import type { ReactNode } from 'react';

export function MetricCard({
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
