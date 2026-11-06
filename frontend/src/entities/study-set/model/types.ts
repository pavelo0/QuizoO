export type StudySetId = string;

export type StudySetModuleType = 'FLASHCARD' | 'QUIZ';

export type StudySetSummary = {
  id: StudySetId;
  title: string;
  moduleCount: number;
  studiedCount: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type StudySetModuleItem = {
  id: string;
  title: string;
  type: StudySetModuleType;
  studied: boolean;
  orderIndex: number;
};

export type StudySetDetail = StudySetSummary & {
  modules: StudySetModuleItem[];
};

export type StudySetSessionStat = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  kind: 'FLASHCARD' | 'QUIZ';
  at: string;
  knownCount: number | null;
  totalCards: number | null;
  scorePercent: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
};

export type StudySetStat = {
  id: string;
  title: string;
  moduleCount: number;
  studiedCount: number;
  progress: number;
  sessionCount: number;
  recent: StudySetSessionStat[];
};
