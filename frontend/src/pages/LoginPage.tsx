import { Button, Input } from '@/components/ui';
import { AppleIcon } from '@/components/ui/icons/AppleIcon';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const fieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate('/app');
  };

  return (
    <div className="flex w-full min-w-0 flex-col pb-2">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 px-0 py-6 pb-1 min-[480px]:gap-5">
        <form
          className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
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
                placeholder="Your password here"
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

          <Button
            variant="cta"
            size="cta"
            className="w-full"
            onClick={handleSubmit}
          >
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
              <GoogleIcon />
              Google
            </Button>
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              className="w-full gap-2"
            >
              <AppleIcon />
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

        <p className="mx-auto w-full max-w-[420px] pt-3 pb-1 text-center font-(family-name:--font-jetbrains-mono) text-[10px] uppercase leading-relaxed tracking-[0.14em] text-(--text-secondary)/75 min-[480px]:pt-4 min-[480px]:pb-2 min-[480px]:text-[11px]">
          © {new Date().getFullYear()} QuizoO Educational Labs
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
