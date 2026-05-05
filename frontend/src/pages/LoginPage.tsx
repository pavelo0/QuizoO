import { useAuthContext } from '@/auth/AuthContext';
import { Button, Input } from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { AppleIcon } from '@/components/ui/icons/AppleIcon';
import { GoogleIcon } from '@/components/ui/icons/GoogleIcon';
import { Label } from '@/components/ui/label';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import { apiClient } from '@/lib/api/client';
import { getHomeRouteByRole } from '@/lib/authRoute';
import { useI18n } from '@/i18n/useI18n';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import type { ApiPublicUser } from '@/types/api-user';
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

  const { refresh } = useAuthContext();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const { data: signedInUser } = await apiClient.post<ApiPublicUser>(
        '/auth/login',
        {
          email: validatedData.data.email,
          password: validatedData.data.password,
        },
      );
      await refresh();
      toast.success(t('auth.signIn'));
      navigate(getHomeRouteByRole(signedInUser.role), { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

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
              {t('auth.email')}
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={
                locale === 'ru' ? 'you@example.com' : 'you@example.com'
              }
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
                {t('auth.password')}
              </label>
              <Link
                to="/auth/forgot-password"
                className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--primary-accent) transition-opacity hover:opacity-90"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={
                  locale === 'ru' ? 'Введите пароль' : 'Your password here'
                }
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
                aria-label={
                  showPassword
                    ? locale === 'ru'
                      ? 'Скрыть пароль'
                      : 'Hide password'
                    : locale === 'ru'
                      ? 'Показать пароль'
                      : 'Show password'
                }
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
              {t('auth.rememberMe')}
            </Label>
          </div>

          <Button
            variant="cta"
            size="cta"
            className="w-full"
            type="submit"
            disabled={pending}
          >
            {pending ? t('auth.signingIn') : t('auth.logIn')}
          </Button>

          <div
            className="flex items-center gap-4"
            role="separator"
            aria-orientation="horizontal"
          >
            <span className="h-px flex-1 bg-(--border-default)" aria-hidden />
            <span className="font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-(--text-secondary)">
              {locale === 'ru' ? 'или' : 'or'}
            </span>
            <span className="h-px flex-1 bg-(--border-default)" aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 min-[480px]:gap-3">
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              className="w-full gap-2"
              disabled
            >
              <GoogleIcon />
              Google
            </Button>
            <Button
              type="button"
              variant="outlineSoft"
              size="outlineCompact"
              className="w-full gap-2"
              disabled
            >
              <AppleIcon />
              Apple
            </Button>
          </div>

          <p className="text-center font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
            {t('auth.noAccount')}{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-(--primary-accent) transition-opacity hover:opacity-90"
            >
              {t('auth.signUp')}
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
