import { Button } from '@/shared/ui/button';
import { FocusBar } from '@/shared/ui/focus-bar';
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
import type { FlashcardStudy } from '../model/useFlashcardStudy';

export function FlashcardStudyView({ study }: { study: FlashcardStudy }) {
  const {
    t,
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
    <>
      <FocusBar
        backTo="/app"
        backLabel={t('shell.leave')}
        title={titleTrimmed}
        status={t('flashStudy.cardProgress', {
          current: currentIndex + 1,
          total: cards.length,
        })}
      />
      <article className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 py-10 text-center text-(--text-primary) sm:px-6">
        <h1 className="sr-only">
          {t('flashStudy.study')}: {titleTrimmed}
        </h1>

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
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
            'shadow-none',
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
                    'flex min-h-[300px] flex-col rounded-[20px] border border-(--border-default) bg-(--surface-color) p-6 sm:min-h-[360px] sm:p-8',
                  )}
                >
                  <p className="text-xs font-semibold tracking-[0.14em] text-(--text-secondary) uppercase">
                    {showAnswer
                      ? t('flashStudy.answer')
                      : t('flashStudy.question')}
                  </p>
                  <p className="mt-6 font-(family-name:--font-syne) text-3xl leading-[1.12] font-extrabold tracking-[-0.03em] text-(--text-primary) sm:text-5xl">
                    {showAnswer ? currentCard.answer : currentCard.question}
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
            {showAnswer ? (
              <>
                <Button
                  type="button"
                  variant="outlineSoft"
                  className="h-12 min-w-40 rounded-xl px-6 text-base font-bold"
                  onClick={() => markCurrent('unknown')}
                >
                  <CircleHelp className="size-4" strokeWidth={2.2} />
                  {t('flashStudy.didntKnow')}
                </Button>
                <Button
                  type="button"
                  variant="cta"
                  size="cta"
                  className="min-w-40"
                  onClick={() => markCurrent('known')}
                >
                  <Check className="size-4" strokeWidth={2.4} />
                  {t('flashStudy.iKnewIt')}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="cta"
                size="cta"
                onClick={toggleFace}
              >
                {t('flashStudy.revealAnswer')}
              </Button>
            )}
          </div>
        </section>

        <section
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-(--border-default) pt-5"
          aria-label={t('aria.sessionStatistics')}
        >
          <p className="font-(family-name:--font-dm-sans) text-sm text-(--success-color)">
            <span className="mr-2 inline-block size-2 rounded-full bg-(--success-color)" />
            {knownCount} {t('flashStudy.known')}
          </p>
          <p className="font-(family-name:--font-dm-sans) text-sm text-(--danger-color)">
            <span className="mr-2 inline-block size-2 rounded-full bg-(--danger-color)" />
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
    </>
  );
}
