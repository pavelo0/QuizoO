import { describe, expect, it } from 'vitest';
import type { ModuleQuestion } from '@/entities/module';
import { tStub } from '@/shared/test/tStub';
import {
  MAX_QUESTIONS_PER_MODULE,
  parseQuestionPointsInput,
  parseQuizImportJson,
  quizJsonExample,
  sanitizeFilenamePart,
  toExportQuestion,
} from './quizQuestionDraft';

function question(
  partial: Partial<ModuleQuestion> & Pick<ModuleQuestion, 'type'>,
): ModuleQuestion {
  return {
    id: 'q1',
    moduleId: 'm1',
    questionText: 'Question',
    allowMultipleAnswers: false,
    questionImageMime: 'image/png',
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

describe('sanitizeFilenamePart', () => {
  it('режет пробелы и спецсимволы', () => {
    expect(sanitizeFilenamePart('  Hello, World! ')).toBe('hello-world');
    expect(sanitizeFilenamePart('Привет мир')).toBe('привет-мир');
  });
});

describe('parseQuestionPointsInput', () => {
  it('принимает целые от 1 до 100 и отбрасывает остальное', () => {
    expect(parseQuestionPointsInput('1')).toBe(1);
    expect(parseQuestionPointsInput('100')).toBe(100);
    expect(parseQuestionPointsInput(' 8 ')).toBe(8);
    expect(parseQuestionPointsInput('01')).toBe(1);
    expect(parseQuestionPointsInput('')).toBeNull();
    expect(parseQuestionPointsInput('  ')).toBeNull();
    expect(parseQuestionPointsInput('0')).toBeNull();
    expect(parseQuestionPointsInput('101')).toBeNull();
    expect(parseQuestionPointsInput('1.5')).toBeNull();
    expect(parseQuestionPointsInput('4a')).toBeNull();
    expect(parseQuestionPointsInput('-2')).toBeNull();
  });
});

describe('toExportQuestion', () => {
  it('не включает изображение и сортирует порядок', () => {
    const exported = toExportQuestion(
      question({
        type: 'ORDERING',
        questionText: 'Даты',
        orderingItems: [
          { id: 'b', text: '1945', correctOrder: 1 },
          { id: 'a', text: '1789', correctOrder: 0 },
        ],
      }),
    );
    expect(exported).toEqual({
      type: 'ORDERING',
      questionText: 'Даты',
      items: ['1789', '1945'],
    });
    expect(exported).not.toHaveProperty('questionImageMime');
  });

  it('кладёт баллы, только если они не равны 1', () => {
    expect(
      toExportQuestion(
        question({
          type: 'CHOICE',
          points: 4,
          questionOptions: [
            { id: 'o1', questionId: 'q1', text: 'A', isCorrect: true },
          ],
        }),
      ),
    ).toMatchObject({ type: 'CHOICE', points: 4 });
  });

  it('кладёт эталон TEXT и варианты', () => {
    expect(
      toExportQuestion(
        question({
          type: 'TEXT',
          questionText: 'Столица',
          acceptedVariants: ['Paris'],
          questionOptions: [
            {
              id: 'o1',
              questionId: 'q1',
              text: 'Париж',
              isCorrect: true,
            },
          ],
        }),
      ),
    ).toEqual({
      type: 'TEXT',
      questionText: 'Столица',
      answer: 'Париж',
      acceptedVariants: ['Paris'],
    });
  });
});

describe('parseQuizImportJson', () => {
  it('разбирает пример со всеми типами вопросов', () => {
    const parsed = parseQuizImportJson(JSON.parse(quizJsonExample), tStub);
    expect(parsed.customScoring).toBe(true);
    expect(parsed.questions[0]).toMatchObject({ points: 2 });
    expect(parsed.questions.map((item) => item.type)).toEqual([
      'CHOICE',
      'TEXT',
      'MATCHING',
      'ORDERING',
      'FILL_BLANK',
    ]);
    expect(parsed.questions[1]).toMatchObject({
      options: [{ text: 'Париж', isCorrect: true }],
      acceptedVariants: ['Paris', 'paris'],
    });
    expect(parsed.questions[3]?.orderingItems).toEqual([
      { text: '1914', correctOrder: 0 },
      { text: '1789', correctOrder: 1 },
      { text: '1945', correctOrder: 2 },
      { text: '1969', correctOrder: 3 },
    ]);
    expect(parsed.questions[4]).toMatchObject({
      questionText: 'GET-запрос обычно {{1}} данные',
      fillBlanks: [{ answer: 'читает', acceptedVariants: ['получает'] }],
    });
  });

  it('отклоняет битую структуру, версию, тип и лимит', () => {
    expect(() => parseQuizImportJson(null, tStub)).toThrow(
      'editQuiz.importInvalidStructure',
    );
    expect(() =>
      parseQuizImportJson({ formatVersion: 2, moduleType: 'QUIZ' }, tStub),
    ).toThrow(/editQuiz.importUnsupportedVersion/);
    expect(() =>
      parseQuizImportJson(
        { formatVersion: 1, moduleType: 'FLASHCARD', questions: [] },
        tStub,
      ),
    ).toThrow('editQuiz.importWrongModuleType');
    expect(() =>
      parseQuizImportJson(
        { formatVersion: 1, moduleType: 'QUIZ', questions: {} },
        tStub,
      ),
    ).toThrow('editQuiz.importQuestionsArrayRequired');
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: Array.from(
            { length: MAX_QUESTIONS_PER_MODULE + 1 },
            () => ({}),
          ),
        },
        tStub,
      ),
    ).toThrow(/editQuiz.validationMaxQuestions/);
  });

  it('отклоняет пустой текст и неизвестный тип', () => {
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: [{ type: 'TEXT', questionText: '  ', answer: 'x' }],
        },
        tStub,
      ),
    ).toThrow(/editQuiz.importQuestionTextRequired/);
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: [{ type: 'NOPE', questionText: 'Q' }],
        },
        tStub,
      ),
    ).toThrow(/editQuiz.importUnknownType/);
  });

  it('читает свою шкалу и отклоняет кривые баллы', () => {
    const parsed = parseQuizImportJson(
      {
        formatVersion: 1,
        moduleType: 'QUIZ',
        questions: [
          {
            type: 'TEXT',
            questionText: 'Столица',
            answer: 'Париж',
          },
        ],
      },
      tStub,
    );
    expect(parsed.customScoring).toBe(false);
    expect(parsed.questions[0]?.points).toBeUndefined();

    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          customScoring: 'yes',
          questions: [],
        },
        tStub,
      ),
    ).toThrow('editQuiz.importCustomScoringInvalid');
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: [
            {
              type: 'TEXT',
              questionText: 'Столица',
              answer: 'Париж',
              points: 0,
            },
          ],
        },
        tStub,
      ),
    ).toThrow(/editQuiz.importPointsInvalid/);
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: [
            {
              type: 'TEXT',
              questionText: 'Столица',
              answer: 'Париж',
              points: 1.5,
            },
          ],
        },
        tStub,
      ),
    ).toThrow(/editQuiz.importPointsInvalid/);
    expect(() =>
      parseQuizImportJson(
        {
          formatVersion: 1,
          moduleType: 'QUIZ',
          questions: [
            {
              type: 'TEXT',
              questionText: 'Столица',
              answer: 'Париж',
              points: '5',
            },
          ],
        },
        tStub,
      ),
    ).toThrow(/editQuiz.importPointsInvalid/);

    const upper = parseQuizImportJson(
      {
        formatVersion: 1,
        moduleType: 'QUIZ',
        customScoring: false,
        questions: [
          {
            type: 'TEXT',
            questionText: 'Столица',
            answer: 'Париж',
            points: 100,
          },
        ],
      },
      tStub,
    );
    expect(upper.customScoring).toBe(false);
    expect(upper.questions[0]?.points).toBe(100);
  });
});
