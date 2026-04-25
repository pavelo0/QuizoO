import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

const moduleBadgeVariants = cva(
  'inline-flex min-h-7 items-center justify-center rounded-full px-4 py-1.5 text-[0.625rem] font-bold tracking-wide uppercase',
  {
    variants: {
      variant: {
        mint: 'bg-(--module-badge-mint-bg) text-(--module-badge-mint-fg)',
        violet: 'bg-(--module-badge-violet-bg) text-(--module-badge-violet-fg)',
      },
    },
    defaultVariants: {
      variant: 'mint',
    },
  },
);

export type ModuleBadgeProps = ComponentProps<'span'> &
  VariantProps<typeof moduleBadgeVariants>;

/**
 * Пилюля-метка модуля: тёмный фон в тон акценту + контрастный текст (токены `--module-badge-*` в `index.css`).
 */
export function ModuleBadge({
  className,
  variant,
  ...props
}: ModuleBadgeProps) {
  return (
    <span
      data-slot="module-badge"
      className={cn(moduleBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}
