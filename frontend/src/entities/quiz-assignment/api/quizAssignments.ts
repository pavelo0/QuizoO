import { apiClient } from '@/shared/api/client';
import type {
  QuizAssignmentDetail,
  QuizAssignmentJoin,
  QuizAssignmentSummary,
} from '../model/types';

export async function fetchQuizAssignmentList() {
  const { data } =
    await apiClient.get<QuizAssignmentSummary[]>('/quiz-assignments');
  return data;
}

export async function createQuizAssignment(body: {
  moduleId: string;
  deadline: string;
}) {
  const { data } = await apiClient.post<QuizAssignmentSummary>(
    '/quiz-assignments',
    body,
  );
  return data;
}

export async function fetchQuizAssignment(assignmentId: string) {
  const { data } = await apiClient.get<QuizAssignmentDetail>(
    `/quiz-assignments/${encodeURIComponent(assignmentId)}`,
  );
  return data;
}

export async function deleteQuizAssignment(assignmentId: string) {
  await apiClient.delete(
    `/quiz-assignments/${encodeURIComponent(assignmentId)}`,
  );
}

export async function fetchQuizAssignmentByCode(code: string) {
  const { data } = await apiClient.get<QuizAssignmentJoin>(
    `/quiz-assignments/by-code/${encodeURIComponent(code)}`,
  );
  return data;
}
