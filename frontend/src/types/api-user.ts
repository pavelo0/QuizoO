/** Ответ `/users/me` и `/auth/*` (без секретов) */
export type ApiPublicUser = {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  emailVerified: boolean;
  /** Если задано, у пользователя загружено своё фото (`GET /users/me/avatar`). */
  avatarMime: string | null;
  createdAt: string;
  updatedAt: string;
};
