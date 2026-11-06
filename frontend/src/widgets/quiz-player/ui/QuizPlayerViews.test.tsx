import type { ModuleQuestion, QuizSessionDetail } from '@/entities/module';
import { messages } from '@/shared/i18n/messages';
import { moduleQuestion } from '@/shared/test/moduleFixtures';
import { renderWithProviders } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { QuizStudy } from '../model/useQuizStudy';
import { QuizPlayView } from './QuizPlayView';
import { QuizResultView } from './QuizResultView';

function translate(key: string, vars?: Record<string, string | number>) {
  const template = messages.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    String(vars[name] ?? ''),
  );
}

function playStudy(question: ModuleQuestion, extra: Partial<QuizStudy> = {}) {
  return {
    t: translate,
    moduleId: 'mod-1',
    moduleTitle: 'Biology quiz',
    questions: [question],
    totalQuestions: 1,
    nextCursor: null,
    currentIndex: 0,
    timerEnabled: false,
    remainingSec: 0,
    timerActive: false,
    currentQuestion: question,
    currentDraft: undefined,
    canSubmit: true,
    progressPercent: 0,
    fullyLoaded: true,
    leaveDialogOpen: false,
    studyOrderingItems: question.orderingItems.map((item) => ({
      id: item.id,
      text: item.text,
    })),
    submitState: 'idle',
    submitError: null,
    imageLoadFailedByQuestionId: {},
    setChoiceAnswer: vi.fn(),
    setTextAnswer: vi.fn(),
    setFillBlankAnswer: vi.fn(),
    setMatchingAnswer: vi.fn(),
    setStudyOrderingOrder: vi.fn(),
    goPrev: vi.fn(),
    goNext: vi.fn(),
    submitSession: vi.fn(),
    onQuestionImageError: vi.fn(),
    restart: vi.fn(),
    confirmLeave: vi.fn(),
    cancelLeave: vi.fn(),
    ...extra,
  } as unknown as QuizStudy;
}

