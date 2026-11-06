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
  const points = q.points;
  return {
    ...q,
    points:
      Number.isInteger(points) && points >= 1 && points <= 100 ? points : 1,
    questionOptions: Array.isArray(q.questionOptions) ? q.questionOptions : [],
    matchingPairs: Array.isArray(q.matchingPairs) ? q.matchingPairs : [],
    orderingItems: Array.isArray(q.orderingItems) ? q.orderingItems : [],
    fillBlanks: Array.isArray(q.fillBlanks) ? q.fillBlanks : [],
  };
}

export function normalizeModuleDetail(module: ModuleDetail): ModuleDetail {
  return {
    ...module,
    customScoring: module.customScoring === true,
    questions: Array.isArray(module.questions)
      ? module.questions.map(normalizeModuleQuestion)
      : [],
  };
}
