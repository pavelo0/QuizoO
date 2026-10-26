import { registerVerifiedUser } from '../support/auth';
import { useApiApp } from '../support/hooks';

describe('card', () => {
  const api = useApiApp();

  it('добавляет, меняет порядок и удаляет карточку', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const created = await user.agent
      .post('/api/modules')
      .send({ title: 'Terms', type: 'FLASHCARD' })
      .expect(201);
    const moduleId = created.body.id as string;

    const first = await user.agent
      .post(`/api/modules/${moduleId}/cards`)
      .send({ question: 'Cell', answer: 'Клетка', orderIndex: 1 })
      .expect(201);
    const second = await user.agent
      .post(`/api/modules/${moduleId}/cards`)
      .send({ question: 'Bone', answer: 'Кость', orderIndex: 0 })
      .expect(201);

    const moved = await user.agent
      .patch(`/api/modules/${moduleId}/cards/${first.body.id}`)
      .send({ orderIndex: 2, answer: 'Клетка организма' })
      .expect(200);
    expect(moved.body).toMatchObject({
      orderIndex: 2,
      answer: 'Клетка организма',
    });

    const detail = await user.agent.get(`/api/modules/${moduleId}`).expect(200);
    const questions = (detail.body.cards as Array<{ question: string }>).map(
      (card) => card.question,
    );
    expect(questions).toEqual(['Bone', 'Cell']);

    await user.agent
      .delete(`/api/modules/${moduleId}/cards/${second.body.id}`)
      .expect(200);
    const after = await user.agent.get(`/api/modules/${moduleId}`).expect(200);
    expect(after.body.cards).toHaveLength(1);
    expect(after.body.cardCount).toBe(1);
  });

  it('отклоняет карточку в модуле квиза и пустые поля', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const quiz = await user.agent
      .post('/api/modules')
      .send({ title: 'Quiz only', type: 'QUIZ' })
      .expect(201);

    await user.agent
      .post(`/api/modules/${quiz.body.id}/cards`)
      .send({ question: 'Q', answer: 'A' })
      .expect(400);

    const flash = await user.agent
      .post('/api/modules')
      .send({ title: 'Empty card', type: 'FLASHCARD' })
      .expect(201);
    await user.agent
      .post(`/api/modules/${flash.body.id}/cards`)
      .send({ question: '   ', answer: 'A' })
      .expect(400);
  });
});
