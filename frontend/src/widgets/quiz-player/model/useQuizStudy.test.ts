import type {
  ModuleQuestion,
  QuizSessionAnswerDetail,
} from '@/entities/module';
import { tStub } from '@/shared/test/tStub';
import { describe, expect, it } from 'vitest';
import {
  isQuestionAnswered,
  renderCorrectAnswer,
  renderUserAnswer,
  toSessionAnswerPayload,
} from './useQuizStudy';

function question(
  partial: Partial<ModuleQuestion> & Pick<ModuleQuestion, 'type'>,
): ModuleQuestion {
  return {
    id: 'q1',
    moduleId: 'm1',
    questionText: 'Question',
    allowMultipleAnswers: false,
    questionImageMime: null,
    orderIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    questionOptions: [],
    matchingPairs: [],
    orderingItems: [],
    ...partial,
  };
}

function answer(
  questionValue: ModuleQuestion,
  userAnswer: QuizSessionAnswerDetail['userAnswer'],
): QuizSessionAnswerDetail {
  return {
    id: 'a1',
    questionId: questionValue.id,
    isCorrect: false,
    userAnswer,
    question: questionValue,
  };
}

describe('isQuestionAnswered', () => {
  it('отличает пустой черновик от ответа каждого типа', () => {
    const choice = question({ type: 'CHOICE' });
    const text = question({ type: 'TEXT' });
    const matching = question({
      type: 'MATCHING',
      matchingPairs: [
        { id: 'p1', questionId: 'q1', leftItem: 'H2O', rightItem: 'Вода' },
      ],
    });
    const ordering = question({
      type: 'ORDERING',
      orderingItems: [
        { id: 'i1', text: 'A' },
        { id: 'i2', text: 'B' },
      ],
    });

    expect(isQuestionAnswered(choice, undefined)).toBe(false);
    expect(isQuestionAnswered(choice, { choiceOptionIds: ['o1'] })).toBe(true);
    expect(isQuestionAnswered(text, { textAnswer: '  ' })).toBe(false);
    expect(isQuestionAnswered(text, { textAnswer: 'Минск' })).toBe(true);
    expect(isQuestionAnswered(matching, { matchingAnswer: {} })).toBe(false);
    expect(isQuestionAnswered(matching, { matchingAnswer: { p1: 'p1' } })).toBe(
      true,
    );
    expect(isQuestionAnswered(ordering, { orderingAnswer: ['i1'] })).toBe(
      false,
    );
    expect(isQuestionAnswered(ordering, { orderingAnswer: ['i1', 'i2'] })).toBe(
      true,
    );
  });
});

describe('toSessionAnswerPayload', () => {
  it('собирает тело сессии квиза', () => {
    expect(
      toSessionAnswerPayload(question({ type: 'CHOICE', id: 'c1' }), {
        choiceOptionIds: ['o2', 'o2', ''],
      }),
    ).toEqual({
      questionId: 'c1',
      choiceOptionId: 'o2',
      choiceOptionIds: ['o2'],
    });
    expect(
      toSessionAnswerPayload(question({ type: 'TEXT', id: 't1' }), {
        textAnswer: '  Minsk ',
      }),
    ).toEqual({ questionId: 't1', textAnswer: 'Minsk' });
    expect(
      toSessionAnswerPayload(question({ type: 'ORDERING', id: 'o1' }), {
        orderingAnswer: ['b', 'a'],
      }),
    ).toEqual({ questionId: 'o1', orderingAnswer: ['b', 'a'] });
    expect(
      toSessionAnswerPayload(question({ type: 'MATCHING', id: 'm1' }), {
        matchingAnswer: { left: 'right' },
      }),
    ).toEqual({
      questionId: 'm1',
      matchingAnswer: { left: 'right' },
    });
  });
});

describe('render answers', () => {
  it('показывает эталон и ответ пользователя', () => {
    const choice = question({
      type: 'CHOICE',
      questionOptions: [
        { id: 'yes', questionId: 'q1', text: 'Да', isCorrect: true },
        { id: 'no', questionId: 'q1', text: 'Нет', isCorrect: false },
      ],
    });
    expect(renderCorrectAnswer(answer(choice, null))).toBe('Да');
    expect(
      renderUserAnswer(answer(choice, { choiceOptionIds: ['no'] }), tStub),
    ).toBe('Нет');
    expect(renderUserAnswer(answer(choice, null), tStub)).toBe(
      'quizStudy.noAnswer',
    );

    const text = question({
      type: 'TEXT',
      questionOptions: [
        { id: 'canon', questionId: 'q1', text: 'Минск', isCorrect: true },
      ],
    });
    expect(renderCorrectAnswer(answer(text, null))).toBe('Минск');
    expect(
      renderUserAnswer(answer(text, { textAnswer: '  Брест ' }), tStub),
    ).toBe('Брест');

    const matching = question({
      type: 'MATCHING',
      matchingPairs: [
        { id: 'p1', questionId: 'q1', leftItem: 'H2O', rightItem: 'Вода' },
        { id: 'p2', questionId: 'q1', leftItem: 'NaCl', rightItem: 'Соль' },
      ],
    });
    expect(renderCorrectAnswer(answer(matching, null))).toBe(
      'H2O -> Вода · NaCl -> Соль',
    );
    expect(
      renderUserAnswer(
        answer(matching, { matchingAnswer: { p1: 'p2', p2: 'p1' } }),
        tStub,
      ),
    ).toBe('H2O -> Соль · NaCl -> Вода');

    const ordering = question({
      type: 'ORDERING',
      orderingItems: [
        { id: 'a', text: 'Сначала', correctOrder: 0 },
        { id: 'b', text: 'Потом', correctOrder: 1 },
      ],
    });
    expect(renderCorrectAnswer(answer(ordering, null))).toBe('Сначала → Потом');
    expect(
      renderUserAnswer(answer(ordering, { orderingAnswer: ['b', 'a'] }), tStub),
    ).toBe('1. Потом ✗ · 2. Сначала ✗');
  });
});
