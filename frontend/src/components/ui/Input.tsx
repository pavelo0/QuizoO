import cn from '@/lib/utils/cn';
import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: string;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id: idProp, ...rest },
  ref,
) {
  const uid = useId();
  const id = idProp ?? uid;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium tracking-wide text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-[52px] w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--input-bg)] px-4 text-base text-[var(--text-primary)]',
          'placeholder:text-[var(--text-secondary)]',
          'transition-[border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
          'focus:border-[var(--primary-accent)] focus:outline-none focus:shadow-[0_0_10px_var(--purple-glow)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error &&
            'border-[var(--danger-color)] focus:border-[var(--danger-color)] focus:shadow-[0_0_10px_rgba(255,92,92,0.25)]',
          className,
        )}
        style={{ fontFamily: 'var(--font-dm-sans)' }}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...rest}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="text-sm text-[var(--danger-color)]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="text-sm text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export { Input };
