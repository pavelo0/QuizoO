import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-[10px] border border-(--border-default) bg-(--input-bg) px-3 text-[15px] text-(--text-primary) transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-(--text-secondary) focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
