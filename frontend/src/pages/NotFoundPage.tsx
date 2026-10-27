import { useAuthContext } from '@/features/auth-session';
import { QMascot } from '@/shared/ui/mascot/QMascot';
import { Button } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { Link, useNavigate } from 'react-router-dom';

type NotFoundPageProps = {
  inService?: boolean;
};

export default function NotFoundPage({ inService = false }: NotFoundPageProps) {
  const { user } = useAuthContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const home = user || inService ? '/app' : '/';

  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-(--bg-color) px-5 py-16">
      <section className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative mb-6 flex h-40 w-56 items-center justify-center rounded-full bg-(--blue-tint)">
          <QMascot className="w-28" />
        </div>
        <p className="font-(family-name:--font-syne) text-6xl font-extrabold tracking-[-0.05em] text-(--secondary-accent)">
          {t('notFound.error')}
        </p>
        <h1 className="mt-3 font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em]">
          {t('notFound.title')}
        </h1>
        <p className="mt-3 text-sm text-(--text-secondary)">
          {t('notFound.subtitle')}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button variant="cta" size="cta" asChild>
            <Link to={home}>{t('notFound.goHome')}</Link>
          </Button>
          <Button
            type="button"
            variant="outlineSoft"
            size="outlineCompact"
            onClick={() => {
              const index =
                typeof window.history.state?.idx === 'number'
                  ? window.history.state.idx
                  : 0;
              if (index > 0) navigate(-1);
              else navigate(home);
            }}
          >
            {t('notFound.back')}
          </Button>
        </div>
      </section>
    </div>
  );
}
