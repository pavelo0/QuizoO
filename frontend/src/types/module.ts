/**
 * Модуль обучения (API `/modules`).
 */

export type ModuleId = string;

export type ModuleType = 'FLASHCARD' | 'QUIZ';

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
