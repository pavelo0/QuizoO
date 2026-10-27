import { DashboardModuleCard } from './DashboardModuleCard';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { PageHead } from '@/shared/ui/page-head';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useI18n } from '@/shared/i18n/useI18n';
import { MAX_MODULE_TITLE_LENGTH } from '@/shared/config/module';
import { cn } from '@/shared/lib/utils';
import type { ModuleListItem, ModuleType } from '@/entities/module';
import { Plus, Search, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type DashboardModulesSectionProps = {
  modules: ModuleListItem[];
  filteredModules: ModuleListItem[];
  loading: boolean;
  search: string;
  canCreate?: boolean;
  onSearchChange: (value: string) => void;
  onModuleDeleted: (moduleId: string) => Promise<void> | void;
};

type KindFilter = 'ALL' | ModuleType;
type SortMode = 'updated' | 'title';

const NewModuleButton = memo(function NewModuleButton() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Button
      type="button"
      variant="cta"
      size="outlineCompact"
      className="h-11 shrink-0 rounded-xl px-5"
      onClick={() => navigate('/app/modules/create')}
    >
      <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      {t('modules.newModule')}
    </Button>
  );
});
NewModuleButton.displayName = 'NewModuleButton';

function DashboardModulesSectionInner({
  modules,
  filteredModules,
  loading,
  search,
  canCreate = true,
  onSearchChange,
  onModuleDeleted,
}: DashboardModulesSectionProps) {
  const { t } = useI18n();
  const [kind, setKind] = useState<KindFilter>('ALL');
  const [sort, setSort] = useState<SortMode>('updated');

  const visible = useMemo(() => {
    const list =
      kind === 'ALL'
        ? filteredModules
        : filteredModules.filter((module) => module.type === kind);
    return [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [filteredModules, kind, sort]);

  const filters: Array<{ id: KindFilter; label: string }> = [
    { id: 'ALL', label: t('modules.filterAll') },
    { id: 'FLASHCARD', label: t('modules.filterCards') },
    { id: 'QUIZ', label: t('modules.filterQuizzes') },
  ];

  return (
    <section aria-labelledby="modules-heading">
      <PageHead
        id="modules-heading"
        title={t('modules.myModules')}
        action={canCreate ? <NewModuleButton /> : undefined}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="dashboard-module-search" className="sr-only">
            {t('modules.searchModules')}
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-(--text-secondary)"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            id="dashboard-module-search"
            type="text"
            role="searchbox"
            value={search}
            onChange={(ev) =>
              onSearchChange(ev.target.value.slice(0, MAX_MODULE_TITLE_LENGTH))
            }
            placeholder={t('modules.searchPlaceholder')}
            maxLength={MAX_MODULE_TITLE_LENGTH}
            autoComplete="off"
            className={cn(
              'h-12 rounded-xl border-(--border-default) bg-(--surface-color) py-0 pl-11 text-sm',
              search.length > 0 ? 'pr-12' : 'pr-4',
            )}
          />
          {search.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-2 z-10 size-8 -translate-y-1/2 rounded-full text-(--text-secondary)"
              onClick={() => onSearchChange('')}
              aria-label={t('aria.clearSearch')}
            >
              <X className="size-4" strokeWidth={2} />
            </Button>
          )}
        </div>
        <label className="sr-only" htmlFor="module-sort">
          {t('modules.sortUpdated')}
        </label>
        <select
          id="module-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="h-12 rounded-xl border border-(--border-default) bg-(--surface-color) px-3 text-sm"
        >
          <option value="updated">{t('modules.sortUpdated')}</option>
          <option value="title">{t('modules.sortTitle')}</option>
        </select>
      </div>

      <Tabs
        value={kind}
        onValueChange={(value) => setKind(value as KindFilter)}
        className="mb-6"
      >
        <TabsList aria-label={t('modules.filterAll')}>
          {filters.map((filter) => (
            <TabsTrigger key={filter.id} value={filter.id}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading && modules.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-72 animate-pulse rounded-2xl bg-(--border-default)/50"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          showMascot={modules.length === 0}
          title={
            modules.length === 0
              ? t('modules.emptyLibrary')
              : t('modules.noModulesMatch')
          }
          description={
            modules.length === 0
              ? canCreate
                ? t('modules.noModulesYet')
                : undefined
              : t('modules.noModulesMatch')
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((module) => (
            <DashboardModuleCard
              key={module.id}
              module={module}
              onModuleDeleted={onModuleDeleted}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export const DashboardModulesSection = memo(DashboardModulesSectionInner);
DashboardModulesSection.displayName = 'DashboardModulesSection';
