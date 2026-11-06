import { createStudySet, type StudySetSummary } from '@/entities/study-set';
import { MAX_STUDY_SET_TITLE_LENGTH } from '@/shared/config';
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
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type CreateStudySetDialogProps = {
  onCreated: (set: StudySetSummary) => void;
};

export function CreateStudySetDialog({ onCreated }: CreateStudySetDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setTitle('');
  };

  const submit = async () => {
    const next = title.trim();
    if (!next) return;
    setPending(true);
    try {
      const created = await createStudySet(next);
      setOpen(false);
      setTitle('');
      onCreated(created);
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
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
        {t('studySets.create')}
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
              {t('studySets.createTitle')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('studySets.createHint')}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="create-study-set-title">
                {t('studySets.nameLabel')}
              </Label>
              <Input
                id="create-study-set-title"
                value={title}
                maxLength={MAX_STUDY_SET_TITLE_LENGTH}
                autoComplete="off"
                placeholder={t('studySets.namePlaceholder')}
                onChange={(event) =>
                  setTitle(
                    event.target.value.slice(0, MAX_STUDY_SET_TITLE_LENGTH),
                  )
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={close}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={pending || title.trim().length === 0}
              >
                {pending ? t('common.saving') : t('studySets.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
