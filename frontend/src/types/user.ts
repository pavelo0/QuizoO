/**
 * Пользователь приложения (ученик, преподаватель, админ).
 */

export type UserId = string;

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}
