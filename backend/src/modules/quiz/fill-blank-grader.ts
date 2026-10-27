import { gradeTextAnswer } from './answer-normalizer';

export const FILL_BLANK_MIN = 1;
export const FILL_BLANK_MAX = 8;

const MARKER_PATTERN = /\{\{(\d+)\}\}/g;

export type FillBlankSpec = {
  answer: string;
  acceptedVariants?: string[];
};

export type FillBlankGradeResult = {
  isCorrect: boolean;
  credit: number;
  blankCorrect: boolean[];
  normalizedAnswers: string[];
};

export function parseFillBlankMarkers(questionText: string): number[] {
  const indexes: number[] = [];
  for (const match of questionText.matchAll(MARKER_PATTERN)) {
    indexes.push(Number(match[1]));
  }
  return indexes;
}

/** Маркеры {{1}}…{{n}} встречаются ровно по одному разу, без дыр и лишних номеров. */
export function fillBlankMarkersMatch(
  questionText: string,
  blankCount: number,
): boolean {
  if (blankCount < FILL_BLANK_MIN || blankCount > FILL_BLANK_MAX) {
    return false;
  }
  const indexes = parseFillBlankMarkers(questionText);
  if (indexes.length !== blankCount) {
    return false;
  }
  const seen = new Set(indexes);
  if (seen.size !== blankCount) {
    return false;
  }
  for (let n = 1; n <= blankCount; n += 1) {
    if (!seen.has(n)) {
      return false;
    }
  }
  return true;
}

export function gradeFillBlankAnswer(
  userAnswers: string[],
  blanks: FillBlankSpec[],
): FillBlankGradeResult {
  const blankCorrect = blanks.map((blank, index) => {
    const raw = userAnswers[index] ?? '';
    return gradeTextAnswer(raw, blank.answer, blank.acceptedVariants ?? [])
      .isCorrect;
  });
  const normalizedAnswers = blanks.map((_, index) =>
    String(userAnswers[index] ?? '').trim(),
  );
  const matched = blankCorrect.filter(Boolean).length;
  const credit = blanks.length > 0 ? matched / blanks.length : 0;

  return {
    isCorrect: blanks.length > 0 && matched === blanks.length,
    credit,
    blankCorrect,
    normalizedAnswers,
  };
}
