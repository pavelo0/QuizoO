import type { ModuleQuestion, QuizSessionDetail } from '@/entities/module';
import { describe, expect, it } from 'vitest';
import { questionsForWrongRetry } from './wrongRetryQuestions';

function question(
  partial: Partial<ModuleQuestion> & Pick<ModuleQuestion, 'id' | 'type'>,
): ModuleQuestion {
  return {
    moduleId: 'm1',
    questionText: partial.id,
    allowMultipleAnswers: false,
    questionImageMime: null,
    orderIndex: 0,
    points: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    questionOptions: [],
    matchingPairs: [],
    orderingItems: [],
    fillBlanks: [],
    ...partial,
  };
}

function session(
  answers: QuizSessionDetail['answers'],
): Pick<QuizSessionDetail, 'answers'> {
  return { answers };
}

describe('questionsForWrongRetry', () => {
  it('keeps only incorrect questions and hides answer keys', () => {
    const ordering = question({
      id: 'order',
      type: 'ORDERING',
      orderingItems: [
        { id: 'b', text: 'Second', correctOrder: 1 },
        { id: 'a', text: 'First', correctOrder: 0 },
      ],
    });
    const blank = question({
      id: 'blank',
      type: 'FILL_BLANK',
      fillBlanks: [
        {
          id: 'f2',
          blankIndex: 2,
          answer: 'two',
          acceptedVariants: ['2'],
        },
        {
          id: 'f1',
          blankIndex: 1,
          answer: 'one',
          acceptedVariants: ['1'],
        },
      ],
    });
    const correct = question({ id: 'ok', type: 'TEXT' });

    const questions = questionsForWrongRetry(
      session([
        {
          id: 'a-order',
          questionId: 'order',
          isCorrect: false,
          userAnswer: null,
          question: ordering,
        },
        {
          id: 'a-ok',
          questionId: 'ok',
          isCorrect: true,
          userAnswer: null,
          question: correct,
        },
        {
          id: 'a-blank',
          questionId: 'blank',
          isCorrect: false,
          userAnswer: null,
          question: blank,
        },
      ]),
    );

    expect(questions.map((item) => item.id)).toEqual(['order', 'blank']);
    expect(questions[0]?.orderingItems).toEqual([
      { id: 'b', text: 'Second' },
      { id: 'a', text: 'First' },
    ]);
    expect(questions[1]?.fillBlanks).toEqual([
      { id: 'f1', blankIndex: 1, answer: '', acceptedVariants: [] },
      { id: 'f2', blankIndex: 2, answer: '', acceptedVariants: [] },
    ]);
  });

  it('returns an empty list when every answer is correct', () => {
    const only = question({ id: 'ok', type: 'CHOICE' });
    expect(
      questionsForWrongRetry(
        session([
          {
            id: 'a1',
            questionId: 'ok',
            isCorrect: true,
            userAnswer: null,
            question: only,
          },
        ]),
      ),
    ).toEqual([]);
  });
});
