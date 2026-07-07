import type { ModuleId, QuestionType } from '@/entities/module';
import {
  createQuestion as createModuleQuestion,
  deleteQuestion as deleteModuleQuestion,
  deleteQuestionImage as deleteModuleQuestionImage,
  fetchQuizQuestionsPage,
  normalizeModuleQuestion,
  questionImageUrl,
  updateQuestion as updateModuleQuestion,
  uploadQuestionImage as uploadModuleQuestionImage,
} from '@/entities/module';

export { fetchQuizQuestionsPage, normalizeModuleQuestion, questionImageUrl };

export async function createQuestion(
  moduleId: ModuleId,
  body: Parameters<typeof createModuleQuestion>[1],
) {
  return createModuleQuestion(moduleId, body);
}

export async function updateQuestion(
  moduleId: ModuleId,
  questionId: string,
  body: Parameters<typeof updateModuleQuestion>[2],
) {
  return updateModuleQuestion(moduleId, questionId, body);
}

export async function deleteQuestion(moduleId: ModuleId, questionId: string) {
  return deleteModuleQuestion(moduleId, questionId);
}

export async function uploadQuestionImage(
  moduleId: ModuleId,
  questionId: string,
  file: File,
) {
  return uploadModuleQuestionImage(moduleId, questionId, file);
}

export async function deleteQuestionImage(
  moduleId: ModuleId,
  questionId: string,
) {
  return deleteModuleQuestionImage(moduleId, questionId);
}

export type { QuestionType };
