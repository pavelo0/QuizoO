import { QMascot } from '@/shared/ui/mascot/QMascot';
import { Button } from '@/shared/ui/button';
import { useI18n } from '@/shared/i18n/useI18n';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function RouteErrorPage() {
  const error = useRouteError();
  const { t } = useI18n();
  const reference = isRouteErrorResponse(error) ? String(error.status) : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--bg-color) px-5">
      <section className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative mb-6 flex h-40 w-56 items-center justify-center rounded-full bg-(--blue-tint)">
          <QMascot className="w-28" />
        </div>
        <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
          {t('error.pageTitle')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--text-secondary)">
          {t('error.pageBody')}
        </p>
        {reference ? (
          <p className="mt-3 text-xs text-(--text-secondary)">{reference}</p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="cta"
            size="cta"
            onClick={() => window.location.reload()}
          >
            {t('error.tryAgain')}
          </Button>
          <Button asChild variant="outlineSoft" size="outlineCompact">
            <Link to="/">{t('notFound.goHome')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
