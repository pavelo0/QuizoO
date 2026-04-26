/**
 * Модуль обучения (API `/modules`).
 */

export type ModuleId = string;

export type ModuleType = 'FLASHCARD' | 'QUIZ';
export type QuestionType = 'CHOICE' | 'TEXT' | 'MATCHING';

/** Карточка модуля (флешкарточки) */
export interface ModuleCard {
  id: string;
  moduleId: string;
  question: string;
  answer: string;
  orderIndex: number;
  createdAt: string;
}

export interface ModuleQuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface ModuleMatchingPair {
  id: string;
  questionId: string;
  leftItem: string;
  rightItem: string;
}

export interface ModuleQuestion {
  id: string;
  moduleId: string;
  questionText: string;
  type: QuestionType;
  orderIndex: number;
  createdAt: string;
  questionOptions: ModuleQuestionOption[];
  matchingPairs: ModuleMatchingPair[];
}

/** Детали модуля из `GET /modules/:id` */
export interface ModuleDetail {
  id: ModuleId;
  userId: string;
  title: string;
  description: string | null;
  type: ModuleType;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  questionCount: number;
  cards: ModuleCard[];
  questions: ModuleQuestion[];
}

export interface CreateModuleResult {
  id: ModuleId;
  title: string;
  description: string | null;
  type: ModuleType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Элемент списка из `GET /modules` */
export interface ModuleListItem {
  id: ModuleId;
  title: string;
  description: string | null;
  type: ModuleType;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  questionCount: number;
  lastStudiedAt: string | null;
}

/** Ответ `GET /modules/summary` */
export interface ModulesDashboardSummary {
  totalModules: number;
  activeModules: number;
  cardsStudied: number;
  averageQuizScore: number | null;
}
