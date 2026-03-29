import cn from '@/lib/utils/cn';
import type { ComponentPropsWithoutRef } from 'react';

type CardProps = ComponentPropsWithoutRef<'div'> & {
  /** `default` — 16px radius; `hero` — 24px для крупных блоков */
  variant?: 'default' | 'hero';
  /** Подъём и подсветка бордера по hover (карточки-ссылки, кликабельные блоки) */
  interactive?: boolean;
};

const Card = ({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) => {
  return (
    <div
      className={cn(
        'border border-[var(--border-default)] bg-[var(--surface-color)]',
        variant === 'default' ? 'rounded-2xl' : 'rounded-[24px]',
        interactive &&
          'cursor-pointer transition-all duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-[var(--primary-accent)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export { Card };
