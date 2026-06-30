import { gradeTextAnswer, normalizeTextAnswer } from './answer-normalizer';

describe('normalizeTextAnswer', () => {
  it('приводит к нижнему регистру и обрезает пробелы', () => {
    expect(normalizeTextAnswer('  Париж  ')).toBe('париж');
  });

  it('схлопывает лишние пробелы', () => {
    expect(normalizeTextAnswer('  Paris   France  ')).toBe('paris france');
  });

  it('применяет Unicode NFKC', () => {
    expect(normalizeTextAnswer('Ｐａｒｉｓ')).toBe('paris');
  });

  it('возвращает пустую строку для пробелов', () => {
    expect(normalizeTextAnswer('   ')).toBe('');
  });
});

describe('gradeTextAnswer', () => {
  it('засчитывает ответ без учета регистра и пробелов', () => {
    const result = gradeTextAnswer('  париж  ', 'Париж');
    expect(result.isCorrect).toBe(true);
    expect(result.canonicalAnswer).toBe('Париж');
    expect(result.normalizedUserInput).toBe('париж');
  });

  it('засчитывает латинский вариант из acceptedVariants', () => {
    const result = gradeTextAnswer('Paris', 'Париж', ['Paris', 'paris']);
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет неверный ответ', () => {
    expect(gradeTextAnswer('London', 'Париж').isCorrect).toBe(false);
  });

  it('отклоняет пустой ответ', () => {
    expect(gradeTextAnswer('', 'Париж').isCorrect).toBe(false);
    expect(gradeTextAnswer('   ', 'Париж').isCorrect).toBe(false);
  });
});
