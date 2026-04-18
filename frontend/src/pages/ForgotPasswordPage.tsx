import { Button, Input } from '@/components/ui';
import { clerkErrorMessage } from '@/lib/clerkErrorMessage';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import { cn } from '@/lib/utils';
import {
  forgotPasswordEmailSchema,
  resetPasswordFormSchema,
  type ForgotPasswordEmailValues,
  type ResetPasswordFormValues,
} from '@/schemas/auth';
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ForgotPasswordEmailValues, string>>
  >({});
  const [resetFieldErrors, setResetFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormValues, string>>
  >({});
  const [pending, setPending] = useState(false);

  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  const finalizeSignedIn = async (si: SignInFutureResource) => {
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
    } else {
      toast.success('Password updated. You are signed in.');
    }
  };

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const parsed = forgotPasswordEmailSchema.safeParse({
      email: formData.get('email'),
    });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});

    setPending(true);
    try {
      const { error: createError } = await signIn.create({
        identifier: parsed.data.email,
      });
      if (createError) {
        toast.error(clerkErrorMessage(createError));
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        toast.error(clerkErrorMessage(sendError));
        return;
      }

      setEmail(parsed.data.email);
      setCodeSent(true);
      toast.success('Check your email for a reset code.');
    } finally {
      setPending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('Enter the code from your email');
      return;
    }

    setPending(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: trimmed,
      });
      if (error) {
        toast.error(clerkErrorMessage(error));
        return;
      }
      if (signIn.status !== 'needs_new_password') {
        toast.error('Unexpected sign-in state. Try again from the beginning.');
      }
    } finally {
      setPending(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signIn) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const parsed = resetPasswordFormSchema.safeParse({
      password: formData.get('password'),
      passwordConfirm: formData.get('passwordConfirm'),
    });
    if (!parsed.success) {
      setResetFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setResetFieldErrors({});

    setPending(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: parsed.data.password,
      });
      if (error) {
        toast.error(clerkErrorMessage(error));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignedIn(signIn);
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        toast.error(
          'Two-factor authentication is required. Complete 2FA in the Clerk Dashboard or disable MFA for this account to finish reset here.',
          { duration: 8000 },
        );
        return;
      }

      toast.error('Could not finish password reset. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn || pending) return;
    setPending(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) toast.error(clerkErrorMessage(error));
      else toast.success('A new code was sent.');
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
        {!codeSent ? (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleSendCode}
            noValidate
          >
            <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
              Enter the email for your account. We will send a one-time code to
              reset your password.
            </p>
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Email
              </label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
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
            <Button
              variant="cta"
              size="cta"
              className="w-full"
              type="submit"
              disabled={pending}
            >
              {pending ? 'Sending…' : 'Send reset code'}
            </Button>
            <p className="text-center font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
              <Link
                to="/auth/login"
                className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
              >
                Back to log in
              </Link>
            </p>
          </form>
        ) : signIn.status !== 'needs_new_password' ? (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleVerifyCode}
            noValidate
          >
            <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
              Enter the code we sent to{' '}
              <span className="font-medium text-(--text-primary)">{email}</span>
              .
            </p>
            <div>
              <label
                htmlFor="forgot-code"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Verification code
              </label>
              <Input
                id="forgot-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                className={fieldClass}
              />
            </div>
            <Button
              variant="cta"
              size="cta"
              className="w-full"
              type="submit"
              disabled={pending}
            >
              {pending ? 'Verifying…' : 'Verify code'}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
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
                className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                onClick={() => {
                  setCodeSent(false);
                  setCode('');
                  void signIn.reset();
                }}
                disabled={pending}
              >
                Use a different email
              </button>
            </div>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleNewPassword}
            noValidate
          >
            <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
              Choose a new password for your account.
            </p>
            <div>
              <label
                htmlFor="forgot-new-password"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                New password
              </label>
              <div className="relative">
                <Input
                  id="forgot-new-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!resetFieldErrors.password}
                  className={cn(
                    fieldClass,
                    'pr-12',
                    resetFieldErrors.password && 'border-destructive',
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
              {resetFieldErrors.password ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {resetFieldErrors.password}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="forgot-confirm-password"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Confirm new password
              </label>
              <Input
                id="forgot-confirm-password"
                name="passwordConfirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={!!resetFieldErrors.passwordConfirm}
                className={cn(
                  fieldClass,
                  resetFieldErrors.passwordConfirm && 'border-destructive',
                )}
              />
              {resetFieldErrors.passwordConfirm ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {resetFieldErrors.passwordConfirm}
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
              {pending ? 'Saving…' : 'Save password and sign in'}
            </Button>
          </form>
        )}

        <p className="mx-auto w-full max-w-[420px] pt-3 pb-1 text-center font-(family-name:--font-jetbrains-mono) text-[10px] uppercase leading-relaxed tracking-[0.14em] text-(--text-secondary)/75 min-[480px]:pt-4 min-[480px]:pb-2 min-[480px]:text-[11px]">
          © {new Date().getFullYear()} QuizoO Educational Labs
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
