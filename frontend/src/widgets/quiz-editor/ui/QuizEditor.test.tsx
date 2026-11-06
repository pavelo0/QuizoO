import {
  createQuestion,
  deleteQuestion,
  fetchModuleById,
  updateModule,
} from '@/entities/module';
import { moduleDetail, moduleQuestion } from '@/shared/test/moduleFixtures';
import { renderWithI18n } from '@/shared/test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuizEditor } from './QuizEditor';
import { SortableQuestionRow } from './SortableQuestionRow';

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('react-hot-toast', () => ({ toast, default: toast }));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useBlocker: () => ({
      state: 'unblocked',
      reset: vi.fn(),
      proceed: vi.fn(),
    }),
  };
});

vi.mock('@/entities/module', async () => {
  const actual =
    await vi.importActual<typeof import('@/entities/module')>(
      '@/entities/module',
    );
  return {
    ...actual,
    fetchModuleById: vi.fn(),
    createQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    updateModule: vi.fn(),
    deleteModule: vi.fn(),
  };
});

const choice = moduleQuestion({
  id: 'q1',
  questionText: 'Capital?',
  type: 'CHOICE',
  questionOptions: [
    { id: 'yes', questionId: 'q1', text: 'Minsk', isCorrect: true },
    { id: 'no', questionId: 'q1', text: 'Rome', isCorrect: false },
  ],
});

