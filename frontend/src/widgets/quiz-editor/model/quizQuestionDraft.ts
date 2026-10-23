import type { ModuleQuestion, QuestionType } from '@/entities/module';

export const MAX_QUESTIONS_PER_MODULE = 30;
export const QUIZ_IMPORT_FORMAT_VERSION = 1;
export const QUESTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const QUESTION_IMAGE_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export type QuestionPayload = {
  questionText: string;
  type: QuestionType;
  allowMultipleAnswers?: boolean;
  options?: Array<{ text: string; isCorrect: boolean }>;
  matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
  orderingItems?: Array<{ text: string; correctOrder: number }>;
  acceptedVariants?: string[];
};

export function createDefaultOrderingItems() {
  return [
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
  ];
}

export const quizJsonExample = JSON.stringify(
  {
    formatVersion: QUIZ_IMPORT_FORMAT_VERSION,
    moduleType: 'QUIZ',
    _comment: 'Изображения вопросов не включаются в JSON импорта/экспорта.',
    title: 'Контрольный квиз',
    questions: [
      {
        type: 'CHOICE',
        questionText: 'Какой HTTP-метод обычно используют для создания записи?',
        allowMultipleAnswers: false,
        options: [
          { text: 'POST', isCorrect: true },
          { text: 'GET', isCorrect: false },
          { text: 'DELETE', isCorrect: false },
        ],
      },
      {
        type: 'TEXT',
        questionText: 'Назовите столицу Франции',
        answer: 'Париж',
        acceptedVariants: ['Paris', 'paris'],
      },
      {
        type: 'MATCHING',
        questionText: 'Сопоставьте термин и определение',
        pairs: [
          { left: 'Инкапсуляция', right: 'Сокрытие внутренней реализации' },
          {
            left: 'Полиморфизм',
            right: 'Единый интерфейс для разных реализаций',
          },
        ],
      },
      {
        type: 'ORDERING',
        questionText: 'Расположите исторические даты в хронологическом порядке',
        items: ['1914', '1789', '1945', '1969'],
      },
    ],
  },
  null,
  2,
);

export function sanitizeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toExportQuestion(q: ModuleQuestion) {
  if (q.type === 'CHOICE') {
    return {
      type: 'CHOICE',
      questionText: q.questionText,
      allowMultipleAnswers: q.allowMultipleAnswers,
      options: q.questionOptions.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    };
  }
  if (q.type === 'TEXT') {
    const answer = q.questionOptions.find((o) => o.isCorrect)?.text ?? '';
    const exported: {
      type: 'TEXT';
      questionText: string;
      answer: string;
      acceptedVariants?: string[];
    } = {
      type: 'TEXT',
      questionText: q.questionText,
      answer,
    };
    if (q.acceptedVariants && q.acceptedVariants.length > 0) {
      exported.acceptedVariants = q.acceptedVariants;
    }
    return exported;
  }
  if (q.type === 'MATCHING') {
    return {
      type: 'MATCHING',
      questionText: q.questionText,
      pairs: q.matchingPairs.map((p) => ({
        left: p.leftItem,
        right: p.rightItem,
      })),
    };
  }
  return {
    type: 'ORDERING',
    questionText: q.questionText,
    items: [...(Array.isArray(q.orderingItems) ? q.orderingItems : [])]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((item) => item.text),
  };
}

