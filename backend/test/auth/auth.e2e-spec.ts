import request from 'supertest';
import { ACCESS_TOKEN_COOKIE } from '../../src/auth/constants';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  registerVerifiedUser,
  setCookieHeader,
  TEST_PASSWORD,
  uniqueEmail,
} from '../support/auth';
import { useApiApp } from '../support/hooks';

describe('auth', () => {
  const api = useApiApp();

  it('регистрирует пользователя и отклоняет повтор email и короткий пароль', async () => {
    const email = uniqueEmail('reg');
    const server = api.getApp().getHttpServer();

    await request(server)
      .post('/api/auth/register')
      .send({ email, password: TEST_PASSWORD, username: 'Ann' })
      .expect(201)
      .expect({ message: 'Verification code sent to your email address.' });

    const row = await api
      .getApp()
      .get(PrismaService)
      .user.findUniqueOrThrow({ where: { email } });
    expect(row.emailVerified).toBe(false);
    expect(row.emailVerificationCode).toMatch(/^\d{6}$/);

    await request(server)
      .post('/api/auth/register')
      .send({ email, password: TEST_PASSWORD })
      .expect(409);

    await request(server)
      .post('/api/auth/register')
      .send({ email: uniqueEmail('short'), password: 'short' })
      .expect(400);
  });

  it('подтверждает почту кодом и ставит cookie сессии', async () => {
    const email = uniqueEmail('verify');
    const server = api.getApp().getHttpServer();
    await request(server)
      .post('/api/auth/register')
      .send({ email, password: TEST_PASSWORD, username: 'Ann' })
      .expect(201);

    const prisma = api.getApp().get(PrismaService);
    const before = await prisma.user.findUniqueOrThrow({ where: { email } });

    await request(server)
      .post('/api/auth/resend-verification')
      .send({ email })
      .expect(201);

    const resent = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(resent.emailVerificationCode).not.toBe(before.emailVerificationCode);

    await request(server)
      .post('/api/auth/verify-email')
      .send({ email, code: before.emailVerificationCode, rememberMe: true })
      .expect(401);

    const verified = await request(server)
      .post('/api/auth/verify-email')
      .send({
        email,
        code: resent.emailVerificationCode,
        rememberMe: true,
      })
      .expect(201);

    expect(verified.body).toMatchObject({
      email,
      emailVerified: true,
      username: 'Ann',
    });
    const cookie = setCookieHeader(verified.headers['set-cookie']);
    expect(cookie).toContain(ACCESS_TOKEN_COOKIE);
    expect(cookie).toMatch(/Max-Age=/i);
  });

  it('пускает только подтверждённого пользователя и различает rememberMe', async () => {
    const email = uniqueEmail('login');
    const server = api.getApp().getHttpServer();
    await request(server)
      .post('/api/auth/register')
      .send({ email, password: TEST_PASSWORD })
      .expect(201);

    const unverified = await request(server)
      .post('/api/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(401);
    expect(unverified.body).toMatchObject({
      message: 'Verify your email before signing in',
    });

    const user = await registerVerifiedUser(api.getApp(), {
      email: uniqueEmail('login-ok'),
    });

    const wrong = await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong-password' })
      .expect(401);
    expect(wrong.body).toMatchObject({
      message: 'Invalid email or password',
    });

    const session = await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password, rememberMe: false })
      .expect(201);
    const sessionCookie = setCookieHeader(session.headers['set-cookie']);
    expect(sessionCookie).toContain(ACCESS_TOKEN_COOKIE);
    expect(sessionCookie).not.toMatch(/Max-Age=/i);

    const remembered = await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password, rememberMe: true })
      .expect(201);
    expect(setCookieHeader(remembered.headers['set-cookie'])).toMatch(
      /Max-Age=/i,
    );
  });

  it('выходит из сессии и очищает cookie', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const loggedOut = await user.agent.post('/api/auth/logout').expect(201);
    expect(loggedOut.body).toEqual({ ok: true });
    expect(setCookieHeader(loggedOut.headers['set-cookie'])).toContain(
      ACCESS_TOKEN_COOKIE,
    );

    await user.agent.get('/api/users/me').expect(401);
  });

  it('сбрасывает пароль по коду', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const server = api.getApp().getHttpServer();
    const missing = uniqueEmail('missing');

    const hidden = await request(server)
      .post('/api/auth/forgot-password')
      .send({ email: missing })
      .expect(201);
    expect(hidden.body.message).toContain('If an account exists');

    await request(server)
      .post('/api/auth/forgot-password')
      .send({ email: user.email })
      .expect(201);

    const row = await api
      .getApp()
      .get(PrismaService)
      .user.findUniqueOrThrow({ where: { email: user.email } });
    expect(row.passwordResetCode).toMatch(/^\d{6}$/);

    await request(server)
      .post('/api/auth/reset-password')
      .send({
        email: user.email,
        code: '000000',
        newPassword: 'Newpass12',
      })
      .expect(401);

    const reset = await request(server)
      .post('/api/auth/reset-password')
      .send({
        email: user.email,
        code: row.passwordResetCode,
        newPassword: 'Newpass12',
      })
      .expect(201);
    expect(setCookieHeader(reset.headers['set-cookie'])).toContain(
      ACCESS_TOKEN_COOKIE,
    );

    await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(401);
    await request(server)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Newpass12', rememberMe: true })
      .expect(201);
  });

  it('отвечает на блокировку так же, как на неверный пароль', async () => {
    const user = await registerVerifiedUser(api.getApp());
    await api
      .getApp()
      .get(PrismaService)
      .user.update({
        where: { id: user.id },
        data: { isBlocked: true },
      });

    const blocked = await request(api.getApp().getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(401);
    expect(blocked.body).toMatchObject({
      message: 'Invalid email or password',
    });
  });

  it('начинает Google OAuth редиректом и отклоняет callback без кода', async () => {
    const server = api.getApp().getHttpServer();
    const start = await request(server).get('/api/auth/google').expect(302);
    expect(start.headers.location).toContain(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(setCookieHeader(start.headers['set-cookie'])).toContain(
      'quizoo_oauth_state',
    );

    const callback = await request(server)
      .get('/api/auth/google/callback')
      .expect(302);
    expect(callback.headers.location).toBe(
      'https://localhost/auth/oauth/callback?oauthError=missing_code',
    );
  });
});
