import { Brand } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { Link } from 'react-router-dom';

const footerLinkClass =
  'font-(family-name:--font-dm-sans) text-sm font-medium text-(--text-secondary) no-underline transition-colors hover:text-(--text-primary)';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer
      className="mt-auto w-full border-t border-(--border-default) bg-(--bg-color)"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand className="text-xl" />
          <p className="mt-2 max-w-sm text-sm text-(--text-secondary)">
            {t('public.footerTagline')}
          </p>
        </div>
        <nav aria-label={t('aria.footerNavigation')}>
          <ul className="flex list-none flex-wrap gap-x-5 gap-y-2">
            <li>
              <a href="#cards" className={footerLinkClass}>
                {t('landing.featureFlashTitle')}
              </a>
            </li>
            <li>
              <a href="#quizzes" className={footerLinkClass}>
                {t('landing.featureQuizTitle')}
              </a>
            </li>
            <li>
              <a href="#how-it-works" className={footerLinkClass}>
                {t('public.howItWorks')}
              </a>
            </li>
            <li>
              <Link to="/auth/login" className={footerLinkClass}>
                {t('auth.logIn')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
