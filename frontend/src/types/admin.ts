import type { ModuleType } from './module';

export type AdminOverview = {
  totalUsers: number;
  totalModules: number;
  sessionsToday: number;
  blockedUsers: number;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  emailVerified: boolean;
  avatarMime: string | null;
  createdAt: string;
  updatedAt: string;
  moduleCount: number;
};

export type AdminModuleListItem = {
  id: string;
  title: string;
  description: string | null;
  type: ModuleType;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  questionCount: number;
  sessionCount: number;
  owner: {
    id: string;
    email: string;
    username: string | null;
    isBlocked: boolean;
  };
};
