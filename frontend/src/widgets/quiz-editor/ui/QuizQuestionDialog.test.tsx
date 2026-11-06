import { renderWithProviders } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { QuizQuestionDialog } from './QuizQuestionDialog';

function renderDialog(
  onCreateQuestion: (
    payload: { type: string; questionText: string; points?: number },
    imageFile: File | null,
  ) => Promise<void> = vi.fn(async () => undefined),
  customScoring = false,
): Mock {
  renderWithProviders(
    <QuizQuestionDialog
      open
      presentation="panel"
      editingQuestion={null}
      questionsCount={0}
      customScoring={customScoring}
      moduleId="mod-1"
      onOpenChange={vi.fn()}
      onCreateQuestion={onCreateQuestion}
      onUpdateQuestion={vi.fn(async () => undefined)}
    />,
  );
  return onCreateQuestion;
}

describe('QuizQuestionDialog', () => {
  it('отклоняет пустой вопрос', async () => {
    const user = userEvent.setup();
    const onCreate = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(screen.getByText('Enter question text.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('сохраняет выбор с несколькими верными ответами', async () => {
    const user = userEvent.setup();
    const onCreate = renderDialog();
    await user.type(
      screen.getByPlaceholderText('e.g. Which statement is correct?'),
      'Pick letters',
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Allow multiple answers' }),
    );
    await user.type(screen.getByPlaceholderText('Option 1'), 'A');
    await user.type(screen.getByPlaceholderText('Option 2'), 'B');
    const correct = screen.getAllByRole('checkbox', { name: 'Correct' });
    await user.click(correct[0]!);
    await user.click(correct[1]!);
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CHOICE',
        questionText: 'Pick letters',
        allowMultipleAnswers: true,
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
      }),
      null,
    );
  });

  it('сохраняет текст, пары, порядок и пропуски', async () => {
    const user = userEvent.setup();
    const onCreate = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Text answer' }));
    await user.type(
      screen.getByPlaceholderText('e.g. Which statement is correct?'),
      'Capital?',
    );
    await user.type(screen.getByPlaceholderText('e.g. Paris'), 'Minsk');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TEXT', questionText: 'Capital?' }),
      null,
    );

    onCreate.mockClear();
    await user.click(screen.getByRole('button', { name: 'Matching' }));
    const left = screen.getAllByPlaceholderText('Left item');
    const right = screen.getAllByPlaceholderText('Right item');
    await user.type(left[0]!, 'HTTP');
    await user.type(right[0]!, 'Protocol');
    await user.type(left[1]!, 'CSS');
    await user.type(right[1]!, 'Style');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MATCHING' }),
      null,
    );

    onCreate.mockClear();
    await user.click(screen.getByRole('button', { name: 'Ordering' }));
    const items = screen.getAllByPlaceholderText('Enter item text');
    await user.type(items[0]!, 'One');
    await user.type(items[1]!, 'Two');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ORDERING' }),
      null,
    );

    onCreate.mockClear();
    await user.click(screen.getByRole('button', { name: 'Fill in the blank' }));
    await user.type(screen.getByLabelText('Correct word or phrase'), 'Minsk');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FILL_BLANK' }),
      null,
    );
  });

  it('прячет баллы, пока шкала выключена', () => {
    renderDialog();
    expect(screen.queryByLabelText('Points')).not.toBeInTheDocument();
  });

  it('сохраняет баллы вопроса на своей шкале', async () => {
    const user = userEvent.setup();
    const onCreate = renderDialog(
      vi.fn(async () => undefined),
      true,
    );
    expect(screen.getByLabelText('Points')).toHaveValue('1');

    await user.type(
      screen.getByPlaceholderText('e.g. Which statement is correct?'),
      'Pick letters',
    );
    await user.type(screen.getByPlaceholderText('Option 1'), 'A');
    await user.type(screen.getByPlaceholderText('Option 2'), 'B');
    await user.click(screen.getAllByRole('checkbox', { name: 'Correct' })[0]!);
    await user.clear(screen.getByLabelText('Points'));
    await user.type(screen.getByLabelText('Points'), '0');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(
      screen.getByText('Enter a whole number from 1 to 100.'),
    ).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Points'));
    await user.type(screen.getByLabelText('Points'), '5');
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CHOICE',
        questionText: 'Pick letters',
        points: 5,
      }),
      null,
    );
  });

  it('кладёт выбранную картинку в черновик', async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const onCreate = renderDialog();
    await user.type(
      screen.getByPlaceholderText('e.g. Which statement is correct?'),
      'With image',
    );
    await user.type(screen.getByPlaceholderText('Option 1'), 'Yes');
    await user.type(screen.getByPlaceholderText('Option 2'), 'No');
    await user.click(screen.getAllByRole('checkbox', { name: 'Correct' })[0]!);
    const file = new File(['png'], 'pic.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Choose image'), file);
    expect(screen.getByAltText('Question image preview')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onCreate).toHaveBeenCalledWith(expect.anything(), file);
  });
});
