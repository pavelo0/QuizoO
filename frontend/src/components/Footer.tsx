import { useTheme } from '@/theme/useTheme';
import { Link } from 'react-router-dom';

const footerLinkClass =
  'font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-secondary) no-underline transition-colors hover:text-(--text-primary)';

const Footer = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer
      className="mt-auto w-full border-t border-(--border-default) bg-(--bg-color)"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1320px] px-5 py-12 md:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-sm shrink-0">
            <Link
              to="/"
              className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-tight text-(--text-primary) no-underline hover:opacity-80 md:text-[1.75rem]"
            >
              QuizoO
            </Link>
            <p className="mt-4 font-(family-name:--font-dm-sans) text-sm leading-relaxed text-(--text-secondary) md:text-base">
              The modern knowledge retention platform for students,
              professionals, and lifelong learners.
            </p>
          </div>

          <nav
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-12 lg:gap-16"
            aria-label="Footer"
          >
            <div>
              <h3 className="font-(family-name:--font-syne) text-sm font-bold text-(--text-primary)">
                Platform
              </h3>
              <ul className="mt-4 flex list-none flex-col gap-3">
                <li>
                  <a href="#about" className={footerLinkClass}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#features" className={footerLinkClass}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className={footerLinkClass}>
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-(family-name:--font-syne) text-sm font-bold text-(--text-primary)">
                Community
              </h3>
              <ul className="mt-4 flex list-none flex-col gap-3">
                <li>
                  <a
                    href="https://github.com"
                    className={footerLinkClass}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    className={footerLinkClass}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    className={footerLinkClass}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-(family-name:--font-syne) text-sm font-bold text-(--text-primary)">
                Contact
              </h3>
              <ul className="mt-4 flex list-none flex-col gap-3">
                <li>
                  <a
                    href="mailto:support@example.com"
                    className={footerLinkClass}
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a href="#privacy" className={footerLinkClass}>
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className={footerLinkClass}>
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 border-t border-(--border-default) pt-8 md:pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-(family-name:--font-jetbrains-mono) text-[11px] uppercase leading-relaxed tracking-wide text-(--text-secondary) sm:text-xs">
              © {new Date().getFullYear()} QuizoO INC. BUILT WITH INNOVATION.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-primary)">
                Theme
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Dark theme"
                className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full bg-(--primary-accent)/25 p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-accent)"
                onClick={toggle}
              >
                <span
                  className={`pointer-events-none absolute left-1 top-1/2 size-6 -translate-y-1/2 rounded-full bg-(--primary-accent) shadow-sm ring-1 ring-black/10 transition-transform duration-200 ease-out will-change-transform dark:ring-white/10 ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
