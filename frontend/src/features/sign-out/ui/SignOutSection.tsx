import { useAuthContext } from '@/features/auth-session';
import { Button } from '@/shared/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiClient } from '@/shared/api/client';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { cn } from '@/shared/lib/utils';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const profileSectionClass =
  'rounded-[18px] border border-(--border-default) bg-(--surface-color) p-7';

export function SignOutButton({
  className,
  onSignedOut,
}: {
  className?: string;
  onSignedOut?: () => void;
}) {
  const { signOutLocal } = useAuthContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      await apiClient.post('/auth/logout');
      signOutLocal();
      toast.success(t('profile.toastSignedOut'), { duration: 3500 });
      onSignedOut?.();
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setLogoutPending(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-11 gap-2 rounded-xl px-3 text-sm font-medium text-(--text-primary)',
          className,
        )}
        onClick={() => setLogoutOpen(true)}
        disabled={logoutPending}
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        {t('profile.logOut')}
      </Button>
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="border-(--border-default) bg-(--surface-color) text-(--text-primary)">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
              {t('profile.signOutQuestion')}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('profile.signOutDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-(--border-default)">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-(--primary-accent) text-white hover:bg-(--primary-accent)/90"
              onClick={(e) => {
                e.preventDefault();
                void handleLogout();
              }}
              disabled={logoutPending}
            >
              {logoutPending ? t('profile.signingOut') : t('profile.signOut')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SignOutSection() {
  const { t } = useI18n();

  return (
    <section
      className={profileSectionClass}
      aria-labelledby="profile-session-heading"
    >
      <h2
        id="profile-session-heading"
        className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)"
      >
        {t('profile.session')}
      </h2>
      <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        {t('profile.sessionHint')}
      </p>
      <SignOutButton className="mt-3" />
    </section>
  );
}
