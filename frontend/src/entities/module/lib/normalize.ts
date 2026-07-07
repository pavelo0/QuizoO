import type {
  ModuleDetail,
  ModuleQuestion,
  ModuleSessionActivityPage,
} from '../model/types';

export function normalizeActivityPage(
  payload: ModuleSessionActivityPage | null | undefined,
): ModuleSessionActivityPage {
  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    nextCursor:
      typeof payload?.nextCursor === 'string' ? payload.nextCursor : null,
  };
}

export function normalizeModuleQuestion(q: ModuleQuestion): ModuleQuestion {
  return {
    ...q,
    questionOptions: Array.isArray(q.questionOptions) ? q.questionOptions : [],
    matchingPairs: Array.isArray(q.matchingPairs) ? q.matchingPairs : [],
    orderingItems: Array.isArray(q.orderingItems) ? q.orderingItems : [],
  };
}

export function normalizeModuleDetail(module: ModuleDetail): ModuleDetail {
  return {
    ...module,
    questions: Array.isArray(module.questions)
      ? module.questions.map(normalizeModuleQuestion)
      : [],
  };
}
