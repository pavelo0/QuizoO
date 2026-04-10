import { Button } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';
import { Moon, Sun } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Burger from './Burger';
import BurgerButton from './BurgerButton';

type MobileMenu = 'closed' | 'open' | 'closing';

const Header = () => {
  const { theme, toggle } = useTheme();
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
      <header className="relative z-40 h-20 w-full border-b-[0.5px] bg-(--bg-color)">
        <div className="mx-auto flex h-full max-w-[1320px] px-5">
          <div className="flex h-full w-full min-w-0 items-center justify-between gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
            <div className="min-w-0 justify-self-start">
              <Link
                to="/"
                className="font-(family-name:--font-syne) text-[30px] font-extrabold leading-9 tracking-[-0.75px] text-(--text-primary) no-underline hover:opacity-70"
              >
                QuizoO
              </Link>
            </div>

            <nav
              className="hidden shrink-0 justify-self-center lg:block"
              aria-label="Main"
            >
              <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
                <li>
                  <a
                    href="#features"
                    className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-primary) no-underline hover:opacity-90"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-primary) no-underline hover:opacity-90"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-primary) no-underline hover:opacity-90"
                  >
                    How it works
                  </a>
                </li>
              </ul>
            </nav>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3 lg:justify-self-end">
              <BurgerButton
                menuOpen={mobileMenu !== 'closed'}
                onToggle={toggleMobileMenu}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden h-12 w-12 shrink-0 rounded-2xl text-(--text-primary) transition-colors hover:bg-transparent hover:text-(--primary-accent) focus-visible:bg-transparent dark:hover:bg-transparent lg:inline-flex"
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

              <Button
                className="hidden lg:inline-flex"
                variant="outlineSoft"
                size="outlineCompact"
                asChild
              >
                <Link to="/auth/login">Log in</Link>
              </Button>

              <Button
                className="hidden lg:inline-flex"
                variant="cta"
                size="cta"
                asChild
              >
                <Link to="/auth/register">Get started</Link>
              </Button>
            </div>
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
