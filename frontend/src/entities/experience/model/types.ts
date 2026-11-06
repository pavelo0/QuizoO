export type AchievementId =
  | 'first-flashcard'
  | 'first-quiz'
  | 'first-retry'
  | 'first-assignment'
  | 'first-set'
  | 'five-studies'
  | 'perfect-quiz'
  | 'set-complete';

export type AchievementView = {
  id: AchievementId;
  earned: boolean;
  current: number;
  target: number;
};

export type ExperienceProfile = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  achievements: AchievementView[];
};
