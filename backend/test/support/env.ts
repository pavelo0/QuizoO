import { config as loadDotenv } from 'dotenv';
import path from 'node:path';

const backendRoot = path.resolve(__dirname, '../..');
const TEST_DATABASE_NAME = 'quizoo_test';
const DEFAULT_DATABASE_URL =
  'postgresql://quizoo_user:quizoo_pass@localhost:5432/quizoo?schema=public';

let ready = false;
let maintenanceDatabaseUrl = DEFAULT_DATABASE_URL;

export function loadTestEnv(): {
  testDatabaseUrl: string;
  maintenanceDatabaseUrl: string;
} {
  if (ready && process.env.DATABASE_URL) {
    return {
      testDatabaseUrl: process.env.DATABASE_URL,
      maintenanceDatabaseUrl,
    };
  }

  loadDotenv({
    path: path.resolve(backendRoot, '.env'),
    quiet: true,
  });

  const configured = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  maintenanceDatabaseUrl = configured;
  const testDatabaseUrl = replaceDatabaseName(configured, TEST_DATABASE_NAME);
  assertDatabaseName(testDatabaseUrl, TEST_DATABASE_NAME);

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET ||=
    'e2e-test-jwt-secret-do-not-use-in-production-0123456789';
  process.env.AUTH_FRONTEND_URL = 'https://localhost';
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
  process.env.GOOGLE_REDIRECT_URI =
    'https://localhost/api/auth/google/callback';

  ready = true;
  return { testDatabaseUrl, maintenanceDatabaseUrl };
}

export function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? '';
  assertDatabaseName(url, TEST_DATABASE_NAME);
}

function assertDatabaseName(raw: string, expected: string): void {
  const name = databaseName(raw);
  if (name !== expected) {
    throw new Error(
      `Refusing to use database "${name}". API tests only run against ${expected}.`,
    );
  }
}

function replaceDatabaseName(raw: string, database: string): string {
  const url = new URL(raw);
  url.pathname = `/${database}`;
  return url.toString();
}

function databaseName(raw: string): string {
  return new URL(raw).pathname.replace(/^\//, '');
}

loadTestEnv();
