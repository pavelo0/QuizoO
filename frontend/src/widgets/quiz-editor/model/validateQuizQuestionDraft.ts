import { parseAcceptedVariantsText } from '@/features/edit-question-shared';
import type { QuestionType } from '@/entities/module';
import type { TranslationKey } from '@/shared/i18n/messages';
import {
  MAX_QUESTIONS_PER_MODULE,
  type QuestionPayload,
} from './quizQuestionDraft';

export type QuizQuestionFieldErrors = {
  questionText?: string;
  textAnswer?: string;
  options?: string;
  matching?: string;
  orderingItems?: string;
  image?: string;
  form?: string;
};

export type QuizQuestionDraftInput = {
  questionText: string;
  type: QuestionType;
  allowMultipleAnswers: boolean;
  options: Array<{ text: string; isCorrect: boolean }>;
  pairs: Array<{ leftItem: string; rightItem: string }>;
  textAnswer: string;
  orderingItems: Array<{ id: string; text: string }>;
  acceptedVariantsText: string;
  editing: boolean;
  questionsCount: number;
};

export type QuizQuestionDraftResult =
  | { ok: false; errors: QuizQuestionFieldErrors }
  | { ok: true; payload: QuestionPayload };

type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

export function validateQuizQuestionDraft(
  input: QuizQuestionDraftInput,
  t: Translate,
): QuizQuestionDraftResult {
  const question = input.questionText.trim();
  const errors: QuizQuestionFieldErrors = {};

  if (!question) errors.questionText = t('editQuiz.validationQuestionText');
  if (!input.editing && input.questionsCount >= MAX_QUESTIONS_PER_MODULE) {
    errors.form = t('editQuiz.validationMaxQuestions', {
      count: MAX_QUESTIONS_PER_MODULE,
    });
  }

  const cleanOptions = input.options
    .map((option) => ({
      text: option.text.trim(),
      isCorrect: option.isCorrect,
    }))
    .filter((option) => option.text.length > 0 || option.isCorrect);
  const cleanPairs = input.pairs
    .map((pair) => ({
      leftItem: pair.leftItem.trim(),
      rightItem: pair.rightItem.trim(),
    }))
    .filter((pair) => pair.leftItem.length > 0 || pair.rightItem.length > 0);

  if (input.type === 'CHOICE') {
    if (cleanOptions.length < 2) {
      errors.options = t('editQuiz.validationAtLeast2Options');
    } else if (cleanOptions.some((option) => !option.text)) {
      errors.options = t('editQuiz.validationOptionEmpty');
    } else if (cleanOptions.filter((option) => option.isCorrect).length < 1) {
      errors.options = t('editQuiz.validationAtLeastOneCorrect');
    } else if (
      !input.allowMultipleAnswers &&
      cleanOptions.filter((option) => option.isCorrect).length !== 1
    ) {
      errors.options = t('editQuiz.validationSingleCorrect');
    }
  }

  if (input.type === 'MATCHING') {
    if (cleanPairs.length < 2) {
      errors.matching = t('editQuiz.validationAtLeast2Pairs');
    } else if (
      cleanPairs.some(
        (pair) => pair.leftItem.length === 0 || pair.rightItem.length === 0,
      )
    ) {
      errors.matching = t('editQuiz.validationPairValues');
    }
  }

  const cleanTextAnswer = input.textAnswer.trim();
  if (input.type === 'TEXT' && !cleanTextAnswer) {
    errors.textAnswer = t('editQuiz.validationTextAnswer');
  }

  const cleanOrderingItems = input.orderingItems
    .map((item) => ({ id: item.id, text: item.text.trim() }))
    .filter((item) => item.text.length > 0);

  if (input.type === 'ORDERING' && cleanOrderingItems.length < 2) {
    errors.orderingItems = t('editQuiz.validationOrderingMinItems');
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const payload: QuestionPayload = { questionText: question, type: input.type };
  if (input.type === 'CHOICE') {
    payload.allowMultipleAnswers = input.allowMultipleAnswers;
    payload.options = cleanOptions;
  }
  if (input.type === 'TEXT') {
    payload.options = [{ text: cleanTextAnswer, isCorrect: true }];
    payload.acceptedVariants = parseAcceptedVariantsText(
      input.acceptedVariantsText,
    );
  }
  if (input.type === 'MATCHING') {
    payload.matchingPairs = cleanPairs;
  }
  if (input.type === 'ORDERING') {
    payload.orderingItems = cleanOrderingItems.map((item, index) => ({
      text: item.text,
      correctOrder: index,
    }));
  }

  return { ok: true, payload };
}
