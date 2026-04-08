import { Button } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';
import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, toggle } = useTheme();

  return (
    <header className="h-20 w-full bg-(--bg-color) border-b-[0.5px]">
      <div className="mx-auto flex h-full max-w-[1320px] px-5">
        <div className="grid h-full w-full min-h-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
          <div className="min-w-0 justify-self-start">
            <Link
              to="/"
              className="font-(family-name:--font-syne) text-[30px] font-extrabold leading-9 tracking-[-0.75px] text-(--text-primary) no-underline hover:opacity-70"
            >
              QuizoO
            </Link>
          </div>

          <nav className="shrink-0 justify-self-center" aria-label="Main">
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

          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-2xl text-(--text-primary) transition-colors hover:bg-transparent hover:text-(--primary-accent) focus-visible:bg-transparent dark:hover:bg-transparent"
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

            <Button variant="outlineSoft" size="outlineCompact" asChild>
              <Link to="/auth/login">Log in</Link>
            </Button>

            <Button variant="cta" size="cta" asChild>
              <Link to="/auth/register">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
