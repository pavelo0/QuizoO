import { cn } from '@/shared/lib/utils';

export type DashboardStatCardProps = {
  label: string;
  value: string;
  valueClassName: string;
};

export function DashboardStatCard({
  label,
  value,
  valueClassName,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-(--border-default) bg-zinc-100/90 p-5 shadow-sm',
        'dark:border-white/6 dark:bg-[#161b22]',
      )}
    >
      <p className="text-xs font-medium text-(--text-secondary)">{label}</p>
      <p
        className={cn(
          'mt-2 font-(family-name:--font-dm-sans) text-3xl font-bold tracking-tight',
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
