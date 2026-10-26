import { PrismaService } from '../../src/prisma/prisma.service';
import { assertTestDatabase } from './env';

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  assertTestDatabase();
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "quiz_answers",
      "quiz_sessions",
      "flashcard_sessions",
      "ordering_items",
      "matching_pairs",
      "question_options",
      "questions",
      "cards",
      "modules",
      "users"
    RESTART IDENTITY CASCADE
  `);
}
