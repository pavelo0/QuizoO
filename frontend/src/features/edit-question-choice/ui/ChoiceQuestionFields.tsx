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

type ChoiceOption = { text: string; isCorrect: boolean };

type Props = {
  options: ChoiceOption[];
  setOptions: Dispatch<SetStateAction<ChoiceOption[]>>;
  allowMultipleAnswers: boolean;
  setAllowMultipleAnswers: Dispatch<SetStateAction<boolean>>;
  errors: FieldErrors;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
  addChoiceOption: () => void;
};

export function ChoiceQuestionFields({
  options,
  setOptions,
  allowMultipleAnswers,
  setAllowMultipleAnswers,
  errors,
  setErrors,
  addChoiceOption,
}: Props) {
  const { t } = useI18n();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-(--border-default) bg-(--input-bg)/45 px-3 py-2">
        <p className="text-xs text-(--text-secondary)">
          {t('editQuiz.dialogAnswerMode')}
        </p>
        <label className="flex items-center gap-2 text-xs text-(--text-primary)">
          <input
            type="checkbox"
            checked={allowMultipleAnswers}
            onChange={(e) => {
              setAllowMultipleAnswers(e.target.checked);
              setErrors((prev) => ({
                ...prev,
                options: undefined,
                form: undefined,
              }));
            }}
          />
          {t('editQuiz.dialogAllowMultiple')}
        </label>
      </div>
      <p className={labelClass}>{t('editQuiz.dialogOptions')}</p>
      <div className="space-y-2.5">
        {options.map((opt, idx) => (
          <div key={`opt-${idx}`} className="flex items-center gap-2">
            <Input
              value={opt.text}
              onChange={(e) => {
                const v = e.target.value;
                setOptions((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, text: v } : x)),
                );
                setErrors((prev) => ({
                  ...prev,
                  options: undefined,
                  form: undefined,
                }));
              }}
              placeholder={t('editQuiz.dialogOption', {
                index: idx + 1,
              })}
              className="h-11 rounded-xl"
            />
            <label className="flex shrink-0 items-center gap-2 text-xs text-(--text-secondary)">
              <input
                type="checkbox"
                checked={opt.isCorrect}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setOptions((prev) =>
                    prev.map((x, i) =>
                      i === idx ? { ...x, isCorrect: checked } : x,
                    ),
                  );
                  setErrors((prev) => ({
                    ...prev,
                    options: undefined,
                    form: undefined,
                  }));
                }}
              />
              {t('editQuiz.dialogOptionCorrect')}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={addChoiceOption}
        >
          {t('editQuiz.dialogAddOption')}
        </Button>
      </div>
      {errors.options ? (
        <p
          className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
          role="alert"
        >
          {errors.options}
        </p>
      ) : null}
    </div>
  );
}
