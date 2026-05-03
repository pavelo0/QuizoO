import { useAuthContext } from '@/auth/AuthContext';
import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/lib/profileAvatar';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/useI18n';
import { useTheme } from '@/theme/useTheme';
import {
  BarChart2,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const ServiceHeader = () => {
  const { user } = useAuthContext();
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [isCompact, setIsCompact] = useState(false);

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

  const toggleCompact = useCallback(() => {
    setIsCompact((c) => !c);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center rounded-2xl font-(family-name:--font-dm-sans) text-sm font-medium no-underline transition-colors cursor-pointer select-none [&_svg]:pointer-events-none',
      isCompact ? 'size-11 shrink-0 justify-center p-0' : 'gap-3 px-3 py-2.5',
      isActive
        ? 'bg-(--primary-accent)/12 text-(--primary-accent)'
        : 'text-(--text-primary) hover:bg-(--bg-color)',
    );

  return (
    <div
      className={cn(
        'box-border flex h-full shrink-0 flex-col rounded-3xl border border-(--border-default) bg-(--surface-color) shadow-sm transition-[width,padding] duration-200 ease-out',
        isCompact ? 'w-17 gap-4 p-2' : 'w-68 gap-6 p-4',
      )}
    >
      {isCompact ? (
        <div className="flex flex-col items-center gap-1.5">
          <Link
            to="/app"
            className="font-(family-name:--font-syne) flex size-10 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold leading-none tracking-[-0.04em] text-(--text-primary) no-underline transition-opacity hover:opacity-70"
            title="QuizoO — Home"
          >
            Q
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-xl text-(--text-secondary) hover:bg-(--bg-color) hover:text-(--text-primary)"
            aria-label={t('nav.expandSidebar')}
            onClick={toggleCompact}
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link
            to="/app"
            className="min-w-0 flex-1 truncate font-(family-name:--font-syne) text-2xl font-extrabold leading-tight tracking-[-0.04em] text-(--text-primary) no-underline transition-opacity hover:opacity-70"
          >
            QuizoO
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-2xl text-(--text-primary)"
            aria-label={t('nav.compactMenu')}
            onClick={toggleCompact}
          >
            <ChevronLeft className="size-4.5" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col gap-2" aria-label="App">
        <NavLink
          to={isAdmin ? '/app/admin' : '/app'}
          end={!isAdmin}
          title={t('common.dashboard')}
          className={linkClass}
        >
          <LayoutDashboard className="size-4.5 shrink-0" strokeWidth={1.75} />
          <span className={cn(isCompact && 'sr-only')}>
            {t('common.dashboard')}
          </span>
        </NavLink>
        {isAdmin ? (
          <>
            <NavLink
              to="/app/admin/users"
              title={t('common.users')}
              className={linkClass}
            >
              <Users className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span className={cn(isCompact && 'sr-only')}>
                {t('common.users')}
              </span>
            </NavLink>
            <NavLink
              to="/app/admin/modules"
              title={t('common.modules')}
              className={linkClass}
            >
              <BookOpen className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span className={cn(isCompact && 'sr-only')}>
                {t('common.modules')}
              </span>
            </NavLink>
            <NavLink
              to="/app/admin/analytics"
              title={t('common.analytics')}
              className={linkClass}
            >
              <BarChart2 className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span className={cn(isCompact && 'sr-only')}>
                {t('common.analytics')}
              </span>
            </NavLink>
          </>
        ) : null}
        <NavLink
          to="/app/statistics"
          title={t('common.statistics')}
          className={linkClass}
        >
          <BarChart3 className="size-4.5 shrink-0" strokeWidth={1.75} />
          <span className={cn(isCompact && 'sr-only')}>
            {t('common.statistics')}
          </span>
        </NavLink>
        <NavLink
          to="/app/settings"
          title={t('common.settings')}
          className={linkClass}
        >
          <Settings className="size-4.5 shrink-0" strokeWidth={1.75} />
          <span className={cn(isCompact && 'sr-only')}>
            {t('common.settings')}
          </span>
        </NavLink>
      </nav>

      <div
        className={cn(
          'mt-auto flex flex-col border-t border-(--border-default) pt-4',
          isCompact ? 'gap-2' : 'gap-3',
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'text-(--text-primary) hover:bg-(--bg-color)',
            isCompact
              ? 'size-11 rounded-2xl'
              : 'h-11 w-full justify-start gap-3 rounded-2xl px-3',
          )}
          aria-label={
            theme === 'dark' ? t('common.lightMode') : t('common.darkMode')
          }
          aria-pressed={theme === 'dark'}
          title={
            theme === 'dark' ? t('common.lightMode') : t('common.darkMode')
          }
          onClick={toggle}
        >
          {theme === 'dark' ? (
            <Sun className="size-4.5 shrink-0" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4.5 shrink-0" strokeWidth={1.75} />
          )}
          <span
            className={cn(
              'font-(family-name:--font-dm-sans) text-sm font-medium',
              isCompact && 'sr-only',
            )}
          >
            {theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          </span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'text-(--text-primary) hover:bg-(--bg-color)',
            isCompact
              ? 'size-11 rounded-2xl'
              : 'h-11 w-full justify-start gap-3 rounded-2xl px-3',
          )}
          aria-label={t('common.language')}
          title={t('common.language')}
          onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
        >
          <span className="text-xs font-semibold uppercase">{locale}</span>
          <span
            className={cn(
              'font-(family-name:--font-dm-sans) text-sm font-medium',
              isCompact && 'sr-only',
            )}
          >
            {t('common.language')}
          </span>
        </Button>

        <Link
          to="/app/profile"
          className={cn(
            'flex items-center rounded-2xl transition-colors hover:bg-(--bg-color)',
            isCompact ? 'justify-center p-1' : 'gap-3 px-2 py-1.5',
          )}
          aria-label={t('nav.openProfile')}
          title={t('common.profile')}
        >
          <Avatar
            key={avatarInstanceKey}
            className={cn(
              'border border-(--border-default)',
              isCompact ? 'size-9' : 'size-10',
            )}
          >
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback
              delayMs={0}
              className={cn(
                'font-(family-name:--font-dm-sans) font-semibold text-white',
                isCompact ? 'text-xs' : 'text-sm',
              )}
              style={
                user
                  ? { backgroundColor: profileAvatarBackground(user.id) }
                  : undefined
              }
            >
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', isCompact && 'sr-only')}>
            <p className="truncate font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)">
              {profileLabel}
            </p>
            <p className="truncate font-(family-name:--font-dm-sans) text-xs text-(--text-secondary)">
              {user?.email ?? 'View account'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ServiceHeader;
