import { ChangePasswordSection } from '@/features/change-password';
import { EditProfileSection } from '@/features/edit-profile';
import { useAuthContext } from '@/features/auth-session';
import { SignOutSection } from '@/features/sign-out';
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.02em] text-(--text-primary)">
          {t('profile.title')}
        </h1>
        <p className="mt-2 max-w-lg font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          {t('profile.subtitle')}
        </p>
      </div>

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

      <EditProfileSection />
      <ChangePasswordSection />
      <SignOutSection />
    </div>
  );
};

export default ProfilePage;
