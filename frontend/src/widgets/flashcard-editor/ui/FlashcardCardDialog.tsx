import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { MAX_FLASHCARDS_PER_MODULE } from '@/shared/config/module';
import { cn } from '@/shared/lib/utils';
import { useI18n } from '@/shared/i18n/useI18n';
import type { ModuleCard } from '@/entities/module';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';
import { memo, useCallback, useEffect, useState } from 'react';

const cardTextareaClass = cn(
  'min-h-28 w-full rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-3 text-sm text-(--text-primary) shadow-none',
  'placeholder:text-(--text-secondary) md:text-sm',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10',
);

const cardLabelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

type FlashcardCardDialogProps = {
  open: boolean;
  editingCard: ModuleCard | null;
  cardsCount: number;
  onOpenChange: (open: boolean) => void;
  onCreateCard: (question: string, answer: string) => Promise<void>;
  onUpdateCard: (
    cardId: string,
    question: string,
    answer: string,
  ) => Promise<void>;
};

export const FlashcardCardDialog = memo(function FlashcardCardDialog({
  open,
  editingCard,
  cardsCount,
  onOpenChange,
  onCreateCard,
  onUpdateCard,
}: FlashcardCardDialogProps) {
  const { t } = useI18n();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    question?: string;
    answer?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setQuestion(editingCard?.question ?? '');
    setAnswer(editingCard?.answer ?? '');
    setErrors({});
    setSaving(false);
  }, [open, editingCard]);

  const onSubmit = useCallback(async () => {
    const q = question.trim();
    const a = answer.trim();
    const next: { question?: string; answer?: string; form?: string } = {};

    if (!q) next.question = t('editFlash.validationQuestion');
    if (!a) next.answer = t('editFlash.validationAnswer');
    if (!editingCard && cardsCount >= MAX_FLASHCARDS_PER_MODULE) {
      next.form = t('editFlash.validationMaxCards', {
        count: MAX_FLASHCARDS_PER_MODULE,
      });
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      if (editingCard) {
        await onUpdateCard(editingCard.id, q, a);
      } else {
        await onCreateCard(q, a);
      }
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: apiErrorText(err, t) });
    } finally {
      setSaving(false);
    }
  }, [
    answer,
    cardsCount,
    editingCard,
    onCreateCard,
    onOpenChange,
    onUpdateCard,
    question,
    t,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setErrors({});
      }}
    >
      <DialogContent
        className="w-[min(32rem,calc(100%-2rem))] max-w-2xl gap-0 p-0 sm:max-w-2xl"
        showCloseButton
      >
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-0 gap-0 space-y-0 text-left sm:text-left">
            <DialogTitle className="font-(family-name:--font-syne) text-lg font-bold tracking-[0.02em] text-(--text-primary) sm:text-xl">
              {editingCard
                ? t('editFlash.dialogEdit')
                : t('editFlash.dialogNew')}
            </DialogTitle>
          </DialogHeader>
          {errors.form ? (
            <p
              className="mt-3 font-(family-name:--font-dm-sans) text-xs text-destructive"
              role="alert"
            >
              {errors.form}
            </p>
          ) : null}
          <div
            className={cn('grid gap-6 sm:gap-8', errors.form ? 'mt-5' : 'mt-6')}
          >
            <div>
              <label className={cardLabelClass} htmlFor="new-card-question">
                {t('editFlash.dialogQuestion')}
              </label>
              <Textarea
                id="new-card-question"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    question: undefined,
                    form: undefined,
                  }));
                }}
                placeholder={t('editFlash.dialogQuestionPlaceholder')}
                aria-invalid={!!errors.question}
                rows={4}
                className={cn(
                  cardTextareaClass,
                  'resize-y',
                  errors.question && 'border-destructive',
                )}
              />
              {errors.question ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.question}
                </p>
              ) : null}
            </div>
            <div>
              <label className={cardLabelClass} htmlFor="new-card-answer">
                {t('editFlash.dialogAnswer')}
              </label>
              <Textarea
                id="new-card-answer"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    answer: undefined,
                    form: undefined,
                  }));
                }}
                placeholder={t('editFlash.dialogAnswerPlaceholder')}
                aria-invalid={!!errors.answer}
                rows={4}
                className={cn(
                  cardTextareaClass,
                  'resize-y',
                  errors.answer && 'border-destructive',
                )}
              />
              {errors.answer ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.answer}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-0 gap-3 border-t border-(--border-default) p-6 sm:gap-3 sm:px-8 sm:py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-2xl px-6"
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="cta"
            onClick={() => void onSubmit()}
            className="h-12 rounded-2xl px-6"
            disabled={saving}
          >
            {saving
              ? t('common.saving')
              : editingCard
                ? t('editFlash.dialogSave')
                : t('editFlash.dialogAdd')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
FlashcardCardDialog.displayName = 'FlashcardCardDialog';
