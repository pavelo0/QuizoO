import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createQuizSession, fetchQuizQuestionsPage } from '@/lib/api/modules';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import { cn } from '@/lib/utils';
import type {
  ModuleId,
  ModuleQuestion,
  QuizSessionDetail,
  QuizSessionAnswerDetail,
} from '@/types/module';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleX,
  ClipboardList,
  RotateCcw,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SHUFFLE_KEY = (id: string) => `quizo:quiz-shuffle:${id}`;
const PAGE_SIZE = 12;
const PREFETCH_THRESHOLD = 3;

type DraftAnswer = {
  choiceOptionIds?: string[];
  textAnswer?: string;
  matchingAnswer?: Record<string, string>;
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

function isQuestionAnswered(
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
    return question.matchingPairs.every((pair) => Boolean(map[pair.id]));
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
  return {
    questionId: question.id,
    matchingAnswer: draft?.matchingAnswer ?? null,
  };
}

function renderCorrectAnswer(answer: QuizSessionAnswerDetail) {
  const q = answer.question;
  if (q.type === 'CHOICE') {
    const correct = q.questionOptions
      .filter((o) => o.isCorrect)
      .map((o) => o.text);
    return correct.length > 0 ? correct.join(' · ') : '—';
  }
  if (q.type === 'TEXT') {
    const correct = q.questionOptions.find((o) => o.isCorrect)?.text ?? '—';
    return correct;
  }
  return q.matchingPairs
    .map((pair) => `${pair.leftItem} -> ${pair.rightItem}`)
    .join(' · ');
}

function renderUserAnswer(answer: QuizSessionAnswerDetail) {
  const q = answer.question;
  if (!answer.userAnswer) return 'No answer';
  if (q.type === 'CHOICE') {
    const selectedIds =
      'choiceOptionIds' in answer.userAnswer
        ? (answer.userAnswer.choiceOptionIds ?? [])
        : 'choiceOptionId' in answer.userAnswer &&
            answer.userAnswer.choiceOptionId
          ? [answer.userAnswer.choiceOptionId]
          : [];
    if (selectedIds.length < 1) return 'No answer';
    const selected = selectedIds.map((id) => {
      return (
        q.questionOptions.find((o) => o.id === id)?.text ?? 'Unknown option'
      );
    });
    return selected.join(' · ');
  }
  if (q.type === 'TEXT') {
    if (!('textAnswer' in answer.userAnswer)) return 'No answer';
    return answer.userAnswer.textAnswer?.trim() || 'No answer';
  }
  if (
    !('matchingAnswer' in answer.userAnswer) ||
    !answer.userAnswer.matchingAnswer
  ) {
    return 'No answer';
  }

  const rightById = new Map(
    q.matchingPairs.map((pair) => [pair.id, pair.rightItem] as const),
  );

  return q.matchingPairs
    .map((pair) => {
      const selectedId = answer.userAnswer?.matchingAnswer?.[pair.id];
      const selectedRight = selectedId
        ? (rightById.get(selectedId) ?? '—')
        : '—';
      return `${pair.leftItem} -> ${selectedRight}`;
    })
    .join(' · ');
}

export default function QuizStudyPage() {
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [moduleTitle, setModuleTitle] = useState('Quiz module');
  const [questions, setQuestions] = useState<ModuleQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'error'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSessionDetail | null>(null);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const nextCursorRef = useRef<string | null>(null);

  const shuffleEnabled = useMemo(() => readShuffle(moduleId), [moduleId]);

  const mergeQuestions = useCallback((newItems: ModuleQuestion[]) => {
    setQuestions((prev) => {
      if (newItems.length === 0) return prev;
      const known = new Set(prev.map((q) => q.id));
      const filtered = newItems.filter((q) => !known.has(q.id));
      if (filtered.length === 0) return prev;
      return [...prev, ...filtered];
    });
  }, []);

  const loadInitial = useCallback(async () => {
    if (!moduleId) {
      setLoadState('notfound');
      return;
    }
    setLoadState('loading');
    try {
      const page = await fetchQuizQuestionsPage(moduleId, { take: PAGE_SIZE });
      setModuleTitle(page.moduleTitle?.trim() || 'Quiz module');
      setTotalQuestions(page.total);
      setQuestions(maybeShuffleQuestions(page.items, shuffleEnabled));
      setNextCursor(page.nextCursor);
      nextCursorRef.current = page.nextCursor;
      setCurrentIndex(0);
      setAnswers({});
      setSession(null);
      setSubmitState('idle');
      setSubmitError(null);
      setAllowNavigation(false);
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
      toast.error(apiErrorMessage(e));
      return 0;
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, mergeQuestions, moduleId, shuffleEnabled]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadInitial();
    }, 0);
    return () => window.clearTimeout(t);
  }, [loadInitial]);

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

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        if (allowNavigation) return false;
        if (!hasActiveProgress) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [allowNavigation, hasActiveProgress],
    ),
  );
  const leaveDialogOpen = blocker.state === 'blocked';

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
      setSession(nextSession);
      setAllowNavigation(true);
      setSubmitState('idle');
    } catch (e) {
      const message = apiErrorMessage(e);
      setSubmitState('error');
      setSubmitError(message);
      toast.error(message);
    }
  }, [answers, canSubmit, moduleId, questions, submitState]);

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

  if (loadState === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)"
        role="status"
        aria-live="polite"
        aria-busy
      >
        Loading quiz…
      </div>
    );
  }

  if (loadState === 'notfound' || loadState === 'wrongType') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {loadState === 'wrongType'
            ? 'This module is not a quiz module.'
            : 'Module not found or you do not have access.'}
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl"
          variant="outline"
          size="outlineCompact"
        >
          <Link to="/app">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          Add at least one question to start the quiz.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="outlineCompact"
            className="rounded-xl"
          >
            <Link to={`/app/modules/${encodeURIComponent(moduleId)}/quiz-edit`}>
              Back to module
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const titleTrimmed = moduleTitle.trim() || 'Quiz module';

  if (session) {
    const scorePercent = Math.round(session.scorePercent);
    const wrongCount = session.totalQuestions - session.correctCount;
    const performanceLabel =
      scorePercent >= 85
        ? 'Excellent'
        : scorePercent >= 65
          ? 'Good job'
          : scorePercent >= 45
            ? 'Keep practicing'
            : 'Needs more practice';

    return (
      <article className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col pb-4 text-(--text-primary)">
        <h1 className="sr-only">Quiz results: {titleTrimmed}</h1>
        <header className="mb-8 text-center">
          <h2 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
            {titleTrimmed} - Quiz results
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {session.correctCount} of {session.totalQuestions} correct
          </p>
        </header>

        <section className="mx-auto w-full rounded-3xl border border-(--border-default) bg-(--input-bg)/20 p-5 sm:p-7">
          <div className="mx-auto mb-6 flex w-fit flex-col items-center gap-3">
            <div
              className="grid size-42 shrink-0 place-items-center overflow-hidden rounded-full p-2 sm:size-48"
              style={{
                background: `conic-gradient(var(--secondary-accent) ${animatedPercent}%, rgba(119,131,171,0.18) ${animatedPercent}% 100%)`,
              }}
              aria-label={`Score ${visiblePercent}%`}
            >
              <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-(--border-default) bg-[#0d122a] text-center">
                <div className="flex w-full max-w-full flex-col items-center justify-center px-2">
                  <p className="leading-none font-(family-name:--font-syne) text-3xl font-extrabold sm:text-4xl">
                    {visiblePercent}%
                  </p>
                  <p className="mt-2 text-xs text-(--text-secondary)">
                    Session complete
                  </p>
                </div>
              </div>
            </div>
            <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              {performanceLabel}
            </p>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-emerald-300">Correct</p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {session.correctCount}
              </p>
            </div>
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-red-300">Wrong</p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {wrongCount}
              </p>
            </div>
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-(--text-secondary)">Total</p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {session.totalQuestions}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="outlineCompact"
              className="h-11 min-w-36 rounded-xl"
              onClick={restart}
            >
              <RotateCcw className="size-4" />
              Retake quiz
            </Button>
            <Button
              asChild
              type="button"
              variant="cta"
              size="outlineCompact"
              className="h-11 min-w-36 rounded-xl"
            >
              <Link
                to={`/app/modules/${encodeURIComponent(moduleId)}/quiz-edit`}
              >
                Back to module
              </Link>
            </Button>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-(--border-default)"
          aria-label="Questions breakdown"
        >
          <header className="border-b border-(--border-default) bg-(--input-bg)/45 px-4 py-3">
            <h3 className="font-(family-name:--font-syne) text-lg font-bold">
              Questions breakdown
            </h3>
          </header>
          <ul className="max-h-[560px] space-y-0 overflow-y-auto">
            {resultAnswers.map((answer) => (
              <li
                key={answer.id}
                className="border-b border-(--border-default) bg-(--input-bg)/15 px-4 py-4 last:border-b-0"
              >
                <div className="mb-2 flex items-start gap-2">
                  {answer.isCorrect ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                  ) : (
                    <CircleX className="mt-0.5 size-4 shrink-0 text-red-300" />
                  )}
                  <p className="font-semibold text-(--text-primary)">
                    {answer.question.questionText}
                  </p>
                </div>
                <p className="ml-6 text-sm text-(--text-secondary)">
                  Your answer: {renderUserAnswer(answer)}
                </p>
                <p className="ml-6 mt-1 text-sm text-(--text-secondary)">
                  Correct answer: {renderCorrectAnswer(answer)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)">
        No questions loaded yet.
      </div>
    );
  }

  const currentAnswered = isQuestionAnswered(currentQuestion, currentDraft);
  const matchingOptions =
    currentQuestion.type === 'MATCHING'
      ? currentQuestion.matchingPairs.map((pair) => ({
          id: pair.id,
          label: pair.rightItem,
        }))
      : [];

  return (
    <article className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col text-(--text-primary)">
      <h1 className="sr-only">Quiz study: {titleTrimmed}</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav
          className="text-xs text-(--text-secondary)"
          aria-label="Breadcrumb"
        >
          <ol className="flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
            <li className="shrink-0">
              <Link
                to="/app"
                className="font-(family-name:--font-dm-sans) font-medium text-(--text-secondary) underline-offset-2 transition-opacity hover:opacity-100 hover:underline"
              >
                My modules
              </Link>
            </li>
            <li className="shrink-0 text-(--text-secondary)/50" aria-hidden>
              <span className="px-0.5">&gt;</span>
            </li>
            <li className="shrink-0">
              <Link
                to={`/app/modules/${encodeURIComponent(moduleId)}/quiz-edit`}
                className="font-(family-name:--font-dm-sans) font-medium text-(--text-secondary) underline-offset-2 transition-opacity hover:opacity-100 hover:underline"
              >
                {titleTrimmed}
              </Link>
            </li>
            <li className="shrink-0 text-(--text-secondary)/50" aria-hidden>
              <span className="px-0.5">&gt;</span>
            </li>
            <li
              className="min-w-0 font-(family-name:--font-dm-sans) font-medium text-(--text-primary)"
              aria-current="page"
            >
              Quiz
            </li>
          </ol>
        </nav>

        <Button
          type="button"
          variant="outline"
          size="outlineCompact"
          className="h-10 rounded-xl"
          onClick={restart}
        >
          <RotateCcw className="size-4" aria-hidden />
          Restart
        </Button>
      </div>

      <section
        className={cn(
          'rounded-3xl border border-(--border-default) bg-(--input-bg)/25 px-4 py-6 sm:px-8 sm:py-8',
          'shadow-[0_18px_80px_rgba(11,16,40,0.35)]',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-(--module-badge-violet-bg) px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
            <ClipboardList className="size-3.5" aria-hidden />
            Question {Math.min(currentIndex + 1, totalQuestions)}/
            {totalQuestions}
          </div>
          <p
            className={cn(
              'text-xs font-semibold',
              currentAnswered ? 'text-emerald-300' : 'text-(--text-secondary)',
            )}
          >
            {currentAnswered ? 'Answered' : 'Not answered'}
          </p>
        </div>

        <div className="mb-6 h-2 rounded-full bg-(--input-bg)/70">
          <div
            className="h-full rounded-full bg-(--primary-accent) transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
            aria-label={`Progress ${progressPercent}%`}
          />
        </div>

        <h2 className="font-(family-name:--font-syne) text-2xl leading-tight font-extrabold tracking-[-0.03em] sm:text-3xl">
          {currentQuestion.questionText}
        </h2>

        {currentQuestion.type === 'CHOICE' ? (
          <div className="mt-6 space-y-2.5">
            <p className="text-xs text-(--text-secondary)">
              {currentQuestion.allowMultipleAnswers
                ? 'Select one or more options'
                : 'Select one option'}
            </p>
            {currentQuestion.questionOptions.map((opt) => {
              const selected = (currentDraft?.choiceOptionIds ?? []).includes(
                opt.id,
              );
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                    selected
                      ? 'border-(--primary-accent) bg-(--primary-accent)/15'
                      : 'border-(--border-default) bg-(--input-bg)/35 hover:bg-(--input-bg)/55',
                  )}
                  onClick={() =>
                    setChoiceAnswer(
                      currentQuestion.id,
                      opt.id,
                      currentQuestion.allowMultipleAnswers,
                    )
                  }
                >
                  <span
                    className={cn(
                      'inline-flex size-4 shrink-0 items-center justify-center rounded-sm border',
                      selected
                        ? 'border-(--primary-accent) bg-(--primary-accent)'
                        : 'border-(--border-default)',
                    )}
                    aria-hidden
                  />
                  {opt.text}
                </button>
              );
            })}
          </div>
        ) : null}

        {currentQuestion.type === 'TEXT' ? (
          <div className="mt-6">
            <label htmlFor="quiz-text-answer" className="sr-only">
              Type your answer
            </label>
            <Textarea
              id="quiz-text-answer"
              value={currentDraft?.textAnswer ?? ''}
              onChange={(e) =>
                setTextAnswer(currentQuestion.id, e.target.value)
              }
              placeholder="Type your answer…"
              rows={4}
              className="min-h-28 rounded-2xl border-(--border-default) bg-(--input-bg)/35"
            />
          </div>
        ) : null}

        {currentQuestion.type === 'MATCHING' ? (
          <div className="mt-6 space-y-3">
            {currentQuestion.matchingPairs.map((pair) => (
              <div
                key={pair.id}
                className="grid gap-2 rounded-2xl border border-(--border-default) bg-(--input-bg)/30 p-3 sm:grid-cols-[1fr_1fr]"
              >
                <p className="self-center text-sm font-medium">
                  {pair.leftItem}
                </p>
                <label className="sr-only" htmlFor={`matching-${pair.id}`}>
                  Select matching value
                </label>
                <select
                  id={`matching-${pair.id}`}
                  value={currentDraft?.matchingAnswer?.[pair.id] ?? ''}
                  onChange={(e) =>
                    setMatchingAnswer(
                      currentQuestion.id,
                      pair.id,
                      e.target.value,
                    )
                  }
                  className="h-11 rounded-xl border border-(--border-default) bg-(--input-bg) px-3 text-sm text-(--text-primary) outline-none focus:border-(--primary-accent)"
                >
                  <option value="">Select match</option>
                  {matchingOptions.map((right) => (
                    <option key={right.id} value={right.id}>
                      {right.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outlineSoft"
              size="icon-header"
              className="size-11 rounded-full"
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label="Previous question"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outlineSoft"
              size="icon-header"
              className="size-11 rounded-full"
              onClick={() => void goNext()}
              disabled={currentIndex >= questions.length - 1 && !nextCursor}
              aria-label="Next question"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="cta"
            className="h-11 rounded-xl px-6"
            disabled={!canSubmit || submitState === 'saving'}
            onClick={() => void submitSession()}
          >
            {submitState === 'saving' ? 'Submitting…' : 'Finish quiz'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-(--text-secondary)">
          For big quizzes, questions are loaded in small pages so the app stays
          responsive.
        </p>
        {submitState === 'error' && submitError ? (
          <p className="mt-2 text-xs text-destructive">
            Could not submit: {submitError}
          </p>
        ) : null}
      </section>

      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={(open) => {
          if (!open) cancelLeave();
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave quiz session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current progress in this quiz is not submitted yet. Are you
              sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-full"
              onClick={confirmLeave}
            >
              Leave session
            </Button>
            <AlertDialogCancel
              className="w-full sm:w-full"
              onClick={cancelLeave}
            >
              Stay here
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
