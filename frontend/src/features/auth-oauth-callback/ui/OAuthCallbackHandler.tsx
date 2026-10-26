import { getHomeRouteByRole, useAuthContext } from '@/features/auth-session';
import { useI18n } from '@/shared/i18n/useI18n';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function OAuthCallbackHandler() {
  const { user, refresh } = useAuthContext();
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get('oauthError');

    if (oauthError) {
      toast.error(
        locale === 'ru'
          ? 'Не удалось войти через Google. Попробуйте снова.'
          : 'Google sign-in failed. Please try again.',
      );
      navigate('/auth/login', { replace: true });
      return;
    }

    if (user) {
      navigate(getHomeRouteByRole(user.role), { replace: true });
      return;
    }

    void (async () => {
      const refreshedUser = await refresh();
      if (refreshedUser) {
        navigate(getHomeRouteByRole(refreshedUser.role), { replace: true });
        return;
      }
      toast.error(
        locale === 'ru'
          ? 'Сессию после OAuth восстановить не удалось. Войдите снова.'
          : 'Could not restore session after OAuth. Please sign in again.',
      );
      navigate('/auth/login', { replace: true });
    })();
  }, [locale, navigate, refresh, searchParams, user]);

  return (
    <div
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-10 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="size-9 animate-spin rounded-full border-2 border-(--border-default) border-t-(--primary-accent)"
        aria-hidden
      />
      <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        {t('common.loading')}
      </p>
    </div>
  );
}
