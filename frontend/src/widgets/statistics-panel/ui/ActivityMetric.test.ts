import { describe, expect, it } from 'vitest';
import { scoreColor } from './ActivityMetric';

describe('scoreColor', () => {
  it('красит пустой, высокий, средний и низкий результат', () => {
    expect(scoreColor(null)).toContain('text-(--text-secondary)');
    expect(scoreColor(85)).toContain('secondary-accent');
    expect(scoreColor(70)).toContain('primary-accent');
    expect(scoreColor(69)).toContain('danger-color');
  });
});
