import { useDeadlineCountdown } from '@/shared/hooks/useDeadlineCountdown';
import { createFlashcardSession, fetchModuleById } from '@/entities/module';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import {
  readFlashTimerDurationSec,
  readFlashTimerEnabled,
} from '@/shared/lib/sessionTimerPrefs';
import { useI18n } from '@/shared/i18n/useI18n';
import type { ModuleCard, ModuleId } from '@/entities/module';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useParams, type Location } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type Mark = 'known' | 'unknown';
type PersistState = 'idle' | 'saving' | 'saved' | 'error';

const SHUFFLE_KEY = (id: string) => `quizo:flash-shuffle:${id}`;

function findNextIndex(
  cards: ModuleCard[],
  currentIndex: number,
  marks: Record<string, Mark>,
) {
  if (cards.length <= 1) return currentIndex;
  for (let step = 1; step <= cards.length; step += 1) {
    const idx = (currentIndex + step) % cards.length;
    const card = cards[idx];
    if (!card) return currentIndex;
    if (!marks[card.id]) return idx;
  }
  return (currentIndex + 1) % cards.length;
}

function readShuffle(id: string) {
  try {
    const s = localStorage.getItem(SHUFFLE_KEY(id));
    if (s === null) return true;
    return s === '1';
  } catch {
    return true;
  }
}

