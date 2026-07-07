import { useAuthContext } from '@/auth/AuthContext';
import {
  fetchModuleList,
  fetchModulesDashboardSummary,
  type ModuleListItem,
} from '@/entities/module';
import { Button } from '@/shared/ui/button';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { useI18n } from '@/shared/i18n/useI18n';
import { DashboardModulesSection } from '@/widgets/dashboard-module-list';
import { DashboardStats } from '@/widgets/dashboard-stats';
import type { ApiPublicUser } from '@/entities/user';
import { useCallback, useEffect, useMemo, useState } from 'react';

function greetingWord(hour: number, t: (key: string) => string): string {
  if (hour < 12) return t('dashboard.greetingMorning');
  if (hour < 18) return t('dashboard.greetingAfternoon');
  return t('dashboard.greetingEvening');
}

function displayFirstName(
  user: ApiPublicUser | null,
  fallback: string,
): string {
  if (!user) return fallback;
  const u = user.username?.trim();
  if (u) return u.split(/\s+/)[0] ?? u;
  return user.email.split('@')[0] ?? fallback;
}

const DashboardPage = () => {
  const { user } = useAuthContext();
  const { t } = useI18n();
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof fetchModulesDashboardSummary>
  > | null>(null);
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const [s, list] = await Promise.all([
        fetchModulesDashboardSummary(),
        fetchModuleList(),
      ]);
      setSummary(s);
      setModules(list);
    } catch (e) {
      setLoadError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleModuleDeleted = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter((m) => {
      const t = m.title.toLowerCase();
      const d = (m.description ?? '').toLowerCase();
      return t.includes(q) || d.includes(q);
    });
  }, [modules, search]);

  const activeModules = summary?.activeModules ?? 0;
  const subtitle =
    summary == null && loading
      ? t('dashboard.subtitleLoading')
      : activeModules === 0
        ? t('dashboard.subtitleEmpty')
        : t('dashboard.subtitleActive', { count: activeModules });

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-8">
        <h1 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] text-(--text-primary) sm:text-3xl">
          {greetingWord(new Date().getHours(), t)},{' '}
          {displayFirstName(user, t('dashboard.greetingFallbackName'))} 👋
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">{subtitle}</p>
      </header>

      {loadError && (
        <div
          className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p>{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => void load()}
          >
            {t('common.retry')}
          </Button>
        </div>
      )}

      <DashboardStats summary={summary} loading={loading} />

      <DashboardModulesSection
        modules={modules}
        filteredModules={filteredModules}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        onModuleDeleted={handleModuleDeleted}
      />
    </div>
  );
};

export default DashboardPage;
