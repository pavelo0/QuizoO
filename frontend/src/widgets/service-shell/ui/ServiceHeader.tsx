import { Brand } from '@/shared/ui';
import { SignOutButton } from '@/features/sign-out';
import { useAuthContext } from '@/features/auth-session';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/shared/lib/profileAvatar';
import { cn } from '@/shared/lib/utils';
import { useI18n } from '@/shared/i18n/useI18n';
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Undo2,
  Users,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const ServiceHeader = () => {
  const { user } = useAuthContext();
  const { locale, setLocale, t } = useI18n();

  const hasCustomAvatar = Boolean(user?.avatarMime);
  const avatarSrc =
    user && hasCustomAvatar
      ? `/api/users/me/avatar?v=${encodeURIComponent(user.updatedAt)}`
      : undefined;
  const initial = user ? profileDisplayInitial(user.username, user.email) : '?';
  const avatarInstanceKey = user
    ? `${user.avatarMime ?? 'generated'}-${user.updatedAt}`
    : 'guest';
  const profileLabel =
    user?.username?.trim() || user?.email?.split('@')[0] || t('common.profile');
  const isAdmin = user?.role === 'ADMIN';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex h-11 items-center gap-2.5 rounded-[10px] px-3 font-(family-name:--font-dm-sans) text-sm font-semibold no-underline transition-colors',
      isActive
        ? 'bg-(--blue-tint) text-(--primary-accent)'
        : 'text-(--text-secondary) hover:bg-(--bg-color) hover:text-(--text-primary)',
    );

  return (
    <div className="flex h-full flex-col gap-6 px-3 py-5">
      <Brand to="/app" className="px-3" />

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1"
        aria-label={t('aria.appNavigation')}
      >
        <NavLink to={isAdmin ? '/app/admin' : '/app'} end className={linkClass}>
          {isAdmin ? (
            <LayoutDashboard className="size-4.5 shrink-0" strokeWidth={1.75} />
          ) : (
            <BookOpen className="size-4.5 shrink-0" strokeWidth={1.75} />
          )}
          <span>
            {isAdmin ? t('admin.overviewTitle') : t('modules.myModules')}
          </span>
        </NavLink>
        {isAdmin ? (
          <>
            <NavLink to="/app/admin/users" className={linkClass}>
              <Users className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span>{t('common.users')}</span>
            </NavLink>
            <NavLink to="/app/admin/modules" className={linkClass}>
              <BookOpen className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span>{t('common.modules')}</span>
            </NavLink>
          </>
        ) : (
          <NavLink to="/app/statistics" className={linkClass}>
            <BarChart3 className="size-4.5 shrink-0" strokeWidth={1.75} />
            <span>{t('common.statistics')}</span>
          </NavLink>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-(--border-default) pt-4">
        {isAdmin ? (
          <Link
            to="/app"
            className="flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm font-semibold text-(--text-secondary) no-underline hover:bg-(--bg-color) hover:text-(--text-primary)"
          >
            <Undo2 className="size-4.5 shrink-0" strokeWidth={1.75} />
            <span>{t('admin.backToApp')}</span>
          </Link>
        ) : null}
        <button
          type="button"
          className="h-10 rounded-xl px-3 text-left text-xs font-semibold uppercase text-(--text-secondary) hover:bg-(--bg-color)"
          aria-label={t('common.language')}
          onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
        >
          {locale}
        </button>
        <Link
          to="/app/profile"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 no-underline hover:bg-(--bg-color)"
          aria-label={t('nav.openProfile')}
        >
          <Avatar
            key={avatarInstanceKey}
            className="size-9 border border-(--border-default)"
          >
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback
              delayMs={0}
              className="text-xs font-semibold text-white"
              style={
                user
                  ? { backgroundColor: profileAvatarBackground(user.id) }
                  : undefined
              }
            >
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-(--text-primary)">
              {profileLabel}
            </span>
            <span className="block truncate text-xs text-(--text-secondary)">
              {user?.email ?? t('service.viewAccount')}
            </span>
          </span>
        </Link>
        <SignOutButton className="justify-start" />
      </div>
    </div>
  );
};

export default ServiceHeader;