function shuffleCards(cards: ModuleCard[]) {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function useFlashcardStudy() {
  const { t } = useI18n();
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [moduleTitle, setModuleTitle] = useState(t('flashStudy.titleDefault'));
  const [sourceCards, setSourceCards] = useState<ModuleCard[]>([]);
  const [cards, setCards] = useState<ModuleCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [persistState, setPersistState] = useState<PersistState>('idle');
  const [persistError, setPersistError] = useState<string | null>(null);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [flashElapsedMs, setFlashElapsedMs] = useState<number | null>(null);

  const countdownResetRef = useRef<() => void>(() => {});
  const studyStartedAtRef = useRef<number | null>(null);
  const flashElapsedCapturedRef = useRef(false);

  const load = useCallback(async () => {
    if (!moduleId) {
      setLoadState('notfound');
      return;
    }
    try {
      const m = await fetchModuleById(moduleId);
      if (m.type !== 'FLASHCARD') {
        setLoadState('wrongType');
        return;
      }
      countdownResetRef.current();
      const prepared = readShuffle(m.id) ? shuffleCards(m.cards) : [...m.cards];
      setModuleTitle(m.title);
      setSourceCards(m.cards);
      setCards(prepared);
      setCurrentIndex(0);
      setMarks({});
      setShowAnswer(false);
      setPersistState('idle');
      setPersistError(null);
      studyStartedAtRef.current = null;
      flashElapsedCapturedRef.current = false;
      setFlashElapsedMs(null);
      setLoadState('ok');
    } catch {
      setLoadState('notfound');
    }
  }, [moduleId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const currentCard = cards[currentIndex] ?? null;
  const answeredCount = Object.keys(marks).length;
  const knownCount = useMemo(
    () => Object.values(marks).filter((m) => m === 'known').length,
    [marks],
  );
  const unknownCount = useMemo(
    () => Object.values(marks).filter((m) => m === 'unknown').length,
    [marks],
  );
  const remainingCount = Math.max(0, cards.length - answeredCount);
  const allAnswered = cards.length > 0 && remainingCount === 0;
  const hasActiveProgress = answeredCount > 0 && !allAnswered;

  useEffect(() => {
    if (loadState !== 'ok' || cards.length === 0) return;
    if (allAnswered) return;
    if (studyStartedAtRef.current !== null) return;
    studyStartedAtRef.current = Date.now();
  }, [loadState, cards.length, allAnswered]);

  useEffect(() => {
    if (!allAnswered) {
      flashElapsedCapturedRef.current = false;
      return;
    }
    if (flashElapsedCapturedRef.current) return;
    if (studyStartedAtRef.current === null) return;
    flashElapsedCapturedRef.current = true;
    setFlashElapsedMs(Date.now() - studyStartedAtRef.current);
  }, [allAnswered]);

  const timerEnabled = useMemo(
    () => readFlashTimerEnabled(moduleId),
    [moduleId],
  );
  const timerDurationSec = useMemo(
    () => readFlashTimerDurationSec(moduleId),
    [moduleId],
  );
  const shouldRunTimer =
    loadState === 'ok' && timerEnabled && cards.length > 0 && !allAnswered;

  const onTimerDeadline = useCallback(() => {
    toast.success(t('sessionTimer.timeUpToast'));
    setMarks((prev) => {
      const next = { ...prev };
      for (const c of cards) {
        if (!next[c.id]) next[c.id] = 'unknown';
      }
      return next;
    });
  }, [cards, t]);

  const {
    remainingSec,
    isActive: timerActive,
    reset: resetCountdown,
  } = useDeadlineCountdown({
    enabled: timerEnabled,
    durationSec: timerDurationSec,
    shouldRun: shouldRunTimer,
    onDeadline: onTimerDeadline,
  });

  useEffect(() => {
    countdownResetRef.current = resetCountdown;
  }, [resetCountdown]);

  const shouldWarnLeave =
    hasActiveProgress ||
    (timerEnabled && timerActive && loadState === 'ok' && !allAnswered);
  const scorePercent =
    cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;
  const performanceLabel =
    scorePercent >= 85
      ? t('quizStudy.performanceExcellent')
      : scorePercent >= 65
        ? t('quizStudy.performanceGood')
        : scorePercent >= 45
          ? t('quizStudy.performanceKeep')
          : t('quizStudy.performanceMore');
  const visiblePercent = Math.round(animatedPercent);

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: Location;
        nextLocation: Location;
      }) => {
        if (allowNavigation) return false;
        if (!shouldWarnLeave) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [allowNavigation, shouldWarnLeave],
    ),
  );
  const leaveDialogOpen = blocker.state === 'blocked';

  const goPrev = useCallback(() => {
    if (cards.length < 2) return;
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setShowAnswer(false);
  }, [cards.length]);

  const goNext = useCallback(() => {
    if (cards.length < 2) return;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setShowAnswer(false);
  }, [cards.length]);

  const toggleFace = useCallback(() => {
    if (!currentCard) return;
    setShowAnswer((prev) => !prev);
  }, [currentCard]);

  const markCurrent = useCallback(
    (value: Mark) => {
      if (!currentCard || allAnswered) return;
      const nextMarks = { ...marks, [currentCard.id]: value };
      setMarks(nextMarks);
      setShowAnswer(false);
      setCurrentIndex((prev) => findNextIndex(cards, prev, nextMarks));
    },
    [allAnswered, cards, currentCard, marks],
  );

  const restartSession = useCallback(() => {
    countdownResetRef.current();
    studyStartedAtRef.current = null;
    flashElapsedCapturedRef.current = false;
    setFlashElapsedMs(null);
    const prepared = readShuffle(moduleId)
      ? shuffleCards(sourceCards)
      : [...sourceCards];
    setCards(prepared);
    setMarks({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setPersistState('idle');
    setPersistError(null);
    setAllowNavigation(false);
    setAnimatedPercent(0);
  }, [moduleId, sourceCards]);

  const persistSession = useCallback(async () => {
    setPersistState('saving');
    setPersistError(null);
    try {
      await createFlashcardSession(moduleId, {
        totalCards: cards.length,
        knownCount,
        unknownCount,
      });
      setPersistState('saved');
    } catch (e) {
      setPersistState('error');
      setPersistError(apiErrorText(e, t));
    }
  }, [cards.length, knownCount, moduleId, t, unknownCount]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentCard || allAnswered) return;
      if (e.key === 'ArrowLeft' && showAnswer) {
        e.preventDefault();
        markCurrent('unknown');
      } else if (e.key === 'ArrowRight' && showAnswer) {
        e.preventDefault();
        markCurrent('known');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allAnswered, currentCard, markCurrent, showAnswer, toggleFace]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldWarnLeave || allowNavigation) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [allowNavigation, shouldWarnLeave]);

  useEffect(() => {
    if (!allAnswered || persistState !== 'idle') return;
    void persistSession();
  }, [allAnswered, persistSession, persistState]);

  useEffect(() => {
    if (!allAnswered) {
      setAnimatedPercent(0);
      return;
    }

    const durationMs = 1300;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const raw = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - raw) ** 3;
      setAnimatedPercent(scorePercent * eased);
      if (raw < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [allAnswered, scorePercent]);

  const confirmLeave = useCallback(() => {
    setAllowNavigation(true);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelLeave = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    t,
    moduleId,
    loadState,
    moduleTitle,
    cards,
    currentIndex,
    currentCard,
    showAnswer,
    marks,
    persistState,
    persistError,
    animatedPercent,
    flashElapsedMs,
    knownCount,
    unknownCount,
    remainingCount,
    allAnswered,
    timerEnabled,
    remainingSec,
    timerActive,
    scorePercent,
    performanceLabel,
    visiblePercent,
    leaveDialogOpen,
    goPrev,
    goNext,
    toggleFace,
    markCurrent,
    restartSession,
    persistSession,
    confirmLeave,
    cancelLeave,
  };
}

export type FlashcardStudy = ReturnType<typeof useFlashcardStudy>;
