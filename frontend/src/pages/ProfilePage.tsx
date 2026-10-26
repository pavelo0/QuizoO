import { ChangePasswordSection } from '@/features/change-password';
import { EditProfileSection } from '@/features/edit-profile';
import { useAuthContext } from '@/features/auth-session';
import { SignOutSection } from '@/features/sign-out';
import { PageHead } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuthContext();
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="flex items-center gap-2 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t('profile.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHead title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {!user.emailVerified ? (
        <div
          className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
          role="status"
        >
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            {t('profile.emailNotVerified')}
          </p>
          <p className="mt-1 text-(--text-secondary)">
            {t('profile.emailNotVerifiedHint')}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <EditProfileSection />
        <ChangePasswordSection />
      </div>
      <SignOutSection />
    </div>
  );
};

export default ProfilePage;
