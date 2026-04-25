import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ModuleListItem } from '@/types/module';
import { ClipboardList, Clock, Layers } from 'lucide-react';
import { ModuleBadge } from './ModuleBadge';

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
};

export function DashboardModuleCard({ module }: DashboardModuleCardProps) {
  const isFlash = module.type === 'FLASHCARD';
  const count = isFlash ? module.cardCount : module.questionCount;
  const canStart = count > 0;
  const titleId = `module-title-${module.id}`;

  return (
    <Card
      role="article"
      aria-labelledby={titleId}
      className={cn(
        'gap-0 rounded-2xl border border-(--border-default) bg-zinc-100/90 py-0 shadow-sm ring-0',
        'dark:border-white/6 dark:bg-[#161b22]',
      )}
    >
      <CardContent className="flex flex-col px-5 pt-5 pb-0">
        <div className="flex flex-wrap gap-2">
          <ModuleBadge variant="mint">
            {isFlash ? 'Flashcards' : 'Quiz'}
          </ModuleBadge>
          <ModuleBadge variant="violet">
            {count} {isFlash ? 'cards' : 'questions'}
          </ModuleBadge>
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
  );
}
