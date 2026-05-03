import { useI18n } from '@/i18n/useI18n';

const SettingsPage = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.02em] text-(--text-primary)">
          {t('settings.title')}
        </h1>
        <p className="mt-2 max-w-lg font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          {t('settings.subtitle')}
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
