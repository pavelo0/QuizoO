import { useAuthContext } from '@/auth/AuthContext';
import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  profileAvatarBackground,
  profileDisplayInitial,
} from '@/lib/profileAvatar';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/useTheme';
import { LayoutDashboard, Moon, Settings, Sun, X } from 'lucide-react';
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
    user?.username?.trim() || user?.email?.split('@')[0] || 'Profile';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-3 font-(family-name:--font-dm-sans) text-base font-medium no-underline transition-colors',
      isActive
        ? 'bg-(--primary-accent)/12 text-(--primary-accent)'
        : 'text-(--text-primary) hover:bg-(--bg-color)',
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
      aria-label="App navigation"
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close menu"
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
            Menu
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl text-(--text-primary) transition-colors hover:bg-(--bg-color)"
            aria-label="Close menu"
            onClick={onDismiss}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          aria-label="App"
        >
          <NavLink to="/app" end onClick={onDismiss} className={linkClass}>
            <LayoutDashboard className="size-5 shrink-0" strokeWidth={1.75} />
            Dashboard
          </NavLink>
          <NavLink to="/app/settings" onClick={onDismiss} className={linkClass}>
            <Settings className="size-5 shrink-0" strokeWidth={1.75} />
            Settings
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
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
          >
            {theme === 'dark' ? (
              <Sun className="size-4" strokeWidth={1.5} />
            ) : (
              <Moon className="size-4" strokeWidth={1.5} />
            )}
            {theme === 'dark' ? 'Light theme' : 'Dark theme'}
          </Button>

          <Button
            variant="outlineSoft"
            size="cta"
            className="w-full px-4"
            asChild
          >
            <Link
              to="/app/profile"
              onClick={onDismiss}
              className="inline-flex w-full items-center justify-start gap-3 no-underline"
              aria-label="Open profile"
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
                  {user?.email ?? 'Account'}
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
