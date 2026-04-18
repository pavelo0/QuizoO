import { Button, Input } from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { AppleIcon } from '@/components/ui/icons/AppleIcon';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';
import { Label } from '@/components/ui/label';
import { clerkErrorMessage } from '@/lib/clerkErrorMessage';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { useAuth, useSignIn } from '@clerk/react';
import type { SignInFutureResource } from '@clerk/shared/types';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const fieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [pending, setPending] = useState(false);

  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  const finalizeAndGoApp = async (si: SignInFutureResource) => {
    const { error } = await si.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl('/app');
        if (url.startsWith('http')) window.location.href = url;
        else navigate(url);
      },
    });
    if (error) {
      toast.error(clerkErrorMessage(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const validatedData = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      remember,
    });
    if (!validatedData.success) {
      setFieldErrors(fieldErrorsFromZod(validatedData.error));
      return;
    }
    setFieldErrors({});

    setPending(true);
    try {
      const { error: pwError } = await signIn.password({
        emailAddress: validatedData.data.email,
        password: validatedData.data.password,
      });
      if (pwError) {
        toast.error(clerkErrorMessage(pwError));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeAndGoApp(signIn);
        return;
      }

      if (signIn.status === 'needs_new_password') {
        toast.error(
          'You must set a new password. Use your organization’s password reset flow.',
        );
        return;
      }

      await signIn.reset();
      toast.error(
        'Sign-in expects an extra step (for example MFA or email verification). Use the Clerk Dashboard to disable user MFA and optional “Client Trust” email codes if you want only email + password.',
        { duration: 8000 },
      );
    } finally {
      setPending(false);
    }
  };

  if (!isLoaded || !signIn) {
    return (
      <div className="flex w-full min-w-0 flex-col items-center justify-center py-16">
        <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col pb-2">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 px-0 py-6 pb-1 min-[480px]:gap-5">
        <form
          className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
          onSubmit={handleSubmit}
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
              aria-invalid={!!fieldErrors.email}
              className={cn(
                fieldClass,
                fieldErrors.email && 'border-destructive',
              )}
            />
            {fieldErrors.email ? (
              <p
                className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                role="alert"
              >
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex min-h-5 items-center justify-between gap-3">
              <label
                htmlFor="login-password"
                className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--primary-accent) transition-opacity hover:opacity-90"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password here"
                aria-invalid={!!fieldErrors.password}
                className={cn(
                  fieldClass,
                  'pr-12',
                  fieldErrors.password && 'border-destructive',
                )}
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
            {fieldErrors.password ? (
              <p
                className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                role="alert"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="login-remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
              className="size-[18px] rounded-md border-(--border-default) data-checked:border-(--primary-accent) data-checked:bg-(--primary-accent)"
            />
            <Label
              htmlFor="login-remember"
              className="cursor-pointer font-(family-name:--font-dm-sans) text-sm font-normal text-(--text-primary)"
            >
              Remember me
            </Label>
          </div>

          <Button
            variant="cta"
            size="cta"
            className="w-full"
            type="submit"
            disabled={pending}
          >
            {pending ? 'Signing in…' : 'Log in'}
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
