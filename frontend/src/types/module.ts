/**
 * Модуль обучения (API `/modules`).
 */

export type ModuleId = string;

export type ModuleType = 'FLASHCARD' | 'QUIZ';

/** Карточка модуля (флешкарточки) */
export interface ModuleCard {
  id: string;
  moduleId: string;
  question: string;
  answer: string;
  orderIndex: number;
  createdAt: string;
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
  questions: unknown[];
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
