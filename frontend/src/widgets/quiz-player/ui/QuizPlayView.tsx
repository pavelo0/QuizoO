import { SortableOrderingList } from '@/features/edit-question-ordering';
import { splitFillBlankPrompt } from '@/features/edit-question-fill-blank';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { FocusBar } from '@/shared/ui/focus-bar';
import { Textarea } from '@/shared/ui/textarea';
import { questionImageUrl } from '@/entities/module';
import { formatCountdownMmSs } from '@/shared/lib/sessionTimerPrefs';
import { cn } from '@/shared/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { isQuestionAnswered, type QuizStudy } from '../model/useQuizStudy';

export function QuizPlayView({ study }: { study: QuizStudy }) {
  const {
    t,
    moduleId,
    moduleTitle,
    questions,
    totalQuestions,
    nextCursor,
    currentIndex,
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
    imageLoadFailedByQuestionId,
    setChoiceAnswer,
    setTextAnswer,
    setFillBlankAnswer,
    setMatchingAnswer,
    setStudyOrderingOrder,
    goPrev,
    goNext,
    submitSession,
    onQuestionImageError,
    restart,
    confirmLeave,
    cancelLeave,
  } = study;
  if (!currentQuestion) return null;
  const titleTrimmed = moduleTitle.trim() || t('quizStudy.quizModule');
  const currentAnswered = isQuestionAnswered(currentQuestion, currentDraft);
  const matchingOptions =
    currentQuestion.type === 'MATCHING'
      ? (Array.isArray(currentQuestion.matchingPairs)
          ? currentQuestion.matchingPairs
          : []
        ).map((pair) => ({
          id: pair.id,
          label: pair.rightItem,
        }))
      : [];

  return (
    <>
      <FocusBar
        backTo="/app"
        backLabel={t('shell.leave')}
        title={titleTrimmed}
        status={t('quizStudy.questionProgress', {
          current: currentIndex + 1,
          total: totalQuestions,
        })}
      />
      <article className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 py-10 text-(--text-primary) sm:px-6">
        <h1 className="sr-only">
          {t('quizStudy.quiz')}: {titleTrimmed}
        </h1>

        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {timerEnabled ? (
              !fullyLoaded ? (
                <p
                  className="max-w-56 text-right text-xs text-(--text-secondary)"
                  role="status"
                  aria-live="polite"
                >
                  {t('quizStudy.timerPrefetching')}
                </p>
              ) : (
                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border border-(--border-default) bg-(--input-bg)/40 px-3 py-1.5 font-(family-name:--font-dm-sans) text-sm font-semibold tabular-nums',
                    timerActive && remainingSec <= 60
                      ? 'border-amber-500/40 text-amber-600 dark:text-amber-300'
                      : 'text-(--text-primary)',
                  )}
                  role="timer"
                  aria-live="polite"
                  aria-label={t('quizStudy.timerRemainingAria')}
                >
                  <Timer className="size-4 shrink-0 opacity-80" aria-hidden />
                  {formatCountdownMmSs(remainingSec)}
                </div>
              )
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="outlineCompact"
              className="h-10 rounded-xl"
              onClick={restart}
            >
              <RotateCcw className="size-4" aria-hidden />
              {t('quizStudy.restart')}
            </Button>
          </div>
        </div>

        <section
          className={cn(
            'relative rounded-3xl border border-(--border-default) bg-(--surface-color) px-4 py-6 sm:px-8 sm:py-8',
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-(--module-badge-violet-bg) px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
              <ClipboardList className="size-3.5" aria-hidden />
              {t('quizStudy.questionProgress', {
                current: Math.min(currentIndex + 1, totalQuestions),
                total: totalQuestions,
              })}
            </div>
            <p
              className={cn(
                'text-xs font-semibold',
                currentAnswered
                  ? 'text-emerald-300'
                  : 'text-(--text-secondary)',
              )}
            >
              {currentAnswered
                ? t('quizStudy.answered')
                : t('quizStudy.notAnswered')}
            </p>
          </div>

          <div className="mb-6 h-2 rounded-full bg-(--input-bg)/70">
            <div
              className="h-full rounded-full bg-(--primary-accent) transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
              aria-label={t('aria.statistics')}
            />
          </div>

          {currentQuestion.type === 'FILL_BLANK' ? (
            <p className="font-(family-name:--font-syne) text-2xl leading-relaxed font-extrabold tracking-[-0.03em] sm:text-3xl">
              {splitFillBlankPrompt(currentQuestion.questionText).map(
                (segment, index) =>
                  segment.kind === 'text' ? (
                    <span key={`text-${index}`}>{segment.value}</span>
                  ) : (
                    <input
                      key={`blank-${segment.index}`}
                      value={
                        currentDraft?.fillBlankAnswers?.[segment.index - 1] ??
                        ''
                      }
                      onChange={(event) =>
                        setFillBlankAnswer(
                          currentQuestion.id,
                          segment.index,
                          event.target.value,
                        )
                      }
                      aria-label={t('quizStudy.fillBlankInput', {
                        index: segment.index,
                      })}
                      className="mx-1 inline-block w-28 border-b-2 border-(--primary-accent) bg-transparent px-1 text-center text-[0.9em] font-semibold text-(--text-primary) outline-none placeholder:text-(--text-secondary)"
                    />
                  ),
              )}
            </p>
          ) : (
            <h2 className="font-(family-name:--font-syne) text-2xl leading-tight font-extrabold tracking-[-0.03em] sm:text-3xl">
              {currentQuestion.questionText}
            </h2>
          )}
          {currentQuestion.questionImageMime &&
          !imageLoadFailedByQuestionId[currentQuestion.id] ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-(--border-default) bg-(--input-bg)/30 p-2">
              <img
                src={questionImageUrl(moduleId, currentQuestion.id, {
                  version: currentQuestion.createdAt,
                })}
                alt={t('quizStudy.questionImageAlt')}
                className="max-h-80 w-full rounded-xl object-contain"
                onError={() => onQuestionImageError(currentQuestion.id)}
              />
            </div>
          ) : null}

          {currentQuestion.type === 'CHOICE' ? (
            <div className="mt-6 space-y-2.5">
              <p className="text-xs text-(--text-secondary)">
                {currentQuestion.allowMultipleAnswers
                  ? t('quizStudy.selectOneOrMore')
                  : t('quizStudy.selectOne')}
              </p>
              {(Array.isArray(currentQuestion.questionOptions)
                ? currentQuestion.questionOptions
                : []
              ).map((opt) => {
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
                {t('quizStudy.typeAnswer')}
              </label>
              <Textarea
                id="quiz-text-answer"
                value={currentDraft?.textAnswer ?? ''}
                onChange={(e) =>
                  setTextAnswer(currentQuestion.id, e.target.value)
                }
                placeholder={t('quizStudy.typeAnswerPlaceholder')}
                rows={4}
                className="min-h-28 rounded-2xl border-(--border-default) bg-(--input-bg)/35"
              />
            </div>
          ) : null}

          {currentQuestion.type === 'MATCHING' ? (
            <div className="mt-6 space-y-3">
              {(Array.isArray(currentQuestion.matchingPairs)
                ? currentQuestion.matchingPairs
                : []
              ).map((pair) => (
                <div
                  key={pair.id}
                  className="grid gap-2 rounded-2xl border border-(--border-default) bg-(--input-bg)/30 p-3 sm:grid-cols-[1fr_1fr]"
                >
                  <p className="self-center text-sm font-medium">
                    {pair.leftItem}
                  </p>
                  <label className="sr-only" htmlFor={`matching-${pair.id}`}>
                    {t('quizStudy.selectMatchingValue')}
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
                    <option value="">{t('quizStudy.selectMatch')}</option>
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

          {currentQuestion.type === 'ORDERING' ? (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-(--text-secondary)">
                {t('quizStudy.orderingInstruction')}
              </p>
              <SortableOrderingList
                items={studyOrderingItems}
                mode="study"
                onReorder={(items) =>
                  setStudyOrderingOrder(currentQuestion.id, items)
                }
              />
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
                aria-label={t('aria.previousQuestion')}
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
                aria-label={t('aria.nextQuestion')}
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
              {submitState === 'saving'
                ? t('quizStudy.submitting')
                : t('quizStudy.finishQuiz')}
            </Button>
          </div>

          <p className="mt-4 text-xs text-(--text-secondary)">
            {timerEnabled ? null : t('quizStudy.lazyLoadHint')}
          </p>
          {submitState === 'error' && submitError ? (
            <p className="mt-2 text-xs text-destructive">
              {t('quizStudy.submitFailed', { error: submitError })}
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
              <AlertDialogTitle>{t('quizStudy.leaveTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('quizStudy.leaveDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-col sm:gap-2">
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-full"
                onClick={confirmLeave}
              >
                {t('quizStudy.leaveAction')}
              </Button>
              <AlertDialogCancel
                className="w-full sm:w-full"
                onClick={cancelLeave}
              >
                {t('quizStudy.stayAction')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </article>
    </>
  );
}
