import { renameStudySet, type StudySetDetail } from '@/entities/study-set';
import { MAX_STUDY_SET_TITLE_LENGTH } from '@/shared/config';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type RenameStudySetDialogProps = {
  setId: string;
  title: string;
  onRenamed: (detail: StudySetDetail) => void;
};

export function RenameStudySetDialog({
  setId,
  title,
  onRenamed,
}: RenameStudySetDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [pending, setPending] = useState(false);

  const openDialog = () => {
    setNextTitle(title);
    setOpen(true);
  };

  const submit = async () => {
    const value = nextTitle.trim();
    if (!value) return;
    setPending(true);
    try {
      const detail = await renameStudySet(setId, value);
      setOpen(false);
      onRenamed(detail);
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
        onClick={openDialog}
      >
        {t('studySets.rename')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary) sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne) text-base">
              {t('studySets.renameTitle')}
            </DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="rename-study-set-title">
                {t('studySets.nameLabel')}
              </Label>
              <Input
                id="rename-study-set-title"
                value={nextTitle}
                maxLength={MAX_STUDY_SET_TITLE_LENGTH}
                autoComplete="off"
                onChange={(event) =>
                  setNextTitle(
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
                onClick={() => setOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={pending || nextTitle.trim().length === 0}
              >
                {pending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
