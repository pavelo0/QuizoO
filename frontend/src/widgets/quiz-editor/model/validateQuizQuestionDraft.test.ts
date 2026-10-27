import { tStub } from '@/shared/test/tStub';
import { describe, expect, it } from 'vitest';
import { MAX_QUESTIONS_PER_MODULE } from './quizQuestionDraft';
import {
  validateQuizQuestionDraft,
  type QuizQuestionDraftInput,
} from './validateQuizQuestionDraft';

function draft(
  partial: Partial<QuizQuestionDraftInput> = {},
): QuizQuestionDraftInput {
  return {
    questionText: 'Столица?',
    type: 'CHOICE',
    allowMultipleAnswers: false,
    options: [
      { text: 'Минск', isCorrect: true },
      { text: 'Брест', isCorrect: false },
    ],
    pairs: [],
    textAnswer: '',
    orderingItems: [],
    fillBlanks: [],
    acceptedVariantsText: '',
    editing: false,
    questionsCount: 0,
    ...partial,
  };
}

describe('validateQuizQuestionDraft', () => {
  it('собирает успешный CHOICE', () => {
    const result = validateQuizQuestionDraft(draft(), tStub);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({
        questionText: 'Столица?',
        type: 'CHOICE',
        allowMultipleAnswers: false,
        options: [
          { text: 'Минск', isCorrect: true },
          { text: 'Брест', isCorrect: false },
        ],
      });
    }
  });

  it('отклоняет пустой текст, мало вариантов, отсутствие и лишние верные', () => {
    expect(
      validateQuizQuestionDraft(draft({ questionText: '  ' }), tStub).ok,
    ).toBe(false);

    const few = validateQuizQuestionDraft(
      draft({ options: [{ text: 'Только', isCorrect: true }] }),
      tStub,
    );
    expect(few.ok).toBe(false);
    if (!few.ok) {
      expect(few.errors.options).toBe('editQuiz.validationAtLeast2Options');
    }

    const none = validateQuizQuestionDraft(
      draft({
        options: [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: false },
        ],
      }),
      tStub,
    );
    expect(none.ok).toBe(false);
    if (!none.ok) {
      expect(none.errors.options).toBe('editQuiz.validationAtLeastOneCorrect');
    }

    const many = validateQuizQuestionDraft(
      draft({
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
      }),
      tStub,
    );
    expect(many.ok).toBe(false);
    if (!many.ok) {
      expect(many.errors.options).toBe('editQuiz.validationSingleCorrect');
    }
  });

  it('проверяет пары, текст, порядок и лимит новых вопросов', () => {
    const onePair = validateQuizQuestionDraft(
      draft({
        type: 'MATCHING',
        pairs: [{ leftItem: 'H2O', rightItem: 'Вода' }],
      }),
      tStub,
    );
    expect(onePair.ok).toBe(false);
    if (!onePair.ok) {
      expect(onePair.errors.matching).toBe('editQuiz.validationAtLeast2Pairs');
    }

    const half = validateQuizQuestionDraft(
      draft({
        type: 'MATCHING',
        pairs: [
          { leftItem: 'H2O', rightItem: 'Вода' },
          { leftItem: 'NaCl', rightItem: '  ' },
        ],
      }),
      tStub,
    );
    expect(half.ok).toBe(false);
    if (!half.ok) {
      expect(half.errors.matching).toBe('editQuiz.validationPairValues');
    }

    const emptyText = validateQuizQuestionDraft(
      draft({ type: 'TEXT', textAnswer: '  ' }),
      tStub,
    );
    expect(emptyText.ok).toBe(false);
    if (!emptyText.ok) {
      expect(emptyText.errors.textAnswer).toBe('editQuiz.validationTextAnswer');
    }

    const shortOrder = validateQuizQuestionDraft(
      draft({
        type: 'ORDERING',
        orderingItems: [{ id: 'a', text: 'Один' }],
      }),
      tStub,
    );
    expect(shortOrder.ok).toBe(false);
    if (!shortOrder.ok) {
      expect(shortOrder.errors.orderingItems).toBe(
        'editQuiz.validationOrderingMinItems',
      );
    }

    const limited = validateQuizQuestionDraft(
      draft({ questionsCount: MAX_QUESTIONS_PER_MODULE }),
      tStub,
    );
    expect(limited.ok).toBe(false);
    if (!limited.ok) {
      expect(limited.errors.form).toContain('editQuiz.validationMaxQuestions');
    }

    expect(
      validateQuizQuestionDraft(
        draft({ questionsCount: MAX_QUESTIONS_PER_MODULE, editing: true }),
        tStub,
      ).ok,
    ).toBe(true);
  });
});
