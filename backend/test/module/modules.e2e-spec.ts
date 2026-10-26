import { registerVerifiedUser, promoteToAdmin } from '../support/auth';
import { useApiApp } from '../support/hooks';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('module', () => {
  const api = useApiApp();

  it('создаёт, правит и показывает только свои модули обоих типов', async () => {
    const owner = await registerVerifiedUser(api.getApp());
    const other = await registerVerifiedUser(api.getApp());

    const flash = await owner.agent
      .post('/api/modules')
      .send({ title: 'Biology', type: 'FLASHCARD', description: 'cells' })
      .expect(201);
    expect(flash.body).toMatchObject({
      title: 'Biology',
      type: 'FLASHCARD',
      description: 'cells',
      userId: owner.id,
    });

    const quiz = await owner.agent
      .post('/api/modules')
      .send({ title: 'History', type: 'QUIZ' })
      .expect(201);
    expect(quiz.body).toMatchObject({ type: 'QUIZ', description: null });

    await owner.agent
      .post('/api/modules')
      .send({ title: 'biology', type: 'FLASHCARD' })
      .expect(409);

    const updated = await owner.agent
      .patch(`/api/modules/${flash.body.id}`)
      .send({ title: 'Biology 2', description: null })
      .expect(200);
    expect(updated.body).toMatchObject({
      title: 'Biology 2',
      description: null,
    });

    const list = await owner.agent.get('/api/modules').expect(200);
    const titles = (list.body as Array<{ title: string }>).map(
      (item) => item.title,
    );
    expect(titles).toEqual(expect.arrayContaining(['Biology 2', 'History']));

    const otherList = await other.agent.get('/api/modules').expect(200);
    expect(otherList.body).toEqual([]);
    await other.agent.get(`/api/modules/${flash.body.id}`).expect(404);

    const detail = await owner.agent
      .get(`/api/modules/${quiz.body.id}`)
      .expect(200);
    expect(detail.body).toMatchObject({
      id: quiz.body.id,
      title: 'History',
      questions: [],
      cards: [],
    });
  });

  it('не даёт администратору создавать учебные модули', async () => {
    const admin = await registerVerifiedUser(api.getApp());
    await promoteToAdmin(api.getApp(), admin.id);

    await admin.agent
      .post('/api/modules')
      .send({ title: 'Staff notes', type: 'FLASHCARD' })
      .expect(403);
  });

  it('удаляет модуль вместе с карточками, вопросами и сессиями', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const flash = await user.agent
      .post('/api/modules')
      .send({ title: 'Cards', type: 'FLASHCARD' })
      .expect(201);
    await user.agent
      .post(`/api/modules/${flash.body.id}/cards`)
      .send({ question: 'Q', answer: 'A' })
      .expect(201);
    await user.agent
      .post(`/api/modules/${flash.body.id}/flashcard-sessions`)
      .send({ totalCards: 1, knownCount: 1, unknownCount: 0 })
      .expect(201);

    const quiz = await user.agent
      .post('/api/modules')
      .send({ title: 'Quiz', type: 'QUIZ' })
      .expect(201);
    const question = await user.agent
      .post(`/api/modules/${quiz.body.id}/questions`)
      .send({
        questionText: 'Capital?',
        type: 'TEXT',
        options: [{ text: 'Minsk', isCorrect: true }],
      })
      .expect(201);
    await user.agent
      .post(`/api/modules/${quiz.body.id}/quiz-sessions`)
      .send({
        answers: [{ questionId: question.body.id, textAnswer: 'Minsk' }],
      })
      .expect(201);

    await user.agent.delete(`/api/modules/${flash.body.id}`).expect(200);
    await user.agent.delete(`/api/modules/${quiz.body.id}`).expect(200);

    const prisma = api.getApp().get(PrismaService);
    expect(await prisma.card.count()).toBe(0);
    expect(await prisma.question.count()).toBe(0);
    expect(await prisma.flashcardSession.count()).toBe(0);
    expect(await prisma.quizSession.count()).toBe(0);
    expect(await prisma.quizAnswer.count()).toBe(0);
  });
});
