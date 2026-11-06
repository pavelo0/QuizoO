export type {
  QuizAssignmentAttempt,
  QuizAssignmentDetail,
  QuizAssignmentId,
  QuizAssignmentJoin,
  QuizAssignmentSummary,
} from './model/types';

export { ASSIGNMENT_CODE_LENGTH, normalizeAssignmentCode } from './lib/code';

export {
  createQuizAssignment,
  deleteQuizAssignment,
  fetchQuizAssignment,
  fetchQuizAssignmentByCode,
  fetchQuizAssignmentList,
} from './api/quizAssignments';
