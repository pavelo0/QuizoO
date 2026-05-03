import { Button } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchAdminModules,
  fetchAdminOverview,
  fetchAdminUsers,
} from '@/lib/api/admin';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import { useI18n } from '@/i18n/useI18n';
import type {
  AdminModuleListItem,
  AdminOverview,
  AdminUserListItem,
} from '@/types/admin';
import { Ban, BookCopy, RefreshCcw, Users } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-5">
      <div className="mb-2 flex items-center justify-between text-(--text-secondary)">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-(--text-primary)">
        {value.toLocaleString()}
      </p>
    </article>
  );
}

export default function AdminDashboardPage() {
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

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
            {t('admin.overviewTitle')}
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t('admin.overviewSubtitle')}
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
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('admin.totalUsers')}
          value={overview?.totalUsers ?? 0}
          icon={<Users className="size-4 text-(--primary-accent)" />}
        />
        <StatCard
          label={t('admin.totalModules')}
          value={overview?.totalModules ?? 0}
          icon={<BookCopy className="size-4 text-(--secondary-accent)" />}
        />
        <StatCard
          label={t('admin.sessionsToday')}
          value={overview?.sessionsToday ?? 0}
          icon={<RefreshCcw className="size-4 text-(--primary-accent)" />}
        />
        <StatCard
          label={t('admin.blockedUsers')}
          value={overview?.blockedUsers ?? 0}
          icon={<Ban className="size-4 text-(--danger-color)" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4 xl:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              {t('admin.recentUsers')}
            </h2>
            <Link
              to="/app/admin/users"
              className="text-sm font-semibold text-(--primary-accent)"
            >
              {t('admin.viewAll')}
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-(--border-default)">
                <TableHead>{t('admin.user')}</TableHead>
                <TableHead>{t('auth.email')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading ? [] : users.slice(0, 5)).map((user) => (
                <TableRow key={user.id} className="border-(--border-default)">
                  <TableCell className="font-medium text-(--text-primary)">
                    {user.username?.trim() || user.email.split('@')[0]}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <span className="rounded-full bg-(--danger-color)/15 px-2 py-1 text-xs font-semibold text-(--danger-color)">
                        {t('common.blocked')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-(--secondary-accent)/15 px-2 py-1 text-xs font-semibold text-(--secondary-accent)">
                        {t('common.active')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && users.length < 1 ? (
                <TableRow className="border-(--border-default)">
                  <TableCell
                    colSpan={3}
                    className="h-14 text-center text-(--text-secondary)"
                  >
                    {t('admin.noUsers')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </article>

        <article className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4 xl:col-span-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              {t('admin.recentModules')}
            </h2>
            <Link
              to="/app/admin/modules"
              className="text-sm font-semibold text-(--primary-accent)"
            >
              {t('admin.viewAll')}
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-(--border-default)">
                <TableHead>{t('statistics.module')}</TableHead>
                <TableHead>{t('admin.owner')}</TableHead>
                <TableHead>{t('admin.totalSessions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading ? [] : modules.slice(0, 5)).map((module) => (
                <TableRow key={module.id} className="border-(--border-default)">
                  <TableCell className="font-medium text-(--text-primary)">
                    {module.title}
                  </TableCell>
                  <TableCell>
                    {module.owner.username?.trim() ||
                      module.owner.email.split('@')[0]}
                  </TableCell>
                  <TableCell>{module.sessionCount}</TableCell>
                </TableRow>
              ))}
              {!loading && modules.length < 1 ? (
                <TableRow className="border-(--border-default)">
                  <TableCell
                    colSpan={3}
                    className="h-14 text-center text-(--text-secondary)"
                  >
                    {t('admin.noModules')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </article>
      </section>
    </div>
  );
}
