import { cn } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';

type BrandProps = {
  to?: string;
  className?: string;
};

export function Brand({ to = '/', className }: BrandProps) {
  return (
    <Link
      to={to}
      className={cn(
        'font-(family-name:--font-brand) text-2xl font-extrabold tracking-[-0.06em] text-(--text-primary) no-underline',
        className,
      )}
    >
      Quiz
      <span className="text-(--primary-accent)">oO</span>
    </Link>
  );
}
