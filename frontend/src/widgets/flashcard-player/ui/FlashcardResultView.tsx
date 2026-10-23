import { formatStudyElapsed } from '@/shared/lib/sessionTimerPrefs';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { Check, CircleX, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FlashcardStudy } from '../model/useFlashcardStudy';

export function FlashcardResultView({ study }: { study: FlashcardStudy }) {
  const {
    t,
    moduleId,
    moduleTitle,
    cards,
    marks,
    flashElapsedMs,
    knownCount,
    unknownCount,
    animatedPercent,
    visiblePercent,
    performanceLabel,
    persistState,
    persistError,
    restartSession,
    persistSession,
  } = study;
  const titleTrimmed = moduleTitle.trim() || t('flashStudy.titleDefault');
  const flashElapsedSummary =
    flashElapsedMs !== null
      ? (() => {
          const { minutes, seconds } = formatStudyElapsed(flashElapsedMs);
          return minutes > 0
            ? t('sessionTimer.completedInMinutesSeconds', { minutes, seconds })
            : t('sessionTimer.completedInSecondsOnly', { seconds });
        })()
      : null;

  return (
    <article className="mx-auto flex w-full max-w-[980px] flex-1 flex-col pb-4 text-(--text-primary)">
      <h1 className="sr-only">
        {t('flashStudy.resultsTitle', { title: titleTrimmed })}
      </h1>
      <header className="mb-8 text-center">
        <h2 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
          {t('flashStudy.resultsTitle', { title: titleTrimmed })}
        </h2>
        {flashElapsedSummary ? (
          <p className="mt-2 text-sm text-(--text-secondary)">
            {flashElapsedSummary}
          </p>
        ) : null}
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
            <div className="flex size-full items-center justify-center overflow-hidden rounded-full border border-(--border-default) bg-(--surface-color) text-center">
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
          <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
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
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {t('flashStudy.known')}
            </p>
            <p className="mt-1 font-(family-name:--font-syne) text-3xl font-bold">
              {knownCount}
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-default) bg-(--input-bg)/40 px-4 py-4 text-center">
            <p className="text-xs text-red-700 dark:text-red-300">
              {t('flashStudy.unknown')}
            </p>
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
                        className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                        aria-hidden
                      />
                    ) : (
                      <CircleX
                        className="mt-0.5 size-4 shrink-0 text-red-700 dark:text-red-300"
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
                      known
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300',
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
