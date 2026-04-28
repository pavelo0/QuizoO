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
  allowMultipleAnswers: boolean;
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

export type QuizChoiceUserAnswer = {
  choiceOptionId?: string;
  choiceOptionIds?: string[];
};
export type QuizTextUserAnswer = { textAnswer: string };
export type QuizMatchingUserAnswer = { matchingAnswer: Record<string, string> };

export type QuizUserAnswer =
  | QuizChoiceUserAnswer
  | QuizTextUserAnswer
  | QuizMatchingUserAnswer;

export interface QuizSessionAnswerDetail {
  id: string;
  questionId: string;
  isCorrect: boolean;
  userAnswer: QuizUserAnswer | null;
  question: ModuleQuestion;
}

export interface QuizSessionDetail {
  id: string;
  userId: string;
  moduleId: string;
  moduleTitle: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  completedAt: string | null;
  answers: QuizSessionAnswerDetail[];
}

export interface QuizQuestionsPage {
  moduleId: string;
  moduleTitle: string;
  total: number;
  items: ModuleQuestion[];
  nextCursor: string | null;
}
