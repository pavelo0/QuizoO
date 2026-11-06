import type { ModuleListItem } from '@/entities/module';
import { createQuizAssignment } from '@/entities/quiz-assignment';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type CreateQuizAssignmentDialogProps = {
  modules: ModuleListItem[];
};

function defaultDeadlineValue() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateQuizAssignmentDialog({
  modules,
}: CreateQuizAssignmentDialogProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const quizzes = useMemo(
    () =>
      modules.filter(
        (module) => module.type === 'QUIZ' && module.questionCount > 0,
      ),
    [modules],
  );
  const [open, setOpen] = useState(false);
  const [moduleId, setModuleId] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadlineValue);
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
  };

  const submit = async () => {
    if (!moduleId || !deadline) return;
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) return;
    setPending(true);
    try {
      const created = await createQuizAssignment({
        moduleId,
        deadline: parsed.toISOString(),
      });
      setOpen(false);
      void navigate(`/app/assignments/${encodeURIComponent(created.id)}`);
    } catch (error) {
      toast.error(apiErrorText(error, t));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outlineSoft"
        size="outlineCompact"
        className="h-11 shrink-0 rounded-xl px-5"
        disabled={quizzes.length === 0}
        onClick={() => {
          setModuleId(quizzes[0]?.id ?? '');
          setDeadline(defaultDeadlineValue());
          setOpen(true);
        }}
      >
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
        {t('assignments.create')}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
      >
        <DialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary) sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne) text-base">
              {t('assignments.createTitle')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('assignments.createHint')}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="assignment-module">
                {t('assignments.moduleLabel')}
              </Label>
              <select
                id="assignment-module"
                className="h-11 w-full rounded-[10px] border border-(--border-default) bg-(--input-bg) px-3 text-[15px] text-(--text-primary) outline-none focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25"
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
              >
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignment-deadline">
                {t('assignments.deadlineLabel')}
              </Label>
              <Input
                id="assignment-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={pending || !moduleId}>
                {pending ? t('common.saving') : t('assignments.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
