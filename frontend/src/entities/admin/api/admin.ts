import { apiClient } from '@/shared/api/client';
import type { ApiPublicUser } from '@/entities/user';
import type {
  AdminModuleListItem,
  AdminOverview,
  AdminUserListItem,
} from '../model/types';

export async function fetchAdminOverview() {
  const { data } = await apiClient.get<AdminOverview>('/users/admin/overview');
  return data;
}

export async function fetchAdminUsers() {
  const { data } =
    await apiClient.get<AdminUserListItem[]>('/users/admin/users');
  return data;
}

export async function setAdminUserBlocked(
  targetUserId: string,
  isBlocked: boolean,
) {
  const { data } = await apiClient.patch<ApiPublicUser>(
    `/users/admin/users/${encodeURIComponent(targetUserId)}/block`,
    { isBlocked },
  );
  return data;
}

export async function fetchAdminModules() {
  const { data } = await apiClient.get<AdminModuleListItem[]>(
    '/users/admin/modules',
  );
  return data;
}

export async function deleteAdminModule(moduleId: string) {
  await apiClient.delete(
    `/users/admin/modules/${encodeURIComponent(moduleId)}`,
  );
}
