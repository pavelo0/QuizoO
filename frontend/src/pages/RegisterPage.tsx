import { Button, Input } from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { AppleIcon } from '@/components/ui/icons/AppleIcon';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';
import { Label } from '@/components/ui/label';
import { clerkErrorMessage } from '@/lib/clerkErrorMessage';
import { cn } from '@/lib/utils';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth';
import { useAuth, useSignUp } from '@clerk/react';
import type { SignUpFutureResource } from '@clerk/shared/types';

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

function splitDisplayName(full: string): {
  firstName: string;
  lastName?: string;
} {
  const t = full.trim();
  const space = t.indexOf(' ');
  if (space === -1) return { firstName: t };
  const rest = t.slice(space + 1).trim();
  return { firstName: t.slice(0, space), lastName: rest || undefined };
}

const RegisterPage = () => {
  const [step, setStep] = useState<'credentials' | 'verification'>(
    'credentials',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [codeError, setCodeError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const navigate = useNavigate();

  const finalizeAndGoApp = async (su: SignUpFutureResource) => {
    const { error } = await su.finalize({
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

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!signUp) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const validatedData = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      passwordConfirm: formData.get('passwordConfirm'),
      remember,
    });
    if (!validatedData.success) {
      setFieldErrors(fieldErrorsFromZod(validatedData.error));
      return;
    }
    setFieldErrors({});

    const { firstName, lastName } = splitDisplayName(validatedData.data.name);

    setPending(true);
    try {
      const { error: pwError } = await signUp.password({
        emailAddress: validatedData.data.email,
        password: validatedData.data.password,
        firstName,
        lastName,
      });
      if (pwError) {
        toast.error(clerkErrorMessage(pwError));
        return;
      }

      if (signUp.status === 'complete') {
        await finalizeAndGoApp(signUp);
        return;
      }

      if (signUp.unverifiedFields.includes('email_address')) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          toast.error(clerkErrorMessage(sendError));
          return;
        }
        toast.success('Check your email for a verification code.');
        setStep('verification');
        setVerificationCode('');
        setCodeError(null);
        return;
      }

      await finalizeAndGoApp(signUp);
    } finally {
      setPending(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!signUp) return;
    const code = verificationCode.trim();
    if (!code) {
      setCodeError('Enter the code from your email');
      return;
    }
    setCodeError(null);
    setPending(true);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode(
        { code },
      );
      if (verifyError) {
        toast.error(clerkErrorMessage(verifyError));
        return;
      }

      if (signUp.status === 'complete') {
        await finalizeAndGoApp(signUp);
      } else {
        toast.error(
          'Sign-up is not complete yet. Please try again or contact support.',
        );
      }
    } finally {
      setPending(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp || pending) return;
    setPending(true);
    try {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) toast.error(clerkErrorMessage(sendError));
      else toast.success('A new code was sent to your email.');
    } finally {
      setPending(false);
    }
  };

  const handleBackToCredentials = async () => {
    if (!signUp) return;
    setPending(true);
    try {
      await signUp.reset();
      setStep('credentials');
      setVerificationCode('');
      setCodeError(null);
    } finally {
      setPending(false);
    }
  };

  if (!isLoaded || !signUp) {
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
      <div className="mx-auto flex justify-center w-full max-w-[420px] flex-col gap-4 px-0 py-6 pb-1 min-[480px]:gap-5">
        {step === 'verification' ? (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleVerificationSubmit}
            noValidate
          >
            <div>
              <h2 className="mb-1 font-(family-name:--font-dm-sans) text-lg font-semibold text-(--text-primary)">
                Verify your email
              </h2>
              <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
                Enter the code we sent to your inbox.
              </p>
            </div>
            <div>
              <label
                htmlFor="register-verification-code"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Verification code
              </label>
              <Input
                id="register-verification-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(ev) => {
                  setVerificationCode(ev.target.value);
                  setCodeError(null);
                }}
                aria-invalid={!!codeError}
                className={cn(fieldClass, codeError && 'border-destructive')}
              />
              {codeError ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {codeError}
                </p>
              ) : null}
            </div>
            <Button
              variant="cta"
              size="cta"
              className="w-full"
              type="submit"
              disabled={pending}
            >
              {pending ? 'Verifying…' : 'Verify and continue'}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--primary-accent) transition-opacity hover:opacity-90 disabled:opacity-50"
                onClick={handleResendCode}
                disabled={pending}
              >
                Resend code
              </button>
              <button
                type="button"
                className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary) disabled:opacity-50"
                onClick={handleBackToCredentials}
                disabled={pending}
              >
                Change email
              </button>
            </div>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleCredentialsSubmit}
            noValidate
          >
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Name
              </label>
              <Input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Pavelo_0"
                aria-invalid={!!fieldErrors.name}
                className={cn(
                  fieldClass,
                  fieldErrors.name && 'border-destructive',
                )}
              />
              {fieldErrors.name ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Email
              </label>
              <Input
                id="register-email"
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
                  htmlFor="register-password"
                  className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="New password"
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

            <div>
              <div className="mb-2 flex min-h-5 items-center justify-between gap-3">
                <label
                  htmlFor="register-password-confirm"
                  className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
                >
                  Confirm password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="register-password-confirm"
                  name="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Password confirmation here"
                  aria-invalid={!!fieldErrors.passwordConfirm}
                  className={cn(
                    fieldClass,
                    'pr-12',
                    fieldErrors.passwordConfirm && 'border-destructive',
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
              {fieldErrors.passwordConfirm ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {fieldErrors.passwordConfirm}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="register-remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                className="size-[18px] rounded-md border-(--border-default) data-checked:border-(--primary-accent) data-checked:bg-(--primary-accent)"
              />
              <Label
                htmlFor="register-remember"
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
              {pending ? 'Please wait…' : 'Sign up'}
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
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
              >
                Log in
              </Link>
            </p>
          </form>
        )}

        <p className="mx-auto w-full max-w-[420px] pt-3 pb-1 text-center font-(family-name:--font-jetbrains-mono) text-[10px] uppercase leading-relaxed tracking-[0.14em] text-(--text-secondary)/75 min-[480px]:pt-4 min-[480px]:pb-2 min-[480px]:text-[11px]">
          © {new Date().getFullYear()} QuizoO Educational Labs
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
