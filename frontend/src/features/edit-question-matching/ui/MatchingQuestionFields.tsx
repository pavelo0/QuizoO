import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useI18n } from '@/shared/i18n/useI18n';
import { cn } from '@/shared/lib/utils';
import type { Dispatch, SetStateAction } from 'react';

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

type Pair = { leftItem: string; rightItem: string };

type Props = {
  pairs: Pair[];
  setPairs: Dispatch<SetStateAction<Pair[]>>;
  errors: FieldErrors;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
  addMatchingPair: () => void;
};

export function MatchingQuestionFields({
  pairs,
  setPairs,
  errors,
  setErrors,
  addMatchingPair,
}: Props) {
  const { t } = useI18n();
  return (
    <div>
      <p className={labelClass}>{t('editQuiz.dialogMatchingPairs')}</p>
      <div className="space-y-2.5">
        {pairs.map((pair, idx) => (
          <div
            key={`pair-${idx}`}
            className="grid items-center gap-2 sm:grid-cols-[1fr_28px_1fr]"
          >
            <Input
              value={pair.leftItem}
              onChange={(e) => {
                const v = e.target.value;
                setPairs((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, leftItem: v } : x)),
                );
                setErrors((prev) => ({
                  ...prev,
                  matching: undefined,
                  form: undefined,
                }));
              }}
              placeholder={t('editQuiz.dialogLeftItem')}
              className="h-11 rounded-xl"
            />
            <span className="text-center text-xs text-(--text-secondary)">
              →
            </span>
            <Input
              value={pair.rightItem}
              onChange={(e) => {
                const v = e.target.value;
                setPairs((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, rightItem: v } : x)),
                );
                setErrors((prev) => ({
                  ...prev,
                  matching: undefined,
                  form: undefined,
                }));
              }}
              placeholder={t('editQuiz.dialogRightItem')}
              className="h-11 rounded-xl"
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={addMatchingPair}
        >
          {t('editQuiz.dialogAddPair')}
        </Button>
      </div>
      {errors.matching ? (
        <p
          className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
          role="alert"
        >
          {errors.matching}
        </p>
      ) : null}
    </div>
  );
}
