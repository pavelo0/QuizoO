import { Button, PageHead } from '@/shared/ui';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { useI18n } from '@/shared/i18n/useI18n';
import { deleteAdminModule, fetchAdminModules } from '@/entities/admin';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import type { AdminModuleListItem } from '@/entities/admin';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AdminModulesPage() {
  const { locale, t } = useI18n();
  const [modules, setModules] = useState<AdminModuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AdminModuleListItem | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'FLASHCARD' | 'QUIZ'>(
    'all',
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminModules();
      setModules(data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const flashcards = modules.filter((m) => m.type === 'FLASHCARD').length;
    const quizzes = modules.length - flashcards;
    const sessions = modules.reduce((acc, m) => acc + m.sessionCount, 0);
    return { all: modules.length, flashcards, quizzes, sessions };
  }, [modules]);

  const visibleModules = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return modules.filter((module) => {
      if (typeFilter !== 'all' && module.type !== typeFilter) return false;
      if (!needle) return true;
      const owner =
        module.owner.username?.toLowerCase() ??
        module.owner.email.toLowerCase();
      return (
        module.title.toLowerCase().includes(needle) ||
        owner.includes(needle) ||
        module.owner.email.toLowerCase().includes(needle)
      );
    });
  }, [modules, query, typeFilter]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmTarget) return;
    setPendingDeleteId(confirmTarget.id);
    try {
      await deleteAdminModule(confirmTarget.id);
      setModules((prev) =>
        prev.filter((module) => module.id !== confirmTarget.id),
      );
      setConfirmTarget(null);
      toast.success(t('admin.moduleDeleted'));
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setPendingDeleteId(null);
    }
  }, [confirmTarget, t]);

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <PageHead
        title={t('admin.modulesTitle')}
        subtitle={t('admin.modulesSubtitle')}
        action={
          <Button
            type="button"
            variant="outlineSoft"
            size="outlineCompact"
            onClick={() => void load()}
          >
            <RefreshCcw className="size-4" />
            {t('common.refresh')}
          </Button>
        }
      />

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.allModules')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {stats.all}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.flashcardModules')}
          </p>
          <p className="text-2xl font-semibold text-(--secondary-accent)">
            {stats.flashcards}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.quizModules')}
          </p>
          <p className="text-2xl font-semibold text-(--primary-accent)">
            {stats.quizzes}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-4">
          <p className="text-sm text-(--text-secondary)">
            {t('admin.totalSessions')}
          </p>
          <p className="text-2xl font-semibold text-(--text-primary)">
            {stats.sessions}
          </p>
        </article>
      </section>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('admin.searchModules')}
          aria-label={t('admin.searchModules')}
          className="h-11 min-w-0 flex-1 rounded-xl border border-(--border-default) bg-(--surface-color) px-3 text-sm text-(--text-primary)"
        />
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as 'all' | 'FLASHCARD' | 'QUIZ')
          }
          aria-label={t('statistics.type')}
          className="h-11 rounded-xl border border-(--border-default) bg-(--surface-color) px-3 text-sm text-(--text-primary)"
        >
          <option value="all">{t('admin.allTypes')}</option>
          <option value="FLASHCARD">{t('admin.moduleTypeFlashcards')}</option>
          <option value="QUIZ">{t('admin.moduleTypeQuiz')}</option>
        </select>
      </div>

      <section className="overflow-x-auto rounded-[20px] border border-(--border-default) bg-(--surface-color) p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-(--border-default)">
              <TableHead>{t('statistics.module')}</TableHead>
              <TableHead>{t('statistics.type')}</TableHead>
              <TableHead>{t('admin.owner')}</TableHead>
              <TableHead>{t('admin.cardsQuestions')}</TableHead>
              <TableHead>{t('admin.totalSessions')}</TableHead>
              <TableHead>{t('admin.updated')}</TableHead>
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
                  {t('admin.loadingModules')}
                </TableCell>
              </TableRow>
            ) : visibleModules.length < 1 ? (
              <TableRow className="border-(--border-default)">
                <TableCell
                  colSpan={7}
                  className="h-16 text-center text-(--text-secondary)"
                >
                  {t('admin.noModules')}
                </TableCell>
              </TableRow>
            ) : (
              visibleModules.map((module) => (
                <TableRow key={module.id} className="border-(--border-default)">
                  <TableCell className="font-semibold text-(--text-primary)">
                    {module.title}
                  </TableCell>
                  <TableCell>
                    {module.type === 'FLASHCARD'
                      ? t('admin.moduleTypeFlashcards')
                      : t('admin.moduleTypeQuiz')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {module.owner.username?.trim() ||
                          module.owner.email.split('@')[0]}
                      </span>
                      {module.owner.isBlocked ? (
                        <span className="rounded-full bg-(--danger-color)/15 px-2 py-1 text-[11px] font-semibold text-(--danger-color)">
                          {t('common.blocked')}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {module.type === 'FLASHCARD'
                      ? t('admin.cards', { count: module.cardCount })
                      : t('admin.questions', { count: module.questionCount })}
                  </TableCell>
                  <TableCell>{module.sessionCount}</TableCell>
                  <TableCell>{formatDate(module.updatedAt, locale)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      className="size-8 rounded-lg"
                      aria-label={t('admin.deleteModule')}
                      title={t('admin.deleteModule')}
                      disabled={pendingDeleteId === module.id}
                      onClick={() => setConfirmTarget(module)}
                    >
                      <Trash2 className="size-4" />
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
              {t('admin.deleteModuleQuestion')}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('admin.deleteModuleDescription', {
                title: confirmTarget?.title ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <AlertDialogCancel
              className="w-full border-(--border-default) sm:w-full"
              disabled={pendingDeleteId !== null}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="button"
              className="w-full sm:w-full"
              variant="destructive"
              disabled={pendingDeleteId !== null}
              onClick={() => void handleConfirmDelete()}
            >
              {pendingDeleteId !== null
                ? t('common.deleting')
                : t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
