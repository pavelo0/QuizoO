import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createFlashcardSession, fetchModuleById } from '@/lib/api/modules';
import { apiErrorMessage, apiErrorText } from '@/lib/apiErrorMessage';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';
import type { ModuleCard, ModuleId } from '@/types/module';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleX,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useBlocker, useParams, type Location } from 'react-router-dom';

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

export default function FlashcardStudyPage() {
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
      const prepared = readShuffle(m.id) ? shuffleCards(m.cards) : [...m.cards];
      setModuleTitle(m.title);
      setSourceCards(m.cards);
      setCards(prepared);
      setCurrentIndex(0);
      setMarks({});
      setShowAnswer(false);
      setPersistState('idle');
      setPersistError(null);
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
        if (!hasActiveProgress) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [allowNavigation, hasActiveProgress],
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
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        markCurrent('unknown');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        markCurrent('known');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allAnswered, currentCard, markCurrent, toggleFace]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasActiveProgress || allowNavigation) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [allowNavigation, hasActiveProgress]);

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

  if (loadState === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)"
        role="status"
        aria-live="polite"
        aria-busy
      >
        {t('flashStudy.loading')}
      </div>
    );
  }

  if (loadState === 'notfound' || loadState === 'wrongType') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {loadState === 'wrongType'
            ? t('edit.common.wrongTypeFlash')
            : t('edit.common.moduleNotFound')}
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl"
          variant="outline"
          size="outlineCompact"
        >
          <Link to="/app">{t('common.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {t('flashStudy.noCardsToStart')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="outlineCompact"
            className="rounded-xl"
          >
            <Link to={`/app/modules/${encodeURIComponent(moduleId)}/edit`}>
              {t('common.backToModule')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const titleTrimmed = moduleTitle.trim() || t('flashStudy.titleDefault');
  const sideArrowDisabled = cards.length < 2;

  if (allAnswered) {
    return (
      <article className="mx-auto flex w-full max-w-[980px] flex-1 flex-col pb-4 text-(--text-primary)">
        <h1 className="sr-only">
          {t('flashStudy.resultsTitle', { title: titleTrimmed })}
        </h1>
        <header className="mb-8 text-center">
          <h2 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
            {t('flashStudy.resultsTitle', { title: titleTrimmed })}
          </h2>
        </header>

        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-(--border-default) bg-(--input-bg)/20 p-5 sm:p-7">
          <div className="mx-auto mb-6 flex w-fit flex-col items-center gap-3">
            <div
              className="grid size-42 shrink-0 place-items-center overflow-hidden rounded-full p-2 sm:size-48"
              style={{
                background: `conic-gradient(var(--secondary-accent) ${animatedPercent}%, rgba(119,131,171,0.18) ${animatedPercent}% 100%)`,
              }}
              aria-label={t('aria.statistics')}
            >
              <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-(--border-default) bg-[#0d122a] text-center">
                <div className="flex w-full max-w-full flex-col items-center justify-center px-2">
                  <p className="leading-none font-(family-name:--font-syne) text-3xl font-extrabold sm:text-4xl">
                    {visiblePercent}%
                  </p>
                  <p className="mt-2 text-xs text-(--text-secondary)">
                    {t('flashStudy.sessionComplete')}
                  </p>
                </div>
              </div>
            </div>
            <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              {performanceLabel}
            </p>
            {persistState === 'saving' ? (
              <p className="text-xs text-(--text-secondary)">
                {t('flashStudy.savingSession')}
              </p>
            ) : null}
            {persistState === 'error' ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-destructive">
                  {t('flashStudy.saveFailed', { error: persistError ?? '' })}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => void persistSession()}
                >
                  {t('flashStudy.retrySave')}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-emerald-300">
                {t('flashStudy.known')}
              </p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {knownCount}
              </p>
            </div>
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-red-300">{t('flashStudy.unknown')}</p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {unknownCount}
              </p>
            </div>
            <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
              <p className="text-xs text-(--text-secondary)">
                {t('flashStudy.totalCards')}
              </p>
              <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
                {cards.length}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="outlineCompact"
              className="h-11 min-w-40 rounded-xl"
              onClick={restartSession}
            >
              <RotateCcw className="size-4" />
              {t('common.restart')}
            </Button>
            <Button
              asChild
              type="button"
              variant="cta"
              size="outlineCompact"
              className="h-11 min-w-40 rounded-xl"
            >
              <Link to={`/app/modules/${encodeURIComponent(moduleId)}/edit`}>
                {t('common.backToModule')}
              </Link>
            </Button>
          </div>

          <section
            className="overflow-hidden rounded-2xl border border-(--border-default)"
            aria-label={t('aria.cardsBreakdown')}
          >
            <header className="border-b border-(--border-default) bg-(--input-bg)/45 px-4 py-3">
              <h3 className="font-(family-name:--font-syne) text-lg font-bold">
                {t('flashStudy.breakdownTitle')}
              </h3>
            </header>
            <ul className="max-h-[380px] space-y-0 overflow-y-auto">
              {cards.map((card) => {
                const mark = marks[card.id];
                const known = mark === 'known';
                return (
                  <li
                    key={card.id}
                    className="border-b border-(--border-default) bg-(--input-bg)/20 px-4 py-4 last:border-b-0"
                  >
                    <div className="mb-2 flex items-start gap-2">
                      {known ? (
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-emerald-300"
                          aria-hidden
                        />
                      ) : (
                        <CircleX
                          className="mt-0.5 size-4 shrink-0 text-red-300"
                          aria-hidden
                        />
                      )}
                      <p className="font-medium text-(--text-primary)">
                        {card.question}
                      </p>
                    </div>
                    <p
                      className={cn(
                        'ml-6 text-sm',
                        known ? 'text-emerald-300' : 'text-red-300',
                      )}
                    >
                      {known
                        ? t('flashStudy.markedKnown')
                        : t('flashStudy.markedUnknown')}
                    </p>
                    <p className="ml-6 mt-1 text-sm text-(--text-secondary)">
                      {t('flashStudy.answerLabel', { value: card.answer })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </section>
      </article>
    );
  }

  return (
    <article className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col text-(--text-primary)">
      <h1 className="sr-only">
        {t('flashStudy.study')}: {titleTrimmed}
      </h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav
          className="text-xs text-(--text-secondary)"
          aria-label={t('aria.breadcrumb')}
        >
          <ol className="flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
            <li className="shrink-0">
              <Link
                to="/app"
                className="font-(family-name:--font-dm-sans) font-medium text-(--text-secondary) underline-offset-2 transition-opacity hover:opacity-100 hover:underline"
              >
                {t('modules.myModules')}
              </Link>
            </li>
            <li className="shrink-0 text-(--text-secondary)/50" aria-hidden>
              <span className="px-0.5">&gt;</span>
            </li>
            <li className="shrink-0">
              <Link
                to={`/app/modules/${encodeURIComponent(moduleId)}/edit`}
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
              {t('flashStudy.study')}
            </li>
          </ol>
        </nav>

        <Button
          type="button"
          variant="outline"
          size="outlineCompact"
          className="h-10 rounded-xl"
          onClick={restartSession}
        >
          <RotateCcw className="size-4" aria-hidden />
          {t('common.restart')}
        </Button>
      </div>

      <section
        className={cn(
          'relative rounded-3xl border border-(--border-default) bg-(--input-bg)/25 px-4 py-6 sm:px-8 sm:py-8',
          'shadow-[0_18px_80px_rgba(11,16,40,0.35)]',
        )}
        aria-label={t('aria.flashcardStudyArea')}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-(--module-badge-violet-bg) px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
            <Layers className="size-3.5" aria-hidden />
            {t('flashStudy.cardProgress', {
              current: currentIndex + 1,
              total: cards.length,
            })}
          </div>
          {allAnswered ? (
            <p className="text-xs font-semibold text-(--secondary-accent)">
              {t('flashStudy.sessionComplete')}
            </p>
          ) : null}
        </div>

        <div className="relative mx-auto flex max-w-4xl items-center justify-center gap-2 sm:gap-4">
          <Button
            type="button"
            variant="outlineSoft"
            size="icon-header"
            className="size-10 rounded-full sm:size-12"
            onClick={goPrev}
            disabled={sideArrowDisabled}
            aria-label={t('aria.previousCard')}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>

          <div className="w-full max-w-3xl perspective-[1400px]">
            <button
              type="button"
              onClick={toggleFace}
              className="block w-full rounded-[2rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-accent)/40"
              aria-label={
                showAnswer
                  ? t('flashStudy.showQuestionSide')
                  : t('flashStudy.showAnswerSide')
              }
            >
              <div
                className={cn(
                  'min-h-[300px] rounded-[2rem] border border-(--border-default) p-6 transition-transform duration-450 ease-out sm:min-h-[360px] sm:p-8',
                  'bg-[radial-gradient(120%_140%_at_0%_0%,rgba(109,95,255,0.22)_0%,rgba(22,27,56,0.9)_48%,rgba(14,18,42,0.95)_100%)]',
                  showAnswer
                    ? 'transform-[scale(1.015)_rotateY(-8deg)]'
                    : 'transform-[scale(1.01)_rotateY(8deg)]',
                )}
              >
                <p className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold tracking-[0.2em] text-white/60 uppercase">
                  {showAnswer
                    ? t('flashStudy.answer')
                    : t('flashStudy.question')}
                </p>
                <p className="mt-6 font-(family-name:--font-syne) text-3xl leading-[1.06] font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
                  {showAnswer ? currentCard.answer : currentCard.question}
                </p>
                <p className="mt-8 text-sm text-white/50">
                  {t('flashStudy.flipHint')}
                </p>
              </div>
            </button>
          </div>

          <Button
            type="button"
            variant="outlineSoft"
            size="icon-header"
            className="size-10 rounded-full sm:size-12"
            onClick={goNext}
            disabled={sideArrowDisabled}
            aria-label={t('aria.nextCard')}
          >
            <ChevronRight className="size-5" aria-hidden />
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            type="button"
            className="h-12 min-w-40 gap-2 rounded-[12px] border border-red-400/30 bg-red-500/10 px-6 font-(family-name:--font-syne) text-base font-bold text-red-300 hover:bg-red-500/20"
            onClick={() => markCurrent('unknown')}
          >
            <CircleHelp className="size-4" strokeWidth={2.2} />
            {t('flashStudy.didntKnow')}
          </Button>
          <Button
            type="button"
            className="h-12 min-w-40 gap-2 rounded-[12px] border border-emerald-400/30 bg-emerald-500/10 px-6 font-(family-name:--font-syne) text-base font-bold text-emerald-300 hover:bg-emerald-500/20"
            onClick={() => markCurrent('known')}
          >
            <Check className="size-4" strokeWidth={2.4} />
            {t('flashStudy.iKnewIt')}
          </Button>
        </div>
      </section>

      <section
        className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-(--border-default) pt-5"
        aria-label={t('aria.sessionStatistics')}
      >
        <p className="font-(family-name:--font-dm-sans) text-sm text-emerald-300">
          <span className="mr-2 inline-block size-2 rounded-full bg-emerald-300" />
          {knownCount} {t('flashStudy.known')}
        </p>
        <p className="font-(family-name:--font-dm-sans) text-sm text-red-300">
          <span className="mr-2 inline-block size-2 rounded-full bg-red-300" />
          {unknownCount} {t('flashStudy.unknown')}
        </p>
        <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          <span className="mr-2 inline-block size-2 rounded-full bg-(--text-secondary)" />
          {remainingCount} {t('flashStudy.remaining')}
        </p>
      </section>

      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={(open) => {
          if (!open) cancelLeave();
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('flashStudy.leaveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('flashStudy.leaveDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-full"
              onClick={confirmLeave}
            >
              {t('flashStudy.leaveAction')}
            </Button>
            <AlertDialogCancel
              className="w-full sm:w-full"
              onClick={cancelLeave}
            >
              {t('flashStudy.stayAction')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
