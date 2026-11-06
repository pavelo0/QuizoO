import {
  ASSIGNMENT_POINTS,
  levelFromXp,
  pointsForFlashcard,
  pointsForQuiz,
  RETRY_POINTS,
} from './experience.math';

describe('experience points', () => {
  it('pays for known flashcards and caps the bonus', () => {
    expect(pointsForFlashcard(0)).toBe(10);
    expect(pointsForFlashcard(3)).toBe(13);
    expect(pointsForFlashcard(40)).toBe(30);
  });

  it('pays more for a higher quiz score', () => {
    expect(pointsForQuiz(0)).toBe(15);
    expect(pointsForQuiz(100)).toBe(25);
  });

  it('keeps retry and assignment awards fixed', () => {
    expect(RETRY_POINTS).toBe(12);
    expect(ASSIGNMENT_POINTS).toBe(30);
  });

  it('steps a level every 100 XP', () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForLevel: 100,
    });
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(250)).toEqual({
      level: 3,
      xpIntoLevel: 50,
      xpForLevel: 100,
    });
  });
});
