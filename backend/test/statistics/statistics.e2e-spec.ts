import { registerVerifiedUser } from '../support/auth';
import { useApiApp } from '../support/hooks';

describe('statistics', () => {
  const api = useApiApp();

  it('собирает сводку и недавнюю активность после сессий', async () => {
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
      .send({ totalCards: 4, knownCount: 3, unknownCount: 1 })
      .expect(201);

    const quiz = await user.agent
      .post('/api/modules')
      .send({ title: 'Quiz', type: 'QUIZ' })
      .expect(201);
    const question = await user.agent
      .post(`/api/modules/${quiz.body.id}/questions`)
      .send({
        questionText: 'Столица',
        type: 'TEXT',
        options: [{ text: 'Минск', isCorrect: true }],
      })
      .expect(201);
    await user.agent
      .post(`/api/modules/${quiz.body.id}/quiz-sessions`)
      .send({
        answers: [{ questionId: question.body.id, textAnswer: 'Минск' }],
      })
      .expect(201);

    const summary = await user.agent.get('/api/modules/summary').expect(200);
    expect(summary.body).toMatchObject({
      totalModules: 2,
      activeModules: 2,
      cardsStudied: 4,
      averageQuizScore: 100,
    });

    const activity = await user.agent
      .get('/api/modules/activity')
      .query({ limit: 10 })
      .expect(200);
    const kinds = (activity.body.items as Array<{ kind: string }>).map(
      (item) => item.kind,
    );
    expect(kinds).toEqual(
      expect.arrayContaining(['FLASHCARD_SESSION', 'QUIZ_SESSION']),
    );
  });
});
