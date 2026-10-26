import request from 'supertest';
import { USER_AVATAR_MAX_BYTES } from '../../src/users/user-avatar.constants';
import { registerVerifiedUser, uniqueEmail } from '../support/auth';
import { useApiApp } from '../support/hooks';
import { TINY_PNG } from '../support/png';

describe('user', () => {
  const api = useApiApp();

  it('закрывает профиль без cookie', async () => {
    await request(api.getApp().getHttpServer())
      .get('/api/users/me')
      .expect(401);
  });

  it('показывает и меняет имя, пароль и почту', async () => {
    const user = await registerVerifiedUser(api.getApp(), {
      username: 'Old name',
    });
    const me = await user.agent.get('/api/users/me').expect(200);
    expect(me.body).toMatchObject({
      id: user.id,
      email: user.email,
      username: 'Old name',
      emailVerified: true,
    });
    expect(me.body).not.toHaveProperty('passwordHash');

    const renamed = await user.agent
      .patch('/api/users/me')
      .send({ username: 'New name' })
      .expect(200);
    expect(renamed.body).toMatchObject({ username: 'New name' });

    await user.agent.patch('/api/users/me').send({}).expect(400);

    await user.agent
      .patch('/api/users/me/password')
      .send({ currentPassword: 'wrong-password', newPassword: 'Newpass12' })
      .expect(401);

    await user.agent
      .patch('/api/users/me/password')
      .send({ currentPassword: user.password, newPassword: 'Newpass12' })
      .expect(200);

    const server = api.getApp().getHttpServer();
    await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Newpass12', rememberMe: true })
      .expect(201);

    const other = await registerVerifiedUser(api.getApp());
    await user.agent
      .patch('/api/users/me/email')
      .send({ newEmail: other.email, currentPassword: 'Newpass12' })
      .expect(409);

    const nextEmail = uniqueEmail('next');
    const changed = await user.agent
      .patch('/api/users/me/email')
      .send({ newEmail: nextEmail, currentPassword: 'Newpass12' })
      .expect(200);
    expect(changed.body.user).toMatchObject({
      email: nextEmail,
      emailVerified: false,
    });

    await request(server)
      .post('/api/auth/login')
      .send({ email: nextEmail, password: 'Newpass12' })
      .expect(401);
  });

  it('принимает аватар, отклоняет чужой формат и слишком большой файл, затем удаляет его', async () => {
    const user = await registerVerifiedUser(api.getApp());

    const uploaded = await user.agent
      .post('/api/users/me/avatar')
      .attach('file', TINY_PNG, { filename: 'a.png', contentType: 'image/png' })
      .expect(201);
    expect(uploaded.body).toMatchObject({ avatarMime: 'image/png' });

    const file = await user.agent.get('/api/users/me/avatar').expect(200);
    expect(file.headers['content-type']).toContain('image/png');
    expect(file.body).toEqual(expect.any(Buffer));

    await user.agent
      .post('/api/users/me/avatar')
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      })
      .expect(400);

    await user.agent
      .post('/api/users/me/avatar')
      .attach('file', Buffer.alloc(USER_AVATAR_MAX_BYTES + 1), {
        filename: 'big.png',
        contentType: 'image/png',
      })
      .expect(413);

    const cleared = await user.agent.delete('/api/users/me/avatar').expect(200);
    expect(cleared.body).toMatchObject({ avatarMime: null });
    await user.agent.get('/api/users/me/avatar').expect(404);
  });
});
