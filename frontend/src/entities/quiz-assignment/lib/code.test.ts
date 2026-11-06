import { describe, expect, it } from 'vitest';
import { ASSIGNMENT_CODE_LENGTH, normalizeAssignmentCode } from './code';

describe('normalizeAssignmentCode', () => {
  it('uppercases and drops separators', () => {
    expect(normalizeAssignmentCode(' ab-23 cd ')).toBe('AB23CD');
    expect(normalizeAssignmentCode('ab23cd')).toHaveLength(
      ASSIGNMENT_CODE_LENGTH,
    );
  });
});
