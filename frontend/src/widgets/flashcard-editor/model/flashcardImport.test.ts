import { MAX_FLASHCARDS_PER_MODULE } from '@/shared/config/module';
import { tStub } from '@/shared/test/tStub';
import { describe, expect, it } from 'vitest';
import {
  flashcardJsonExample,
  parseFlashcardImportJson,
  sanitizeFilenamePart,
} from './flashcardImport';

describe('parseFlashcardImportJson', () => {
  it('разбирает пару карточек из примера', () => {
    const cards = parseFlashcardImportJson(
      JSON.parse(flashcardJsonExample),
      tStub,
    );
    expect(cards).toHaveLength(2);
    expect(cards[0]).toEqual({
      question: 'Что такое алгоритм?',
      answer:
        'Последовательность точных шагов для решения задачи за конечное время',
    });
  });

  it('обрезает пробелы и требует оба поля', () => {
    expect(
      parseFlashcardImportJson(
        {
          formatVersion: 1,
          moduleType: 'FLASHCARD',
          cards: [{ question: '  Q  ', answer: '  A  ' }],
        },
        tStub,
      ),
    ).toEqual([{ question: 'Q', answer: 'A' }]);

    expect(() =>
      parseFlashcardImportJson(
        {
          formatVersion: 1,
          moduleType: 'FLASHCARD',
          cards: [{ question: '   ', answer: 'A' }],
        },
        tStub,
      ),
    ).toThrow(/editFlash.importQuestionRequired/);
    expect(() =>
      parseFlashcardImportJson(
        {
          formatVersion: 1,
          moduleType: 'FLASHCARD',
          cards: [{ question: 'Q', answer: '' }],
        },
        tStub,
      ),
    ).toThrow(/editFlash.importAnswerRequired/);
  });

  it('отклоняет чужой тип, не массив и лимит', () => {
    expect(() => parseFlashcardImportJson([], tStub)).toThrow(
      'editFlash.importInvalidStructure',
    );
    expect(() =>
      parseFlashcardImportJson(
        { formatVersion: 1, moduleType: 'QUIZ', cards: [] },
        tStub,
      ),
    ).toThrow('editFlash.importWrongModuleType');
    expect(() =>
      parseFlashcardImportJson(
        { formatVersion: 1, moduleType: 'FLASHCARD' },
        tStub,
      ),
    ).toThrow('editFlash.importCardsArrayRequired');
    expect(() =>
      parseFlashcardImportJson(
        {
          formatVersion: 1,
          moduleType: 'FLASHCARD',
          cards: Array.from({ length: MAX_FLASHCARDS_PER_MODULE + 1 }, () => ({
            question: 'Q',
            answer: 'A',
          })),
        },
        tStub,
      ),
    ).toThrow(/editFlash.validationMaxCards/);
  });
});

describe('sanitizeFilenamePart', () => {
  it('схлопывает повторяющиеся разделители', () => {
    expect(sanitizeFilenamePart('A---B!!')).toBe('a-b');
  });
});
