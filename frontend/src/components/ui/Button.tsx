import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "cursor-pointer group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
        /** QuizoO: фиолетовый CTA, лёгкое свечение, ховер — чуть темнее фон (см. docs/techDesign.md) */
        cta: 'border-0 bg-(--primary-accent) font-(family-name:--font-dm-sans) text-sm font-bold text-white shadow-[0_2px_14px_rgba(108,99,255,0.22)] transition-colors hover:bg-(--primary-accent)/88 hover:shadow-[0_2px_12px_rgba(108,99,255,0.18)]',
        /** Прозрачный фон, контур через box-shadow (без сдвига при «утолщении» на ховере) */
        outlineSoft:
          'border-0 bg-transparent font-(family-name:--font-dm-sans) text-sm font-bold text-(--text-primary) shadow-[0_0_0_1px_var(--border-default)] transition-shadow hover:shadow-[0_0_0_1px_var(--primary-accent)]',
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        /**
         * CTA в хедере: высота 48px как в docs/techDesign.md (стандартная кнопка).
         * Горизонталь 24px (px-6), вертикаль через фиксированную высоту + flex — без «плавающего» py.
         */
        cta: 'h-12 min-h-12 rounded-2xl px-6 py-0 text-sm/relaxed',
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-4",
        /** Квадрат под outlineSoft + иконка в хедере */
        'icon-header':
          'size-10 rounded-2xl [&_svg:not([class*="size-"])]:size-[1.125rem]',
        /**
         * Log in (outline): та же высота 48px, что у `cta`; горизонталь чуть меньше (px-5).
         */
        outlineCompact:
          'h-12 min-h-12 rounded-2xl px-5 py-0 text-sm/relaxed [&_svg:not([class*="size-"])]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
