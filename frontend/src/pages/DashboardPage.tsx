import { fetchModuleList, type ModuleListItem } from '@/entities/module';
import { useAuthContext } from '@/features/auth-session';
import { Button } from '@/shared/ui/button';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { useI18n } from '@/shared/i18n/useI18n';
import { DashboardModulesSection } from '@/widgets/dashboard-module-list';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DashboardPage = () => {
  const { t } = useI18n();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const load = useCallback(async () => {
    if (isAdmin) {
      setModules([]);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoadError(null);
    setLoading(true);
    try {
      setModules(await fetchModuleList());
    } catch (e) {
      setLoadError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

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
      const title = m.title.toLowerCase();
      const description = (m.description ?? '').toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }, [modules, search]);

  return (
    <div className="font-(family-name:--font-dm-sans)">
      {loadError && (
        <div
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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

      <DashboardModulesSection
        modules={modules}
        filteredModules={filteredModules}
        loading={loading}
        search={search}
        canCreate={!isAdmin}
        onSearchChange={handleSearchChange}
        onModuleDeleted={handleModuleDeleted}
      />
    </div>
  );
};

export default DashboardPage;
