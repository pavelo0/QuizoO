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
