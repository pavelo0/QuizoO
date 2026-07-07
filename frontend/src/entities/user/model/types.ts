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

/** Ответ `/users/me` и `/auth/*` (без секретов) */
export type ApiPublicUser = {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  emailVerified: boolean;
  avatarMime: string | null;
  createdAt: string;
  updatedAt: string;
};
