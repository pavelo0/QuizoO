import { useI18n } from '@/i18n/useI18n';

export function AuthLoadingState() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--bg-color)">
      <p className="font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
        {t('common.loading')}
      </p>
    </div>
  );
}
