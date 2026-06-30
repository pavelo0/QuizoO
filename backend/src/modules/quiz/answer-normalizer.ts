export type TextAnswerGradeResult = {
  isCorrect: boolean;
  canonicalAnswer: string;
  normalizedUserInput: string;
};

/** Trim, Unicode NFKC, lowercase, collapse whitespace. */
export function normalizeTextAnswer(input: string): string {
  return input.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function gradeTextAnswer(
  userInput: string,
  canonicalAnswer: string,
  acceptedVariants: string[] = [],
): TextAnswerGradeResult {
  const normalizedUserInput = normalizeTextAnswer(userInput);
  const normalizedCanonical = normalizeTextAnswer(canonicalAnswer);
  const accepted = new Set<string>(
    [normalizedCanonical, ...acceptedVariants.map(normalizeTextAnswer)].filter(
      (v) => v.length > 0,
    ),
  );

  return {
    isCorrect:
      normalizedUserInput.length > 0 && accepted.has(normalizedUserInput),
    canonicalAnswer: canonicalAnswer.trim(),
    normalizedUserInput,
  };
}
