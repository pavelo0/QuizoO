import type { ModulesDashboardSummary } from '@/entities/module';
import { useI18n } from '@/shared/i18n/useI18n';
import { DashboardStatCard } from './DashboardStatCard';

export type DashboardStatsProps = {
  summary: ModulesDashboardSummary | null;
  loading: boolean;
};

export function DashboardStats({ summary, loading }: DashboardStatsProps) {
  const { t } = useI18n();

  const avgScoreText =
    summary?.averageQuizScore != null
      ? `${summary.averageQuizScore % 1 === 0 ? summary.averageQuizScore : summary.averageQuizScore.toFixed(1)}%`
      : '—';

  return (
    <section
      className="mb-10 grid gap-4 sm:grid-cols-3"
      aria-label={t('aria.statistics')}
    >
      {loading && !summary ? (
        <>
          <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
          <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
          <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
        </>
      ) : (
        <>
          <DashboardStatCard
            label={t('dashboard.totalModules')}
            value={String(summary?.totalModules ?? 0)}
            valueClassName="text-(--primary-accent)"
          />
          <DashboardStatCard
            label={t('dashboard.cardsStudied')}
            value={String(summary?.cardsStudied ?? 0)}
            valueClassName="text-(--secondary-accent)"
          />
          <DashboardStatCard
            label={t('dashboard.avgQuizScore')}
            value={avgScoreText}
            valueClassName="text-(--primary-accent)"
          />
        </>
      )}
    </section>
  );
}
