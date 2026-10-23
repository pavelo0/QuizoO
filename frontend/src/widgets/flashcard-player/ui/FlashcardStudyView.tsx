import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { formatCountdownMmSs } from '@/shared/lib/sessionTimerPrefs';
import { cn } from '@/shared/lib/utils';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Layers,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FlashcardStudy } from '../model/useFlashcardStudy';

export function FlashcardStudyView({ study }: { study: FlashcardStudy }) {
  const {
    t,
    moduleId,
    moduleTitle,
    cards,
    currentIndex,
    currentCard,
    showAnswer,
    allAnswered,
    timerEnabled,
    remainingSec,
    timerActive,
    knownCount,
    unknownCount,
    remainingCount,
    leaveDialogOpen,
    goPrev,
    goNext,
    toggleFace,
    markCurrent,
    restartSession,
    confirmLeave,
    cancelLeave,
  } = study;
  if (!currentCard) return null;
  const titleTrimmed = moduleTitle.trim() || t('flashStudy.titleDefault');
  const sideArrowDisabled = cards.length < 2;

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

        <div className="flex flex-wrap items-center justify-end gap-3">
          {timerEnabled ? (
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-(--border-default) bg-(--input-bg)/40 px-3 py-1.5 font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums',
                timerActive && remainingSec <= 60
                  ? 'border-amber-500/40 text-amber-600 dark:text-amber-300'
                  : 'text-(--text-primary)',
              )}
              role="timer"
              aria-live="polite"
              aria-label={t('flashStudy.timerRemainingAria')}
            >
              <Timer className="size-4 shrink-0 opacity-80" aria-hidden />
              {formatCountdownMmSs(remainingSec)}
            </div>
          ) : null}

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
