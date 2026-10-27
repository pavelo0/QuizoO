import { execSync } from 'node:child_process';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadTestEnv } from './support/env';

export default async function globalSetup(): Promise<void> {
  const { testDatabaseUrl, maintenanceDatabaseUrl } = loadTestEnv();

  const admin = new PrismaClient({
    datasources: { db: { url: maintenanceDatabaseUrl } },
  });

  try {
    const rows = await admin.$queryRaw<Array<{ datname: string }>>`
      SELECT datname FROM pg_database WHERE datname = 'quizoo_test'
    `;
    if (rows.length === 0) {
      await admin.$executeRawUnsafe('CREATE DATABASE quizoo_test');
    }
  } finally {
    await admin.$disconnect();
  }

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
}
