import { afterEach, describe, expect, it } from 'vitest';
import {
  formatCountdownMmSs,
  readQuizTimerDurationSec,
  readQuizTimerEnabled,
  writeQuizTimerDurationSec,
  writeQuizTimerEnabled,
} from './sessionTimerPrefs';

afterEach(() => {
  localStorage.clear();
});

describe('session timer prefs', () => {
  it('сохраняет включение и длительность, а мусор заменяет дефолтом', () => {
    expect(readQuizTimerEnabled('mod')).toBe(false);
    writeQuizTimerEnabled('mod', true);
    expect(readQuizTimerEnabled('mod')).toBe(true);

    expect(readQuizTimerDurationSec('mod')).toBe(600);
    writeQuizTimerDurationSec('mod', 300);
    expect(readQuizTimerDurationSec('mod')).toBe(300);
    localStorage.setItem('quizo:quiz-timer-sec:mod', '999');
    expect(readQuizTimerDurationSec('mod')).toBe(600);
  });

  it('форматирует оставшееся время', () => {
    expect(formatCountdownMmSs(90)).toBe('01:30');
    expect(formatCountdownMmSs(61.2)).toBe('01:02');
    expect(formatCountdownMmSs(-4)).toBe('00:00');
  });
});
