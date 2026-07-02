import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/useI18n';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

function routeErrorMessage(error: unknown, fallback: string) {
  if (isRouteErrorResponse(error)) {
    if (typeof error.data === 'string' && error.data.trim()) return error.data;
    if (error.statusText) return error.statusText;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export default function RouteErrorPage() {
  const error = useRouteError();
  const { locale, t } = useI18n();
  const fallbackMessage =
    locale === 'ru'
      ? 'Произошла непредвиденная ошибка.'
      : 'An unexpected error occurred.';
  const message = routeErrorMessage(error, fallbackMessage);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
        {fallbackMessage}
      </h1>
      <p className="text-sm text-(--text-secondary)">{message}</p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="outlineCompact"
          className="rounded-xl"
          onClick={() => window.location.reload()}
        >
          {t('common.refresh')}
        </Button>
        <Button
          asChild
          type="button"
          variant="cta"
          size="outlineCompact"
          className="rounded-xl"
        >
          <Link to="/app">{t('common.backToDashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}
