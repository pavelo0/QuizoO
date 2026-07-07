import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_TICK_MS = 250;

export type UseDeadlineCountdownArgs = {
  /** When false, countdown is cleared and inactive. */
  enabled: boolean;
  /** Wall-clock duration for the next run (when shouldRun becomes true). */
  durationSec: number;
  /** Start the deadline when true (e.g. study ready). */
  shouldRun: boolean;
  /** Called once when remaining hits 0 (still inside rAF). */
  onDeadline?: () => void;
};

export type UseDeadlineCountdownResult = {
  /** Fractional seconds remaining; 0 when idle or expired. */
  remainingSec: number;
  /** True after the deadline has been crossed and onDeadline fired. */
  isExpired: boolean;
  /** True while counting (enabled, shouldRun, not expired). */
  isActive: boolean;
  /** Millisecond timestamp of deadline, or null if not running. */
  deadlineMs: number | null;
  /** Reset expired flag and clear deadline (e.g. new session). */
  reset: () => void;
};

/**
 * Wall-clock countdown: stores deadlineMs and derives remaining from Date.now()
 * so display does not drift with setInterval.
 */
export function useDeadlineCountdown({
  enabled,
  durationSec,
  shouldRun,
  onDeadline,
}: UseDeadlineCountdownArgs): UseDeadlineCountdownResult {
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const onDeadlineRef = useRef(onDeadline);
  useEffect(() => {
    onDeadlineRef.current = onDeadline;
  }, [onDeadline]);
  const firedRef = useRef(false);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  const reset = useCallback(() => {
    setDeadlineMs(null);
    setRemainingSec(0);
    setIsExpired(false);
    firedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled || !shouldRun) {
      firedRef.current = false;
      setDeadlineMs(null);
      setRemainingSec(0);
      setIsExpired(false);
      return;
    }
    if (isExpired) {
      return;
    }
    firedRef.current = false;
    const d = Date.now() + Math.max(0, durationSec) * 1000;
    setDeadlineMs(d);
    setRemainingSec(durationSec);
    lastTickRef.current = 0;
  }, [enabled, shouldRun, durationSec, isExpired]);

  useEffect(() => {
    if (!enabled || !shouldRun || deadlineMs === null || isExpired) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    const tick = (now: number) => {
      if (firedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const msLeft = deadlineMs - Date.now();
      if (msLeft <= 0) {
        setRemainingSec(0);
        firedRef.current = true;
        setIsExpired(true);
        setDeadlineMs(null);
        onDeadlineRef.current?.();
        rafRef.current = 0;
        return;
      }
      if (now - lastTickRef.current >= MIN_TICK_MS) {
        lastTickRef.current = now;
        setRemainingSec(msLeft / 1000);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [enabled, shouldRun, deadlineMs, isExpired]);

  const isActive = Boolean(
    enabled && shouldRun && deadlineMs !== null && !isExpired,
  );

  return {
    remainingSec,
    isExpired,
    isActive,
    deadlineMs,
    reset,
  };
}
