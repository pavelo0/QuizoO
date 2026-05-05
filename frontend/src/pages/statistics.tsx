import { Button } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSessions, type SessionsRange } from '@/hooks/useSessions';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';
import type { ModuleSessionActivity } from '@/types/module';
import {
  BarChart3,
  BookOpenCheck,
  Flame,
  RefreshCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDay(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

function formatRelative(
  value: string,
  t: (
    key:
      | 'statistics.justNow'
      | 'statistics.hoursAgo'
      | 'statistics.yesterday'
      | 'statistics.daysAgo',
    vars?: Record<string, string | number>,
  ) => string,
) {
  const date = new Date(value);
  const ms = Date.now() - date.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return t('statistics.justNow');
  if (hours < 24) return t('statistics.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t('statistics.yesterday');
  return t('statistics.daysAgo', { count: days });
}

function scoreColor(score: number | null) {
  if (score == null) {
    return 'bg-(--input-bg) text-(--text-secondary)';
  }
  if (score >= 85) {
    return 'bg-(--secondary-accent)/15 text-(--secondary-accent)';
  }
  if (score >= 70) {
    return 'bg-(--primary-accent)/15 text-(--primary-accent)';
  }
  return 'bg-(--danger-color)/15 text-(--danger-color)';
}

function ActivityMetric({ session }: { session: ModuleSessionActivity }) {
  if (session.kind === 'QUIZ_SESSION') {
    return (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold',
          scoreColor(session.scorePercent),
        )}
      >
        {Math.round(session.scorePercent)}%
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-(--secondary-accent)/15 px-2 py-1 text-[11px] font-semibold text-(--secondary-accent)">
      {session.knownCount}/{session.totalCards}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-(--text-secondary)">
        {icon}
      </div>
      <p className="text-sm text-(--text-secondary)">{label}</p>
      <p className="mt-1 text-4xl font-semibold text-(--text-primary)">
        {value}
      </p>
      <p className="mt-2 text-xs text-(--text-secondary)">{helper}</p>
    </article>
  );
}

function ProgressChart({
  points,
  locale,
  t,
}: {
  points: Array<{ date: string; score: number }>;
  locale: string;
  t: (key: 'statistics.emptyQuizSeries') => string;
}) {
  if (points.length < 1) {
    return (
      <div className="grid h-56 place-items-center text-sm text-(--text-secondary)">
        {t('statistics.emptyQuizSeries')}
      </div>
    );
  }

  const width = 820;
  const height = 240;
  const padding = 22;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = 100;
  const min = 0;

  const withCoords = points.map((point, index) => {
    const x =
      padding +
      (points.length === 1
        ? innerW / 2
        : (index / (points.length - 1)) * innerW);
    const y = padding + ((max - point.score) / (max - min)) * innerH;
    return { ...point, x, y };
  });

  const path = withCoords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="relative h-56 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="quizo-line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--primary-accent)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="var(--primary-accent)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[25, 50, 75].map((level) => {
          const y = padding + ((max - level) / (max - min)) * innerH;
          return (
            <line
              key={level}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--border-default)"
              strokeDasharray="4 6"
              strokeWidth="1"
            />
          );
        })}

        <path
          d={path}
          fill="none"
          stroke="var(--primary-accent)"
          strokeWidth="3"
        />

        {withCoords.length > 1 ? (
          <path
            d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#quizo-line-fill)"
          />
        ) : null}

        {withCoords.map((point) => (
          <circle
            key={`${point.date}-${point.score}`}
            cx={point.x}
            cy={point.y}
            r="4.5"
            fill="var(--primary-accent)"
            stroke="var(--surface-color)"
            strokeWidth="2"
          />
        ))}

        {withCoords.map((point, index) => {
          if (
            withCoords.length > 1 &&
            index % Math.max(1, Math.floor(withCoords.length / 4)) !== 0
          ) {
            return null;
          }
          return (
            <text
              key={`${point.date}-label`}
              x={point.x}
              y={height - 6}
              fill="var(--text-secondary)"
              fontSize="10"
              textAnchor="middle"
            >
              {formatDay(point.date, locale)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function StatisticsPage() {
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
    stats,
    quizSeries,
    modulePerformance,
    cardsToReview,
  } = useSessions();

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <section className="rounded-3xl border border-(--border-default) bg-(--surface-color) p-6 shadow-sm lg:p-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
              {t('statistics.title')}
            </h1>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {t('statistics.subtitle')}
            </p>
          </div>
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
        </header>

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
        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <MetricCard
            icon={<Flame className="size-4 text-(--danger-color)" />}
            label={t('statistics.streak')}
            value={
              locale === 'ru'
                ? `${stats.streakDays} дн.`
                : `${stats.streakDays} days`
            }
            helper={t('statistics.streakHint')}
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
                    Sessions
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
              {modules.map((module) => (
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
                    key={`${session.moduleId}-${session.at}-${session.kind}`}
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
        )}
      </section>
    </div>
  );
}
