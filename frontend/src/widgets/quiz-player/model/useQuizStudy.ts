import { useDeadlineCountdown } from '@/shared/hooks/useDeadlineCountdown';
import { createQuizSession, fetchQuizQuestionsPage } from '@/entities/module';
import { apiErrorMessage, apiErrorText } from '@/shared/lib/apiErrorMessage';
import {
  readQuizTimerDurationSec,
  readQuizTimerEnabled,
} from '@/shared/lib/sessionTimerPrefs';
import { useI18n } from '@/shared/i18n/useI18n';
import type {
  ModuleId,
  ModuleQuestion,
  QuizSessionAnswerDetail,
  QuizSessionDetail,
} from '@/entities/module';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useBlocker, useParams, type Location } from 'react-router-dom';

const SHUFFLE_KEY = (id: string) => `quizo:quiz-shuffle:${id}`;
const PAGE_SIZE = 12;
const PREFETCH_THRESHOLD = 3;

type DraftAnswer = {
  choiceOptionIds?: string[];
  textAnswer?: string;
  matchingAnswer?: Record<string, string>;
  orderingAnswer?: string[];
};

function readShuffle(id: string) {
  try {
    const s = localStorage.getItem(SHUFFLE_KEY(id));
    if (s === null) return true;
    return s === '1';
  } catch {
    return true;
  }
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

function maybeShuffleQuestions(items: ModuleQuestion[], enabled: boolean) {
  return enabled ? shuffle(items) : items;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function isQuestionAnswered(
  question: ModuleQuestion,
  draft: DraftAnswer | undefined,
) {
  if (!draft) return false;
  if (question.type === 'CHOICE') {
    return (draft.choiceOptionIds?.length ?? 0) > 0;
  }
  if (question.type === 'TEXT') {
    return Boolean(draft.textAnswer?.trim());
  }
  if (question.type === 'MATCHING') {
    const map = draft.matchingAnswer ?? {};
    const pairs = Array.isArray(question.matchingPairs)
      ? question.matchingPairs
      : [];
    return pairs.every((pair) => Boolean(map[pair.id]));
  }
  if (question.type === 'ORDERING') {
    const items = Array.isArray(question.orderingItems)
      ? question.orderingItems
      : [];
    return (draft.orderingAnswer?.length ?? 0) === items.length;
  }
  return false;
}

function toSessionAnswerPayload(
  question: ModuleQuestion,
  draft: DraftAnswer | undefined,
) {
  if (question.type === 'CHOICE') {
    const selectedIds = Array.from(
      new Set((draft?.choiceOptionIds ?? []).filter(Boolean)),
    );
    return {
      questionId: question.id,
      choiceOptionId: selectedIds[0] ?? null,
      choiceOptionIds: selectedIds,
    };
  }
  if (question.type === 'TEXT') {
    return {
      questionId: question.id,
      textAnswer: draft?.textAnswer?.trim() || null,
    };
  }
  if (question.type === 'ORDERING') {
    return {
      questionId: question.id,
      orderingAnswer: draft?.orderingAnswer ?? null,
    };
  }
  return {
    questionId: question.id,
    matchingAnswer: draft?.matchingAnswer ?? null,
  };
}

export function renderCorrectAnswer(answer: QuizSessionAnswerDetail) {
  const q = answer.question;
  if (q.type === 'CHOICE') {
    const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
    const correct = options.filter((o) => o.isCorrect).map((o) => o.text);
    return correct.length > 0 ? correct.join(' · ') : '—';
  }
  if (q.type === 'TEXT') {
    const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
    const correct = options.find((o) => o.isCorrect)?.text ?? '—';
    return correct;
  }
  if (q.type === 'ORDERING') {
    const items = [...(Array.isArray(q.orderingItems) ? q.orderingItems : [])]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((item) => item.text);
    return items.length > 0 ? items.join(' → ') : '—';
  }
  const pairs = Array.isArray(q.matchingPairs) ? q.matchingPairs : [];
  return pairs
    .map((pair) => `${pair.leftItem} -> ${pair.rightItem}`)
    .join(' · ');
}

export function renderUserAnswer(
  answer: QuizSessionAnswerDetail,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const q = answer.question;
  if (!answer.userAnswer) return t('quizStudy.noAnswer');
  if (q.type === 'CHOICE') {
    const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
    const selectedIds =
      'choiceOptionIds' in answer.userAnswer
        ? (answer.userAnswer.choiceOptionIds ?? [])
        : 'choiceOptionId' in answer.userAnswer &&
            answer.userAnswer.choiceOptionId
          ? [answer.userAnswer.choiceOptionId]
          : [];
    if (selectedIds.length < 1) return t('quizStudy.noAnswer');
    const selected = selectedIds.map((id) => {
      return (
        options.find((o) => o.id === id)?.text ?? t('quizStudy.unknownOption')
      );
    });
    return selected.join(' · ');
  }
  if (q.type === 'TEXT') {
    if (!('textAnswer' in answer.userAnswer)) return t('quizStudy.noAnswer');
    return answer.userAnswer.textAnswer?.trim() || t('quizStudy.noAnswer');
  }
  if (q.type === 'ORDERING') {
    if (!('orderingAnswer' in answer.userAnswer)) {
      return t('quizStudy.noAnswer');
    }
    const userOrderIds = answer.userAnswer.orderingAnswer;
    if (!Array.isArray(userOrderIds) || userOrderIds.length < 1) {
      return t('quizStudy.noAnswer');
    }
    const items = Array.isArray(q.orderingItems) ? q.orderingItems : [];
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const correctOrder = [...items]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((item) => item.id);
    return userOrderIds
      .map((id, index) => {
        const item = itemsById.get(id);
        const isCorrect = correctOrder[index] === id;
        return `${index + 1}. ${item?.text ?? t('quizStudy.unknownOption')} ${isCorrect ? '✓' : '✗'}`;
      })
      .join(' · ');
  }
  const pairs = Array.isArray(q.matchingPairs) ? q.matchingPairs : [];
  const matchingAnswer =
    'matchingAnswer' in answer.userAnswer
      ? answer.userAnswer.matchingAnswer
      : null;
  if (!matchingAnswer) {
    return t('quizStudy.noAnswer');
  }

  const rightById = new Map(
    pairs.map((pair) => [pair.id, pair.rightItem] as const),
  );

  return pairs
    .map((pair) => {
      const selectedId = matchingAnswer[pair.id];
      const selectedRight = selectedId
        ? (rightById.get(selectedId) ?? '—')
        : '—';
      return `${pair.leftItem} -> ${selectedRight}`;
    })
    .join(' · ');
}

function isArrowNavBlockedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="combobox"]',
    ),
  );
}

