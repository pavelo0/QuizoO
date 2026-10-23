import { ChoiceQuestionFields } from '@/features/edit-question-choice';
import { MatchingQuestionFields } from '@/features/edit-question-matching';
import { OrderingQuestionFields } from '@/features/edit-question-ordering';
import { TextQuestionFields } from '@/features/edit-question-text';
import {
  DEFAULT_MATCHING_PAIRS,
  formatAcceptedVariantsText,
  getQuestionTypes,
  parseAcceptedVariantsText,
} from '@/features/edit-question-shared';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';
import { useI18n } from '@/shared/i18n/useI18n';
import { questionImageUrl } from '@/entities/module';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { cn } from '@/shared/lib/utils';
import type { ModuleId, ModuleQuestion, QuestionType } from '@/entities/module';
import { X } from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import {
  createDefaultOrderingItems,
  MAX_QUESTIONS_PER_MODULE,
  QUESTION_IMAGE_ALLOWED_MIMES,
  QUESTION_IMAGE_MAX_BYTES,
} from '../model/quizQuestionDraft';

const textareaClass = cn(
  'min-h-28 w-full rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-3 text-sm text-(--text-primary) shadow-none',
  'placeholder:text-(--text-secondary) md:text-sm',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10',
);

const labelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

type QuestionDialogProps = {
  open: boolean;
  editingQuestion: ModuleQuestion | null;
  questionsCount: number;
  onOpenChange: (open: boolean) => void;
  onCreateQuestion: (
    payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      acceptedVariants?: string[];
    },
    imageFile: File | null,
  ) => Promise<void>;
  onUpdateQuestion: (
    questionId: string,
    payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      acceptedVariants?: string[];
    },
    imageUpdate: {
      file: File | null;
      removeExisting: boolean;
      hasExisting: boolean;
    },
  ) => Promise<void>;
  moduleId: ModuleId;
};

