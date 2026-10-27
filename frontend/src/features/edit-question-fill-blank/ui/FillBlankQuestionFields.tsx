import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useI18n } from '@/shared/i18n/useI18n';
import { cn } from '@/shared/lib/utils';
import { FILL_BLANK_MAX } from '../lib/fillBlankMarkers';

const labelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

export type FillBlankDraft = {
  id: string;
  answer: string;
  variantsText: string;
};

type FieldErrors = {
  fillBlanks?: string;
  form?: string;
};

type Props = {
  blanks: FillBlankDraft[];
  errors: FieldErrors;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Omit<FillBlankDraft, 'id'>>) => void;
};

export function FillBlankQuestionFields({
  blanks,
  errors,
  onAdd,
  onRemove,
  onChange,
}: Props) {
  const { t } = useI18n();
  return (
    <div>
      <p className={labelClass}>{t('editQuiz.dialogFillBlanks')}</p>
      <div className="space-y-3">
        {blanks.map((blank, index) => (
          <div
            key={blank.id}
            className="rounded-2xl border border-(--border-default) bg-(--input-bg)/25 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-(--text-secondary)">
                {`{{${index + 1}}}`}
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg px-3 text-xs"
                onClick={() => onRemove(blank.id)}
                disabled={blanks.length <= 1}
              >
                {t('editQuiz.fillBlankRemove')}
              </Button>
            </div>
            <Input
              value={blank.answer}
              onChange={(event) =>
                onChange(blank.id, { answer: event.target.value })
              }
              placeholder={t('editQuiz.fillBlankAnswerPlaceholder')}
              aria-label={t('editQuiz.fillBlankAnswerPlaceholder')}
              className="h-11 rounded-xl"
            />
            <Textarea
              value={blank.variantsText}
              onChange={(event) =>
                onChange(blank.id, { variantsText: event.target.value })
              }
              placeholder={t('editQuiz.dialogAcceptedVariantsPlaceholder')}
              rows={2}
              className="mt-2 min-h-16 rounded-xl"
              aria-label={t('editQuiz.dialogAcceptedVariants')}
            />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          onClick={onAdd}
          disabled={blanks.length >= FILL_BLANK_MAX}
        >
          {t('editQuiz.dialogAddFillBlank')}
        </Button>
      </div>
      <p className="mt-2 text-xs text-(--text-secondary)">
        {t('editQuiz.fillBlankHint')}
      </p>
      {errors.fillBlanks ? (
        <p
          className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
          role="alert"
        >
          {errors.fillBlanks}
        </p>
      ) : null}
    </div>
  );
}
