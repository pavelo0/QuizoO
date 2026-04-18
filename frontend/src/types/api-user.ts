/** Ответ `/users/me` и `/auth/*` (без секретов) */
export type ApiPublicUser = {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};
