import { useAuthContext } from '@/features/auth-session';
import { profileChangePasswordSchema } from '@/features/auth-session';
import { Button, Input, Label } from '@/shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiClient } from '@/shared/api/client';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { cn } from '@/shared/lib/utils';
import { fieldErrorsFromZod } from '@/shared/lib/zodFieldErrors';
import type { ApiPublicUser } from '@/entities/user';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const profileFieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

const profileSectionClass =
  'rounded-2xl border border-(--border-default) bg-(--bg-color) p-5';

export function ChangePasswordSection() {
  const { refresh } = useAuthContext();
  const { t } = useI18n();
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdPending, setPwdPending] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<
    Partial<
      Record<'currentPassword' | 'newPassword' | 'passwordConfirm', string>
    >
  >({});
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  /** Общее отображение для нового пароля и подтверждения */
  const [showPwdNew, setShowPwdNew] = useState(false);

  const resetPasswordForm = () => {
    setPwdCurrent('');
    setPwdNew('');
    setPwdConfirm('');
    setPwdErrors({});
    setShowPwdCurrent(false);
    setShowPwdNew(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileChangePasswordSchema.safeParse({
      currentPassword: pwdCurrent,
      newPassword: pwdNew,
      passwordConfirm: pwdConfirm,
    });
    if (!parsed.success) {
      setPwdErrors(
        fieldErrorsFromZod(parsed.error) as Partial<
          Record<'currentPassword' | 'newPassword' | 'passwordConfirm', string>
        >,
      );
      return;
    }
    setPwdErrors({});
    setPwdPending(true);
    try {
      await apiClient.patch<ApiPublicUser>('/users/me/password', {
        currentPassword: pwdCurrent,
        newPassword: pwdNew,
      });
      await refresh();
      toast.success(t('profile.toastPasswordUpdated'));
      setPwdOpen(false);
      resetPasswordForm();
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setPwdPending(false);
    }
  };

  return (
    <>
      <section
        className={profileSectionClass}
        aria-labelledby="profile-security-heading"
      >
        <h2
          id="profile-security-heading"
          className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)"
        >
          {t('profile.security')}
        </h2>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          {t('profile.securityHint')}
        </p>
        <Button
          type="button"
          variant="outlineSoft"
          size="outlineCompact"
          className="mt-4 gap-2"
          onClick={() => {
            resetPasswordForm();
            setPwdOpen(true);
          }}
        >
          <KeyRound className="size-4" strokeWidth={1.75} />
          {t('profile.changePassword')}
        </Button>
      </section>

      <Dialog
        open={pwdOpen}
        onOpenChange={(open) => {
          setPwdOpen(open);
          if (!open) {
            resetPasswordForm();
          }
        }}
      >
        <DialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary) sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne) text-base">
              {t('profile.changePassword')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('profile.passwordRules')}
            </DialogDescription>
            <p className="font-(family-name:--font-dm-sans) text-xs leading-relaxed text-(--text-secondary)">
              {t('profile.forgotPasswordHintStart')}{' '}
              <Link
                to="/auth/forgot-password"
                className="font-semibold text-(--primary-accent) underline-offset-2 hover:underline"
                onClick={() => setPwdOpen(false)}
              >
                {t('profile.forgotPasswordLink')}
              </Link>
              .
            </p>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={handleChangePassword}
            noValidate
          >
            <div>
              <Label
                htmlFor="pwd-current"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.currentPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="pwd-current"
                  type={showPwdCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={pwdCurrent}
                  onChange={(e) => {
                    setPwdCurrent(e.target.value);
                    setPwdErrors((p) => ({ ...p, currentPassword: undefined }));
                  }}
                  aria-invalid={!!pwdErrors.currentPassword}
                  className={cn(
                    profileFieldClass,
                    'pr-12',
                    pwdErrors.currentPassword && 'border-destructive',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  aria-label={
                    showPwdCurrent
                      ? t('profile.hidePassword')
                      : t('profile.showPassword')
                  }
                  onClick={() => setShowPwdCurrent((v) => !v)}
                >
                  {showPwdCurrent ? (
                    <EyeOff className="size-4.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {pwdErrors.currentPassword ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {pwdErrors.currentPassword}
                </p>
              ) : null}
            </div>
            <div>
              <Label
                htmlFor="pwd-new"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.newPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="pwd-new"
                  type={showPwdNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pwdNew}
                  onChange={(e) => {
                    setPwdNew(e.target.value);
                    setPwdErrors((p) => ({
                      ...p,
                      newPassword: undefined,
                      passwordConfirm: undefined,
                    }));
                  }}
                  aria-invalid={!!pwdErrors.newPassword}
                  className={cn(
                    profileFieldClass,
                    'pr-12',
                    pwdErrors.newPassword && 'border-destructive',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  aria-label={
                    showPwdNew
                      ? t('profile.hidePasswords')
                      : t('profile.showPasswords')
                  }
                  onClick={() => setShowPwdNew((v) => !v)}
                >
                  {showPwdNew ? (
                    <EyeOff className="size-4.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {pwdErrors.newPassword ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {pwdErrors.newPassword}
                </p>
              ) : null}
            </div>
            <div>
              <Label
                htmlFor="pwd-confirm"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.confirmNewPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="pwd-confirm"
                  type={showPwdNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pwdConfirm}
                  onChange={(e) => {
                    setPwdConfirm(e.target.value);
                    setPwdErrors((p) => ({
                      ...p,
                      passwordConfirm: undefined,
                      newPassword: undefined,
                    }));
                  }}
                  aria-invalid={!!pwdErrors.passwordConfirm}
                  className={cn(
                    profileFieldClass,
                    'pr-12',
                    pwdErrors.passwordConfirm && 'border-destructive',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  aria-label={
                    showPwdNew
                      ? t('profile.hidePasswords')
                      : t('profile.showPasswords')
                  }
                  onClick={() => setShowPwdNew((v) => !v)}
                >
                  {showPwdNew ? (
                    <EyeOff className="size-4.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {pwdErrors.passwordConfirm ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {pwdErrors.passwordConfirm}
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outlineSoft"
                size="outlineCompact"
                onClick={() => setPwdOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="cta"
                size="outlineCompact"
                className="rounded-2xl"
                disabled={pwdPending}
              >
                {pwdPending ? t('common.saving') : t('profile.updatePassword')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
