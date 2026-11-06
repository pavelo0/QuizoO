import type { QuizSessionDetail } from '@/entities/module';
import { messages } from '@/shared/i18n/messages';
import { renderWithProviders } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { QuizStudy } from '../model/useQuizStudy';
import { QuizResultView } from './QuizResultView';

function translate(key: string) {
  return messages.en[key] ?? key;
}

function session(correct: boolean): QuizSessionDetail {
  return {
    id: 'sess-1',
    userId: 'user-1',
    moduleId: 'mod-1',
    moduleTitle: 'Biology',
    totalQuestions: 1,
    correctCount: correct ? 1 : 0,
    scorePercent: correct ? 100 : 0,
    pointsEarned: null,
    pointsMax: null,
    completedAt: '2026-02-01T00:00:00.000Z',
    answers: [
      {
        id: 'a1',
        questionId: 'q1',
        isCorrect: correct,
        userAnswer: null,
        question: {
          id: 'q1',
          moduleId: 'mod-1',
          questionText: 'Capital?',
          type: 'TEXT',
          allowMultipleAnswers: false,
          questionImageMime: null,
          orderIndex: 0,
          points: 1,
          createdAt: '2026-01-01T00:00:00.000Z',
          questionOptions: [],
          matchingPairs: [],
          orderingItems: [],
          fillBlanks: [],
        },
      },
    ],
  };
}

function renderResult(correct: boolean, assignmentId = '') {
  const detail = session(correct);
  renderWithProviders(
    <QuizResultView
      study={
        {
          t: translate,
          moduleId: 'mod-1',
          assignmentId,
          moduleTitle: 'Biology',
          session: detail,
          quizElapsedMs: null,
          animatedPercent: 0,
          visiblePercent: 0,
          resultAnswers: detail.answers,
          imageLoadFailedByQuestionId: {},
          onQuestionImageError: vi.fn(),
          restart: vi.fn(),
        } as unknown as QuizStudy
      }
    />,
  );
}

describe('QuizResultView retry', () => {
  it('links a new attempt to the wrong answers of this session', () => {
    renderResult(false);
    const link = screen.getByRole('link', { name: 'Retry mistakes' });
    expect(link).toHaveAttribute(
      'href',
      '/app/modules/mod-1/quiz-study?retrySession=sess-1',
    );
  });

  it('hides the retry link when nothing was wrong', () => {
    renderResult(true);
    expect(
      screen.queryByRole('link', { name: 'Retry mistakes' }),
    ).not.toBeInTheDocument();
  });

  it('hides the retry link during an assignment attempt', () => {
    renderResult(false, 'asg-1');
    expect(
      screen.queryByRole('link', { name: 'Retry mistakes' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to dashboard' }),
    ).toHaveAttribute('href', '/app');
  });
});
