import { Button, PageHead } from '@/shared/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { useSessions, type SessionsRange } from '@/entities/session';
import { useI18n } from '@/shared/i18n/useI18n';
import { cn } from '@/shared/lib/utils';
import {
  BarChart3,
  BookOpenCheck,
  RefreshCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ActivityMetric, scoreColor } from './ActivityMetric';
import { formatDate, formatRelative } from './formatSession';
import { MetricCard } from './MetricCard';
import { ProgressChart } from './ProgressChart';

export function StatisticsPanel() {
  const { locale, t } = useI18n();
  const {
    loading,
    error,
    reload,
    modules,
    selectedModuleId,
    setSelectedModuleId,
    selectedRange,
    setSelectedRange,
    filteredSessions,
    hasMore,
    loadingMore,
    loadMore,
    stats,
    quizSeries,
    modulePerformance,
    cardsToReview,
  } = useSessions();

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <section>
        <PageHead
          title={t('statistics.title')}
          subtitle={t('statistics.subtitle')}
          action={
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              onClick={() => void reload()}
              className="gap-2"
            >
              <RefreshCcw className="size-4" />
              {t('common.refresh')}
            </Button>
          }
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-(--text-primary)">
            {t('statistics.overview')}
          </h2>
          <p className="text-xs text-(--text-secondary)">
            {t('statistics.scopeHint')}
          </p>
        </div>
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <MetricCard
            icon={<BookOpenCheck className="size-4 text-(--primary-accent)" />}
            label={t('statistics.sessions')}
            value={stats.totalSessions}
            helper={t('statistics.sessionsHint')}
          />
          <MetricCard
            icon={<Sparkles className="size-4 text-(--secondary-accent)" />}
            label={t('statistics.cardsStudied')}
            value={stats.cardsStudied}
            helper={t('statistics.cardsHint')}
          />
          <MetricCard
            icon={<Target className="size-4 text-(--secondary-accent)" />}
            label={t('statistics.avgQuizScore')}
            value={
              stats.averageQuizScore == null
                ? '—'
                : `${Math.round(stats.averageQuizScore)}%`
            }
            helper={t('statistics.avgQuizHint')}
          />
        </div>

        <section className="mb-6 rounded-3xl border border-(--border-default) bg-(--bg-color) p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-(--text-primary)">
                {t('statistics.quizQualityTitle')}
              </h2>
              <p className="text-sm text-(--text-secondary)">
                {t('statistics.quizQualitySubtitle')}
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-(--border-default) bg-(--surface-color) p-1">
              {(['7d', '30d', 'all'] as SessionsRange[]).map((range) => (
                <button
                  type="button"
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize text-(--text-secondary) transition-colors',
                    selectedRange === range &&
                      'bg-(--primary-accent)/15 text-(--primary-accent)',
                  )}
                >
                  {range === 'all' ? 'All time' : range}
                </button>
              ))}
            </div>
          </div>

          <ProgressChart points={quizSeries} locale={locale} t={t} />
          {quizSeries.length < 1 ? (
            <p className="mt-3 text-xs text-(--text-secondary)">
              {t('statistics.emptyQuizSeriesHint')}
            </p>
          ) : null}
        </section>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4 xl:col-span-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-(--text-primary)">
                {t('statistics.moduleSnapshotTitle')}
              </h3>
              <BarChart3 className="size-4 text-(--primary-accent)" />
            </div>
            <p className="mb-4 text-xs text-(--text-secondary)">
              {t('statistics.moduleSnapshotHint')}
            </p>

            <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-(--border-default) hover:bg-transparent">
                  <TableHead className="h-10 text-(--text-secondary)">
                    Module
                  </TableHead>
                  <TableHead className="h-10 text-(--text-secondary)">
                    {t('statistics.sessions')}
                  </TableHead>
                  <TableHead className="h-10 text-(--text-secondary)">
                    Best score
                  </TableHead>
                  <TableHead className="h-10 text-(--text-secondary)">
                    Last studied
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulePerformance.length < 1 ? (
                  <TableRow className="border-(--border-default)">
                    <TableCell
                      colSpan={4}
                      className="h-20 text-center text-sm text-(--text-secondary)"
                    >
                      {t('statistics.noModuleActivity')}
                    </TableCell>
                  </TableRow>
                ) : (
                  modulePerformance.slice(0, 6).map((row) => (
                    <TableRow
                      key={row.moduleId}
                      className="border-(--border-default)"
                    >
                      <TableCell className="font-semibold text-(--text-primary)">
                        {row.moduleTitle}
                      </TableCell>
                      <TableCell className="text-(--text-primary)">
                        {row.sessions}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                            scoreColor(row.bestScore),
                          )}
                        >
                          {row.bestScore == null
                            ? '—'
                            : `${Math.round(row.bestScore)}%`}
                        </span>
                      </TableCell>
                      <TableCell className="text-(--text-secondary)">
                        {formatRelative(row.lastStudiedAt, t)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>

          <section className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4 xl:col-span-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-(--text-primary)">
                {t('statistics.priorityReviewTitle')}
              </h3>
              <span className="text-sm text-(--text-secondary)">
                {cardsToReview.length || 0}
              </span>
            </div>
            <p className="mb-4 text-xs text-(--text-secondary)">
              {t('statistics.priorityReviewHint')}
            </p>

            <div className="space-y-3">
              {cardsToReview.length < 1 ? (
                <div className="rounded-2xl border border-(--border-default) bg-(--surface-color) p-4 text-sm text-(--text-secondary)">
                  {t('statistics.noWeakSessions')}
                </div>
              ) : (
                cardsToReview.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-(--border-default) bg-(--surface-color) p-4"
                  >
                    <p className="text-sm text-(--text-primary)">
                      {item.moduleTitle}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-(--danger-color)">
                      {locale === 'ru'
                        ? `${item.mistakes} ошибок в худшей попытке`
                        : `${item.mistakes} mistakes in weakest attempt`}
                    </p>
                    <Link
                      to={`/app/modules/${item.moduleId}/quiz-study`}
                      className="mt-3 inline-flex text-sm font-semibold text-(--primary-accent)"
                    >
                      {t('statistics.startQuiz')}
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-(--border-default) bg-(--surface-color) p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
            {t('statistics.sessionHistory')}
          </h2>

          <div className="flex items-center gap-2">
            <label
              htmlFor="module-filter"
              className="text-sm font-medium text-(--text-secondary)"
            >
              {t('statistics.moduleLabel')}
            </label>
            <select
              id="module-filter"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="h-10 rounded-xl border border-(--border-default) bg-(--bg-color) px-3 text-sm text-(--text-primary) outline-none"
            >
              <option value="all">{t('common.allModules')}</option>
              {(Array.isArray(modules) ? modules : []).map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            <div className="max-h-112 overflow-auto rounded-2xl border border-(--border-default)">
              <Table>
                <TableHeader>
                  <TableRow className="border-(--border-default)">
                    <TableHead>{t('statistics.type')}</TableHead>
                    <TableHead>{t('statistics.module')}</TableHead>
                    <TableHead>{t('statistics.result')}</TableHead>
                    <TableHead>{t('statistics.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-(--border-default)">
                      <TableCell
                        colSpan={4}
                        className="h-16 text-center text-(--text-secondary)"
                      >
                        {t('statistics.loadingSessions')}
                      </TableCell>
                    </TableRow>
                  ) : filteredSessions.length < 1 ? (
                    <TableRow className="border-(--border-default)">
                      <TableCell
                        colSpan={4}
                        className="h-16 text-center text-(--text-secondary)"
                      >
                        {t('statistics.noSessionsForFilter')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="border-(--border-default)"
                      >
                        <TableCell className="font-medium text-(--text-primary)">
                          {session.kind === 'QUIZ_SESSION'
                            ? t('statistics.quiz')
                            : t('statistics.flashcards')}
                        </TableCell>
                        <TableCell className="text-(--text-primary)">
                          {session.moduleTitle}
                        </TableCell>
                        <TableCell>
                          <ActivityMetric session={session} />
                        </TableCell>
                        <TableCell className="text-(--text-secondary)">
                          {formatDate(session.at, locale)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {hasMore ? (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outlineSoft"
                  size="outlineCompact"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore
                    ? t('statistics.loadingMore')
                    : t('statistics.loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
