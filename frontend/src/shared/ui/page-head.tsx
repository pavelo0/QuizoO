import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type PageHeadProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  id?: string;
  className?: string;
};

export function PageHead({
  title,
  subtitle,
  action,
  id,
  className,
}: PageHeadProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1
          id={id}
          className="font-(family-name:--font-syne) text-[1.75rem] leading-[1.18] font-extrabold tracking-[-0.03em] text-(--text-primary) sm:text-[2rem]"
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