function renderEditor() {
  return renderWithI18n(
    <MemoryRouter initialEntries={['/app/modules/mod-1/quiz-edit']}>
      <Routes>
        <Route
          path="/app/modules/:moduleId/quiz-edit"
          element={<QuizEditor />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('QuizEditor', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    toast.success.mockReset();
    toast.error.mockReset();
    vi.mocked(fetchModuleById).mockReset();
    vi.mocked(createQuestion).mockReset();
    vi.mocked(deleteQuestion).mockReset();
    vi.mocked(updateModule).mockReset();
    vi.mocked(updateModule).mockResolvedValue({
      id: 'mod-1',
      title: 'Biology quiz',
      description: null,
      type: 'QUIZ',
      userId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:quiz');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.mocked(fetchModuleById).mockResolvedValue(
      moduleDetail('QUIZ', { questions: [choice], questionCount: 1 }),
    );
  });

  it('экспортирует JSON и отклоняет битый импорт', async () => {
    const user = userEvent.setup();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    renderEditor();
    await screen.findByText('Capital?');
    expect(screen.queryByText('1 pts')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Export JSON' }));
    expect(click).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Quiz JSON file exported.');

    const input = document.querySelector(
      'input[accept="application/json,.json"]',
    ) as HTMLInputElement;
    await user.upload(
      input,
      new File(['{'], 'broken.json', { type: 'application/json' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Replace all questions?' }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Replace and import' }),
    );
    expect(toast.error).toHaveBeenCalledWith('Invalid JSON file.');
    expect(deleteQuestion).not.toHaveBeenCalled();
  });

  it('включает шкалу и показывает баллы вопроса', async () => {
    const user = userEvent.setup();
    renderEditor();
    const scale = await screen.findByRole('switch', {
      name: 'Custom point scale',
    });
    expect(scale).not.toBeChecked();
    await user.click(scale);
    await waitFor(() => {
      expect(updateModule).toHaveBeenCalledWith('mod-1', {
        customScoring: true,
      });
    });
    expect(await screen.findByText('1 pts')).toBeInTheDocument();
  });

  it('возвращает переключатель, если шкала не сохранилась', async () => {
    const user = userEvent.setup();
    vi.mocked(updateModule).mockRejectedValueOnce(new Error('nope'));
    renderEditor();
    const scale = await screen.findByRole('switch', {
      name: 'Custom point scale',
    });
    await user.click(scale);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not save the point scale.',
      );
    });
    expect(scale).not.toBeChecked();
    expect(screen.queryByText('1 pts')).not.toBeInTheDocument();
  });

  it('экспортирует включённую шкалу и баллы', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchModuleById).mockResolvedValue(
      moduleDetail('QUIZ', {
        customScoring: true,
        questionCount: 1,
        questions: [
          moduleQuestion({
            id: 'q1',
            questionText: 'Capital?',
            type: 'TEXT',
            points: 4,
            questionOptions: [
              { id: 'o1', questionId: 'q1', text: 'Minsk', isCorrect: true },
            ],
          }),
        ],
      }),
    );
    let exported = '';
    const originalStringify = JSON.stringify;
    const stringifySpy = vi
      .spyOn(JSON, 'stringify')
      .mockImplementation((value, replacer, space) => {
        const text = originalStringify(value, replacer, space);
        if (value && typeof value === 'object' && 'formatVersion' in value) {
          exported = text;
        }
        return text;
      });
    try {
      renderEditor();
      expect(await screen.findByText('4 pts')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Export JSON' }));
      expect(JSON.parse(exported)).toMatchObject({
        customScoring: true,
        questions: [{ type: 'TEXT', answer: 'Minsk', points: 4 }],
      });
    } finally {
      stringifySpy.mockRestore();
    }
  });

  it('импортирует шкалу и баллы вопросов', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchModuleById).mockResolvedValue(
      moduleDetail('QUIZ', { questions: [], questionCount: 0 }),
    );
    vi.mocked(createQuestion).mockResolvedValue(
      moduleQuestion({
        id: 'q-import',
        questionText: 'River?',
        type: 'TEXT',
        points: 5,
      }),
    );
    renderEditor();
    await screen.findByText(/No questions yet/);
    const input = document.querySelector(
      'input[accept="application/json,.json"]',
    ) as HTMLInputElement;
    await user.upload(
      input,
      new File(
        [
          JSON.stringify({
            formatVersion: 1,
            moduleType: 'QUIZ',
            customScoring: true,
            questions: [
              {
                type: 'TEXT',
                questionText: 'River?',
                answer: 'Neman',
                points: 5,
              },
            ],
          }),
        ],
        'quiz.json',
        { type: 'application/json' },
      ),
    );
    await waitFor(() => {
      expect(createQuestion).toHaveBeenCalledWith(
        'mod-1',
        expect.objectContaining({
          questionText: 'River?',
          type: 'TEXT',
          points: 5,
        }),
      );
    });
    expect(updateModule).toHaveBeenCalledWith('mod-1', { customScoring: true });
    expect(await screen.findByText('5 pts')).toBeInTheDocument();
    expect(deleteQuestion).not.toHaveBeenCalled();
  });

  it('двигает вопрос вверх', async () => {
    const user = userEvent.setup();
    const onMoveUp = vi.fn();
    const second = moduleQuestion({
      id: 'q2',
      questionText: 'River?',
      type: 'TEXT',
      orderIndex: 1,
    });
    renderWithI18n(
      <DndContext>
        <SortableContext items={['q2']}>
          <ul>
            <SortableQuestionRow
              q={second}
              index={1}
              total={2}
              canReorder
              onEdit={vi.fn()}
              onDelete={vi.fn(async () => undefined)}
              onMoveUp={onMoveUp}
              onMoveDown={vi.fn()}
              t={(key) =>
                (
                  ({
                    'editQuiz.moveUp': 'Move question up',
                    'editQuiz.moveDown': 'Move question down',
                    'editQuiz.reorder': 'Reorder question',
                    'aria.editQuestion': 'Edit question',
                    'aria.deleteQuestion': 'Delete question',
                    'aria.order': 'Order {number}',
                  }) as Record<string, string>
                )[key] ?? key
              }
            />
          </ul>
        </SortableContext>
      </DndContext>,
    );
    await user.click(screen.getByRole('button', { name: 'Move question up' }));
    expect(onMoveUp).toHaveBeenCalledWith('q2');
  });
});
