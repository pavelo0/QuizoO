import {
  deleteQuizAssignment,
  fetchQuizAssignment,
  type QuizAssignmentDetail,
} from '@/entities/quiz-assignment';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorMessage, apiErrorText } from '@/shared/lib/apiErrorMessage';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

type QuizAssignmentJournalProps = {
  assignmentId: string;
};

export function QuizAssignmentJournal({
  assignmentId,
}: QuizAssignmentJournalProps) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<QuizAssignmentDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAssignment(await fetchQuizAssignment(assignmentId));
    } catch (loadError) {
      setAssignment(null);
      setError(apiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const copyCode = async () => {
    if (!assignment) return;
    try {
      await navigator.clipboard.writeText(assignment.code);
      toast.success(t('assignments.copied'));
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  const remove = async () => {
    setDeletePending(true);
    try {
      await deleteQuizAssignment(assignmentId);
      toast.success(t('assignments.deleted'));
      void navigate('/app');
    } catch (deleteError) {
      toast.error(apiErrorText(deleteError, t));
    } finally {
      setDeletePending(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-(--text-secondary)" role="status">
        {t('common.loading')}
      </p>
    );
  }

  if (!assignment) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {error ?? t('assignments.notFound')}
        </p>
        <Button asChild className="mt-6 rounded-xl" variant="outline">
          <Link to="/app">{t('common.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  const deadline = new Date(assignment.deadline).toLocaleString(locale);

  return (
    <section className="grid gap-6" aria-labelledby="assignment-journal-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-(--text-secondary)">
            {t('assignments.journalLabel')}
          </p>
          <h1
            id="assignment-journal-title"
            className="font-(family-name:--font-syne) text-[1.75rem] font-extrabold tracking-[-0.03em]"
          >
            {assignment.moduleTitle}
          </h1>
          <p className="mt-2 font-(family-name:--font-syne) text-3xl tracking-[0.2em]">
            {assignment.code}
          </p>
          <p className="mt-2 text-sm text-(--text-secondary)">
            {assignment.closed
              ? t('assignments.closed')
              : t('assignments.deadlineUntil', { deadline })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyCode()}
          >
            {t('assignments.copyCode')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteOpen(true)}
          >
            {t('common.delete')}
          </Button>
        </div>
      </header>

      {assignment.attempts.length === 0 ? (
        <p className="text-sm text-(--text-secondary)">
          {t('assignments.noAttempts')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-(--border-default)">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-(--input-bg)/45 text-(--text-secondary)">
              <tr>
                <th className="px-4 py-3 font-medium">
                  {t('assignments.participant')}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t('assignments.score')}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t('assignments.when')}
                </th>
              </tr>
            </thead>
            <tbody>
              {assignment.attempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="border-t border-(--border-default)"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-(--text-primary)">
                      {attempt.username?.trim() || attempt.email}
                    </p>
                    {attempt.username ? (
                      <p className="text-(--text-secondary)">{attempt.email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {t('assignments.scoreValue', {
                      correct: attempt.correctCount,
                      total: attempt.totalQuestions,
                      percent: Math.round(attempt.scorePercent),
                    })}
                  </td>
                  <td className="px-4 py-3 text-(--text-secondary)">
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleString(locale)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('assignments.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('assignments.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending}
              onClick={() => void remove()}
            >
              {deletePending ? t('common.deleting') : t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
