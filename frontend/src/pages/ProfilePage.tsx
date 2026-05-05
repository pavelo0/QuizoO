import { useAuthContext } from '@/auth/AuthContext';
import { Button, Input, Label } from '@/components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n/useI18n';
import { apiClient } from '@/lib/api/client';
import { apiErrorText } from '@/lib/apiErrorMessage';
import {
  PROFILE_AVATAR_ACCEPT,
  PROFILE_AVATAR_MAX_BYTES,
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/lib/profileAvatar';
import { cn } from '@/lib/utils';
import { fieldErrorsFromZod } from '@/lib/zodFieldErrors';
import {
  profileChangeEmailSchema,
  profileChangePasswordSchema,
  profileDisplayNameSchema,
} from '@/schemas/auth';
import type { ApiPublicUser } from '@/types/api-user';
import {
  Eye,
  EyeOff,
  ImageUp,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const fieldClass = cn(
  'h-12 min-h-12 rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-0 text-sm text-(--text-primary)',
  'shadow-none placeholder:text-(--text-secondary)',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10 md:text-sm',
);

const sectionClass =
  'rounded-2xl border border-(--border-default) bg-(--bg-color) p-5';

const ProfilePage = () => {
  const { user, refresh } = useAuthContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const [nickname, setNickname] = useState('');
  const [nicknamePending, setNicknamePending] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const [avatarPending, setAvatarPending] = useState(false);

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

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailNew, setEmailNew] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailPending, setEmailPending] = useState(false);
  const [emailErrors, setEmailErrors] = useState<
    Partial<Record<'newEmail' | 'currentPassword', string>>
  >({});
  const [showEmailPwd, setShowEmailPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.username ?? '');
    }
  }, [user?.id, user?.username]);

  if (!user) {
    return (
      <div className="flex items-center gap-2 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t('profile.loading')}
      </div>
    );
  }

  const hasCustomAvatar = Boolean(user.avatarMime);
  const avatarSrc = hasCustomAvatar
    ? `/api/users/me/avatar?v=${encodeURIComponent(user.updatedAt)}`
    : undefined;
  const initial = profileDisplayInitial(user.username, user.email);
  /** Сбрасывает Radix Avatar после удаления фото — иначе fallback с буквой не показывается. */
  const avatarInstanceKey = `${user.avatarMime ?? 'generated'}-${user.updatedAt}`;

  const resetPasswordForm = () => {
    setPwdCurrent('');
    setPwdNew('');
    setPwdConfirm('');
    setPwdErrors({});
    setShowPwdCurrent(false);
    setShowPwdNew(false);
  };

  const resetEmailForm = () => {
    setEmailNew('');
    setEmailPassword('');
    setEmailErrors({});
    setShowEmailPwd(false);
  };

  const handleLogout = async () => {
    setLogoutPending(true);
    try {
      await apiClient.post('/auth/logout');
      await refresh();
      toast.success(t('profile.toastSignedOut'), { duration: 3500 });
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setLogoutPending(false);
      setLogoutOpen(false);
    }
  };

  const handleSaveNickname = async () => {
    const parsed = profileDisplayNameSchema.safeParse({
      displayName: nickname,
    });
    if (!parsed.success) {
      const err = fieldErrorsFromZod(parsed.error);
      setDisplayNameError(err.displayName ?? t('errors.invalidDisplayName'));
      return;
    }
    setDisplayNameError(null);
    const next =
      parsed.data.displayName === '' ? null : parsed.data.displayName;
    if (next === (user.username ?? null)) {
      toast(t('profile.toastNoChanges'), { duration: 2500 });
      return;
    }
    setNicknamePending(true);
    try {
      await apiClient.patch<ApiPublicUser>('/users/me', { username: next });
      await refresh();
      toast.success(t('profile.toastDisplayNameUpdated'));
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setNicknamePending(false);
    }
  };

  const handleAvatarFile = async (file: File | undefined) => {
    if (!file) return;

    if (!PROFILE_AVATAR_ACCEPT.split(',').includes(file.type)) {
      toast.error(t('profile.toastUseImageTypes'));
      return;
    }
    if (file.size > PROFILE_AVATAR_MAX_BYTES) {
      toast.error(t('profile.toastImageTooLarge'));
      return;
    }

    setAvatarPending(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await apiClient.post<ApiPublicUser>('/users/me/avatar', fd, {
        transformRequest: [
          (data, headers) => {
            if (data instanceof FormData) {
              delete headers['Content-Type'];
            }
            return data;
          },
        ],
        timeout: 60_000,
      });
      await refresh();
      toast.success(t('profile.toastPhotoUpdated'));
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setAvatarPending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!hasCustomAvatar) return;
    setAvatarPending(true);
    try {
      await apiClient.delete<ApiPublicUser>('/users/me/avatar');
      await refresh();
      toast.success(t('profile.toastPhotoRemoved'));
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setAvatarPending(false);
    }
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
        verificationCode?: string;
      }>('/users/me/email', {
        newEmail: trimmed,
        currentPassword: parsed.data.currentPassword,
      });
      await refresh();
      toast.success(data.message, { duration: 5000 });
      if (data.verificationCode) {
        toast(`Lab code: ${data.verificationCode}`, { duration: 8000 });
      }
      setEmailOpen(false);
      resetEmailForm();
    } catch (err) {
      toast.error(apiErrorText(err, t));
    } finally {
      setEmailPending(false);
    }
  };

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

      <section
        className={sectionClass}
        aria-labelledby="profile-identity-heading"
      >
        <h2
          id="profile-identity-heading"
          className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)"
        >
          {t('profile.identity')}
        </h2>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          {t('profile.photoHint')}
        </p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="relative">
              <Avatar
                key={avatarInstanceKey}
                className="size-28 border-2 border-(--border-default) shadow-sm"
              >
                {avatarSrc ? (
                  <AvatarImage
                    src={avatarSrc}
                    alt=""
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback
                  delayMs={0}
                  className="text-3xl font-bold text-white"
                  style={{
                    backgroundColor: profileAvatarBackground(user.id),
                  }}
                >
                  {initial}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute -right-1 -bottom-1 size-10 rounded-full border-0 bg-(--surface-color) hover:bg-(--surface-color) active:bg-(--surface-color) p-0 active:translate-y-0',
                  'shadow-[0_0_0_1px_var(--border-default),0_10px_15px_-3px_rgb(0_0_0/0.1),0_4px_6px_-4px_rgb(0_0_0/0.1)]',
                  'transition-shadow duration-300 ease-out',
                  'hover:shadow-[0_0_0_1px_var(--primary-accent),0_10px_15px_-3px_rgb(0_0_0/0.1),0_4px_6px_-4px_rgb(0_0_0/0.1)]',
                )}
                disabled={avatarPending}
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('profile.uploadPhoto')}
                title={t('profile.uploadPhoto')}
              >
                {avatarPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImageUp className="size-4" strokeWidth={1.9} />
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={PROFILE_AVATAR_ACCEPT}
              className="sr-only"
              onChange={(e) => void handleAvatarFile(e.target.files?.[0])}
            />

            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {hasCustomAvatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="outlineCompact"
                  className="gap-2 text-(--text-secondary) hover:text-destructive"
                  disabled={avatarPending}
                  onClick={() => void handleRemoveAvatar()}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                  {t('profile.remove')}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div>
              <Label
                htmlFor="profile-nickname"
                className="mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)"
              >
                {t('profile.displayName')}
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Input
                  id="profile-nickname"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setDisplayNameError(null);
                  }}
                  autoComplete="nickname"
                  placeholder={t('profile.howOthersSeeYou')}
                  aria-invalid={!!displayNameError}
                  className={cn(
                    fieldClass,
                    'min-w-0 flex-1',
                    displayNameError && 'border-destructive',
                  )}
                  maxLength={80}
                />
                <Button
                  type="button"
                  variant="cta"
                  size="outlineCompact"
                  className="shrink-0 rounded-2xl"
                  disabled={nicknamePending}
                  onClick={() => void handleSaveNickname()}
                >
                  {nicknamePending ? t('auth.saving') : t('common.save')}
                </Button>
              </div>
              {displayNameError ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {displayNameError}
                </p>
              ) : (
                <p className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-(--text-secondary)">
                  {t('profile.displayNameHint')}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                {t('profile.emailLabel')}
              </p>
              <p className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-primary)">
                {user.email}
              </p>
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
            </div>
          </div>
        </div>
      </section>

      <section
        className={sectionClass}
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

      <section
        className={sectionClass}
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
        <Button
          type="button"
          variant="outlineSoft"
          size="outlineCompact"
          className="mt-4 gap-2"
          onClick={() => setLogoutOpen(true)}
          disabled={logoutPending}
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          {t('profile.logOut')}
        </Button>
      </section>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary)">
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
                    fieldClass,
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
                    fieldClass,
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
                    fieldClass,
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
                  fieldClass,
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
                    fieldClass,
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
    </div>
  );
};

export default ProfilePage;
