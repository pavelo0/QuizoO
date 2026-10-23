import type { ApiPublicUser } from '@/entities/user';
import { vi } from 'vitest';

export const authState: {
  user: ApiPublicUser | null;
  loading: boolean;
  refresh: ReturnType<typeof vi.fn>;
  signOutLocal: ReturnType<typeof vi.fn>;
} = {
  user: null,
  loading: false,
  refresh: vi.fn(async () => null),
  signOutLocal: vi.fn(),
};

export function resetAuthState(): void {
  authState.user = null;
  authState.loading = false;
  authState.refresh = vi.fn(async () => null);
  authState.signOutLocal = vi.fn();
}

export function publicUser(role: ApiPublicUser['role']): ApiPublicUser {
  return {
    id: 'user-1',
    email: 'ann@quizoo.test',
    username: 'Ann',
    role,
    isBlocked: false,
    emailVerified: true,
    avatarMime: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
