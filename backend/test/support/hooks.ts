import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './create-app';
import { resetDatabase } from './db';

export function useApiApp(): { getApp: () => INestApplication } {
  let app: INestApplication | undefined;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    if (!app) {
      throw new Error('Test app was not started');
    }
    await resetDatabase(app.get(PrismaService));
  });

  afterAll(async () => {
    await app?.close();
  });

  return {
    getApp: () => {
      if (!app) {
        throw new Error('Test app was not started');
      }
      return app;
    },
  };
}
