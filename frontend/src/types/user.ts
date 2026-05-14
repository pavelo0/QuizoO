/**
 * Пользователь приложения (обычный пользователь или администратор).
 */

export type UserId = string;

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}
