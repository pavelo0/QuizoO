export const XP_PER_LEVEL = 100;
export const RETRY_POINTS = 12;
export const ASSIGNMENT_POINTS = 30;

export function pointsForFlashcard(knownCount: number): number {
  const known = Math.max(0, Math.min(20, Math.floor(knownCount)));
  return 10 + known;
}

export function pointsForQuiz(scorePercent: number): number {
  const score = Math.max(0, Math.min(100, scorePercent));
  return 15 + Math.round(score / 10);
}

export function levelFromXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
} {
  const safe = Math.max(0, Math.floor(xp));
  return {
    level: Math.floor(safe / XP_PER_LEVEL) + 1,
    xpIntoLevel: safe % XP_PER_LEVEL,
    xpForLevel: XP_PER_LEVEL,
  };
}
