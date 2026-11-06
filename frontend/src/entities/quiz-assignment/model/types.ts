export type QuizAssignmentId = string;

export type QuizAssignmentSummary = {
  id: QuizAssignmentId;
  code: string;
  moduleId: string;
  moduleTitle: string;
  deadline: string;
  createdAt: string;
  attemptCount: number;
  closed: boolean;
};

export type QuizAssignmentAttempt = {
  id: string;
  userId: string;
  username: string | null;
  email: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  pointsEarned: number | null;
  pointsMax: number | null;
  completedAt: string | null;
};

export type QuizAssignmentDetail = QuizAssignmentSummary & {
  attempts: QuizAssignmentAttempt[];
};

export type QuizAssignmentJoin = {
  id: QuizAssignmentId;
  code: string;
  moduleId: string;
  moduleTitle: string;
  deadline: string;
  questionCount: number;
  closed: boolean;
};
