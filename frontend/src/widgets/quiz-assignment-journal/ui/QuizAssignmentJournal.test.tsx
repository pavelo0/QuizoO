import { fetchQuizAssignment } from '@/entities/quiz-assignment';
import { renderWithProviders } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizAssignmentJournal } from './QuizAssignmentJournal';

vi.mock('@/entities/quiz-assignment', () => ({
  fetchQuizAssignment: vi.fn(),
  deleteQuizAssignment: vi.fn(),
}));

const assignment = {
  id: 'a1',
  code: 'AB23CD',
  moduleId: 'mod-1',
  moduleTitle: 'Biology quiz',
  deadline: '2026-12-01T18:00:00.000Z',
  createdAt: '2026-11-06T12:00:00.000Z',
  attemptCount: 2,
  closed: false,
  attempts: [
    {
      id: 's1',
      userId: 'u2',
      username: 'ann',
      email: 'ann@example.com',
      correctCount: 1,
      totalQuestions: 2,
      scorePercent: 80,
      pointsEarned: 4,
      pointsMax: 5,
      completedAt: '2026-11-06T12:30:00.000Z',
    },
    {
      id: 's2',
      userId: 'u3',
      username: null,
      email: 'bob@example.com',
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      pointsEarned: null,
      pointsMax: null,
      completedAt: '2026-11-06T13:00:00.000Z',
    },
    {
      id: 's3',
      userId: 'u4',
      username: 'cara',
      email: 'cara@example.com',
      correctCount: 0,
      totalQuestions: 1,
      scorePercent: 62.5,
      pointsEarned: 2.5,
      pointsMax: 4,
      completedAt: '2026-11-06T14:00:00.000Z',
    },
  ],
};

describe('QuizAssignmentJournal', () => {
  beforeEach(() => {
    vi.mocked(fetchQuizAssignment).mockReset();
  });

  it('показывает баллы своей шкалы и старый формат для попытки без них', async () => {
    vi.mocked(fetchQuizAssignment).mockResolvedValue(assignment);
    renderWithProviders(<QuizAssignmentJournal assignmentId="a1" />);

    expect(await screen.findByText('4 of 5 points · 80%')).toBeInTheDocument();
    expect(screen.getByText('1 of 1 · 100%')).toBeInTheDocument();
    expect(screen.getByText('2.5 of 4 points · 63%')).toBeInTheDocument();
    expect(screen.getByText('ann')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });
});
