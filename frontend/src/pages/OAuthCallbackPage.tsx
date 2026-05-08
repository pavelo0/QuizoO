import { useAuthContext } from '@/auth/AuthContext';
import { getHomeRouteByRole } from '@/lib/authRoute';
import { useI18n } from '@/i18n/useI18n';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallbackPage = () => {
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
      await refresh();
      navigate('/app', { replace: true });
    })();
  }, [locale, navigate, refresh, searchParams, user]);

  return (
    <div className="flex min-h-[220px] items-center justify-center py-10 text-center">
      <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        {t('common.loading')}
      </p>
    </div>
  );
};

export default OAuthCallbackPage;
