import { describe, expect, it } from 'vitest';
import { formatScorePoints } from './formatScorePoints';

describe('formatScorePoints', () => {
  it('показывает целое без дроби и округляет до десятой', () => {
    expect(formatScorePoints(0)).toBe('0');
    expect(formatScorePoints(2)).toBe('2');
    expect(formatScorePoints(2.04)).toBe('2');
    expect(formatScorePoints(2.25)).toBe('2.3');
    expect(formatScorePoints(2.5)).toBe('2.5');
    expect(formatScorePoints(9.04)).toBe('9');
    expect(formatScorePoints(10)).toBe('10');
  });
});
