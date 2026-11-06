import {
  fetchStudySetStatistics,
  type StudySetStat,
} from '@/entities/study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { Progress } from '@/shared/ui/progress';
import { useEffect, useState } from 'react';

export function StudySetStatsSection() {
  const { locale, t } = useI18n();
  const [sets, setSets] = useState<StudySetStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchStudySetStatistics()
      .then((rows) => {
        if (!cancelled) setSets(rows);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(apiErrorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mb-6 rounded-3xl border border-(--border-default) bg-(--bg-color) p-5">
      <h2 className="text-xl font-semibold text-(--text-primary)">
        {t('statistics.setsTitle')}
      </h2>
      <p className="mb-4 text-sm text-(--text-secondary)">
        {t('statistics.setsHint')}
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {sets === null && !error ? (
        <p className="text-sm text-(--text-secondary)" role="status">
          {t('common.loading')}
        </p>
      ) : null}
      {sets && sets.length === 0 ? (
        <p className="text-sm text-(--text-secondary)">
          {t('statistics.setsEmpty')}
        </p>
      ) : null}
      <div className="grid gap-4">
        {sets?.map((set) => (
          <article
            key={set.id}
            className="rounded-2xl border border-(--border-default) p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-(--text-primary)">
                {set.title}
              </h3>
              <p className="text-sm text-(--text-secondary)">
                {t('statistics.setProgress', {
                  studied: set.studiedCount,
                  total: set.moduleCount,
                  percent: set.progress,
                })}
              </p>
            </div>
            <Progress
              className="mt-3"
              value={set.progress}
              aria-label={t('statistics.setsTitle')}
            />
            <p className="mt-2 text-xs text-(--text-secondary)">
              {t('statistics.setSessions', { count: set.sessionCount })}
            </p>
            {set.recent.length > 0 ? (
              <ul className="mt-3 grid gap-2">
                {set.recent.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="text-(--text-primary)">
                      {session.moduleTitle}
                    </span>
                    <span className="text-(--text-secondary)">
                      {session.kind === 'QUIZ'
                        ? t('statistics.setQuizResult', {
                            percent: Math.round(session.scorePercent ?? 0),
                          })
                        : t('statistics.setFlashResult', {
                            known: session.knownCount ?? 0,
                            total: session.totalCards ?? 0,
                          })}
                      {' · '}
                      {new Date(session.at).toLocaleString(locale)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-(--text-secondary)">
                {t('statistics.setNoHistory')}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
