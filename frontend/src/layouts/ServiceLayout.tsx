import BurgerButton from '@/components/BurgerButton';
import ServiceBurger from '@/components/ServiceBurger';
import ServiceHeader from '@/components/ServiceHeader';
import { useCallback, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

type MobileMenu = 'closed' | 'open' | 'closing';

export default function ServiceLayout() {
  const [mobileMenu, setMobileMenu] = useState<MobileMenu>('closed');

  const toggleMobileMenu = useCallback(() => {
    setMobileMenu((m) => {
      if (m === 'closed') return 'open';
      if (m === 'open') return 'closing';
      return m;
    });
  }, []);

  return (
    <div className="min-h-dvh bg-(--bg-color)">
      <div className="fixed inset-x-0 top-0 z-40 px-3 pt-3 lg:hidden">
        <div className="mx-auto flex h-14 max-w-[120rem] items-center justify-between rounded-2xl border border-(--border-default) bg-(--surface-color)/95 px-4 shadow-sm backdrop-blur">
          <Link
            to="/app"
            className="font-(family-name:--font-syne) text-xl font-extrabold tracking-[-0.04em] text-(--text-primary) no-underline transition-opacity hover:opacity-70"
          >
            QuizoO
          </Link>
          <BurgerButton
            menuOpen={mobileMenu !== 'closed'}
            onToggle={toggleMobileMenu}
            menuId="service-mobile-menu"
          />
        </div>
      </div>

      {mobileMenu !== 'closed' && (
        <ServiceBurger
          phase={mobileMenu === 'open' ? 'open' : 'closing'}
          onDismiss={() => setMobileMenu('closing')}
          onExitComplete={() => setMobileMenu('closed')}
        />
      )}

      <div className="mx-auto flex min-h-dvh w-full max-w-[120rem] flex-col gap-3 px-3 pb-8 pt-[5.25rem] lg:flex-row lg:items-stretch lg:gap-0 lg:px-4 lg:pt-6">
        <aside className="hidden shrink-0 lg:block lg:self-start">
          <div className="sticky top-6 h-[calc(100dvh-3rem)]">
            <ServiceHeader />
          </div>
        </aside>

        <div
          className="hidden shrink-0 self-stretch lg:block lg:w-4 lg:min-w-4 lg:flex-none"
          aria-hidden
        />

        <main className="min-h-[calc(100dvh-5.25rem-2rem)] min-w-0 flex-1 rounded-3xl border border-(--border-default) bg-(--surface-color) p-4 shadow-sm sm:p-5 lg:min-h-[calc(100dvh-3rem)] lg:p-6">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
