import {
  removeModuleFromStudySet,
  type StudySetDetail,
} from '@/entities/study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type RemoveModuleFromSetButtonProps = {
  setId: string;
  moduleId: string;
  onRemoved: (detail: StudySetDetail) => void;
};

export function RemoveModuleFromSetButton({
  setId,
  moduleId,
  onRemoved,
}: RemoveModuleFromSetButtonProps) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);

  const handleRemove = async () => {
    setPending(true);
    try {
      const detail = await removeModuleFromStudySet(setId, moduleId);
      toast.success(t('studySets.removed'));
      onRemoved(detail);
    } catch (error) {
      toast.error(apiErrorText(error, t));
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outlineSoft"
      size="sm"
      disabled={pending}
      onClick={() => void handleRemove()}
    >
      {pending ? t('common.loading') : t('studySets.removeModule')}
    </Button>
  );
}
