import { Input } from '@/shared/ui/input';
import { useI18n } from '@/shared/i18n/useI18n';
import { cn } from '@/shared/lib/utils';
import type { Dispatch, SetStateAction } from 'react';

import { Textarea } from '@/shared/ui/textarea';

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
  textAnswer: string;
  setTextAnswer: Dispatch<SetStateAction<string>>;
  acceptedVariantsText: string;
  setAcceptedVariantsText: Dispatch<SetStateAction<string>>;
  errors: FieldErrors;
  setErrors: Dispatch<SetStateAction<FieldErrors>>;
};

export function TextQuestionFields({
  textAnswer,
  setTextAnswer,
  acceptedVariantsText,
  setAcceptedVariantsText,
  errors,
  setErrors,
}: Props) {
  const { t } = useI18n();
  return (
    <div>
      <label className={labelClass} htmlFor="quiz-text-answer">
        {t('editQuiz.dialogCorrectAnswer')}
      </label>
      <Input
        id="quiz-text-answer"
        value={textAnswer}
        onChange={(e) => {
          setTextAnswer(e.target.value);
          setErrors((prev) => ({
            ...prev,
            textAnswer: undefined,
            form: undefined,
          }));
        }}
        placeholder={t('editQuiz.dialogCorrectPlaceholder')}
        aria-invalid={!!errors.textAnswer}
        className={cn(
          'h-11 rounded-xl',
          errors.textAnswer && 'border-destructive',
        )}
      />
      {errors.textAnswer ? (
        <p
          className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
          role="alert"
        >
          {errors.textAnswer}
        </p>
      ) : null}
      <label
        className={cn(labelClass, 'mt-4 block')}
        htmlFor="quiz-accepted-variants"
      >
        {t('editQuiz.dialogAcceptedVariants')}
      </label>
      <p className="mb-2 font-(family-name:--font-dm-sans) text-xs text-(--text-secondary)">
        {t('editQuiz.dialogAcceptedVariantsHint')}
      </p>
      <Textarea
        id="quiz-accepted-variants"
        value={acceptedVariantsText}
        onChange={(e) => {
          setAcceptedVariantsText(e.target.value);
          setErrors((prev) => ({ ...prev, form: undefined }));
        }}
        placeholder={t('editQuiz.dialogAcceptedVariantsPlaceholder')}
        rows={3}
        className="min-h-[5.5rem] rounded-xl"
      />
    </div>
  );
}
