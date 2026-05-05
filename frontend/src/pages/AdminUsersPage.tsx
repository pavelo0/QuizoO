import { Button } from '@/components/ui';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useI18n } from '@/i18n/useI18n';
import { fetchAdminUsers, setAdminUserBlocked } from '@/lib/api/admin';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import type { AdminUserListItem } from '@/types/admin';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AdminUsersPage() {
  const { locale, t } = useI18n();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminUserListItem | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    const blocked = users.filter((u) => u.isBlocked).length;
    return {
      total: users.length,
      blocked,
      active: users.length - blocked,
    };
  }, [users]);

  const handleConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    setPendingId(confirmTarget.id);
    try {
      await setAdminUserBlocked(confirmTarget.id, !confirmTarget.isBlocked);
      await load();
      toast.success(
        confirmTarget.isBlocked ? t('admin.unblockUser') : t('admin.blockUser'),
      );
      setConfirmTarget(null);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setPendingId(null);
    }
  }, [confirmTarget, load]);

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
            {t('admin.usersTitle')}
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t('admin.usersSubtitle')}
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

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">{t('admin.total')}</p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {summary.total}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('common.active')}
          </p>
          <p className="text-2xl font-semibold text-(--secondary-accent)">
            {summary.active}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('common.blocked')}
          </p>
          <p className="text-2xl font-semibold text-(--danger-color)">
            {summary.blocked}
          </p>
        </article>
      </section>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-(--border-default)">
              <TableHead>{t('admin.user')}</TableHead>
              <TableHead>{t('auth.email')}</TableHead>
              <TableHead>{t('admin.role')}</TableHead>
              <TableHead>{t('common.modules')}</TableHead>
              <TableHead>{t('admin.joined')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-(--border-default)">
                <TableCell
                  colSpan={7}
                  className="h-16 text-center text-(--text-secondary)"
                >
                  {t('admin.loadingUsers')}
                </TableCell>
              </TableRow>
            ) : users.length < 1 ? (
              <TableRow className="border-(--border-default)">
                <TableCell
                  colSpan={7}
                  className="h-16 text-center text-(--text-secondary)"
                >
                  {t('admin.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-(--border-default)">
                  <TableCell className="font-semibold text-(--text-primary)">
                    {user.username?.trim() || user.email.split('@')[0]}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.moduleCount}</TableCell>
                  <TableCell>{formatDate(user.createdAt, locale)}</TableCell>
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
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant={user.isBlocked ? 'outlineSoft' : 'destructive'}
                      className="h-8"
                      disabled={pendingId === user.id || user.role === 'ADMIN'}
                      title={
                        user.role === 'ADMIN'
                          ? t('admin.protectedAdminAccounts')
                          : undefined
                      }
                      onClick={() => setConfirmTarget(user)}
                    >
                      {user.isBlocked ? t('admin.unblock') : t('admin.block')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <AlertDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(nextOpen) => !nextOpen && setConfirmTarget(null)}
      >
        <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
              {confirmTarget?.isBlocked
                ? t('admin.unblockUserQuestion')
                : t('admin.blockUserQuestion')}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {confirmTarget?.isBlocked
                ? t('admin.unblockUserDescription', {
                    email: confirmTarget.email,
                  })
                : t('admin.blockUserDescription', {
                    email: confirmTarget?.email ?? '',
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <AlertDialogCancel
              className="w-full border-(--border-default) sm:w-full"
              disabled={pendingId !== null}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="button"
              className="w-full sm:w-full"
              variant={confirmTarget?.isBlocked ? 'outlineSoft' : 'destructive'}
              disabled={pendingId !== null}
              onClick={() => void handleConfirm()}
            >
              {pendingId !== null
                ? t('auth.saving')
                : confirmTarget?.isBlocked
                  ? t('admin.unblockUser')
                  : t('admin.blockUser')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
