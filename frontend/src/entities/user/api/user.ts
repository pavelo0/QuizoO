import { apiClient } from '@/shared/api/client';
import type { ApiPublicUser } from '../model/types';

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<ApiPublicUser>('/users/me');
  return data;
}

export async function updateCurrentUser(body: {
  username?: string | null;
  email?: string;
}) {
  const { data } = await apiClient.patch<ApiPublicUser>('/users/me', body);
  return data;
}

export async function uploadUserAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ApiPublicUser>(
    '/users/me/avatar',
    formData,
    {
      transformRequest: [
        (payload, headers) => {
          if (payload instanceof FormData) {
            delete headers['Content-Type'];
          }
          return payload;
        },
      ],
      timeout: 60_000,
    },
  );
  return data;
}

export async function deleteUserAvatar() {
  const { data } = await apiClient.delete<ApiPublicUser>('/users/me/avatar');
  return data;
}

export function userAvatarUrl(
  userId: string,
  version?: string | number | null,
) {
  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  const path = `/users/${encodeURIComponent(userId)}/avatar`;
  const base = `${apiBase}${path}`;
  if (version === undefined || version === null || version === '') {
    return base;
  }
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(String(version))}`;
}
