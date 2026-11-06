import { fetchModuleList, type ModuleListItem } from '@/entities/module';
import { addModuleToStudySet, type StudySetDetail } from '@/entities/study-set';
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
import { Label } from '@/shared/ui/label';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

type AddModuleToSetDialogProps = {
  setId: string;
  memberIds: string[];
  onAdded: (detail: StudySetDetail) => void;
};

export function AddModuleToSetDialog({
  setId,
  memberIds,
  onAdded,
}: AddModuleToSetDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [moduleId, setModuleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const available = useMemo(() => {
    const taken = new Set(memberIds);
    return modules.filter((module) => !taken.has(module.id));
  }, [memberIds, modules]);

  const openDialog = async () => {
    setOpen(true);
    setLoading(true);
    setModuleId('');
    try {
      const rows = await fetchModuleList();
      setModules(rows);
      const taken = new Set(memberIds);
      const first = rows.find((module) => !taken.has(module.id));
      setModuleId(first?.id ?? '');
    } catch (error) {
      toast.error(apiErrorText(error, t));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!moduleId) return;
    setPending(true);
    try {
      const detail = await addModuleToStudySet(setId, moduleId);
      setOpen(false);
      onAdded(detail);
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
        variant="cta"
        size="outlineCompact"
        onClick={() => void openDialog()}
      >
        <Plus className="size-4" strokeWidth={2.5} aria-hidden />
        {t('studySets.addModule')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-(--border-default) bg-(--bg-color) text-(--text-primary) sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne) text-base">
              {t('studySets.addModuleTitle')}
            </DialogTitle>
            <DialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('studySets.addModuleHint')}
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p className="text-sm text-(--text-secondary)">
              {t('common.loading')}
            </p>
          ) : modules.length === 0 ? (
            <p className="text-sm text-(--text-secondary)">
              {t('studySets.noModulesToAdd')}
            </p>
          ) : available.length === 0 ? (
            <p className="text-sm text-(--text-secondary)">
              {t('studySets.addModuleEmpty')}
            </p>
          ) : (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="add-study-set-module">
                  {t('studySets.addModule')}
                </Label>
                <select
                  id="add-study-set-module"
                  value={moduleId}
                  onChange={(event) => setModuleId(event.target.value)}
                  className="h-12 rounded-xl border border-(--border-default) bg-(--surface-color) px-3 text-sm"
                >
                  {available.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
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
                <Button type="submit" disabled={pending || !moduleId}>
                  {pending ? t('common.saving') : t('studySets.addModule')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
