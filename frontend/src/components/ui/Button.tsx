import cn from '@/lib/utils/cn';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-(--primary-accent) text-white border border-transparent hover:shadow-[0_4px_15px_var(--purple-glow)] focus-visible:shadow-[0_4px_15px_var(--purple-glow)]',
  outline:
    'bg-transparent text-(--text-primary) border border-(--text-primary)/80 hover:bg-white/10 hover:border-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--primary-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-color)',
  secondary:
    'bg-(--secondary-accent) text-[#0f1117] border border-transparent hover:opacity-90 focus-visible:ring-2 focus-visible:ring-(--secondary-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-color)',
  danger:
    'bg-(--danger-color) text-white border border-transparent hover:opacity-90 focus-visible:ring-2 focus-visible:ring-(--danger-color) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-color)',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-sm rounded-xl',
  md: 'min-h-[48px] px-6 py-2.5 text-base rounded-xl',
  lg: 'min-h-[56px] px-6 py-3 text-lg rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-colors [font-family:var(--font-syne)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
};

export { Button };
