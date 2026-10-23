import {
  labelByType,
  summarizeQuestion,
} from '@/features/edit-question-shared';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import type { ModuleQuestion } from '@/entities/module';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Image as ImageIcon,
  MoveDown,
  MoveUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import { memo } from 'react';

type SortableQuestionRowProps = {
  q: ModuleQuestion;
  index: number;
  total: number;
  canReorder: boolean;
  onEdit: (q: ModuleQuestion) => void;
  onDelete: (q: ModuleQuestion) => Promise<void>;
  onMoveUp: (questionId: string) => void;
  onMoveDown: (questionId: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const SortableQuestionRow = memo(function SortableQuestionRow({
  q,
  index,
  total,
  canReorder,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  t,
}: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: q.id,
    disabled: !canReorder,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const n = String(index + 1).padStart(2, '0');
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-stretch gap-3 rounded-2xl border border-(--border-default) bg-(--input-bg)/35 px-3 py-3 transition-colors duration-300 sm:px-4',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      <span
        className="w-7 shrink-0 select-none pt-0.5 font-(family-name:--font-jetbrains-mono) text-xs text-(--text-secondary)"
        aria-label={t('aria.order', { number: n })}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-(--text-primary) sm:text-base">
            {q.questionText}
          </h3>
          <span className="inline-flex items-center rounded-full bg-(--module-badge-violet-bg) px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
            {labelByType(q.type, t)}
          </span>
        </div>
        <p className="mt-1 text-sm text-(--text-secondary) sm:text-sm">
          {summarizeQuestion(q, t)}
        </p>
        {q.questionImageMime ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-(--text-secondary)">
            <ImageIcon className="size-3.5" />
            {t('editQuiz.imageAttached')}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {canReorder ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab text-(--text-secondary) hover:text-(--text-primary) active:cursor-grabbing"
            aria-label={t('editQuiz.reorder')}
            title={t('editQuiz.reorder')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveUp(q.id)}
          aria-label={t('editQuiz.moveUp')}
          disabled={!canReorder || index === 0}
        >
          <MoveUp className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveDown(q.id)}
          aria-label={t('editQuiz.moveDown')}
          disabled={!canReorder || index === total - 1}
        >
          <MoveDown className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onEdit(q)}
          aria-label={t('aria.editQuestion')}
        >
          <Pencil className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--danger-color)"
          onClick={() => void onDelete(q)}
          aria-label={t('aria.deleteQuestion')}
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </Button>
      </div>
    </li>
  );
});
SortableQuestionRow.displayName = 'SortableQuestionRow';
