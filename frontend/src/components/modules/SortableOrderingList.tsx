import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { useMemo } from 'react';

export type OrderingListItem = {
  id: string;
  text: string;
};

type SortableOrderingListProps = {
  items: OrderingListItem[];
  onReorder: (items: OrderingListItem[]) => void;
  mode: 'edit' | 'study';
  disabled?: boolean;
  onItemTextChange?: (id: string, text: string) => void;
  onRemoveItem?: (id: string) => void;
  minItems?: number;
  textPlaceholder?: string;
};

type SortableOrderingRowProps = {
  item: OrderingListItem;
  index: number;
  mode: 'edit' | 'study';
  disabled?: boolean;
  canRemove?: boolean;
  textPlaceholder?: string;
  onItemTextChange?: (id: string, text: string) => void;
  onRemoveItem?: (id: string) => void;
};

function SortableOrderingRow({
  item,
  index,
  mode,
  disabled = false,
  canRemove = false,
  textPlaceholder,
  onItemTextChange,
  onRemoveItem,
}: SortableOrderingRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-(--border-default) bg-(--input-bg)/35 p-2',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      {!disabled ? (
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-(--text-secondary) active:cursor-grabbing"
          aria-label={`${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : (
        <span className="w-9 shrink-0 text-center text-sm text-(--text-secondary)">
          {index + 1}.
        </span>
      )}

      {mode === 'edit' ? (
        <Input
          value={item.text}
          onChange={(e) => onItemTextChange?.(item.id, e.target.value)}
          placeholder={textPlaceholder}
          disabled={disabled}
          className="h-11 flex-1 rounded-xl"
        />
      ) : (
        <span className="flex-1 px-1 text-sm text-(--text-primary)">
          {item.text}
        </span>
      )}

      {mode === 'edit' && onRemoveItem ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.id)}
          disabled={disabled || !canRemove}
          className="h-9 w-9 shrink-0 p-0"
          aria-label="Remove item"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function SortableOrderingList({
  items,
  onReorder,
  mode,
  disabled = false,
  onItemTextChange,
  onRemoveItem,
  minItems = 2,
  textPlaceholder,
}: SortableOrderingListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <SortableOrderingRow
              key={item.id}
              item={item}
              index={index}
              mode={mode}
              disabled={disabled}
              canRemove={items.length > minItems}
              textPlaceholder={textPlaceholder}
              onItemTextChange={onItemTextChange}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
