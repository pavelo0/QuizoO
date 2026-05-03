import { Button } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useI18n } from '@/i18n/useI18n';
import { fetchAdminModules } from '@/lib/api/admin';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import type { AdminModuleListItem } from '@/types/admin';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

  return (
    <div className="font-(family-name:--font-dm-sans)">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em] text-(--text-primary)">
            {t('admin.modulesTitle')}
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {t('admin.modulesSubtitle')}
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

      <section className="rounded-3xl border border-(--border-default) bg-(--bg-color) p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-(--border-default)">
              <TableHead>{t('statistics.module')}</TableHead>
              <TableHead>{t('statistics.type')}</TableHead>
              <TableHead>{t('admin.owner')}</TableHead>
              <TableHead>{t('admin.cardsQuestions')}</TableHead>
              <TableHead>{t('admin.totalSessions')}</TableHead>
              <TableHead>{t('admin.updated')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-(--border-default)">
                <TableCell
                  colSpan={6}
                  className="h-16 text-center text-(--text-secondary)"
                >
                  {t('admin.loadingModules')}
                </TableCell>
              </TableRow>
            ) : modules.length < 1 ? (
              <TableRow className="border-(--border-default)">
                <TableCell
                  colSpan={6}
                  className="h-16 text-center text-(--text-secondary)"
                >
                  {t('admin.noModules')}
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
