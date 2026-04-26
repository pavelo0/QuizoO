import { useAuthContext } from '@/auth/AuthContext';
import { DashboardModulesSection } from '@/components/modules';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import {
  fetchModuleList,
  fetchModulesDashboardSummary,
} from '@/lib/api/modules';
import { cn } from '@/lib/utils';
import type { ApiPublicUser } from '@/types/api-user';
import type { ModuleListItem } from '@/types/module';
import { useCallback, useEffect, useMemo, useState } from 'react';

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function displayFirstName(user: ApiPublicUser | null): string {
  if (!user) return 'there';
  const u = user.username?.trim();
  if (u) return u.split(/\s+/)[0] ?? u;
  return user.email.split('@')[0] ?? 'there';
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-(--border-default) bg-zinc-100/90 p-5 shadow-sm',
        'dark:border-white/6 dark:bg-[#161b22]',
      )}
    >
      <p className="text-xs font-medium text-(--text-secondary)">{label}</p>
      <p
        className={cn(
          'mt-2 font-(family-name:--font-dm-sans) text-3xl font-bold tracking-tight',
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

const DashboardPage = () => {
  const { user } = useAuthContext();
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

  const avgScoreText =
    summary?.averageQuizScore != null
      ? `${summary.averageQuizScore % 1 === 0 ? summary.averageQuizScore : summary.averageQuizScore.toFixed(1)}%`
      : '—';

  const activeModules = summary?.activeModules ?? 0;
  const subtitle =
    summary == null && loading
      ? 'Loading your stats…'
      : activeModules === 0
        ? "No modules yet. Create your first module when you're ready."
        : `You have ${activeModules} modules active. Keep it up!`;

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-8">
        <h1 className="font-(family-name:--font-syne) text-2xl font-extrabold tracking-[-0.04em] text-(--text-primary) sm:text-3xl">
          {greetingWord()}, {displayFirstName(user)} 👋
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
            Retry
          </Button>
        </div>
      )}

      <section
        className="mb-10 grid gap-4 sm:grid-cols-3"
        aria-label="Statistics"
      >
        {loading && !summary ? (
          <>
            <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
            <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
            <div className="h-24 animate-pulse rounded-2xl bg-(--border-default)/40 dark:bg-white/6" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Modules"
              value={String(summary?.totalModules ?? 0)}
              valueClassName="text-(--primary-accent)"
            />
            <StatCard
              label="Cards Studied"
              value={String(summary?.cardsStudied ?? 0)}
              valueClassName="text-(--secondary-accent)"
            />
            <StatCard
              label="Avg Quiz Score"
              value={avgScoreText}
              valueClassName="text-(--primary-accent)"
            />
          </>
        )}
      </section>

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
