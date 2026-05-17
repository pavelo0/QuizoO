/** Session timer preferences per module (localStorage, mirrors shuffle pattern). */

export const SESSION_TIMER_DURATION_OPTIONS_SEC = [
  60, 300, 600, 900, 1800, 3600,
] as const;

export type SessionTimerDurationSec =
  (typeof SESSION_TIMER_DURATION_OPTIONS_SEC)[number];

const DEFAULT_DURATION_SEC: SessionTimerDurationSec = 600;

export const quizTimerEnabledKey = (id: string) =>
  `quizo:quiz-timer-enabled:${id}`;
export const quizTimerSecKey = (id: string) => `quizo:quiz-timer-sec:${id}`;
export const flashTimerEnabledKey = (id: string) =>
  `quizo:flash-timer-enabled:${id}`;
export const flashTimerSecKey = (id: string) => `quizo:flash-timer-sec:${id}`;

function isDurationSec(n: number): n is SessionTimerDurationSec {
  return SESSION_TIMER_DURATION_OPTIONS_SEC.includes(
    n as SessionTimerDurationSec,
  );
}

export function readQuizTimerEnabled(id: string): boolean {
  try {
    const s = localStorage.getItem(quizTimerEnabledKey(id));
    if (s === null) return false;
    return s === '1';
  } catch {
    return false;
  }
}

export function writeQuizTimerEnabled(id: string, v: boolean) {
  try {
    localStorage.setItem(quizTimerEnabledKey(id), v ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function readQuizTimerDurationSec(id: string): SessionTimerDurationSec {
  try {
    const s = localStorage.getItem(quizTimerSecKey(id));
    if (s === null) return DEFAULT_DURATION_SEC;
    const n = Number.parseInt(s, 10);
    if (!Number.isFinite(n) || !isDurationSec(n)) return DEFAULT_DURATION_SEC;
    return n;
  } catch {
    return DEFAULT_DURATION_SEC;
  }
}

export function writeQuizTimerDurationSec(
  id: string,
  sec: SessionTimerDurationSec,
) {
  try {
    localStorage.setItem(quizTimerSecKey(id), String(sec));
  } catch {
    /* ignore */
  }
}

export function readFlashTimerEnabled(id: string): boolean {
  try {
    const s = localStorage.getItem(flashTimerEnabledKey(id));
    if (s === null) return false;
    return s === '1';
  } catch {
    return false;
  }
}

export function writeFlashTimerEnabled(id: string, v: boolean) {
  try {
    localStorage.setItem(flashTimerEnabledKey(id), v ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function readFlashTimerDurationSec(id: string): SessionTimerDurationSec {
  try {
    const s = localStorage.getItem(flashTimerSecKey(id));
    if (s === null) return DEFAULT_DURATION_SEC;
    const n = Number.parseInt(s, 10);
    if (!Number.isFinite(n) || !isDurationSec(n)) return DEFAULT_DURATION_SEC;
    return n;
  } catch {
    return DEFAULT_DURATION_SEC;
  }
}

export function writeFlashTimerDurationSec(
  id: string,
  sec: SessionTimerDurationSec,
) {
  try {
    localStorage.setItem(flashTimerSecKey(id), String(sec));
  } catch {
    /* ignore */
  }
}

/** Display mm:ss for countdown UI (ceil seconds). */
export function formatCountdownMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** Floor elapsed wall time into whole minutes and seconds (for "completed in" copy). */
export function formatStudyElapsed(ms: number): {
  minutes: number;
  seconds: number;
} {
  const raw = Math.max(0, Math.floor(ms / 1000));
  return {
    minutes: Math.floor(raw / 60),
    seconds: raw % 60,
  };
}
