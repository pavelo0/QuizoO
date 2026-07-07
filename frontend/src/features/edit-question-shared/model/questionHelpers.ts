import type { ModuleQuestion, QuestionType } from '@/entities/module';

export type QuestionTypeUi = {
  value: QuestionType;
  title: string;
  badge: string;
};

export function getQuestionTypes(t: (key: string) => string): QuestionTypeUi[] {
  return [
    {
      value: 'CHOICE',
      title: t('questionType.choice'),
      badge: t('questionType.badgeChoice'),
    },
    {
      value: 'TEXT',
      title: t('questionType.text'),
      badge: t('questionType.badgeText'),
    },
    {
      value: 'MATCHING',
      title: t('questionType.matching'),
      badge: t('questionType.badgeMatching'),
    },
    {
      value: 'ORDERING',
      title: t('questionType.ordering'),
      badge: t('questionType.badgeOrdering'),
    },
  ];
}

export const DEFAULT_MATCHING_PAIRS = [
  { leftItem: '', rightItem: '' },
  { leftItem: '', rightItem: '' },
];

export function labelByType(
  type: QuestionType,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  return getQuestionTypes(t).find((x) => x.value === type)?.badge ?? type;
}

export function summarizeQuestion(
  q: ModuleQuestion,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  if (q.type === 'CHOICE') {
    const mode = q.allowMultipleAnswers
      ? t('editQuiz.summaryMultiple')
      : t('editQuiz.summarySingle');
    const options = q.questionOptions.map((o) => o.text).join(' · ');
    return options
      ? `${mode}: ${options}`
      : `${mode}: ${t('editQuiz.summaryNoOptions')}`;
  }
  if (q.type === 'TEXT') {
    const correct = q.questionOptions.find((o) => o.isCorrect)?.text?.trim();
    return correct
      ? t('editQuiz.summaryCorrectAnswer', { value: correct })
      : t('editQuiz.summaryCorrectNotSet');
  }
  if (q.type === 'MATCHING') {
    return (
      q.matchingPairs
        .map((p) => `${p.leftItem} -> ${p.rightItem}`)
        .join(' · ') || t('editQuiz.summaryNoPairs')
    );
  }
  if (q.type === 'ORDERING') {
    const items = [...(Array.isArray(q.orderingItems) ? q.orderingItems : [])]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((item) => item.text)
      .filter(Boolean);
    const preview = items.slice(0, 3).join(' → ');
    return items.length > 3
      ? `${preview}…`
      : preview || t('editQuiz.summaryNoOrderingItems');
  }
  return q.questionText;
}

export function parseAcceptedVariantsText(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    ),
  );
}

export function formatAcceptedVariantsText(
  variants: string[] | undefined,
): string {
  return (variants ?? []).join('\n');
}
