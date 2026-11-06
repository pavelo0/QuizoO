import { deleteStudySet } from '@/entities/study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type DeleteStudySetButtonProps = {
  setId: string;
  title: string;
  onDeleted: () => void;
};

export function DeleteStudySetButton({
  setId,
  title,
  onDeleted,
}: DeleteStudySetButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);
    try {
      await deleteStudySet(setId);
      setOpen(false);
      toast.success(t('studySets.deleted'));
      onDeleted();
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
        variant="destructive"
        size="outlineCompact"
        onClick={() => setOpen(true)}
      >
        {t('common.delete')}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
              {t('studySets.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('studySets.deleteDescription', { title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <AlertDialogCancel
              className="w-full border-(--border-default) sm:w-full"
              disabled={pending}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-full"
              disabled={pending}
              onClick={() => void handleDelete()}
            >
              {pending ? t('common.deleting') : t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
