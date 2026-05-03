import type { ApiPublicUser } from '@/types/api-user';

type UserRole = ApiPublicUser['role'] | null | undefined;

export function getHomeRouteByRole(role: UserRole): string {
  return role === 'ADMIN' ? '/app/admin' : '/app';
}

export function getHomeRouteForUser(
  user: Pick<ApiPublicUser, 'role'> | null | undefined,
): string {
  return getHomeRouteByRole(user?.role);
}
