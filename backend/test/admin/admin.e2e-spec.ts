import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { registerVerifiedUser, promoteToAdmin } from '../support/auth';
import { useApiApp } from '../support/hooks';

describe('admin', () => {
  const api = useApiApp();

  it('даёт сводку, список пользователей и модулей и запрещает это обычному пользователю', async () => {
    const learner = await registerVerifiedUser(api.getApp(), {
      username: 'Learner',
    });
    const admin = await registerVerifiedUser(api.getApp(), {
      username: 'Admin',
    });
    await promoteToAdmin(api.getApp(), admin.id);

    const created = await learner.agent
      .post('/api/modules')
      .send({ title: 'Visible', type: 'FLASHCARD' })
      .expect(201);

    await learner.agent.get('/api/users/admin/overview').expect(403);
    await learner.agent.get('/api/users/admin/users').expect(403);
    await learner.agent.get('/api/users/admin/modules').expect(403);

    const overview = await admin.agent
      .get('/api/users/admin/overview')
      .expect(200);
    expect(overview.body).toMatchObject({
      totalUsers: 2,
      totalModules: 1,
      blockedUsers: 0,
    });

    const users = await admin.agent.get('/api/users/admin/users').expect(200);
    const emails = (users.body as Array<{ email: string }>).map(
      (item) => item.email,
    );
    expect(emails).toEqual(
      expect.arrayContaining([learner.email, admin.email]),
    );

    const modules = await admin.agent
      .get('/api/users/admin/modules')
      .expect(200);
    expect(modules.body).toEqual([
      expect.objectContaining({
        id: created.body.id,
        title: 'Visible',
        owner: expect.objectContaining({ email: learner.email }),
      }),
    ]);
  });

  it('блокирует и разблокирует пользователя, после чего вход снова работает', async () => {
    const learner = await registerVerifiedUser(api.getApp());
    const admin = await registerVerifiedUser(api.getApp());
    await promoteToAdmin(api.getApp(), admin.id);
    const server = api.getApp().getHttpServer();

    await admin.agent
      .patch(`/api/users/admin/users/${admin.id}/block`)
      .send({ isBlocked: true })
      .expect(400);

    const blocked = await admin.agent
      .patch(`/api/users/admin/users/${learner.id}/block`)
      .send({ isBlocked: true })
      .expect(200);
    expect(blocked.body).toMatchObject({ isBlocked: true });

    await request(server)
      .post('/api/auth/login')
      .send({ email: learner.email, password: learner.password })
      .expect(401);

    await admin.agent
      .patch(`/api/users/admin/users/${learner.id}/block`)
      .send({ isBlocked: false })
      .expect(200);

    await request(server)
      .post('/api/auth/login')
      .send({
        email: learner.email,
        password: learner.password,
        rememberMe: true,
      })
      .expect(201);
  });

  it('удаляет чужой модуль', async () => {
    const learner = await registerVerifiedUser(api.getApp());
    const admin = await registerVerifiedUser(api.getApp());
    await promoteToAdmin(api.getApp(), admin.id);

    const created = await learner.agent
      .post('/api/modules')
      .send({ title: 'To remove', type: 'QUIZ' })
      .expect(201);

    await learner.agent
      .delete(`/api/users/admin/modules/${created.body.id}`)
      .expect(403);

    await admin.agent
      .delete(`/api/users/admin/modules/${created.body.id}`)
      .expect(200);

    expect(
      await api
        .getApp()
        .get(PrismaService)
        .module.count({
          where: { id: created.body.id },
        }),
    ).toBe(0);
    await admin.agent
      .delete(`/api/users/admin/modules/${created.body.id}`)
      .expect(404);
  });
});
