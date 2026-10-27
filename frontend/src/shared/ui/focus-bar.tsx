import { cn } from '@/shared/lib/utils';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type FocusBarProps = {
  backTo: string;
  backLabel: string;
  title: string;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function FocusBar({
  backTo,
  backLabel,
  title,
  status,
  actions,
  className,
}: FocusBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 grid h-[72px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-(--border-default) bg-(--surface-color) px-3 sm:px-7',
        className,
      )}
    >
      <Link
        to={backTo}
        className="inline-flex min-w-0 items-center gap-1 justify-self-start text-sm font-bold text-(--text-primary) no-underline"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{backLabel}</span>
      </Link>
      <p className="max-w-[34vw] truncate text-center text-sm font-bold text-(--text-primary) sm:max-w-md">
        {title}
      </p>
      <div className="flex min-w-0 items-center justify-end gap-3 justify-self-end">
        {status ? (
          <span className="hidden truncate text-xs font-semibold text-(--text-secondary) sm:inline">
            {status}
          </span>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
