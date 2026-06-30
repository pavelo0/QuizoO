import { apiClient } from '@/lib/api/client';
import type {
  CreateModuleResult,
  ModuleCard,
  ModuleDetail,
  ModuleId,
  ModuleListItem,
  ModuleQuestion,
  ModuleSessionActivityPage,
  ModuleType,
  ModulesDashboardSummary,
  QuizQuestionsPage,
  QuizSessionDetail,
  QuestionType,
} from '@/types/module';

function normalizeActivityPage(
  payload: ModuleSessionActivityPage | null | undefined,
): ModuleSessionActivityPage {
  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    nextCursor:
      typeof payload?.nextCursor === 'string' ? payload.nextCursor : null,
  };
}

export async function fetchModulesDashboardSummary() {
  const { data } =
    await apiClient.get<ModulesDashboardSummary>('/modules/summary');
  return data;
}

export async function fetchRecentModuleActivity(params?: {
  take?: number;
  cursor?: string | null;
}) {
  const { data } = await apiClient.get<ModuleSessionActivityPage>(
    '/modules/activity',
    {
      params: {
        take: params?.take,
        cursor: params?.cursor ?? undefined,
      },
    },
  );
  return normalizeActivityPage(data);
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

export async function createFlashcardSession(
  moduleId: ModuleId,
  body: { totalCards: number; knownCount: number; unknownCount: number },
) {
  const { data } = await apiClient.post<{
    id: string;
    moduleId: string;
    userId: string;
    totalCards: number;
    knownCount: number;
    unknownCount: number;
    completedAt: string | null;
  }>(`/modules/${moduleId}/flashcard-sessions`, body);
  return data;
}

export async function fetchQuizQuestionsPage(
  moduleId: ModuleId,
  params?: { take?: number; cursor?: string | null },
) {
  const { data } = await apiClient.get<QuizQuestionsPage>(
    `/modules/${moduleId}/quiz-questions`,
    { params },
  );
  return data;
}

export async function createQuizSession(
  moduleId: ModuleId,
  body: {
    answers: Array<{
      questionId: string;
      choiceOptionId?: string | null;
      choiceOptionIds?: string[] | null;
      textAnswer?: string | null;
      matchingAnswer?: Record<string, string> | null;
    }>;
  },
) {
  const { data } = await apiClient.post<QuizSessionDetail>(
    `/modules/${moduleId}/quiz-sessions`,
    body,
  );
  return data;
}

export async function fetchQuizSession(moduleId: ModuleId, sessionId: string) {
  const { data } = await apiClient.get<QuizSessionDetail>(
    `/modules/${moduleId}/quiz-sessions/${sessionId}`,
  );
  return data;
}

export async function createQuestion(
  moduleId: ModuleId,
  body: {
    questionText: string;
    type: QuestionType;
    allowMultipleAnswers?: boolean;
    orderIndex?: number;
    options?: Array<{ text: string; isCorrect: boolean }>;
    matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
    acceptedVariants?: string[];
  },
) {
  const { data } = await apiClient.post<ModuleQuestion>(
    `/modules/${moduleId}/questions`,
    body,
  );
  return data;
}

export async function updateQuestion(
  moduleId: ModuleId,
  questionId: string,
  body: {
    questionText?: string;
    type?: QuestionType;
    allowMultipleAnswers?: boolean;
    orderIndex?: number;
    options?: Array<{ text: string; isCorrect: boolean }>;
    matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
    acceptedVariants?: string[];
  },
) {
  const { data } = await apiClient.patch<ModuleQuestion>(
    `/modules/${moduleId}/questions/${questionId}`,
    body,
  );
  return data;
}

export async function deleteQuestion(moduleId: ModuleId, questionId: string) {
  await apiClient.delete(`/modules/${moduleId}/questions/${questionId}`);
}

function normalizedApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || '/api').trim();
  if (!raw) return '/api';
  const withoutTrailing = raw.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(withoutTrailing)) {
    return withoutTrailing;
  }
  return withoutTrailing.startsWith('/')
    ? withoutTrailing
    : `/${withoutTrailing}`;
}

export function questionImageUrl(
  moduleId: ModuleId,
  questionId: string,
  options?: { version?: string | number | null },
) {
  const apiBase = normalizedApiBaseUrl();
  const path = `/modules/${encodeURIComponent(moduleId)}/questions/${encodeURIComponent(questionId)}/image`;
  const base = `${apiBase}${path}`;
  const version = options?.version;
  if (version === undefined || version === null || version === '') {
    return base;
  }
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(String(version))}`;
}

export async function uploadQuestionImage(
  moduleId: ModuleId,
  questionId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ModuleQuestion>(
    `/modules/${moduleId}/questions/${questionId}/image`,
    formData,
    {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
      timeout: 60_000,
    },
  );
  return data;
}

export async function deleteQuestionImage(
  moduleId: ModuleId,
  questionId: string,
) {
  await apiClient.delete(`/modules/${moduleId}/questions/${questionId}/image`);
}
