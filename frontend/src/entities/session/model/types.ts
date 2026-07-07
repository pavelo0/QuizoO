import type { ModuleId } from '@/entities/module';
import type { UserId } from '@/entities/user';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  userId: UserId;
}

export interface QuizSession {
  id: string;
  userId: UserId;
  moduleId: ModuleId;
  startedAt: string;
  completedAt?: string;
}

export type {
  FlashcardSessionActivity,
  ModuleSessionActivity,
  ModuleSessionActivityPage,
  QuizSessionActivity,
  QuizSessionAnswerDetail,
  QuizSessionDetail,
} from '@/entities/module';
