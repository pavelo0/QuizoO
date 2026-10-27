import { registerVerifiedUser } from '../support/auth';
import { useApiApp } from '../support/hooks';

describe('flashcard-session', () => {
  const api = useApiApp();

  it('сохраняет самооценку «знал / не знал»', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const created = await user.agent
      .post('/api/modules')
      .send({ title: 'Review', type: 'FLASHCARD' })
      .expect(201);

    const session = await user.agent
      .post(`/api/modules/${created.body.id}/flashcard-sessions`)
      .send({ totalCards: 3, knownCount: 2, unknownCount: 1 })
      .expect(201);

    expect(session.body).toMatchObject({
      moduleId: created.body.id,
      userId: user.id,
      totalCards: 3,
      knownCount: 2,
      unknownCount: 1,
    });
    expect(session.body.completedAt).toEqual(expect.any(String));
  });

  it('отклоняет битые счётчики', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const created = await user.agent
      .post('/api/modules')
      .send({ title: 'Review', type: 'FLASHCARD' })
      .expect(201);
    const path = `/api/modules/${created.body.id}/flashcard-sessions`;

    await user.agent
      .post(path)
      .send({ totalCards: 2, knownCount: 2, unknownCount: 1 })
      .expect(400);
    await user.agent
      .post(path)
      .send({ totalCards: 0, knownCount: 0, unknownCount: 0 })
      .expect(400);
  });
});
