import { QMascot } from '@/shared/ui/mascot/QMascot';
import { Brand, Button } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { Outlet, useLocation } from 'react-router-dom';

export default function AuthLayout() {
  const { locale, setLocale, t } = useI18n();
  const location = useLocation();
  const isRegister = location.pathname.includes('/auth/register');
  const isForgotPassword = location.pathname.includes('/auth/forgot-password');
  const title = isRegister
    ? t('auth.createAccountTitle')
    : isForgotPassword
      ? t('auth.resetPasswordTitle')
      : t('auth.welcomeBackTitle');
  const subtitle = isRegister
    ? t('auth.createAccountSubtitle')
    : isForgotPassword
      ? t('auth.resetPasswordSubtitle')
      : t('auth.welcomeBackSubtitle');

  return (
    <div className="min-h-dvh bg-(--bg-color) text-(--text-primary)">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Brand />
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-xl px-3 text-xs font-semibold uppercase"
          aria-label={t('common.language')}
          onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
        >
          {locale}
        </Button>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-6xl flex-col items-center justify-center gap-10 px-5 pb-16 lg:flex-row lg:gap-20">
        <div className="w-full max-w-[460px] rounded-[20px] border border-(--border-default) bg-(--surface-color) px-7 py-9 shadow-[0_15px_50px_color-mix(in_srgb,var(--text-primary)_6%,transparent)] sm:px-10 sm:py-11">
          <h1 className="font-(family-name:--font-syne) text-[1.75rem] font-extrabold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-2 mb-6 text-sm leading-relaxed text-(--text-secondary)">
            {subtitle}
          </p>
          <Outlet />
        </div>
        <div
          className="relative hidden h-[300px] w-[260px] shrink-0 rounded-[30px] bg-(--blue-tint) lg:block"
          aria-hidden
        >
          <QMascot className="absolute bottom-10 left-1/2 w-36 -translate-x-1/2" />
          <p className="absolute top-8 right-6 left-6 text-center text-sm text-(--text-secondary)">
            {isRegister
              ? t('auth.createAccountTitle')
              : t('auth.layoutTagline')}
          </p>
        </div>
      </main>
    </div>
  );
}
