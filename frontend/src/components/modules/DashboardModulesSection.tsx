import { CreateModuleTypeDialog } from './CreateModuleTypeDialog';
import { DashboardModuleCard } from './DashboardModuleCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_MODULE_TITLE_LENGTH } from '@/lib/moduleConstants';
import { cn } from '@/lib/utils';
import type { ModuleListItem, ModuleType } from '@/types/module';
import { Plus, Search, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type DashboardModulesSectionProps = {
  modules: ModuleListItem[];
  filteredModules: ModuleListItem[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

/**
 * Секция «My Modules»: поиск, сетка и диалог создания.
 * Состояние открытия попапа живёт здесь — при открытии/закрытии не ре-рендерится родительский DashboardPage.
 */
function DashboardModulesSectionInner({
  modules,
  filteredModules,
  loading,
  search,
  onSearchChange,
}: DashboardModulesSectionProps) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleContinue = useCallback(
    (type: ModuleType) => {
      setDialogOpen(false);
      void navigate(`/app/modules/create?type=${encodeURIComponent(type)}`);
    },
    [navigate],
  );

  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  return (
    <section aria-labelledby="modules-heading">
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="modules-heading"
          className="font-(family-name:--font-syne) text-lg font-extrabold tracking-[-0.04em] text-(--text-primary)"
        >
          My Modules
        </h2>
        <Button
          type="button"
          variant="cta"
          size="outlineCompact"
          className="h-11 shrink-0 rounded-xl px-5"
          onClick={openDialog}
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          New Module
        </Button>
      </div>

      <div className="relative mb-8">
        <label htmlFor="dashboard-module-search" className="sr-only">
          Search modules
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
          placeholder="Search your modules…"
          maxLength={MAX_MODULE_TITLE_LENGTH}
          autoComplete="off"
          className={cn(
            'h-12 rounded-full border-(--border-default) bg-(--input-bg) py-0 pl-11 text-sm font-(family-name:--font-dm-sans)',
            search.length > 0 ? 'pr-12' : 'pr-4',
          )}
        />
        {search.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-2 z-10 size-8 -translate-y-1/2 rounded-full text-(--text-secondary) hover:bg-(--bg-color)/80 hover:text-(--text-primary)"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X className="size-4" strokeWidth={2} />
          </Button>
        )}
      </div>

      {loading && modules.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-72 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6"
            />
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--border-default) bg-(--bg-color)/30 py-16 text-center text-sm text-(--text-secondary) dark:bg-black/20">
          {modules.length === 0
            ? 'No modules yet. Create one with “New Module”.'
            : 'No modules match your search.'}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map((m) => (
            <DashboardModuleCard key={m.id} module={m} />
          ))}
        </div>
      )}

      <CreateModuleTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onContinue={handleContinue}
      />
    </section>
  );
}

export const DashboardModulesSection = memo(DashboardModulesSectionInner);
DashboardModulesSection.displayName = 'DashboardModulesSection';
