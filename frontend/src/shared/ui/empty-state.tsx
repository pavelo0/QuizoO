import { QMascot } from '@/shared/ui/mascot/QMascot';
import { cn } from '@/shared/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  showMascot?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  showMascot = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-[20px] border border-dashed border-(--border-default) bg-(--surface-color) px-6 py-14 text-center',
        className,
      )}
    >
      {showMascot ? <QMascot className="mb-4 w-28" /> : null}
      <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-(--text-secondary)">
          {description}
        </p>
      ) : null}
    </div>
  );
}
