import { apiClient } from '@/lib/api/client';
import type {
  ModuleListItem,
  ModuleType,
  ModulesDashboardSummary,
} from '@/types/module';

export async function fetchModulesDashboardSummary() {
  const { data } =
    await apiClient.get<ModulesDashboardSummary>('/modules/summary');
  return data;
}

export async function fetchModuleList() {
  const { data } = await apiClient.get<ModuleListItem[]>('/modules');
  return data;
}

export async function createModule(payload: {
  title: string;
  description?: string | null;
  type: ModuleType;
}) {
  await apiClient.post('/modules', payload);
}
