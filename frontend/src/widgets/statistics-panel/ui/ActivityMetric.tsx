import { cn } from '@/shared/lib/utils';
import type { ModuleSessionActivity } from '@/entities/module';

export function scoreColor(score: number | null) {
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

export function ActivityMetric({
  session,
}: {
  session: ModuleSessionActivity;
}) {
  if (session.kind === 'QUIZ_SESSION') {
    const safeScore = Number.isFinite(session.scorePercent)
      ? session.scorePercent
      : null;
    return (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold',
          scoreColor(safeScore),
        )}
      >
        {safeScore == null ? '—' : `${Math.round(safeScore)}%`}
      </span>
    );
  }
  const flashPercent =
    session.totalCards > 0
      ? (session.knownCount / session.totalCards) * 100
      : 0;
  return (
    <span className="inline-flex rounded-full bg-(--secondary-accent)/15 px-2 py-1 text-[11px] font-semibold text-(--secondary-accent)">
      {`${Math.round(flashPercent)}% (${session.knownCount}/${session.totalCards})`}
    </span>
  );
}
