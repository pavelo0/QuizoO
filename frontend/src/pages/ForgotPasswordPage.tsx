import { useAuthContext } from '@/auth/AuthContext';
import { Button, Input } from '@/components/ui';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import { apiClient } from '@/lib/api/client';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import { cn } from '@/lib/utils';
import {
  forgotPasswordEmailSchema,
  resetPasswordFormSchema,
  type ForgotPasswordEmailValues,
  type ResetPasswordFormValues,
} from '@/schemas/auth';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
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

  const { user, refresh } = useAuthContext();
  const navigate = useNavigate();
  const signedIn = Boolean(user);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const { data } = await apiClient.post<{
        message: string;
        resetCode?: string;
      }>('/auth/forgot-password', { email: parsed.data.email });

      setEmail(parsed.data.email);
      setCodeSent(true);
      if (data.resetCode) {
        toast.success(`Reset code (lab): ${data.resetCode}`);
      } else {
        toast.success(
          'If the account exists, a reset code was logged on the server.',
        );
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.error('Enter the reset code');
      return;
    }

    setPending(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        code: trimmedCode,
        newPassword: parsed.data.password,
      });
      await refresh();
      toast.success('Password updated. You are signed in.');
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const handleResendCode = async () => {
    if (pending || !email) return;
    setPending(true);
    try {
      const { data } = await apiClient.post<{
        message: string;
        resetCode?: string;
      }>('/auth/forgot-password', { email });
      if (data.resetCode) {
        toast.success(`New code (lab): ${data.resetCode}`);
      } else {
        toast.success('A new code was logged on the server.');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

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
              {signedIn ? (
                <>
                  You&apos;re signed in. We&apos;ll send a one-time code to{' '}
                  <span className="font-medium text-(--text-primary)">
                    {user?.email}
                  </span>
                  . Use it below to set a new password — no need to know the old
                  one. In lab mode the code is also in the API server log.
                </>
              ) : (
                <>
                  Enter the email for your account. A one-time code is written
                  to the API server log (lab mode).
                </>
              )}
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
                readOnly={signedIn}
                aria-readonly={signedIn}
                aria-invalid={!!fieldErrors.email}
                className={cn(
                  fieldClass,
                  fieldErrors.email && 'border-destructive',
                  signedIn && 'cursor-not-allowed opacity-90',
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
              {signedIn ? (
                <Link
                  to="/app/profile"
                  className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
                >
                  Back to profile
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
                >
                  Back to log in
                </Link>
              )}
            </p>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 min-[480px]:gap-5 p-1"
            onSubmit={handleResetPassword}
            noValidate
          >
            <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
              Enter the code for{' '}
              <span className="font-medium text-(--text-primary)">{email}</span>{' '}
              and choose a new password.
            </p>
            <div>
              <label
                htmlFor="forgot-code"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                Reset code
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
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--primary-accent) transition-opacity hover:opacity-90 disabled:opacity-50"
                onClick={handleResendCode}
                disabled={pending}
              >
                Resend code
              </button>
              {signedIn ? (
                <Link
                  to="/app/profile"
                  className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                  Back to profile
                </Link>
              ) : (
                <button
                  type="button"
                  className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  onClick={() => {
                    setCodeSent(false);
                    setCode('');
                  }}
                  disabled={pending}
                >
                  Use a different email
                </button>
              )}
            </div>
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
