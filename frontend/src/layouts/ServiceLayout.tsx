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
    <div className="flex min-h-dvh flex-col bg-(--bg-color)">
      <div className="sticky top-0 z-40 shrink-0 px-3 pt-3 lg:hidden">
        <div className="flex h-14 items-center justify-between rounded-2xl border border-(--border-default) bg-(--surface-color) px-4 shadow-sm">
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

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-8 pt-3 lg:flex-row lg:items-stretch lg:gap-0 lg:px-4 lg:pt-4">
        <aside className="hidden shrink-0 overflow-hidden lg:block">
          <div className="sticky top-4 h-[calc(100dvh-2rem)]">
            <ServiceHeader />
          </div>
        </aside>

        <div
          className="hidden shrink-0 self-stretch lg:block lg:w-4 lg:min-w-4 lg:flex-none"
          aria-hidden
        />

        <main className="min-w-0 min-h-0 flex-1 rounded-3xl border border-(--border-default) bg-(--surface-color) p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
