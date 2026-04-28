import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteModule } from '@/lib/api/modules';
import { cn } from '@/lib/utils';
import type { ModuleListItem } from '@/types/module';
import { ClipboardList, Clock, Layers, Trash2 } from 'lucide-react';
import { ModuleBadge } from './ModuleBadge';
import { memo, useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function formatLastStudied(iso: string | null): string {
  if (!iso) return 'Not studied yet';
  const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'Just now';
  if (abs < 3600) return rtf.format(Math.floor(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.floor(diffSec / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.floor(diffSec / 86400), 'day');
  return rtf.format(Math.floor(diffSec / 604800), 'week');
}

export type DashboardModuleCardProps = {
  module: ModuleListItem;
  onModuleDeleted: (moduleId: string) => Promise<void> | void;
};

function DashboardModuleCardInner({
  module,
  onModuleDeleted,
}: DashboardModuleCardProps) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const isFlash = module.type === 'FLASHCARD';
  const count = isFlash ? module.cardCount : module.questionCount;
  const canStart = count > 0;
  const titleId = `module-title-${module.id}`;
  const settingsHref = isFlash
    ? `/app/modules/${encodeURIComponent(module.id)}/edit`
    : `/app/modules/${encodeURIComponent(module.id)}/quiz-edit`;
  const studyHref = isFlash
    ? `/app/modules/${encodeURIComponent(module.id)}/flash-study`
    : `/app/modules/${encodeURIComponent(module.id)}/quiz-study`;

  const openSettings = useCallback(() => {
    void navigate(settingsHref);
  }, [navigate, settingsHref]);

  const openStudy = useCallback(() => {
    void navigate(studyHref);
  }, [navigate, studyHref]);

  const handleDelete = useCallback(async () => {
    setDeletePending(true);
    try {
      await deleteModule(module.id);
      await onModuleDeleted(module.id);
      setDeleteOpen(false);
      toast.success('Module deleted');
    } catch {
      toast.error('Could not delete module.');
    } finally {
      setDeletePending(false);
    }
  }, [module.id, onModuleDeleted]);

  return (
    <>
      <Card
        role="link"
        tabIndex={0}
        aria-labelledby={titleId}
        onClick={openSettings}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openSettings();
          }
        }}
        className={cn(
          'gap-0 rounded-2xl border border-(--border-default) bg-zinc-100/90 py-0 shadow-sm ring-0',
          'cursor-pointer transition-colors duration-200 hover:border-(--primary-accent)/35',
          'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25 focus-visible:outline-none',
          'dark:border-white/6 dark:bg-[#161b22]',
        )}
      >
        <CardContent className="flex flex-col px-5 pt-5 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <ModuleBadge variant="mint">
                {isFlash ? 'Flashcards' : 'Quiz'}
              </ModuleBadge>
              <ModuleBadge variant="violet">
                {count} {isFlash ? 'cards' : 'questions'}
              </ModuleBadge>
            </div>
            <Button
              type="button"
              variant="outlineSoft"
              size="icon-sm"
              className="size-8 rounded-lg text-(--text-secondary)"
              aria-label={`Delete module ${module.title}`}
              title="Delete module"
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" strokeWidth={2} />
            </Button>
          </div>
          <h3
            id={titleId}
            className="mt-4 font-(family-name:--font-dm-sans) text-lg font-bold text-(--text-primary)"
          >
            {module.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-(--text-secondary)">
            {module.description?.trim() || 'No description yet.'}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-(--text-secondary)">
            <Clock
              className="size-3.5 shrink-0 opacity-80"
              strokeWidth={2}
              aria-hidden
            />
            <span>Last studied: {formatLastStudied(module.lastStudiedAt)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col border-0 px-5 pt-5 pb-5">
          <Button
            type="button"
            disabled={!canStart}
            onClick={(e) => {
              e.stopPropagation();
              openStudy();
            }}
            title={
              !canStart
                ? isFlash
                  ? 'Add flashcards to start studying'
                  : 'Add questions to start the quiz'
                : undefined
            }
            className={cn(
              'h-11 w-full gap-2 rounded-xl font-(family-name:--font-dm-sans) text-sm font-bold text-white shadow-md',
              isFlash
                ? 'border-0 bg-(--secondary-accent) hover:bg-(--secondary-accent)/90'
                : 'border-0 bg-(--primary-accent) hover:bg-(--primary-accent)/90',
            )}
          >
            {isFlash ? (
              <>
                <Layers className="size-4" strokeWidth={2} aria-hidden />
                Study flashcards
              </>
            ) : (
              <>
                <ClipboardList className="size-4" strokeWidth={2} aria-hidden />
                Start quiz
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
              Delete module?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              This will permanently remove <strong>{module.title}</strong> and
              all its {isFlash ? 'cards' : 'questions'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <AlertDialogCancel
              className="w-full border-(--border-default) sm:w-full"
              disabled={deletePending}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-full"
              disabled={deletePending}
              onClick={() => void handleDelete()}
            >
              {deletePending ? 'Deleting…' : 'Delete module'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const DashboardModuleCard = memo(DashboardModuleCardInner);
DashboardModuleCard.displayName = 'DashboardModuleCard';
