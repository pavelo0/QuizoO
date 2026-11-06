export const ASSIGNMENT_CODE_LENGTH = 6;

export function normalizeAssignmentCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}
