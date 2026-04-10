import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const fieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-[18px] shrink-0', className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-[18px] shrink-0 text-(--text-primary)', className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-between gap-4 overflow-hidden px-0 py-2 min-[480px]:gap-5">
        <form
          className="flex min-h-0 flex-1 flex-col justify-center gap-4 min-[480px]:gap-5"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          noValidate
        >
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
            >
              Email
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClass}
            />
          </div>

          <div>
            <div className="mb-2 flex min-h-5 items-center justify-between gap-3">
              <label
                htmlFor="login-password"
                className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Password
              </label>
              <button
                type="button"
                className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--primary-accent) transition-opacity hover:opacity-90"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(fieldClass, 'pr-12')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" strokeWidth={1.5} />
                ) : (
                  <Eye className="size-4.5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <Button variant="cta" size="cta" className="w-full">
            Log in
          </Button>

          <div
            className="flex items-center gap-4"
            role="separator"
            aria-orientation="horizontal"
          >
            <span className="h-px flex-1 bg-(--border-default)" aria-hidden />
            <span className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-(--text-secondary)">
              or
            </span>
            <span className="h-px flex-1 bg-(--border-default)" aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 min-[480px]:gap-3">
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              className="w-full gap-2"
            >
              <GoogleGlyph />
              Google
            </Button>
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              className="w-full gap-2"
            >
              <AppleGlyph />
              Apple
            </Button>
          </div>

          <p className="text-center font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
            Don&apos;t have an account?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <p className="mx-auto shrink-0 max-w-[420px] pt-3 pb-1 text-center font-(family-name:--font-jetbrains-mono) text-[10px] uppercase leading-relaxed tracking-[0.14em] text-(--text-secondary)/75 min-[480px]:pt-4 min-[480px]:pb-2 min-[480px]:text-[11px]">
        © {new Date().getFullYear()} QuizoO Educational Labs
      </p>
    </div>
  );
};

export default LoginPage;
