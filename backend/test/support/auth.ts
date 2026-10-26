import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

export const TEST_PASSWORD = 'Testpass1';

export type ApiAgent = ReturnType<typeof request.agent>;

export type SignedInUser = {
  agent: ApiAgent;
  id: string;
  email: string;
  password: string;
};

export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${randomUUID()}@quizoo.test`;
}

export function setCookieHeader(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return value ?? '';
}

export async function registerVerifiedUser(
  app: INestApplication,
  options?: { email?: string; password?: string; username?: string },
): Promise<SignedInUser> {
  const email = (options?.email ?? uniqueEmail()).toLowerCase();
  const password = options?.password ?? TEST_PASSWORD;
  const server = app.getHttpServer();
  const prisma = app.get(PrismaService);

  await request(server)
    .post('/api/auth/register')
    .send({
      email,
      password,
      username: options?.username ?? 'Tester',
    })
    .expect(201);

  const row = await prisma.user.findUniqueOrThrow({ where: { email } });
  const agent = request.agent(server);
  const verified = await agent
    .post('/api/auth/verify-email')
    .send({
      email,
      code: row.emailVerificationCode,
      rememberMe: true,
    })
    .expect(201);

  const body = verified.body as { id: string; email: string };
  return { agent, id: body.id, email: body.email, password };
}

export async function promoteToAdmin(
  app: INestApplication,
  userId: string,
): Promise<void> {
  await app.get(PrismaService).user.update({
    where: { id: userId },
    data: { role: UserRole.ADMIN },
  });
}
