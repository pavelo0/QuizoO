import { useAuthContext } from '@/auth/AuthContext';
import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/lib/profileAvatar';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/useTheme';
import {
  BarChart2,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

type ServiceBurgerProps = {
  phase: 'open' | 'closing';
  onDismiss: () => void;
  onExitComplete: () => void;
};

const ServiceBurger = ({
  phase,
  onDismiss,
  onExitComplete,
}: ServiceBurgerProps) => {
  const [visible, setVisible] = useState(false);
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { user } = useAuthContext();

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
      'flex items-center gap-3 rounded-xl px-3 py-3 font-(family-name:--font-dm-sans) text-base font-medium no-underline transition-colors',
      isActive
        ? 'bg-(--primary-accent)/12 text-(--primary-accent)'
        : 'text-(--text-primary) hover:bg-(--primary-accent)/12',
    );

  useEffect(() => {
    if (phase === 'open') {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    queueMicrotask(() => setVisible(false));
  }, [phase]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const handlePanelTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.propertyName !== 'transform') return;
    if (phase === 'closing') onExitComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      id="service-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t('service.appNavigation')}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        aria-label={t('public.closeMenu')}
        onClick={onDismiss}
      />

      <div
        className={cn(
          'absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-(--border-default) bg-(--surface-color) shadow-2xl transition-transform duration-200 ease-out will-change-transform',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-(--border-default) px-5">
          <span className="font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
            {t('service.menu')}
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl text-(--text-primary) transition-colors hover:bg-(--bg-color)"
            aria-label={t('public.closeMenu')}
            onClick={onDismiss}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          aria-label={t('aria.appNavigation')}
        >
          <NavLink
            to={isAdmin ? '/app/admin' : '/app'}
            end={!isAdmin}
            onClick={onDismiss}
            className={linkClass}
          >
            <LayoutDashboard className="size-5 shrink-0" strokeWidth={1.75} />
            {t('common.dashboard')}
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink
                to="/app/admin/users"
                onClick={onDismiss}
                className={linkClass}
              >
                <Users className="size-5 shrink-0" strokeWidth={1.75} />
                {t('common.users')}
              </NavLink>
              <NavLink
                to="/app/admin/modules"
                onClick={onDismiss}
                className={linkClass}
              >
                <BookOpen className="size-5 shrink-0" strokeWidth={1.75} />
                {t('common.modules')}
              </NavLink>
              <NavLink
                to="/app/admin/analytics"
                onClick={onDismiss}
                className={linkClass}
              >
                <BarChart2 className="size-5 shrink-0" strokeWidth={1.75} />
                {t('common.analytics')}
              </NavLink>
            </>
          ) : null}
          <NavLink
            to="/app/statistics"
            onClick={onDismiss}
            className={linkClass}
          >
            <BarChart3 className="size-5 shrink-0" strokeWidth={1.75} />
            {t('common.statistics')}
          </NavLink>
          <NavLink to="/app/settings" onClick={onDismiss} className={linkClass}>
            <Settings className="size-5 shrink-0" strokeWidth={1.75} />
            {t('common.settings')}
          </NavLink>
        </nav>

        <div className="flex shrink-0 flex-col gap-3 border-t border-(--border-default) p-5">
          <Button
            type="button"
            variant="outlineSoft"
            size="cta"
            className="w-full gap-2"
            onClick={() => {
              toggle();
            }}
            aria-label={
              theme === 'dark' ? t('common.lightMode') : t('common.darkMode')
            }
          >
            {theme === 'dark' ? (
              <Sun className="size-4" strokeWidth={1.5} />
            ) : (
              <Moon className="size-4" strokeWidth={1.5} />
            )}
            {theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          </Button>

          <Button
            type="button"
            variant="outlineSoft"
            size="cta"
            className="w-full gap-2"
            aria-label={t('common.language')}
            onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
          >
            <span className="text-xs font-semibold uppercase">{locale}</span>
            {t('common.language')}
          </Button>

          <Button
            variant="outlineSoft"
            size="cta"
            className="w-full px-4 hover:bg-(--primary-accent)/12"
            asChild
          >
            <Link
              to="/app/profile"
              onClick={onDismiss}
              className="inline-flex w-full items-center justify-start gap-3 no-underline"
              aria-label={t('nav.openProfile')}
            >
              <Avatar
                key={avatarInstanceKey}
                className="size-10 shrink-0 border border-(--border-default)"
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
                  className="font-(family-name:--font-dm-sans) text-sm font-semibold text-white"
                  style={
                    user
                      ? { backgroundColor: profileAvatarBackground(user.id) }
                      : undefined
                  }
                >
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-(family-name:--font-dm-sans) text-sm font-semibold">
                  {profileLabel}
                </span>
                <span className="block truncate font-(family-name:--font-dm-sans) text-xs font-normal text-(--text-secondary)">
                  {user?.email ?? t('service.account')}
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBurger;
