import { apiClient } from '@/lib/api/client';
import type {
  CreateModuleResult,
  ModuleCard,
  ModuleDetail,
  ModuleId,
  ModuleListItem,
  ModuleQuestion,
  ModuleType,
  ModulesDashboardSummary,
  QuizQuestionsPage,
  QuizSessionDetail,
  QuestionType,
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
