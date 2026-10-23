import { useAuthContext } from '@/features/auth-session';
import { profileChangeEmailSchema } from '@/features/auth-session';
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
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { profileFieldClass } from './profileFieldClass';

export function ChangeEmailDialog() {
  const { user, refresh } = useAuthContext();
  const { t } = useI18n();
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailNew, setEmailNew] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailPending, setEmailPending] = useState(false);
  const [emailErrors, setEmailErrors] = useState<
    Partial<Record<'newEmail' | 'currentPassword', string>>
  >({});
  const [showEmailPwd, setShowEmailPwd] = useState(false);

  if (!user) return null;

  const resetEmailForm = () => {
    setEmailNew('');
    setEmailPassword('');
    setEmailErrors({});
    setShowEmailPwd(false);
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileChangeEmailSchema.safeParse({
      newEmail: emailNew,
      currentPassword: emailPassword,
    });
    if (!parsed.success) {
      setEmailErrors(
        fieldErrorsFromZod(parsed.error) as Partial<
          Record<'newEmail' | 'currentPassword', string>
        >,
      );
      return;
    }
    const trimmed = parsed.data.newEmail.trim().toLowerCase();
    if (trimmed === user.email.toLowerCase()) {
      setEmailErrors({
        newEmail: t('profile.sameEmailError'),
      });
      return;
    }
    setEmailErrors({});
    setEmailPending(true);
    try {
      const { data } = await apiClient.patch<{
        user: ApiPublicUser;
        message: string;
      }>('/users/me/email', {
        newEmail: trimmed,
        currentPassword: parsed.data.currentPassword,
      });
      await refresh();
      toast.success(data.message, { duration: 5000 });
      setEmailOpen(false);
      resetEmailForm();
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setEmailPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outlineSoft"
        size="outlineCompact"
        className="mt-3 gap-2"
        onClick={() => {
          resetEmailForm();
          setEmailOpen(true);
        }}
      >
        <Mail className="size-4" strokeWidth={1.75} />
        {t('profile.changeEmail')}
      </Button>

      <Dialog
        open={emailOpen}
        onOpenChange={(open) => {
          setEmailOpen(open);
          if (!open) {
            resetEmailForm();
          }
        }}
      >
        <DialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary) sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne) text-base">
              {t('profile.changeEmail')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('profile.changeEmailHint')}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleChangeEmail} noValidate>
            <div>
              <Label
                htmlFor="email-new"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.newEmail')}
              </Label>
              <Input
                id="email-new"
                type="email"
                autoComplete="email"
                value={emailNew}
                onChange={(e) => {
                  setEmailNew(e.target.value);
                  setEmailErrors((p) => ({ ...p, newEmail: undefined }));
                }}
                aria-invalid={!!emailErrors.newEmail}
                className={cn(
                  profileFieldClass,
                  emailErrors.newEmail && 'border-destructive',
                )}
              />
              {emailErrors.newEmail ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {emailErrors.newEmail}
                </p>
              ) : null}
            </div>
            <div>
              <Label
                htmlFor="email-password"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.currentPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="email-password"
                  type={showEmailPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={emailPassword}
                  onChange={(e) => {
                    setEmailPassword(e.target.value);
                    setEmailErrors((p) => ({
                      ...p,
                      currentPassword: undefined,
                    }));
                  }}
                  aria-invalid={!!emailErrors.currentPassword}
                  className={cn(
                    profileFieldClass,
                    'pr-12',
                    emailErrors.currentPassword && 'border-destructive',
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                  aria-label={
                    showEmailPwd
                      ? t('profile.hidePassword')
                      : t('profile.showPassword')
                  }
                  onClick={() => setShowEmailPwd((v) => !v)}
                >
                  {showEmailPwd ? (
                    <EyeOff className="size-4.5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="size-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {emailErrors.currentPassword ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {emailErrors.currentPassword}
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outlineSoft"
                size="outlineCompact"
                onClick={() => setEmailOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="cta"
                size="outlineCompact"
                className="rounded-2xl"
                disabled={emailPending}
              >
                {emailPending ? t('common.saving') : t('profile.updateEmail')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
