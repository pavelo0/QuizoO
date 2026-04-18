import { Prisma } from '@prisma/client';

/** Поля пользователя, безопасные для отдачи клиенту */
export const userPublicSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  isBlocked: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;