export function useQuizStudy() {
  const { t } = useI18n();
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const tRef = useRef(t);

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [moduleTitle, setModuleTitle] = useState(t('quizStudy.quizModule'));
  const [questions, setQuestions] = useState<ModuleQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  const [studyOrderingItems, setStudyOrderingItems] = useState<
    Array<{ id: string; text: string }>
  >([]);
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'error'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSessionDetail | null>(null);
  const [imageLoadFailedByQuestionId, setImageLoadFailedByQuestionId] =
    useState<Record<string, true>>({});
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [quizElapsedMs, setQuizElapsedMs] = useState<number | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  const answersRef = useRef(answers);
  const countdownResetRef = useRef<() => void>(() => {});
  const studyStartedAtRef = useRef<number | null>(null);

  const shuffleEnabled = useMemo(() => readShuffle(moduleId), [moduleId]);
  const timerEnabled = useMemo(
    () => readQuizTimerEnabled(moduleId),
    [moduleId],
  );
  const timerDurationSec = useMemo(
    () => readQuizTimerDurationSec(moduleId),
    [moduleId],
  );

  const mergeQuestions = useCallback((newItems: ModuleQuestion[]) => {
    setQuestions((prev) => {
      if (newItems.length === 0) return prev;
      const known = new Set(prev.map((q) => q.id));
      const filtered = newItems.filter((q) => !known.has(q.id));
      if (filtered.length === 0) return prev;
      return [...prev, ...filtered];
    });
  }, []);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const loadInitial = useCallback(async () => {
    if (!moduleId) {
      setLoadState('notfound');
      return;
    }
    setLoadState('loading');
    countdownResetRef.current();
    try {
      const page = await fetchQuizQuestionsPage(moduleId, { take: PAGE_SIZE });
      setModuleTitle(
        page.moduleTitle?.trim() || tRef.current('quizStudy.quizModule'),
      );
      setTotalQuestions(page.total);
      setQuestions(maybeShuffleQuestions(page.items, shuffleEnabled));
      setNextCursor(page.nextCursor);
      nextCursorRef.current = page.nextCursor;
      setCurrentIndex(0);
      setAnswers({});
      setSession(null);
      setSubmitState('idle');
      setSubmitError(null);
      setImageLoadFailedByQuestionId({});
      setAllowNavigation(false);
      studyStartedAtRef.current = null;
      setQuizElapsedMs(null);
      setLoadState('ok');
    } catch (e) {
      const msg = apiErrorMessage(e);
      if (normalizeText(msg).includes('quiz modules')) {
        setLoadState('wrongType');
        return;
      }
      setLoadState('notfound');
    }
  }, [moduleId, shuffleEnabled]);

  const loadMore = useCallback(async () => {
    const cursor = nextCursorRef.current;
    if (!cursor || isLoadingMore) return 0;
    setIsLoadingMore(true);
    try {
      const page = await fetchQuizQuestionsPage(moduleId, {
        take: PAGE_SIZE,
        cursor,
      });
      const prepared = maybeShuffleQuestions(page.items, shuffleEnabled);
      mergeQuestions(prepared);
      setNextCursor(page.nextCursor);
      nextCursorRef.current = page.nextCursor;
      return prepared.length;
    } catch (e) {
      toast.error(apiErrorText(e, tRef.current));
      return 0;
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, mergeQuestions, moduleId, shuffleEnabled]);

  useEffect(() => {
    if (!timerEnabled || loadState !== 'ok' || session || totalQuestions < 1) {
      return;
    }
    if (nextCursorRef.current === null && questions.length >= totalQuestions) {
      return;
    }
    let cancelled = false;
    void (async () => {
      while (!cancelled && nextCursorRef.current) {
        const before = nextCursorRef.current;
        await loadMore();
        if (nextCursorRef.current === before) break;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    timerEnabled,
    loadState,
    session,
    totalQuestions,
    questions.length,
    loadMore,
  ]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadInitial();
    }, 0);
    return () => window.clearTimeout(t);
  }, [loadInitial]);

  useEffect(() => {
    if (loadState !== 'ok' || session !== null) return;
    if (questions.length < 1) return;
    if (studyStartedAtRef.current !== null) return;
    studyStartedAtRef.current = Date.now();
  }, [loadState, session, questions.length]);

  useEffect(() => {
    if (session) return;
    const remainingLoaded = questions.length - 1 - currentIndex;
    if (remainingLoaded > PREFETCH_THRESHOLD) return;
    if (!nextCursor || isLoadingMore) return;
    void loadMore();
  }, [
    currentIndex,
    isLoadingMore,
    loadMore,
    nextCursor,
    questions.length,
    session,
  ]);

  useEffect(() => {
    if (!session) {
      setAnimatedPercent(0);
      return;
    }

    const targetPercent = Math.round(session.scorePercent);
    const durationMs = 1300;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const raw = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - raw) ** 3;
      setAnimatedPercent(targetPercent * eased);
      if (raw < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [session]);

  const currentQuestion = questions[currentIndex] ?? null;
  const currentDraft = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  useEffect(() => {
    if (!currentQuestion || currentQuestion.type !== 'ORDERING') {
      setStudyOrderingItems([]);
      return;
    }
    const items = Array.isArray(currentQuestion.orderingItems)
      ? currentQuestion.orderingItems
      : [];
    const existingOrder =
      answersRef.current[currentQuestion.id]?.orderingAnswer;
    if (existingOrder && existingOrder.length === items.length) {
      const textById = new Map(items.map((item) => [item.id, item.text]));
      setStudyOrderingItems(
        existingOrder.map((id) => ({
          id,
          text: textById.get(id) ?? tRef.current('quizStudy.unknownOption'),
        })),
      );
      return;
    }
    const shuffled = shuffle(
      items.map((item) => ({ id: item.id, text: item.text })),
    );
    setStudyOrderingItems(shuffled);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        orderingAnswer: shuffled.map((item) => item.id),
      },
    }));
  }, [currentQuestion, answers]);

  const answeredCount = useMemo(
    () => questions.filter((q) => isQuestionAnswered(q, answers[q.id])).length,
    [answers, questions],
  );
  const hasActiveProgress = answeredCount > 0 && !session;
  const canSubmit =
    totalQuestions > 0 &&
    questions.length === totalQuestions &&
    answeredCount === totalQuestions;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const fullyLoaded = useMemo(
    () =>
      totalQuestions > 0 &&
      questions.length === totalQuestions &&
      nextCursor === null &&
      !isLoadingMore,
    [totalQuestions, questions.length, nextCursor, isLoadingMore],
  );

  const shouldRunTimer =
    loadState === 'ok' &&
    timerEnabled &&
    !session &&
    fullyLoaded &&
    totalQuestions > 0;

  const forceSubmitOnTimeout = useCallback(async () => {
    if (session) return;
    if (submitState === 'saving') return;
    if (totalQuestions < 1) return;
    if (questions.length !== totalQuestions) return;
    setSubmitState('saving');
    setSubmitError(null);
    try {
      const payload = questions.map((q) =>
        toSessionAnswerPayload(q, answers[q.id]),
      );
      const nextSession = await createQuizSession(moduleId, {
        answers: payload,
      });
      const elapsed =
        studyStartedAtRef.current !== null
          ? Date.now() - studyStartedAtRef.current
          : null;
      setQuizElapsedMs(elapsed);
      setSession(nextSession);
      setAllowNavigation(true);
      setSubmitState('idle');
      toast.success(t('sessionTimer.timeUpToast'));
    } catch (e) {
      const message = apiErrorText(e, t);
      setSubmitState('error');
      setSubmitError(message);
      toast.error(message);
    }
  }, [answers, moduleId, questions, session, submitState, t, totalQuestions]);

  const {
    remainingSec,
    isActive: timerActive,
    reset: resetCountdown,
  } = useDeadlineCountdown({
    enabled: timerEnabled,
    durationSec: timerDurationSec,
    shouldRun: shouldRunTimer,
    onDeadline: () => {
      void forceSubmitOnTimeout();
    },
  });

  countdownResetRef.current = resetCountdown;

  const shouldWarnLeave =
    hasActiveProgress ||
    (timerEnabled &&
      timerActive &&
      loadState === 'ok' &&
      !session &&
      fullyLoaded);

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

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldWarnLeave || allowNavigation) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [allowNavigation, shouldWarnLeave]);

  const setChoiceAnswer = useCallback(
    (
      questionId: string,
      choiceOptionId: string,
      allowMultipleAnswers: boolean,
    ) => {
      setAnswers((prev) => {
        const prevSelected = prev[questionId]?.choiceOptionIds ?? [];
        if (!allowMultipleAnswers) {
          return {
            ...prev,
            [questionId]: {
              ...prev[questionId],
              choiceOptionIds: [choiceOptionId],
            },
          };
        }
        const has = prevSelected.includes(choiceOptionId);
        const nextSelected = has
          ? prevSelected.filter((id) => id !== choiceOptionId)
          : [...prevSelected, choiceOptionId];
        return {
          ...prev,
          [questionId]: { ...prev[questionId], choiceOptionIds: nextSelected },
        };
      });
    },
    [],
  );

  const setTextAnswer = useCallback(
    (questionId: string, textAnswer: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], textAnswer },
      }));
    },
    [],
  );

  const setMatchingAnswer = useCallback(
    (questionId: string, leftPairId: string, rightPairId: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          matchingAnswer: {
            ...(prev[questionId]?.matchingAnswer ?? {}),
            [leftPairId]: rightPairId,
          },
        },
      }));
    },
    [],
  );

  const setStudyOrderingOrder = useCallback(
    (questionId: string, items: Array<{ id: string; text: string }>) => {
      setStudyOrderingItems(items);
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          orderingAnswer: items.map((item) => item.id),
        },
      }));
    },
    [],
  );

  const goPrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((idx) => idx - 1);
  }, [currentIndex]);

  const goNext = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      return;
    }
    if (!nextCursor) return;
    const added = await loadMore();
    if (added > 0) {
      setCurrentIndex((idx) => idx + 1);
    }
  }, [currentIndex, loadMore, nextCursor, questions.length]);

  const submitSession = useCallback(async () => {
    if (submitState === 'saving') return;
    if (!canSubmit) return;
    setSubmitState('saving');
    setSubmitError(null);
    try {
      const payload = questions.map((q) =>
        toSessionAnswerPayload(q, answers[q.id]),
      );
      const nextSession = await createQuizSession(moduleId, {
        answers: payload,
      });
      const elapsed =
        studyStartedAtRef.current !== null
          ? Date.now() - studyStartedAtRef.current
          : null;
      setQuizElapsedMs(elapsed);
      setSession(nextSession);
      setAllowNavigation(true);
      setSubmitState('idle');
    } catch (e) {
      const message = apiErrorText(e, t);
      setSubmitState('error');
      setSubmitError(message);
      toast.error(message);
    }
  }, [answers, canSubmit, moduleId, questions, submitState, t]);

  useEffect(() => {
    if (session) return;
    if (loadState !== 'ok') return;
    if (!currentQuestion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (isArrowNavBlockedTarget(e.target)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
        return;
      }
      e.preventDefault();
      void goNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [session, loadState, currentQuestion, goPrev, goNext]);

  const onQuestionImageError = useCallback((questionId: string) => {
    setImageLoadFailedByQuestionId((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: true };
    });
  }, []);

  const restart = useCallback(() => {
    void loadInitial();
  }, [loadInitial]);

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

  const resultAnswers = useMemo(() => {
    if (!session) return [];
    return [...session.answers].sort(
      (a, b) => a.question.orderIndex - b.question.orderIndex,
    );
  }, [session]);
  const visiblePercent = Math.round(animatedPercent);

  return {
    t,
    moduleId,
    loadState,
    moduleTitle,
    questions,
    totalQuestions,
    nextCursor,
    currentIndex,
    session,
    imageLoadFailedByQuestionId,
    quizElapsedMs,
    animatedPercent,
    timerEnabled,
    remainingSec,
    timerActive,
    currentQuestion,
    currentDraft,
    canSubmit,
    progressPercent,
    fullyLoaded,
    leaveDialogOpen,
    studyOrderingItems,
    submitState,
    submitError,
    setChoiceAnswer,
    setTextAnswer,
    setMatchingAnswer,
    setStudyOrderingOrder,
    goPrev,
    goNext,
    submitSession,
    onQuestionImageError,
    restart,
    confirmLeave,
    cancelLeave,
    resultAnswers,
    visiblePercent,
  };
}

export type QuizStudy = ReturnType<typeof useQuizStudy>;
