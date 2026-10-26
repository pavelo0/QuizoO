import { cn } from '@/shared/lib/utils';

export const profileFieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

export const profileSectionClass =
  'rounded-[18px] border border-(--border-default) bg-(--surface-color) p-7';
