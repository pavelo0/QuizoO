import { useAuthContext } from '@/features/auth-session';
import { profileDisplayNameSchema } from '@/features/auth-session';
import { Button, Input, Label } from '@/shared/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiClient } from '@/shared/api/client';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import {
  PROFILE_AVATAR_ACCEPT,
  PROFILE_AVATAR_MAX_BYTES,
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/shared/lib/profileAvatar';
import { cn } from '@/shared/lib/utils';
import { fieldErrorsFromZod } from '@/shared/lib/zodFieldErrors';
import type { ApiPublicUser } from '@/entities/user';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ChangeEmailDialog } from './ChangeEmailDialog';
import { profileFieldClass, profileSectionClass } from './profileFieldClass';

export function EditProfileSection() {
  const { user, refresh } = useAuthContext();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [nicknamePending, setNicknamePending] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [avatarPending, setAvatarPending] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.username ?? '');
    }
  }, [user]);

  if (!user) return null;

  const hasCustomAvatar = Boolean(user.avatarMime);
  const avatarSrc = hasCustomAvatar
    ? `/api/users/me/avatar?v=${encodeURIComponent(user.updatedAt)}`
    : undefined;
  const initial = profileDisplayInitial(user.username, user.email);
  /** Сбрасывает Radix Avatar после удаления фото — иначе fallback с буквой не показывается. */
  const avatarInstanceKey = `${user.avatarMime ?? 'generated'}-${user.updatedAt}`;

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

  return (
    <section
      className={profileSectionClass}
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
                <AvatarImage src={avatarSrc} alt="" className="object-cover" />
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
                  profileFieldClass,
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
            <ChangeEmailDialog />
          </div>
        </div>
      </div>
    </section>
  );
}
