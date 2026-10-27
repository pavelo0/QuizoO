import {
  fillBlankMarkersMatch,
  gradeFillBlankAnswer,
  parseFillBlankMarkers,
} from './fill-blank-grader';

describe('parseFillBlankMarkers', () => {
  it('читает номера пропусков из фразы', () => {
    expect(
      parseFillBlankMarkers('GET обычно {{1}} данные и {{2}} заголовки'),
    ).toEqual([1, 2]);
  });
});

describe('fillBlankMarkersMatch', () => {
  it('принимает {{1}}…{{n}} без дыр', () => {
    expect(fillBlankMarkersMatch('обычно {{2}} и {{1}}', 2)).toBe(true);
  });

  it('отклоняет дыру, повтор и лишний номер', () => {
    expect(fillBlankMarkersMatch('только {{2}}', 2)).toBe(false);
    expect(fillBlankMarkersMatch('{{1}} и {{1}}', 2)).toBe(false);
    expect(fillBlankMarkersMatch('{{1}} {{3}}', 2)).toBe(false);
  });
});

describe('gradeFillBlankAnswer', () => {
  const blanks = [
    { answer: 'читает', acceptedVariants: ['получает'] },
    { answer: 'Париж', acceptedVariants: ['Paris'] },
  ];

  it('засчитывает все пропуски с синонимом и другим регистром', () => {
    const result = gradeFillBlankAnswer(['  ПОЛУЧАЕТ ', 'paris'], blanks);

    expect(result.isCorrect).toBe(true);
    expect(result.credit).toBe(1);
    expect(result.blankCorrect).toEqual([true, true]);
  });

  it('даёт долю, если верна только часть пропусков', () => {
    const result = gradeFillBlankAnswer(['читает', 'Лондон'], blanks);

    expect(result.isCorrect).toBe(false);
    expect(result.credit).toBe(0.5);
    expect(result.blankCorrect).toEqual([true, false]);
    expect(result.normalizedAnswers).toEqual(['читает', 'Лондон']);
  });

  it('не засчитывает пустой пропуск', () => {
    const result = gradeFillBlankAnswer(['', '   '], blanks);

    expect(result.isCorrect).toBe(false);
    expect(result.credit).toBe(0);
    expect(result.blankCorrect).toEqual([false, false]);
  });
});