describe('QuizPlayView', () => {
  it('принимает ответ каждого типа и показывает картинку', async () => {
    const user = userEvent.setup();
    const choice = moduleQuestion({
      id: 'c1',
      type: 'CHOICE',
      questionText: 'Pick one',
      allowMultipleAnswers: true,
      questionImageMime: 'image/png',
      questionOptions: [
        { id: 'a', questionId: 'c1', text: 'Alpha', isCorrect: true },
        { id: 'b', questionId: 'c1', text: 'Beta', isCorrect: true },
      ],
    });
    const choiceStudy = playStudy(choice);
    const { rerender } = renderWithProviders(
      <QuizPlayView study={choiceStudy} />,
    );
    expect(screen.getByText('Select one or more options')).toBeInTheDocument();
    expect(
      screen.getByAltText(translate('quizStudy.questionImageAlt')),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(choiceStudy.setChoiceAnswer).toHaveBeenCalledWith('c1', 'a', true);

    const text = moduleQuestion({
      id: 't1',
      type: 'TEXT',
      questionText: 'Capital?',
    });
    const textStudy = playStudy(text);
    rerender(<QuizPlayView study={textStudy} />);
    await user.type(
      screen.getByRole('textbox', { name: 'Type your answer' }),
      'Minsk',
    );
    expect(textStudy.setTextAnswer).toHaveBeenCalled();

    const matching = moduleQuestion({
      id: 'm1',
      type: 'MATCHING',
      questionText: 'Match',
      matchingPairs: [
        { id: 'p1', questionId: 'm1', leftItem: 'HTTP', rightItem: 'Protocol' },
      ],
    });
    const matchingStudy = playStudy(matching);
    rerender(<QuizPlayView study={matchingStudy} />);
    await user.selectOptions(screen.getByRole('combobox'), 'p1');
    expect(matchingStudy.setMatchingAnswer).toHaveBeenCalledWith(
      'm1',
      'p1',
      'p1',
    );

    const ordering = moduleQuestion({
      id: 'o1',
      type: 'ORDERING',
      questionText: 'Order',
      orderingItems: [
        { id: 'i1', text: 'First', correctOrder: 0 },
        { id: 'i2', text: 'Second', correctOrder: 1 },
      ],
    });
    rerender(<QuizPlayView study={playStudy(ordering)} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();

    const blank = moduleQuestion({
      id: 'f1',
      type: 'FILL_BLANK',
      questionText: 'City {{1}}',
      fillBlanks: [{ id: 'b1', blankIndex: 1, answer: 'Minsk' }],
    });
    const blankStudy = playStudy(blank);
    rerender(<QuizPlayView study={blankStudy} />);
    await user.type(screen.getByRole('textbox', { name: 'Blank 1' }), 'Minsk');
    expect(blankStudy.setFillBlankAnswer).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Finish quiz' }));
    expect(blankStudy.submitSession).toHaveBeenCalled();
  });
});

describe('QuizResultView', () => {
  it('показывает эталон и прячет верные ответы в фильтре ошибок', async () => {
    const user = userEvent.setup();
    const question = moduleQuestion({
      id: 'c1',
      type: 'CHOICE',
      questionText: 'Capital?',
      questionOptions: [
        { id: 'yes', questionId: 'c1', text: 'Minsk', isCorrect: true },
        { id: 'no', questionId: 'c1', text: 'Rome', isCorrect: false },
      ],
    });
    const session: QuizSessionDetail = {
      id: 's1',
      userId: 'user-1',
      moduleId: 'mod-1',
      moduleTitle: 'Biology quiz',
      totalQuestions: 1,
      correctCount: 0,
      scorePercent: 0,
      pointsEarned: null,
      pointsMax: null,
      completedAt: '2026-02-01T00:00:00.000Z',
      answers: [
        {
          id: 'a1',
          questionId: 'c1',
          isCorrect: false,
          userAnswer: { choiceOptionIds: ['no'] },
          question,
        },
      ],
    };
    renderWithProviders(
      <QuizResultView
        study={
          {
            t: translate,
            moduleId: 'mod-1',
            moduleTitle: 'Biology quiz',
            session,
            quizElapsedMs: null,
            animatedPercent: 0,
            visiblePercent: 0,
            resultAnswers: session.answers,
            imageLoadFailedByQuestionId: {},
            onQuestionImageError: vi.fn(),
            restart: vi.fn(),
          } as unknown as QuizStudy
        }
      />,
    );

    expect(screen.queryByText(/points/)).not.toBeInTheDocument();
    expect(screen.getByText('Your answer: Rome')).toBeInTheDocument();
    expect(screen.getByText('Correct answer: Minsk')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Mistakes/ }));
    expect(screen.getByText('Correct answer: Minsk')).toBeInTheDocument();
  });

  it('показывает набранные баллы, если шкала была включена', () => {
    const question = moduleQuestion({
      id: 'c1',
      type: 'TEXT',
      questionText: 'Capital?',
      points: 4,
    });
    const session: QuizSessionDetail = {
      id: 's1',
      userId: 'user-1',
      moduleId: 'mod-1',
      moduleTitle: 'Biology quiz',
      totalQuestions: 2,
      correctCount: 1,
      scorePercent: 80,
      pointsEarned: 8,
      pointsMax: 10,
      completedAt: '2026-02-01T00:00:00.000Z',
      answers: [
        {
          id: 'a1',
          questionId: 'c1',
          isCorrect: true,
          userAnswer: { textAnswer: 'minsk' },
          question,
        },
      ],
    };
    renderWithProviders(
      <QuizResultView
        study={
          {
            t: translate,
            moduleId: 'mod-1',
            moduleTitle: 'Biology quiz',
            session,
            quizElapsedMs: null,
            animatedPercent: 80,
            visiblePercent: 80,
            resultAnswers: session.answers,
            imageLoadFailedByQuestionId: {},
            onQuestionImageError: vi.fn(),
            restart: vi.fn(),
          } as unknown as QuizStudy
        }
      />,
    );

    expect(screen.getByText('8 of 10 points')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 correct')).toBeInTheDocument();
  });

  it('округляет дробные баллы и оставляет число верных вопросов', () => {
    const question = moduleQuestion({
      id: 'c1',
      type: 'FILL_BLANK',
      questionText: 'City {{1}}',
      points: 4,
    });
    const session: QuizSessionDetail = {
      id: 's1',
      userId: 'user-1',
      moduleId: 'mod-1',
      moduleTitle: 'Biology quiz',
      totalQuestions: 1,
      correctCount: 0,
      scorePercent: 62.5,
      pointsEarned: 2.5,
      pointsMax: 4,
      completedAt: '2026-02-01T00:00:00.000Z',
      answers: [
        {
          id: 'a1',
          questionId: 'c1',
          isCorrect: false,
          userAnswer: { fillBlankAnswers: ['Minsk'], blankCorrect: [false] },
          question,
        },
      ],
    };
    renderWithProviders(
      <QuizResultView
        study={
          {
            t: translate,
            moduleId: 'mod-1',
            moduleTitle: 'Biology quiz',
            session,
            quizElapsedMs: null,
            animatedPercent: 63,
            visiblePercent: 63,
            resultAnswers: session.answers,
            imageLoadFailedByQuestionId: {},
            onQuestionImageError: vi.fn(),
            restart: vi.fn(),
          } as unknown as QuizStudy
        }
      />,
    );

    expect(screen.getByText('2.5 of 4 points')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 correct')).toBeInTheDocument();
  });
});
