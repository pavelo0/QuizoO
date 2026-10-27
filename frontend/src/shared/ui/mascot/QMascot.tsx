import { cn } from '@/shared/lib/utils';

type QMascotProps = {
  className?: string;
  /** Подпись для скринридеров. Декоративные сцены оставляют пустой. */
  label?: string;
};

/**
 * Статичный маскот Q: карточка с загнутым углом.
 * Без анимации и реплик — только иллюстрация.
 */
export function QMascot({ className, label = '' }: QMascotProps) {
  return (
    <svg
      viewBox="0 0 160 148"
      className={cn('h-auto w-36', className)}
      role={label ? 'img' : 'presentation'}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx="80" cy="136" rx="36" ry="6" fill="#DFE3EF" />
      <path
        d="M38 28c0-8 6-14 14-14h48l28 28v78c0 8-6 14-14 14H52c-8 0-14-6-14-14V28z"
        fill="#F4EEFC"
        stroke="#24315C"
        strokeWidth="3"
      />
      <path
        d="M100 14v22c0 6 5 10 12 10h16"
        fill="#F6CE61"
        stroke="#24315C"
        strokeWidth="3"
      />
      <circle cx="62" cy="68" r="4" fill="#24315C" />
      <circle cx="90" cy="68" r="4" fill="#24315C" />
      <path
        d="M68 84c4 4 12 4 16 0"
        fill="none"
        stroke="#24315C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M30 78c-8 2-12 10-8 16"
        fill="none"
        stroke="#24315C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M130 78c8 2 12 10 8 16"
        fill="none"
        stroke="#24315C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M58 124c2 8 8 12 14 12h8c6 0 12-4 14-12"
        fill="none"
        stroke="#24315C"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
