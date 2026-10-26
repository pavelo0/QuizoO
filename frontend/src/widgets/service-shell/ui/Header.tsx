import { Brand, Button } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Burger from './Burger';
import BurgerButton from './BurgerButton';

type MobileMenu = 'closed' | 'open' | 'closing';

const Header = () => {
  const { t } = useI18n();
  const [mobileMenu, setMobileMenu] = useState<MobileMenu>('closed');

  const toggleMobileMenu = useCallback(() => {
    setMobileMenu((m) => {
      if (m === 'closed') return 'open';
      if (m === 'open') return 'closing';
      return m;
    });
  }, []);

  return (
    <>
      <header className="relative z-40 h-20 w-full bg-(--bg-color)">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Brand />

          <div className="flex items-center gap-2">
            <BurgerButton
              className="sm:hidden"
              menuOpen={mobileMenu !== 'closed'}
              onToggle={toggleMobileMenu}
              openLabel={t('public.openMenu')}
              closeLabel={t('public.closeMenu')}
            />
            <Button
              className="hidden sm:inline-flex"
              variant="outlineSoft"
              size="outlineCompact"
              asChild
            >
              <Link to="/auth/login">{t('auth.logIn')}</Link>
            </Button>
            <Button
              className="hidden sm:inline-flex"
              variant="cta"
              size="cta"
              asChild
            >
              <Link to="/auth/register">{t('public.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {mobileMenu !== 'closed' && (
        <Burger
          phase={mobileMenu === 'open' ? 'open' : 'closing'}
          onDismiss={() => setMobileMenu('closing')}
          onExitComplete={() => setMobileMenu('closed')}
        />
      )}
    </>
  );
};

export default Header;