export function parseQuizImportJson(
  raw: unknown,
  t: (key: string, vars?: Record<string, string | number>) => string,
): QuestionPayload[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(t('editQuiz.importInvalidStructure'));
  }

  const data = raw as {
    formatVersion?: number;
    moduleType?: string;
    questions?: unknown;
  };

  if (data.formatVersion !== QUIZ_IMPORT_FORMAT_VERSION) {
    throw new Error(
      t('editQuiz.importUnsupportedVersion', {
        version: QUIZ_IMPORT_FORMAT_VERSION,
      }),
    );
  }
  if (data.moduleType !== 'QUIZ') {
    throw new Error(t('editQuiz.importWrongModuleType'));
  }
  if (!Array.isArray(data.questions)) {
    throw new Error(t('editQuiz.importQuestionsArrayRequired'));
  }
  if (data.questions.length > MAX_QUESTIONS_PER_MODULE) {
    throw new Error(
      t('editQuiz.validationMaxQuestions', { count: MAX_QUESTIONS_PER_MODULE }),
    );
  }

  return data.questions.map((item, idx) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(
        t('editQuiz.importQuestionObjectExpected', { index: idx + 1 }),
      );
    }
    const q = item as {
      type?: string;
      questionText?: string;
      allowMultipleAnswers?: boolean;
      options?: unknown;
      answer?: string;
      acceptedVariants?: unknown;
      pairs?: unknown;
      items?: unknown;
    };
    const questionText = q.questionText?.trim() ?? '';
    if (!questionText) {
      throw new Error(
        t('editQuiz.importQuestionTextRequired', { index: idx + 1 }),
      );
    }

    if (q.type === 'CHOICE') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(
          t('editQuiz.importChoiceOptionsMin', { index: idx + 1 }),
        );
      }
      const options = q.options.map((opt) => {
        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
          throw new Error(
            t('editQuiz.importChoiceOptionInvalid', { index: idx + 1 }),
          );
        }
        const option = opt as { text?: string; isCorrect?: boolean };
        const text = option.text?.trim() ?? '';
        if (!text) {
          throw new Error(
            t('editQuiz.importChoiceOptionTextRequired', { index: idx + 1 }),
          );
        }
        return { text, isCorrect: !!option.isCorrect };
      });
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) {
        throw new Error(
          t('editQuiz.importChoiceCorrectRequired', { index: idx + 1 }),
        );
      }
      const allowMultipleAnswers = !!q.allowMultipleAnswers;
      if (!allowMultipleAnswers && correctCount !== 1) {
        throw new Error(
          t('editQuiz.importChoiceSingleCorrect', { index: idx + 1 }),
        );
      }
      return {
        questionText,
        type: 'CHOICE' as const,
        allowMultipleAnswers,
        options,
      };
    }

    if (q.type === 'TEXT') {
      const answer = q.answer?.trim() ?? '';
      if (!answer) {
        throw new Error(
          t('editQuiz.importTextAnswerRequired', { index: idx + 1 }),
        );
      }
      let acceptedVariants: string[] | undefined;
      if (q.acceptedVariants !== undefined) {
        if (!Array.isArray(q.acceptedVariants)) {
          throw new Error(
            t('editQuiz.importTextVariantsInvalid', { index: idx + 1 }),
          );
        }
        acceptedVariants = q.acceptedVariants
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0);
      }
      return {
        questionText,
        type: 'TEXT' as const,
        options: [{ text: answer, isCorrect: true }],
        acceptedVariants,
      };
    }

    if (q.type === 'MATCHING') {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2) {
        throw new Error(
          t('editQuiz.importMatchingPairsMin', { index: idx + 1 }),
        );
      }
      const matchingPairs = q.pairs.map((pair) => {
        if (!pair || typeof pair !== 'object' || Array.isArray(pair)) {
          throw new Error(
            t('editQuiz.importMatchingPairInvalid', { index: idx + 1 }),
          );
        }
        const value = pair as { left?: string; right?: string };
        const leftItem = value.left?.trim() ?? '';
        const rightItem = value.right?.trim() ?? '';
        if (!leftItem || !rightItem) {
          throw new Error(
            t('editQuiz.importMatchingPairValuesRequired', { index: idx + 1 }),
          );
        }
        return { leftItem, rightItem };
      });
      return {
        questionText,
        type: 'MATCHING' as const,
        matchingPairs,
      };
    }

    if (q.type === 'ORDERING') {
      if (!Array.isArray(q.items) || q.items.length < 2) {
        throw new Error(
          t('editQuiz.importOrderingItemsMin', { index: idx + 1 }),
        );
      }
      const orderingItems = q.items.map((item, itemIndex) => {
        if (typeof item !== 'string' || !item.trim()) {
          throw new Error(
            t('editQuiz.importOrderingItemTextRequired', { index: idx + 1 }),
          );
        }
        return {
          text: item.trim(),
          correctOrder: itemIndex,
        };
      });
      return {
        questionText,
        type: 'ORDERING' as const,
        orderingItems,
      };
    }

    throw new Error(t('editQuiz.importUnknownType', { index: idx + 1 }));
  });
}