export const QuizQuestionDialog = memo(function QuizQuestionDialog({
  open,
  editingQuestion,
  questionsCount,
  onOpenChange,
  onCreateQuestion,
  onUpdateQuestion,
  moduleId,
}: QuestionDialogProps) {
  const { t } = useI18n();
  const QUESTION_TYPES = useMemo(() => getQuestionTypes(t), [t]);
  const [type, setType] = useState<QuestionType>('CHOICE');
  const [questionText, setQuestionText] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [acceptedVariantsText, setAcceptedVariantsText] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [pairs, setPairs] = useState(DEFAULT_MATCHING_PAIRS);
  const [orderingItems, setOrderingItems] = useState<
    Array<{ id: string; text: string }>
  >(createDefaultOrderingItems);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState<{
    questionText?: string;
    textAnswer?: string;
    options?: string;
    matching?: string;
    orderingItems?: string;
    image?: string;
    form?: string;
  }>({});
  const hasExistingImage = Boolean(editingQuestion?.questionImageMime);
  const existingImageUrl = editingQuestion
    ? questionImageUrl(moduleId, editingQuestion.id, {
        version: editingQuestion.createdAt,
      })
    : null;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setImageFile(null);
    setRemoveExistingImage(false);
    setImagePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return null;
    });
    if (!editingQuestion) {
      setType('CHOICE');
      setQuestionText('');
      setTextAnswer('');
      setAcceptedVariantsText('');
      setAllowMultipleAnswers(false);
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setPairs(DEFAULT_MATCHING_PAIRS);
      setOrderingItems(createDefaultOrderingItems());
      return;
    }
    setType(editingQuestion.type);
    setQuestionText(editingQuestion.questionText);
    setAllowMultipleAnswers(
      editingQuestion.type === 'CHOICE'
        ? editingQuestion.allowMultipleAnswers
        : false,
    );
    setTextAnswer(
      editingQuestion.questionOptions.find((o) => o.isCorrect)?.text ?? '',
    );
    setAcceptedVariantsText(
      formatAcceptedVariantsText(editingQuestion.acceptedVariants),
    );
    setOptions(
      editingQuestion.questionOptions.length > 0
        ? editingQuestion.questionOptions.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          }))
        : [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
    );
    setPairs(
      editingQuestion.matchingPairs.length > 0
        ? editingQuestion.matchingPairs.map((p) => ({
            leftItem: p.leftItem,
            rightItem: p.rightItem,
          }))
        : DEFAULT_MATCHING_PAIRS,
    );
    if (editingQuestion.type === 'ORDERING') {
      const loaded = [
        ...(Array.isArray(editingQuestion.orderingItems)
          ? editingQuestion.orderingItems
          : []),
      ]
        .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
        .map((item) => ({ id: item.id, text: item.text }));
      setOrderingItems(
        loaded.length >= 2 ? loaded : createDefaultOrderingItems(),
      );
    } else {
      setOrderingItems(createDefaultOrderingItems());
    }
  }, [open, editingQuestion]);

  const addChoiceOption = useCallback(() => {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  }, []);

  const addMatchingPair = useCallback(() => {
    setPairs((prev) => [...prev, { leftItem: '', rightItem: '' }]);
  }, []);

  const addOrderingItem = useCallback(() => {
    setOrderingItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: '' },
    ]);
  }, []);

  const updateOrderingItemText = useCallback((id: string, text: string) => {
    setOrderingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  }, []);

  const removeOrderingItem = useCallback((id: string) => {
    setOrderingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      event.target.value = '';
      if (!nextFile) return;
      if (!QUESTION_IMAGE_ALLOWED_MIMES.includes(nextFile.type)) {
        setErrors((prev) => ({
          ...prev,
          image: t('editQuiz.imageTypeError'),
          form: undefined,
        }));
        return;
      }
      if (nextFile.size > QUESTION_IMAGE_MAX_BYTES) {
        setErrors((prev) => ({
          ...prev,
          image: t('editQuiz.imageSizeError'),
          form: undefined,
        }));
        return;
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(nextFile);
      setImagePreviewUrl(URL.createObjectURL(nextFile));
      setRemoveExistingImage(false);
      setErrors((prev) => ({
        ...prev,
        image: undefined,
        form: undefined,
      }));
    },
    [imagePreviewUrl, t],
  );

  const clearSelectedImage = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    if (hasExistingImage) {
      setRemoveExistingImage(true);
    }
    setErrors((prev) => ({
      ...prev,
      image: undefined,
      form: undefined,
    }));
  }, [hasExistingImage, imagePreviewUrl]);

  const onSubmit = useCallback(async () => {
    const question = questionText.trim();
    const nextErrors: {
      questionText?: string;
      textAnswer?: string;
      options?: string;
      matching?: string;
      orderingItems?: string;
      image?: string;
      form?: string;
    } = {};

    if (!question)
      nextErrors.questionText = t('editQuiz.validationQuestionText');
    if (!editingQuestion && questionsCount >= MAX_QUESTIONS_PER_MODULE) {
      nextErrors.form = t('editQuiz.validationMaxQuestions', {
        count: MAX_QUESTIONS_PER_MODULE,
      });
    }

    const cleanOptions = options
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
      .filter((o) => o.text.length > 0 || o.isCorrect);
    const cleanPairs = pairs
      .map((p) => ({
        leftItem: p.leftItem.trim(),
        rightItem: p.rightItem.trim(),
      }))
      .filter((p) => p.leftItem.length > 0 || p.rightItem.length > 0);

    if (type === 'CHOICE') {
      if (cleanOptions.length < 2) {
        nextErrors.options = t('editQuiz.validationAtLeast2Options');
      } else if (cleanOptions.some((o) => !o.text)) {
        nextErrors.options = t('editQuiz.validationOptionEmpty');
      } else if (cleanOptions.filter((o) => o.isCorrect).length < 1) {
        nextErrors.options = t('editQuiz.validationAtLeastOneCorrect');
      } else if (
        !allowMultipleAnswers &&
        cleanOptions.filter((o) => o.isCorrect).length !== 1
      ) {
        nextErrors.options = t('editQuiz.validationSingleCorrect');
      }
    }

    if (type === 'MATCHING') {
      if (cleanPairs.length < 2) {
        nextErrors.matching = t('editQuiz.validationAtLeast2Pairs');
      } else if (
        cleanPairs.some(
          (p) => p.leftItem.length === 0 || p.rightItem.length === 0,
        )
      ) {
        nextErrors.matching = t('editQuiz.validationPairValues');
      }
    }

    const cleanTextAnswer = textAnswer.trim();
    if (type === 'TEXT' && !cleanTextAnswer) {
      nextErrors.textAnswer = t('editQuiz.validationTextAnswer');
    }

    const cleanOrderingItems = orderingItems
      .map((item) => ({ id: item.id, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    if (type === 'ORDERING') {
      if (cleanOrderingItems.length < 2) {
        nextErrors.orderingItems = t('editQuiz.validationOrderingMinItems');
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      orderingItems?: Array<{ text: string; correctOrder: number }>;
      acceptedVariants?: string[];
    } = { questionText: question, type };

    if (type === 'CHOICE') {
      payload.allowMultipleAnswers = allowMultipleAnswers;
      payload.options = cleanOptions;
    }
    if (type === 'TEXT') {
      payload.options = [{ text: cleanTextAnswer, isCorrect: true }];
      payload.acceptedVariants =
        parseAcceptedVariantsText(acceptedVariantsText);
    }
    if (type === 'MATCHING') {
      payload.matchingPairs = cleanPairs;
    }
    if (type === 'ORDERING') {
      payload.orderingItems = cleanOrderingItems.map((item, index) => ({
        text: item.text,
        correctOrder: index,
      }));
    }

    setSaving(true);
    setErrors({});
    try {
      if (editingQuestion) {
        await onUpdateQuestion(editingQuestion.id, payload, {
          file: imageFile,
          removeExisting: removeExistingImage,
          hasExisting: hasExistingImage,
        });
      } else {
        await onCreateQuestion(payload, imageFile);
      }
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: apiErrorText(err, t) });
    } finally {
      setSaving(false);
    }
  }, [
    editingQuestion,
    imageFile,
    removeExistingImage,
    hasExistingImage,
    onCreateQuestion,
    onOpenChange,
    onUpdateQuestion,
    options,
    pairs,
    orderingItems,
    questionText,
    textAnswer,
    acceptedVariantsText,
    questionsCount,
    type,
    allowMultipleAnswers,
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
        className="flex max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100%-2rem))] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="mb-0 gap-0 space-y-0 text-left sm:text-left">
            <DialogTitle className="font-(family-name:--font-syne) text-lg font-bold tracking-[0.02em] text-(--text-primary) sm:text-xl">
              {editingQuestion
                ? t('editQuiz.dialogEdit')
                : t('editQuiz.dialogNew')}
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

          <div className={cn('mt-6 space-y-6', errors.form ? 'mt-5' : 'mt-6')}>
            <div>
              <p className={labelClass}>{t('editQuiz.dialogQuestionType')}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {QUESTION_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={type === t.value ? 'cta' : 'outline'}
                    className={cn(
                      'h-11 rounded-xl text-sm',
                      type === t.value &&
                        'shadow-[0_4px_15px_var(--purple-glow)]',
                    )}
                    onClick={() => {
                      setType(t.value);
                      if (t.value !== 'CHOICE') {
                        setAllowMultipleAnswers(false);
                      }
                      setErrors((prev) => ({
                        ...prev,
                        textAnswer: undefined,
                        options: undefined,
                        matching: undefined,
                        form: undefined,
                      }));
                    }}
                  >
                    {t.title}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="quiz-question-text">
                {t('editQuiz.dialogQuestion')}
              </label>
              <Textarea
                id="quiz-question-text"
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    questionText: undefined,
                    form: undefined,
                  }));
                }}
                placeholder={t('editQuiz.dialogQuestionPlaceholder')}
                rows={4}
                aria-invalid={!!errors.questionText}
                className={cn(
                  textareaClass,
                  'resize-y',
                  errors.questionText && 'border-destructive',
                )}
              />
              {errors.questionText ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.questionText}
                </p>
              ) : null}
            </div>

            <div>
              <p className={labelClass}>{t('editQuiz.imageLabel')}</p>
              {imagePreviewUrl || (hasExistingImage && !removeExistingImage) ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-(--border-default) bg-(--input-bg)/30 p-2">
                  <img
                    src={imagePreviewUrl ?? existingImageUrl ?? ''}
                    alt={t('editQuiz.imagePreviewAlt')}
                    className="max-h-52 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={onImageChange}
                    aria-label={t('editQuiz.imageChoose')}
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-(--border-default) px-4 text-sm text-(--text-primary) transition-colors hover:bg-(--input-bg)/60">
                    {t('editQuiz.imageChoose')}
                  </span>
                </label>
                {imageFile || (hasExistingImage && !removeExistingImage) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-xl text-(--text-secondary)"
                    onClick={clearSelectedImage}
                  >
                    <X className="size-4" />
                    {t('editQuiz.imageRemove')}
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-(--text-secondary)">
                {t('editQuiz.imageHint')}
              </p>
              {errors.image ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.image}
                </p>
              ) : null}
            </div>

            {type === 'TEXT' ? (
              <TextQuestionFields
                textAnswer={textAnswer}
                setTextAnswer={setTextAnswer}
                acceptedVariantsText={acceptedVariantsText}
                setAcceptedVariantsText={setAcceptedVariantsText}
                errors={errors}
                setErrors={setErrors}
              />
            ) : null}

            {type === 'CHOICE' ? (
              <ChoiceQuestionFields
                options={options}
                setOptions={setOptions}
                allowMultipleAnswers={allowMultipleAnswers}
                setAllowMultipleAnswers={setAllowMultipleAnswers}
                errors={errors}
                setErrors={setErrors}
                addChoiceOption={addChoiceOption}
              />
            ) : null}

            {type === 'MATCHING' ? (
              <MatchingQuestionFields
                pairs={pairs}
                setPairs={setPairs}
                errors={errors}
                setErrors={setErrors}
                addMatchingPair={addMatchingPair}
              />
            ) : null}

            {type === 'ORDERING' ? (
              <OrderingQuestionFields
                orderingItems={orderingItems}
                setOrderingItems={setOrderingItems}
                errors={errors}
                setErrors={setErrors}
                addOrderingItem={addOrderingItem}
                updateOrderingItemText={updateOrderingItemText}
                removeOrderingItem={removeOrderingItem}
              />
            ) : null}
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
              : editingQuestion
                ? t('editQuiz.dialogSave')
                : t('editQuiz.dialogAdd')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
QuizQuestionDialog.displayName = 'QuizQuestionDialog';
