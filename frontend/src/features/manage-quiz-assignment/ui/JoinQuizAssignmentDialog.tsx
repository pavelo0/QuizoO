import {
  ASSIGNMENT_CODE_LENGTH,
  fetchQuizAssignmentByCode,
  normalizeAssignmentCode,
} from '@/entities/quiz-assignment';
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
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function JoinQuizAssignmentDialog() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setCode('');
  };

  const submit = async () => {
    const normalized = normalizeAssignmentCode(code);
    if (normalized.length !== ASSIGNMENT_CODE_LENGTH) {
      toast.error(t('assignments.codeInvalid'));
      return;
    }
    setPending(true);
    try {
      const found = await fetchQuizAssignmentByCode(normalized);
      if (found.closed) {
        toast.error(t('assignments.deadlinePassed'));
        return;
      }
      setOpen(false);
      setCode('');
      void navigate(
        `/app/modules/${encodeURIComponent(found.moduleId)}/quiz-study?assignment=${encodeURIComponent(found.id)}`,
      );
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
        variant="outline"
        size="outlineCompact"
        className="h-11 shrink-0 rounded-xl px-5"
        onClick={() => setOpen(true)}
      >
        {t('assignments.join')}
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
              {t('assignments.joinTitle')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('assignments.joinHint')}
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
              <Label htmlFor="assignment-code">
                {t('assignments.codeLabel')}
              </Label>
              <Input
                id="assignment-code"
                value={code}
                autoComplete="off"
                spellCheck={false}
                maxLength={12}
                placeholder={t('assignments.codePlaceholder')}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t('common.loading') : t('assignments.join')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
