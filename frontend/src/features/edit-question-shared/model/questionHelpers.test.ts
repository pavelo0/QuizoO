import type { ModuleQuestion } from '@/entities/module';
import { tStub } from '@/shared/test/tStub';
import { describe, expect, it } from 'vitest';
import {
  parseAcceptedVariantsText,
  summarizeQuestion,
} from './questionHelpers';

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

describe('summarizeQuestion', () => {
  it('собирает краткое описание каждого типа', () => {
    expect(
      summarizeQuestion(
        question({
          type: 'CHOICE',
          allowMultipleAnswers: true,
          questionOptions: [
            { id: 'a', questionId: 'q1', text: 'A', isCorrect: true },
            { id: 'b', questionId: 'q1', text: 'B', isCorrect: false },
          ],
        }),
        tStub,
      ),
    ).toBe('editQuiz.summaryMultiple: A · B');

    expect(
      summarizeQuestion(
        question({
          type: 'TEXT',
          questionOptions: [
            { id: 'a', questionId: 'q1', text: 'Минск', isCorrect: true },
          ],
        }),
        tStub,
      ),
    ).toContain('Минск');

    expect(
      summarizeQuestion(
        question({
          type: 'MATCHING',
          matchingPairs: [
            { id: 'p', questionId: 'q1', leftItem: 'H2O', rightItem: 'Вода' },
          ],
        }),
        tStub,
      ),
    ).toBe('H2O -> Вода');

    expect(
      summarizeQuestion(
        question({
          type: 'ORDERING',
          orderingItems: [
            { id: 'b', text: 'Потом', correctOrder: 1 },
            { id: 'a', text: 'Сначала', correctOrder: 0 },
            { id: 'c', text: 'Дальше', correctOrder: 2 },
            { id: 'd', text: 'Конец', correctOrder: 3 },
          ],
        }),
        tStub,
      ),
    ).toBe('Сначала → Потом → Дальше…');
  });
});

describe('parseAcceptedVariantsText', () => {
  it('убирает пустые строки и дубликаты', () => {
    expect(parseAcceptedVariantsText(' Paris \n\nparis\nParis ')).toEqual([
      'Paris',
      'paris',
    ]);
  });
});
