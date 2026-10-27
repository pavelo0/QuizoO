export const FILL_BLANK_MIN = 1;
export const FILL_BLANK_MAX = 8;

const MARKER_PATTERN = /\{\{(\d+)\}\}/g;

export type FillBlankSegment =
  | { kind: 'text'; value: string }
  | { kind: 'blank'; index: number };

export function parseFillBlankMarkers(questionText: string): number[] {
  return [...questionText.matchAll(MARKER_PATTERN)].map((match) =>
    Number(match[1]),
  );
}

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

export function splitFillBlankPrompt(questionText: string): FillBlankSegment[] {
  const segments: FillBlankSegment[] = [];
  let last = 0;
  for (const match of questionText.matchAll(MARKER_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) {
      segments.push({ kind: 'text', value: questionText.slice(last, start) });
    }
    segments.push({ kind: 'blank', index: Number(match[1]) });
    last = start + match[0].length;
  }
  if (last < questionText.length) {
    segments.push({ kind: 'text', value: questionText.slice(last) });
  }
  return segments;
}

export function appendFillBlankMarker(
  questionText: string,
  blankIndex: number,
): string {
  const marker = `{{${blankIndex}}}`;
  if (questionText.includes(marker)) {
    return questionText;
  }
  if (questionText.length === 0) {
    return marker;
  }
  const spacer = questionText.endsWith(' ') ? '' : ' ';
  return `${questionText}${spacer}${marker}`;
}

export function removeFillBlankMarker(
  questionText: string,
  blankIndex: number,
): string {
  const without = questionText.replace(
    new RegExp(`\\{\\{${blankIndex}\\}\\}`, 'g'),
    '',
  );
  return without.replace(MARKER_PATTERN, (_match, raw: string) => {
    const index = Number(raw);
    return index > blankIndex ? `{{${index - 1}}}` : `{{${index}}}`;
  });
}
