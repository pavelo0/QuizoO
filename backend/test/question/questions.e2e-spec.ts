import { registerVerifiedUser } from '../support/auth';
import { useApiApp } from '../support/hooks';
import { TINY_PNG } from '../support/png';

describe('question', () => {
  const api = useApiApp();

  async function quizModule() {
    const user = await registerVerifiedUser(api.getApp());
    const created = await user.agent
      .post('/api/modules')
      .send({ title: 'Check', type: 'QUIZ' })
      .expect(201);
    return { user, moduleId: created.body.id as string };
  }

  it('сохраняет вопросы CHOICE, TEXT, MATCHING и ORDERING и читает их обратно', async () => {
    const { user, moduleId } = await quizModule();

    const choice = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'Один верный',
        type: 'CHOICE',
        orderIndex: 0,
        options: [
          { text: 'Да', isCorrect: true },
          { text: 'Нет', isCorrect: false },
        ],
      })
      .expect(201);
    expect(choice.body.questionOptions).toHaveLength(2);
    expect(choice.body.allowMultipleAnswers).toBe(false);

    const multi = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'Несколько верных',
        type: 'CHOICE',
        allowMultipleAnswers: true,
        orderIndex: 1,
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ],
      })
      .expect(201);
    expect(multi.body.allowMultipleAnswers).toBe(true);

    const text = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'Столица',
        type: 'TEXT',
        orderIndex: 2,
        options: [{ text: 'Минск', isCorrect: true }],
        acceptedVariants: ['Minsk', 'минск', ''],
      })
      .expect(201);
    expect(text.body.acceptedVariants).toEqual(['Minsk']);

    const matching = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'Пары',
        type: 'MATCHING',
        orderIndex: 3,
        matchingPairs: [
          { leftItem: 'H2O', rightItem: 'Вода' },
          { leftItem: 'NaCl', rightItem: 'Соль' },
        ],
      })
      .expect(201);
    expect(matching.body.matchingPairs).toHaveLength(2);

    const ordering = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'Порядок',
        type: 'ORDERING',
        orderIndex: 4,
        orderingItems: [
          { text: 'Первый', correctOrder: 0 },
          { text: 'Второй', correctOrder: 1 },
        ],
      })
      .expect(201);
    expect(ordering.body.orderingItems).toHaveLength(2);

    const detail = await user.agent.get(`/api/modules/${moduleId}`).expect(200);
    const types = (detail.body.questions as Array<{ type: string }>).map(
      (question) => question.type,
    );
    expect(types).toEqual(['CHOICE', 'CHOICE', 'TEXT', 'MATCHING', 'ORDERING']);
    expect(detail.body.questionCount).toBe(5);

    const fillBlank = await user.agent
      .post(`/api/modules/${moduleId}/questions`)
      .send({
        questionText: 'GET обычно {{1}} данные',
        type: 'FILL_BLANK',
        orderIndex: 5,
        fillBlanks: [{ answer: 'читает', acceptedVariants: ['получает'] }],
      })
      .expect(201);
    expect(fillBlank.body.fillBlanks).toEqual([
      expect.objectContaining({
        blankIndex: 1,
        answer: 'читает',
        acceptedVariants: ['получает'],
      }),
    ]);

    const renamed = await user.agent
      .patch(`/api/modules/${moduleId}/questions/${choice.body.id}`)
      .send({ questionText: 'Один верный?' })
      .expect(200);
    expect(renamed.body.questionText).toBe('Один верный?');

    await user.agent
      .delete(`/api/modules/${moduleId}/questions/${ordering.body.id}`)
      .expect(200);
    const after = await user.agent.get(`/api/modules/${moduleId}`).expect(200);
    expect(after.body.questions).toHaveLength(5);
  });

  it('отклоняет вопрос в модуле карточек и неполный CHOICE', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const flash = await user.agent
      .post('/api/modules')
      .send({ title: 'Cards', type: 'FLASHCARD' })
      .expect(201);
    await user.agent
      .post(`/api/modules/${flash.body.id}/questions`)
      .send({
        questionText: 'Nope',
        type: 'TEXT',
        options: [{ text: 'x', isCorrect: true }],
      })
      .expect(400);

    const quiz = await user.agent
      .post('/api/modules')
      .send({ title: 'Bad choice', type: 'QUIZ' })
      .expect(201);
    await user.agent
      .post(`/api/modules/${quiz.body.id}/questions`)
      .send({
        questionText: 'Broken',
        type: 'CHOICE',
        options: [{ text: 'Only', isCorrect: true }],
      })
      .expect(400);
  });

  it('загружает, отдаёт и удаляет изображение вопроса', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const quiz = await user.agent
      .post('/api/modules')
      .send({ title: 'Pictures', type: 'QUIZ' })
      .expect(201);
    const question = await user.agent
      .post(`/api/modules/${quiz.body.id}/questions`)
      .send({
        questionText: 'Схема',
        type: 'TEXT',
        options: [{ text: 'схема', isCorrect: true }],
      })
      .expect(201);

    const path = `/api/modules/${quiz.body.id}/questions/${question.body.id}/image`;
    await user.agent
      .post(path)
      .attach('file', Buffer.from('text'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      })
      .expect(400);

    const uploaded = await user.agent
      .post(path)
      .attach('file', TINY_PNG, { filename: 'a.png', contentType: 'image/png' })
      .expect(201);
    expect(uploaded.body.questionImageMime).toBe('image/png');

    const file = await user.agent.get(path).expect(200);
    expect(file.headers['content-type']).toContain('image/png');

    await user.agent.delete(path).expect(200);
    await user.agent.get(path).expect(404);
  });
});
