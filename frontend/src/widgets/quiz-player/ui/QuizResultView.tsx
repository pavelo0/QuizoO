import { questionImageUrl } from '@/entities/module';
import { formatStudyElapsed } from '@/shared/lib/sessionTimerPrefs';
import { Button } from '@/shared/ui/button';
import { Check, CircleX, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  renderCorrectAnswer,
  renderUserAnswer,
  type QuizStudy,
} from '../model/useQuizStudy';

export function QuizResultView({ study }: { study: QuizStudy }) {
  const {
    t,
    moduleId,
    moduleTitle,
    session,
    quizElapsedMs,
    animatedPercent,
    visiblePercent,
    resultAnswers,
    imageLoadFailedByQuestionId,
    onQuestionImageError,
    restart,
  } = study;
  if (!session) return null;
  const titleTrimmed = moduleTitle.trim() || t('quizStudy.quizModule');
  const scorePercent = Math.round(session.scorePercent);
  const wrongCount = session.totalQuestions - session.correctCount;
  const performanceLabel =
    scorePercent >= 85
      ? t('quizStudy.performanceExcellent')
      : scorePercent >= 65
        ? t('quizStudy.performanceGood')
        : scorePercent >= 45
          ? t('quizStudy.performanceKeep')
          : t('quizStudy.performanceMore');
  const elapsedSummary =
    quizElapsedMs !== null
      ? (() => {
          const { minutes, seconds } = formatStudyElapsed(quizElapsedMs);
          return minutes > 0
            ? t('sessionTimer.completedInMinutesSeconds', {
                minutes,
                seconds,
              })
            : t('sessionTimer.completedInSecondsOnly', { seconds });
        })()
      : null;

  return (
    <article className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col pb-4 text-(--text-primary)">
      <h1 className="sr-only">
        {t('quizStudy.resultsTitle', { title: titleTrimmed })}
      </h1>
      <header className="mb-8 text-center">
        <h2 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
          {t('quizStudy.resultsTitle', { title: titleTrimmed })}
        </h2>
        <p className="mt-2 text-sm text-(--text-secondary)">
          {t('quizStudy.resultsCorrect', {
            correct: session.correctCount,
            total: session.totalQuestions,
          })}
        </p>
        {elapsedSummary ? (
          <p className="mt-1 text-sm text-(--text-secondary)">
            {elapsedSummary}
          </p>
        ) : null}
      </header>

      <section className="mx-auto w-full rounded-3xl border border-(--border-default) bg-(--input-bg)/20 p-5 sm:p-7">
        <div className="mx-auto mb-6 flex w-fit flex-col items-center gap-3">
          <div
            className="grid size-42 shrink-0 place-items-center overflow-hidden rounded-full p-2 sm:size-48"
            style={{
              background: `conic-gradient(var(--secondary-accent) ${animatedPercent}%, rgba(119,131,171,0.18) ${animatedPercent}% 100%)`,
            }}
            aria-label={t('aria.statistics')}
          >
            <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-(--border-default) bg-(--surface-color) text-center">
              <div className="flex w-full max-w-full flex-col items-center justify-center px-2">
                <p className="leading-none font-(family-name:--font-syne) text-3xl font-extrabold sm:text-4xl">
                  {visiblePercent}%
                </p>
                <p className="mt-2 text-xs text-(--text-secondary)">
                  {t('quizStudy.sessionComplete')}
                </p>
              </div>
            </div>
          </div>
          <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {performanceLabel}
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {t('quizStudy.correct')}
            </p>
            <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
              {session.correctCount}
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
            <p className="text-xs text-red-700 dark:text-red-300">
              {t('quizStudy.wrong')}
            </p>
            <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
              {wrongCount}
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
            <p className="text-xs text-(--text-secondary)">
              {t('quizStudy.total')}
            </p>
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
            className="h-11 min-w-36 gap-2 rounded-xl"
            onClick={restart}
          >
            <RotateCcw className="size-4" />
            {t('quizStudy.retake')}
          </Button>
          <Button
            asChild
            type="button"
            variant="cta"
            size="outlineCompact"
            className="h-11 min-w-36 rounded-xl"
          >
            <Link to={`/app/modules/${encodeURIComponent(moduleId)}/quiz-edit`}>
              {t('common.backToModule')}
            </Link>
          </Button>
        </div>
      </section>

      <section
        className="overflow-hidden rounded-2xl border border-(--border-default)"
        aria-label={t('aria.questionsBreakdown')}
      >
        <header className="border-b border-(--border-default) bg-(--input-bg)/45 px-4 py-3">
          <h3 className="font-(family-name:--font-syne) text-lg font-bold">
            {t('quizStudy.breakdownTitle')}
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
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                ) : (
                  <CircleX className="mt-0.5 size-4 shrink-0 text-red-700 dark:text-red-300" />
                )}
                <p className="font-semibold text-(--text-primary)">
                  {answer.question.questionText}
                </p>
              </div>
              {answer.question.questionImageMime &&
              !imageLoadFailedByQuestionId[answer.question.id] ? (
                <div className="mb-3 ml-6 overflow-hidden rounded-xl border border-(--border-default) bg-(--input-bg)/25 p-2">
                  <img
                    src={questionImageUrl(moduleId, answer.question.id, {
                      version: answer.question.createdAt,
                    })}
                    alt={t('quizStudy.questionImageAlt')}
                    className="max-h-56 w-full rounded-lg object-contain"
                    onError={() => onQuestionImageError(answer.question.id)}
                  />
                </div>
              ) : null}
              <p className="ml-6 text-sm text-(--text-secondary)">
                {t('quizStudy.yourAnswer', {
                  value: renderUserAnswer(answer, t),
                })}
              </p>
              <p className="ml-6 mt-1 text-sm text-(--text-secondary)">
                {t('quizStudy.correctAnswer', {
                  value: renderCorrectAnswer(answer),
                })}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
