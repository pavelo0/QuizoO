import { MAX_FLASHCARDS_PER_MODULE } from '@/shared/config/module';

export const FLASHCARD_IMPORT_FORMAT_VERSION = 1;

export type FlashcardImportPayload = { question: string; answer: string };

export const flashcardJsonExample = JSON.stringify(
  {
    formatVersion: FLASHCARD_IMPORT_FORMAT_VERSION,
    moduleType: 'FLASHCARD',
    title: 'Контрольный набор: флешкарточки',
    cards: [
      {
        question: 'Что такое алгоритм?',
        answer:
          'Последовательность точных шагов для решения задачи за конечное время',
      },
      {
        question: 'Как называется протокол для безопасного веб-трафика?',
        answer: 'HTTPS',
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

export function parseFlashcardImportJson(
  raw: unknown,
  t: (key: string, vars?: Record<string, string | number>) => string,
): FlashcardImportPayload[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(t('editFlash.importInvalidStructure'));
  }
  const data = raw as {
    formatVersion?: number;
    moduleType?: string;
    cards?: unknown;
  };
  if (data.formatVersion !== FLASHCARD_IMPORT_FORMAT_VERSION) {
    throw new Error(
      t('editFlash.importUnsupportedVersion', {
        version: FLASHCARD_IMPORT_FORMAT_VERSION,
      }),
    );
  }
  if (data.moduleType !== 'FLASHCARD') {
    throw new Error(t('editFlash.importWrongModuleType'));
  }
  if (!Array.isArray(data.cards)) {
    throw new Error(t('editFlash.importCardsArrayRequired'));
  }
  if (data.cards.length > MAX_FLASHCARDS_PER_MODULE) {
    throw new Error(
      t('editFlash.validationMaxCards', { count: MAX_FLASHCARDS_PER_MODULE }),
    );
  }

  return data.cards.map((item, idx) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(
        t('editFlash.importCardObjectExpected', { index: idx + 1 }),
      );
    }
    const card = item as { question?: string; answer?: string };
    const question = card.question?.trim() ?? '';
    const answer = card.answer?.trim() ?? '';
    if (!question) {
      throw new Error(
        t('editFlash.importQuestionRequired', { index: idx + 1 }),
      );
    }
    if (!answer) {
      throw new Error(t('editFlash.importAnswerRequired', { index: idx + 1 }));
    }
    return { question, answer };
  });
}
