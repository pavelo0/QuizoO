import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/useTheme';
import { Moon, Sun } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';

const statCards = [
  {
    icon: '🔥',
    title: '15-day streak',
    subtitle: 'Keep it up!',
    rotate: '-5deg',
    rowClass: 'self-start z-[1] w-full max-w-[268px]',
    delay: '0s',
  },
  {
    icon: '📚',
    title: '48 cards learned today',
    subtitle: 'Productive session',
    rotate: '4deg',
    rowClass: 'self-end z-[3] w-full max-w-[280px]',
    delay: '0.45s',
  },
  {
    icon: '✅',
    title: '92% quiz accuracy',
    subtitle: 'Mastery level',
    rotate: '-3deg',
    rowClass: 'self-start z-[2] w-full max-w-[268px] pl-2 sm:pl-4',
    delay: '0.9s',
  },
] as const;

export default function AuthLayout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const isAuthGate = location.pathname.startsWith('/auth');
  const isRegister = location.pathname.includes('/auth/register');

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row',
        isAuthGate
          ? 'fixed inset-0 z-0 max-h-dvh min-h-dvh overflow-hidden'
          : 'min-h-screen',
      )}
    >
      <aside
        className={cn(
          'relative overflow-hidden bg-[#0b0e14] lg:flex-[0_0_40%] lg:px-16',
          isAuthGate
            ? 'hidden min-h-0 shrink-0 lg:flex lg:flex-col lg:max-h-none lg:min-h-0 lg:py-16'
            : 'flex min-h-[min(52vh,420px)] flex-1 flex-col px-8 py-10 sm:px-12 sm:py-14 lg:min-h-screen lg:py-20',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_35%_22%,rgba(99,102,241,0.16),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_75%,rgba(0,212,170,0.06),transparent_55%)]"
          aria-hidden
        />

        <div
          className={cn(
            'relative z-10 flex min-h-0 flex-1 flex-col justify-center',
            isAuthGate ? 'py-6 sm:py-8 lg:py-12' : 'py-10 sm:py-12 lg:py-16',
          )}
        >
          <div className="mx-auto flex w-full max-w-[420px] flex-col">
            <header>
              <h2 className="font-(family-name:--font-syne) text-7xl font-extrabold tracking-[-0.02em] text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
                QuizoO
              </h2>
              <p className="mt-3 max-w-md font-(family-name:--font-dm-sans) text-base leading-relaxed text-white/55 md:text-lg">
                Your personal learning companion
              </p>
            </header>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:gap-3.5">
              {statCards.map((card) => (
                <article
                  key={card.title}
                  className={`auth-stat-card rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-5 ${card.rowClass}`}
                  style={
                    {
                      '--auth-stat-rotate': card.rotate,
                      animationDelay: card.delay,
                    } as React.CSSProperties
                  }
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span
                      className="flex shrink-0 select-none text-2xl leading-none sm:text-[1.75rem]"
                      aria-hidden
                    >
                      {card.icon}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="font-(family-name:--font-dm-sans) text-[0.9375rem] font-semibold leading-snug tracking-tight text-white sm:text-base">
                        {card.title}
                      </h3>
                      <p className="mt-1 font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#34e5c5] sm:text-xs">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col bg-(--bg-color) py-6 sm:py-8 lg:min-w-0 lg:flex-[0_0_60%] lg:py-10',
          isAuthGate
            ? 'overflow-hidden px-8 sm:px-12 md:px-14 lg:px-16 xl:px-20'
            : 'overflow-visible px-6 sm:px-10 lg:px-12',
        )}
      >
        {isAuthGate ? (
          <header className="flex shrink-0 items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-(family-name:--font-syne) text-[1.75rem] font-extrabold tracking-[-0.02em] text-(--text-primary) sm:text-[2rem]">
                {isRegister ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="mt-2 font-(family-name:--font-dm-sans) text-sm leading-relaxed text-(--text-secondary) sm:text-[0.9375rem]">
                {isRegister
                  ? 'Join QuizoO and start learning'
                  : 'Log in to continue your learning'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-2xl hover:text-(--primary-accent)"
              aria-label={
                theme === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
              aria-pressed={theme === 'dark'}
              onClick={toggle}
            >
              {theme === 'dark' ? (
                <Sun className="size-4.5" strokeWidth={1.5} />
              ) : (
                <Moon className="size-4.5" strokeWidth={1.5} />
              )}
            </Button>
          </header>
        ) : null}

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            isAuthGate
              ? 'overflow-y-auto overflow-x-hidden overscroll-contain'
              : 'overflow-auto',
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
