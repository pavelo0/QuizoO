import { Button } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';
import {
  fetchAdminModules,
  fetchAdminOverview,
  fetchAdminUsers,
} from '@/lib/api/admin';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import type {
  AdminModuleListItem,
  AdminOverview,
  AdminUserListItem,
} from '@/types/admin';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

function percent(part: number, total: number): number {
  if (total < 1) return 0;
  return Math.round((part / total) * 100);
}

function PercentBar({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  return (
    <div className="h-2 w-full rounded-full bg-(--border-default)/60">
      <div
        className={`h-2 rounded-full ${colorClass}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [modules, setModules] = useState<AdminModuleListItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, usersData, modulesData] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminUsers(),
        fetchAdminModules(),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setModules(modulesData);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const analytics = useMemo(() => {
    const blockedUsers = users.filter((u) => u.isBlocked).length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const verified = users.filter((u) => u.emailVerified).length;
    const quiz = modules.filter((m) => m.type === 'QUIZ').length;
    const flashcard = modules.length - quiz;
    const activeModules = modules.filter((m) => m.sessionCount > 0).length;
    return {
      blockedUsers,
      admins,
      verified,
      quiz,
      flashcard,
      activeModules,
      inactiveModules: modules.length - activeModules,
    };
  }, [modules, users]);

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
            {t('admin.analyticsTitle')}
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t('admin.analyticsSubtitle')}
          </p>
        </div>
        <Button
          type="button"
          variant="outlineSoft"
          size="outlineCompact"
          onClick={() => void load()}
        >
          <RefreshCcw className="size-4" />
          {t('common.refresh')}
        </Button>
      </header>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
            {t('admin.userHealth')}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.verifiedAccounts')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.verified, users.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.verified, users.length)}
                colorClass="bg-(--secondary-accent)"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.blockedAccounts')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.blockedUsers, users.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.blockedUsers, users.length)}
                colorClass="bg-(--danger-color)"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.adminAccounts')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.admins, users.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.admins, users.length)}
                colorClass="bg-(--primary-accent)"
              />
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-5">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
            {t('admin.moduleActivity')}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.quizModules')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.quiz, modules.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.quiz, modules.length)}
                colorClass="bg-(--primary-accent)"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.flashcardModules')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.flashcard, modules.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.flashcard, modules.length)}
                colorClass="bg-(--secondary-accent)"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-(--text-secondary)">
                  {t('admin.activeModules')}
                </span>
                <span className="font-semibold text-(--text-primary)">
                  {percent(analytics.activeModules, modules.length)}%
                </span>
              </div>
              <PercentBar
                value={percent(analytics.activeModules, modules.length)}
                colorClass="bg-(--primary-accent)"
              />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.totalUsers')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {overview?.totalUsers ?? 0}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.totalModules')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {overview?.totalModules ?? 0}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.sessionsToday')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {overview?.sessionsToday ?? 0}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.loadingState')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {loading ? t('common.loading') : t('admin.ready')}
          </p>
        </article>
      </section>
    </div>
  );
}
