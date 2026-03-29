/**
 * Сессия: аутентификация и/или прохождение квиза — разделено по смыслу.
 * Оставьте только то, что реально вернёт API.
 */

import type { ModuleId } from '@/types/module';
import type { UserId } from '@/types/user';

/** Сессия входа (токены + привязка к пользователю) */
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  userId: UserId;
}

/** Сессия прохождения модуля / квиза */
export interface QuizSession {
  id: string;
  userId: UserId;
  moduleId: ModuleId;
  startedAt: string;
  completedAt?: string;
}
