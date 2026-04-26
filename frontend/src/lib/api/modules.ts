import { apiClient } from '@/lib/api/client';
import type {
  CreateModuleResult,
  ModuleCard,
  ModuleDetail,
  ModuleId,
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
}): Promise<CreateModuleResult> {
  const { data } = await apiClient.post<CreateModuleResult>(
    '/modules',
    payload,
  );
  return data;
}

export async function fetchModuleById(moduleId: ModuleId) {
  const { data } = await apiClient.get<ModuleDetail>(`/modules/${moduleId}`);
  return data;
}

export async function updateModule(
  moduleId: ModuleId,
  body: { title?: string; description?: string | null; type?: ModuleType },
) {
  const { data } = await apiClient.patch<CreateModuleResult>(
    `/modules/${moduleId}`,
    body,
  );
  return data;
}

export async function deleteModule(moduleId: ModuleId) {
  await apiClient.delete(`/modules/${moduleId}`);
}

export async function createCard(
  moduleId: ModuleId,
  body: { question: string; answer: string; orderIndex?: number },
) {
  const { data } = await apiClient.post<ModuleCard>(
    `/modules/${moduleId}/cards`,
    body,
  );
  return data;
}

export async function updateCard(
  moduleId: ModuleId,
  cardId: string,
  body: { question?: string; answer?: string; orderIndex?: number },
) {
  const { data } = await apiClient.patch<ModuleCard>(
    `/modules/${moduleId}/cards/${cardId}`,
    body,
  );
  return data;
}

export async function deleteCard(moduleId: ModuleId, cardId: string) {
  await apiClient.delete(`/modules/${moduleId}/cards/${cardId}`);
}
