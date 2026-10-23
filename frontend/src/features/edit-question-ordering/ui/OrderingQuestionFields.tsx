import { Button } from '@/shared/ui/button';
import { useI18n } from '@/shared/i18n/useI18n';
import { cn } from '@/shared/lib/utils';
import type { Dispatch, SetStateAction } from 'react';
import {
  SortableOrderingList,
  type OrderingListItem,
} from './SortableOrderingList';

const labelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

type FieldErrors = {
  questionText?: string;
  textAnswer?: string;
  options?: string;
  matching?: string;
  orderingItems?: string;
  image?: string;
  form?: string;
};

type Props = {
  orderingItems: OrderingListItem[];
  setOrderingItems: Dispatch<SetStateAction<OrderingListItem[]>>;
  errors: FieldErrors;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
  addOrderingItem: () => void;
  updateOrderingItemText: (id: string, text: string) => void;
  removeOrderingItem: (id: string) => void;
};

export function OrderingQuestionFields({
  orderingItems,
  setOrderingItems,
  errors,
  setErrors,
  addOrderingItem,
  updateOrderingItemText,
  removeOrderingItem,
}: Props) {
  const { t } = useI18n();
  return (
    <div>
      <p className={labelClass}>{t('editQuiz.dialogOrderingItems')}</p>
      <SortableOrderingList
        items={orderingItems}
        mode="edit"
        onReorder={setOrderingItems}
        onItemTextChange={(id, text) => {
          updateOrderingItemText(id, text);
          setErrors((prev) => ({
            ...prev,
            orderingItems: undefined,
            form: undefined,
          }));
        }}
        onRemoveItem={removeOrderingItem}
        textPlaceholder={t('editQuiz.orderingItemPlaceholder')}
      />
      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={addOrderingItem}
        >
          {t('editQuiz.dialogAddOrderingItem')}
        </Button>
      </div>
      <p className="mt-2 text-xs text-(--text-secondary)">
        {t('editQuiz.orderingHint')}
      </p>
      {errors.orderingItems ? (
        <p
          className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
          role="alert"
        >
          {errors.orderingItems}
        </p>
      ) : null}
    </div>
  );
}
