import { Brand } from '@/shared/ui';
import {
  BurgerButton,
  ServiceBurger,
  ServiceHeader,
} from '@/widgets/service-shell';
import { useCallback, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

type MobileMenu = 'closed' | 'open' | 'closing';

function isFocusRoute(pathname: string) {
  return /^\/app\/modules\/(?:create|[^/]+\/(?:edit|quiz-edit|flash-study|quiz-study))$/.test(
    pathname,
  );
}

export default function ServiceLayout() {
  const { pathname } = useLocation();
  const focus = isFocusRoute(pathname);
  const [mobileMenu, setMobileMenu] = useState<MobileMenu>('closed');

  const toggleMobileMenu = useCallback(() => {
    setMobileMenu((m) => {
      if (m === 'closed') return 'open';
      if (m === 'open') return 'closing';
      return m;
    });
  }, []);

  if (focus) {
    return (
      <div className="min-h-dvh bg-(--bg-color)">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--bg-color)">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-(--border-default) bg-(--surface-color) lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand to="/app" className="text-xl" />
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

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh border-r border-(--border-default) bg-(--surface-color) lg:block">
          <ServiceHeader />
        </aside>
        <main className="min-w-0 px-4 pt-20 pb-10 sm:px-8 lg:px-10 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
