import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleType, Prisma, QuestionType } from '@prisma/client';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import {
  QUESTION_IMAGE_ALLOWED_MIMES,
  QUESTION_IMAGE_MAX_BYTES,
} from './question-image.constants';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {
  gradeTextAnswer,
  sanitizeAcceptedVariants,
} from './quiz/answer-normalizer';

function isModuleType(v: unknown): v is ModuleType {
  return v === ModuleType.FLASHCARD || v === ModuleType.QUIZ;
}

function isQuestionType(v: unknown): v is QuestionType {
  return (
    v === QuestionType.CHOICE ||
    v === QuestionType.TEXT ||
    v === QuestionType.MATCHING
  );
}

type ActivityKind = 'FLASHCARD_SESSION' | 'QUIZ_SESSION';
type ActivityCursor = {
  at: string;
  kind: ActivityKind;
  id: string;
};

function encodeActivityCursor(cursor: ActivityCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

function decodeActivityCursor(
  rawCursor: string | undefined,
): ActivityCursor | null {
  if (!rawCursor?.trim()) {
    return null;
  }
  try {
    const decoded = Buffer.from(rawCursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as Partial<ActivityCursor>;
    if (
      !parsed ||
      typeof parsed.at !== 'string' ||
      (parsed.kind !== 'FLASHCARD_SESSION' && parsed.kind !== 'QUIZ_SESSION') ||
      typeof parsed.id !== 'string' ||
      !parsed.id.trim()
    ) {
      throw new Error('Invalid cursor shape');
    }
    const date = new Date(parsed.at);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid cursor date');
    }
    return {
      at: date.toISOString(),
      kind: parsed.kind,
      id: parsed.id.trim(),
    };
  } catch {
    throw new BadRequestException('Invalid activity cursor');
  }
}

type RawActivityRow = {
  kind: ActivityKind;
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleType: ModuleType;
  at: Date;
  knownCount: number | null;
  unknownCount: number | null;
  totalCards: number | null;
  scorePercent: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
};

function validateChoiceOptions(
  options: Array<{ text?: string; isCorrect?: boolean }>,
  allowMultipleAnswers: boolean,
) {
  if (options.length < 2) {
    throw new BadRequestException(
      'CHOICE questions require at least two options',
    );
  }

  const correct = options.filter((o) => o.isCorrect).length;
  if (correct < 1) {
    throw new BadRequestException(
      'CHOICE questions require at least one correct option',
    );
  }
  if (!allowMultipleAnswers && correct !== 1) {
    throw new BadRequestException(
      'Single-choice questions require exactly one correct option',
    );
  }

  for (const o of options) {
    if (!o.text?.trim()) {
      throw new BadRequestException('Each option needs non-empty text');
    }
  }
}

@Injectable()
export class ModulesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await mkdir(this.questionImagesDir, { recursive: true });
  }

  private get questionImagesDir(): string {
    return join(process.cwd(), 'uploads', 'question-images');
  }

  private questionImageFilePath(questionId: string): string {
    return join(this.questionImagesDir, questionId);
  }

  private async ensureUniqueModuleTitle(
    userId: string,
    title: string,
    excludeModuleId?: string,
  ) {
    const existing = await this.prisma.module.findFirst({
      where: {
        userId,
        title: {
          equals: title,
          mode: 'insensitive',
        },
        ...(excludeModuleId ? { NOT: { id: excludeModuleId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Module title already exists');
    }
  }

  private async generateUniqueDefaultModuleTitle(
    userId: string,
    type: ModuleType,
  ) {
    const baseTitle =
      type === ModuleType.QUIZ ? 'New quiz module' : 'New module';
    const modules = await this.prisma.module.findMany({
      where: { userId, type },
      select: { title: true },
    });
    const used = new Set(modules.map((module) => module.title.toLowerCase()));
    if (!used.has(baseTitle.toLowerCase())) {
      return baseTitle;
    }
    let index = 1;
    while (used.has(`${baseTitle} ${index}`.toLowerCase())) {
      index += 1;
    }
    return `${baseTitle} ${index}`;
  }

  private async assertLearningModuleAccessAllowed(
    userId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admin cannot manage learning modules');
    }
  }

  async getDashboardSummary(userId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    const [totalModules, activeModules, flashAgg, quizAgg] = await Promise.all([
      this.prisma.module.count({ where: { userId } }),
      this.prisma.module.count({
        where: {
          userId,
          OR: [{ cards: { some: {} } }, { questions: { some: {} } }],
        },
      }),
      this.prisma.flashcardSession.aggregate({
        where: { userId, completedAt: { not: null } },
        _sum: {
          knownCount: true,
          unknownCount: true,
        },
      }),
      this.prisma.quizSession.aggregate({
        where: { userId, completedAt: { not: null } },
        _avg: { scorePercent: true },
      }),
    ]);

    const k = flashAgg._sum.knownCount ?? 0;
    const u = flashAgg._sum.unknownCount ?? 0;
    const cardsStudied = k + u;
    const averageQuizScore =
      quizAgg._avg.scorePercent != null
        ? Math.round(quizAgg._avg.scorePercent * 10) / 10
        : null;

    return {
      totalModules,
      activeModules,
      cardsStudied,
      averageQuizScore,
    };
  }

  async getRecentActivity(
    userId: string,
    args: { take?: number; cursor?: string } = {},
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    const take = Math.min(Math.max(args.take ?? 20, 1), 50);
    const cursor = decodeActivityCursor(args.cursor);
    const cursorDate = cursor ? new Date(cursor.at) : null;
    const limit = take + 1;
    const cursorFilterFlash =
      cursor && cursorDate
        ? Prisma.sql`AND (fs."completedAt", 'FLASHCARD_SESSION', fs.id) < (${cursorDate}, ${cursor.kind}, ${cursor.id})`
        : Prisma.empty;
    const cursorFilterQuiz =
      cursor && cursorDate
        ? Prisma.sql`AND (qs."completedAt", 'QUIZ_SESSION', qs.id) < (${cursorDate}, ${cursor.kind}, ${cursor.id})`
        : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RawActivityRow[]>(Prisma.sql`
      SELECT
        mixed.kind AS kind,
        mixed.id AS id,
        mixed."moduleId" AS "moduleId",
        mixed."moduleTitle" AS "moduleTitle",
        mixed."moduleType" AS "moduleType",
        mixed.at AS at,
        mixed."knownCount" AS "knownCount",
        mixed."unknownCount" AS "unknownCount",
        mixed."totalCards" AS "totalCards",
        mixed."scorePercent" AS "scorePercent",
        mixed."correctCount" AS "correctCount",
        mixed."totalQuestions" AS "totalQuestions"
      FROM (
        SELECT
          'FLASHCARD_SESSION'::text AS kind,
          fs.id AS id,
          fs."moduleId" AS "moduleId",
          m.title AS "moduleTitle",
          m.type AS "moduleType",
          fs."completedAt" AS at,
          fs."knownCount" AS "knownCount",
          fs."unknownCount" AS "unknownCount",
          fs."totalCards" AS "totalCards",
          NULL::double precision AS "scorePercent",
          NULL::int AS "correctCount",
          NULL::int AS "totalQuestions"
        FROM "flashcard_sessions" fs
        INNER JOIN "modules" m ON m.id = fs."moduleId"
        WHERE fs."userId" = ${userId}
          AND fs."completedAt" IS NOT NULL
          ${cursorFilterFlash}

        UNION ALL

        SELECT
          'QUIZ_SESSION'::text AS kind,
          qs.id AS id,
          qs."moduleId" AS "moduleId",
          m.title AS "moduleTitle",
          m.type AS "moduleType",
          qs."completedAt" AS at,
          NULL::int AS "knownCount",
          NULL::int AS "unknownCount",
          NULL::int AS "totalCards",
          qs."scorePercent" AS "scorePercent",
          qs."correctCount" AS "correctCount",
          qs."totalQuestions" AS "totalQuestions"
        FROM "quiz_sessions" qs
        INNER JOIN "modules" m ON m.id = qs."moduleId"
        WHERE qs."userId" = ${userId}
          AND qs."completedAt" IS NOT NULL
          ${cursorFilterQuiz}
      ) mixed
      ORDER BY mixed.at DESC, mixed.kind DESC, mixed.id DESC
      LIMIT ${limit}
    `);

    const pageRows = rows.slice(0, take);
    const items = pageRows.map((row) => {
      if (row.kind === 'FLASHCARD_SESSION') {
        return {
          kind: 'FLASHCARD_SESSION' as const,
          id: row.id,
          at: row.at.toISOString(),
          moduleId: row.moduleId,
          moduleTitle: row.moduleTitle,
          moduleType: row.moduleType,
          knownCount: Number(row.knownCount ?? 0),
          unknownCount: Number(row.unknownCount ?? 0),
          totalCards: Number(row.totalCards ?? 0),
        };
      }
      return {
        kind: 'QUIZ_SESSION' as const,
        id: row.id,
        at: row.at.toISOString(),
        moduleId: row.moduleId,
        moduleTitle: row.moduleTitle,
        moduleType: row.moduleType,
        scorePercent: Number(row.scorePercent ?? 0),
        correctCount: Number(row.correctCount ?? 0),
        totalQuestions: Number(row.totalQuestions ?? 0),
      };
    });

    const last = pageRows[pageRows.length - 1];
    return {
      items,
      nextCursor:
        rows.length > take && last
          ? encodeActivityCursor({
              at: last.at.toISOString(),
              kind: last.kind,
              id: last.id,
            })
          : null,
    };
  }

  async listModules(userId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    const modules = await this.prisma.module.findMany({
      where: { userId },
      include: {
        _count: { select: { cards: true, questions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const moduleIds = modules.map((m) => m.id);
    if (moduleIds.length === 0) {
      return [];
    }

    const [fcMax, qzMax] = await Promise.all([
      this.prisma.flashcardSession.groupBy({
        by: ['moduleId'],
        where: {
          userId,
          moduleId: { in: moduleIds },
          completedAt: { not: null },
        },
        _max: { completedAt: true },
      }),
      this.prisma.quizSession.groupBy({
        by: ['moduleId'],
        where: {
          userId,
          moduleId: { in: moduleIds },
          completedAt: { not: null },
        },
        _max: { completedAt: true },
      }),
    ]);

    const lastMap = new Map<string, Date>();
    for (const row of fcMax) {
      const d = row._max.completedAt;
      if (d) {
        const cur = lastMap.get(row.moduleId);
        if (!cur || d > cur) lastMap.set(row.moduleId, d);
      }
    }
    for (const row of qzMax) {
      const d = row._max.completedAt;
      if (d) {
        const cur = lastMap.get(row.moduleId);
        if (!cur || d > cur) lastMap.set(row.moduleId, d);
      }
    }

    return modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      cardCount: m._count.cards,
      questionCount: m._count.questions,
      lastStudiedAt: lastMap.get(m.id)?.toISOString() ?? null,
    }));
  }

  async getModule(userId: string, moduleId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    const mod = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
      include: {
        cards: { orderBy: { orderIndex: 'asc' } },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { questionOptions: true, matchingPairs: true },
        },
        _count: { select: { cards: true, questions: true } },
      },
    });
    if (!mod) {
      throw new NotFoundException('Module not found');
    }

    const { _count, ...rest } = mod;
    return {
      ...rest,
      cardCount: _count.cards,
      questionCount: _count.questions,
    };
  }

  async getQuizQuestionsPage(
    userId: string,
    moduleId: string,
    args: { take?: number; cursor?: string },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    const module = await this.assertQuizModule(moduleId, userId);
    const take = Math.min(Math.max(args.take ?? 20, 1), 50);
    const cursor = args.cursor?.trim() ? args.cursor.trim() : null;

    const total = await this.prisma.question.count({ where: { moduleId } });
    const items = await this.prisma.question.findMany({
      where: { moduleId },
      orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
      take,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: { questionOptions: true, matchingPairs: true },
    });

    return {
      moduleId: module.id,
      moduleTitle: module.title,
      total,
      items,
      nextCursor:
        items.length === take && items[items.length - 1]
          ? items[items.length - 1].id
          : null,
    };
  }

  async createModule(userId: string, body: CreateModuleDto) {
    await this.assertLearningModuleAccessAllowed(userId);
    const title = body.title.trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }
    if (!isModuleType(body.type)) {
      throw new BadRequestException('type must be FLASHCARD or QUIZ');
    }
    let resolvedTitle = title;
    const defaultTitle =
      body.type === ModuleType.QUIZ ? 'New quiz module' : 'New module';
    if (title === defaultTitle) {
      resolvedTitle = await this.generateUniqueDefaultModuleTitle(
        userId,
        body.type,
      );
    } else {
      await this.ensureUniqueModuleTitle(userId, title);
    }
    return this.prisma.module.create({
      data: {
        userId,
        title: resolvedTitle,
        description:
          body.description === undefined || body.description === null
            ? null
            : String(body.description),
        type: body.type,
      },
    });
  }

  async updateModule(userId: string, moduleId: string, body: UpdateModuleDto) {
    await this.assertLearningModuleAccessAllowed(userId);
    const existing = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Module not found');
    }

    if (body.type !== undefined) {
      if (!isModuleType(body.type)) {
        throw new BadRequestException('type must be FLASHCARD or QUIZ');
      }
      const nextType = body.type;
      if (nextType !== existing.type) {
        const counts = await this.prisma.module.findFirst({
          where: { id: moduleId },
          include: {
            _count: { select: { cards: true, questions: true } },
          },
        });
        const c = counts?._count.cards ?? 0;
        const q = counts?._count.questions ?? 0;
        if (c > 0 || q > 0) {
          throw new BadRequestException(
            'Cannot change module type while it has cards or questions',
          );
        }
      }
    }

    const data: Prisma.ModuleUpdateInput = {};
    if (body.title !== undefined) {
      const t = body.title.trim();
      if (!t) {
        throw new BadRequestException('title cannot be empty');
      }
      await this.ensureUniqueModuleTitle(userId, t, moduleId);
      data.title = t;
    }
    if (body.description !== undefined) {
      data.description =
        body.description === null ? null : String(body.description);
    }
    if (body.type !== undefined) {
      data.type = body.type;
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    return this.prisma.module.update({
      where: { id: moduleId },
      data,
    });
  }

  async deleteModule(userId: string, moduleId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    const existing = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Module not found');
    }
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { ok: true as const };
  }

  async createCard(
    userId: string,
    moduleId: string,
    body: { question?: string; answer?: string; orderIndex?: number },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertFlashcardModule(moduleId, userId);
    if (!body.question?.trim() || !body.answer?.trim()) {
      throw new BadRequestException('question and answer are required');
    }
    return this.prisma.card.create({
      data: {
        moduleId,
        question: body.question.trim(),
        answer: body.answer.trim(),
        orderIndex: body.orderIndex ?? 0,
      },
    });
  }

  async updateCard(
    userId: string,
    moduleId: string,
    cardId: string,
    body: { question?: string; answer?: string; orderIndex?: number },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertFlashcardModule(moduleId, userId);
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, moduleId },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    const data: Prisma.CardUpdateInput = {};
    if (body.question !== undefined) {
      const q = body.question.trim();
      if (!q) throw new BadRequestException('question cannot be empty');
      data.question = q;
    }
    if (body.answer !== undefined) {
      const a = body.answer.trim();
      if (!a) throw new BadRequestException('answer cannot be empty');
      data.answer = a;
    }
    if (body.orderIndex !== undefined) {
      data.orderIndex = body.orderIndex;
    }
    if (Object.keys(data).length === 0) {
      return card;
    }
    return this.prisma.card.update({ where: { id: cardId }, data });
  }

  async deleteCard(userId: string, moduleId: string, cardId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertFlashcardModule(moduleId, userId);
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, moduleId },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    await this.prisma.card.delete({ where: { id: cardId } });
    return { ok: true as const };
  }

  async createFlashcardSession(
    userId: string,
    moduleId: string,
    body: { totalCards?: number; knownCount?: number; unknownCount?: number },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertFlashcardModule(moduleId, userId);
    const totalCards = Number(body.totalCards ?? 0);
    const knownCount = Number(body.knownCount ?? 0);
    const unknownCount = Number(body.unknownCount ?? 0);

    if (![totalCards, knownCount, unknownCount].every(Number.isFinite)) {
      throw new BadRequestException('Session counters must be valid numbers');
    }
    if (totalCards < 1) {
      throw new BadRequestException('totalCards must be greater than zero');
    }
    if (knownCount < 0 || unknownCount < 0) {
      throw new BadRequestException(
        'knownCount and unknownCount cannot be negative',
      );
    }
    if (knownCount + unknownCount !== totalCards) {
      throw new BadRequestException(
        'knownCount + unknownCount must equal totalCards',
      );
    }

    return this.prisma.flashcardSession.create({
      data: {
        userId,
        moduleId,
        totalCards,
        knownCount,
        unknownCount,
        completedAt: new Date(),
      },
    });
  }

  async createQuizSession(
    userId: string,
    moduleId: string,
    body: {
      answers?: Array<{
        questionId?: string;
        choiceOptionId?: string | null;
        choiceOptionIds?: string[] | null;
        textAnswer?: string | null;
        matchingAnswer?: Record<string, string> | null;
      }>;
    },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const answers = body.answers ?? [];
    if (!Array.isArray(answers)) {
      throw new BadRequestException('answers must be an array');
    }
    if (answers.length < 1) {
      throw new BadRequestException('answers cannot be empty');
    }

    const questionIds = Array.from(
      new Set(
        answers
          .map((a) => (a.questionId ?? '').trim())
          .filter((id) => id.length > 0),
      ),
    );
    if (questionIds.length !== answers.length) {
      throw new BadRequestException('Each answer must have a questionId');
    }

    const questions = await this.prisma.question.findMany({
      where: { moduleId, id: { in: questionIds } },
      include: { questionOptions: true, matchingPairs: true },
    });
    if (questions.length !== questionIds.length) {
      throw new BadRequestException(
        'Some questions do not belong to this module',
      );
    }
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const normalizedAnswers = answers.map((a) => {
      const q = questionById.get(a.questionId!);
      if (!q) {
        throw new BadRequestException('Invalid questionId');
      }

      let isCorrect = false;
      let userAnswer: string | null = null;

      if (q.type === QuestionType.CHOICE) {
        const optionIds = Array.isArray(a.choiceOptionIds)
          ? a.choiceOptionIds
          : a.choiceOptionId
            ? [a.choiceOptionId]
            : [];
        const selectedIds = Array.from(
          new Set(
            optionIds
              .map((id) => String(id ?? '').trim())
              .filter((id) => id.length > 0),
          ),
        );

        if (selectedIds.length < 1) {
          isCorrect = false;
          userAnswer = null;
        } else {
          const optionsById = new Map(q.questionOptions.map((o) => [o.id, o]));
          if (selectedIds.some((id) => !optionsById.has(id))) {
            throw new BadRequestException(
              'choiceOptionId must belong to the question',
            );
          }

          const correctIds = q.questionOptions
            .filter((o) => o.isCorrect)
            .map((o) => o.id);

          if (q.allowMultipleAnswers) {
            const selectedSorted = [...selectedIds].sort();
            const correctSorted = [...correctIds].sort();
            isCorrect =
              selectedSorted.length === correctSorted.length &&
              selectedSorted.every((id, idx) => id === correctSorted[idx]);
            userAnswer = JSON.stringify({ choiceOptionIds: selectedSorted });
          } else {
            const selected = selectedIds[0] ?? '';
            isCorrect =
              selectedIds.length === 1 && correctIds.includes(selected);
            userAnswer = JSON.stringify({ choiceOptionId: selected });
          }
        }
      } else if (q.type === QuestionType.TEXT) {
        const raw = a.textAnswer ?? '';
        const correct = q.questionOptions.find((o) => o.isCorrect)?.text ?? '';
        const grade = gradeTextAnswer(
          String(raw),
          correct,
          q.acceptedVariants ?? [],
        );
        isCorrect = grade.isCorrect;
        userAnswer = JSON.stringify({ textAnswer: grade.normalizedUserInput });
      } else if (q.type === QuestionType.MATCHING) {
        const map = a.matchingAnswer ?? null;
        if (!map || typeof map !== 'object') {
          isCorrect = false;
          userAnswer = null;
        } else {
          const allPairs = q.matchingPairs;
          const matchingAnswerMap = map as Record<string, unknown>;
          const entries = allPairs.map((p) => {
            const rawValue = matchingAnswerMap[p.id];
            const value = typeof rawValue === 'string' ? rawValue : '';
            return [p.id, value] as const;
          });
          const allAnswered = entries.every(([, v]) => v.length > 0);
          isCorrect =
            allAnswered &&
            entries.every(([leftId, rightId]) => rightId === leftId);
          userAnswer = JSON.stringify({
            matchingAnswer: Object.fromEntries(entries),
          });
        }
      } else {
        throw new BadRequestException('Unsupported question type');
      }

      return {
        questionId: q.id,
        userAnswer,
        isCorrect,
      };
    });

    const correctCount = normalizedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = normalizedAnswers.length;
    const scorePercent =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizSession.create({
        data: {
          userId,
          moduleId,
          totalQuestions,
          correctCount,
          scorePercent,
          completedAt: new Date(),
          answers: {
            create: normalizedAnswers.map((a) => ({
              questionId: a.questionId,
              userAnswer: a.userAnswer,
              isCorrect: a.isCorrect,
            })),
          },
        },
      });
      return created;
    });

    return this.getQuizSession(userId, moduleId, session.id);
  }

  async getQuizSession(userId: string, moduleId: string, sessionId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const sess = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, userId, moduleId },
      include: {
        answers: {
          include: {
            question: {
              include: { questionOptions: true, matchingPairs: true },
            },
          },
          orderBy: { questionId: 'asc' },
        },
        module: { select: { id: true, title: true } },
      },
    });
    if (!sess) {
      throw new NotFoundException('Quiz session not found');
    }

    return {
      id: sess.id,
      userId: sess.userId,
      moduleId: sess.moduleId,
      moduleTitle: sess.module.title,
      totalQuestions: sess.totalQuestions,
      correctCount: sess.correctCount,
      scorePercent: Math.round(sess.scorePercent * 10) / 10,
      completedAt: sess.completedAt?.toISOString() ?? null,
      answers: sess.answers.map((a) => ({
        id: a.id,
        questionId: a.questionId,
        isCorrect: a.isCorrect,
        userAnswer: a.userAnswer ? (JSON.parse(a.userAnswer) as unknown) : null,
        question: a.question,
      })),
    };
  }

  async createQuestion(
    userId: string,
    moduleId: string,
    body: {
      questionText?: string;
      type?: string;
      allowMultipleAnswers?: boolean;
      orderIndex?: number;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
      acceptedVariants?: string[];
    },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    if (!body.questionText?.trim()) {
      throw new BadRequestException('questionText is required');
    }
    if (!isQuestionType(body.type)) {
      throw new BadRequestException('type must be CHOICE, TEXT, or MATCHING');
    }

    const orderIndex = body.orderIndex ?? 0;
    const questionText = body.questionText.trim();

    if (body.type === QuestionType.CHOICE) {
      const opts = body.options ?? [];
      const allowMultipleAnswers = Boolean(body.allowMultipleAnswers);
      validateChoiceOptions(opts, allowMultipleAnswers);
      return this.prisma.question.create({
        data: {
          moduleId,
          questionText,
          type: QuestionType.CHOICE,
          allowMultipleAnswers,
          orderIndex,
          questionOptions: {
            create: opts.map((o) => ({
              text: o.text!.trim(),
              isCorrect: Boolean(o.isCorrect),
            })),
          },
        },
        include: { questionOptions: true, matchingPairs: true },
      });
    }

    if (body.type === QuestionType.MATCHING) {
      const pairs = body.matchingPairs ?? [];
      if (pairs.length < 2) {
        throw new BadRequestException(
          'MATCHING questions require at least two pairs',
        );
      }
      for (const p of pairs) {
        if (!p.leftItem?.trim() || !p.rightItem?.trim()) {
          throw new BadRequestException(
            'Each matching pair needs leftItem and rightItem',
          );
        }
      }
      return this.prisma.question.create({
        data: {
          moduleId,
          questionText,
          type: QuestionType.MATCHING,
          allowMultipleAnswers: false,
          orderIndex,
          matchingPairs: {
            create: pairs.map((p) => ({
              leftItem: p.leftItem!.trim(),
              rightItem: p.rightItem!.trim(),
            })),
          },
        },
        include: { questionOptions: true, matchingPairs: true },
      });
    }

    if (body.type === QuestionType.TEXT) {
      const opts = body.options ?? [];
      if (opts.length < 1) {
        throw new BadRequestException(
          'TEXT questions require one correct text answer',
        );
      }
      const normalized = opts.map((o) => ({
        text: o.text?.trim() ?? '',
        isCorrect: Boolean(o.isCorrect),
      }));
      if (normalized.length !== 1) {
        throw new BadRequestException(
          'TEXT questions require exactly one answer option',
        );
      }
      if (!normalized[0].text) {
        throw new BadRequestException('TEXT answer cannot be empty');
      }
      if (!normalized[0].isCorrect) {
        throw new BadRequestException(
          'TEXT answer option must be marked as correct',
        );
      }
      const acceptedVariants = sanitizeAcceptedVariants(
        body.acceptedVariants,
        normalized[0].text,
      );
      return this.prisma.question.create({
        data: {
          moduleId,
          questionText,
          type: QuestionType.TEXT,
          allowMultipleAnswers: false,
          orderIndex,
          acceptedVariants,
          questionOptions: {
            create: [
              {
                text: normalized[0].text,
                isCorrect: true,
              },
            ],
          },
        },
        include: { questionOptions: true, matchingPairs: true },
      });
    }

    return this.prisma.question.create({
      data: {
        moduleId,
        questionText,
        type: body.type,
        allowMultipleAnswers: false,
        orderIndex,
      },
      include: { questionOptions: true, matchingPairs: true },
    });
  }

  async updateQuestion(
    userId: string,
    moduleId: string,
    questionId: string,
    body: {
      questionText?: string;
      orderIndex?: number;
      type?: string;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
      acceptedVariants?: string[];
    },
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const q = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
      include: { questionOptions: true },
    });
    if (!q) {
      throw new NotFoundException('Question not found');
    }

    const nextType = body.type !== undefined ? body.type : q.type;
    const nextAllowMultipleAnswers =
      nextType === QuestionType.CHOICE
        ? (body.allowMultipleAnswers ?? q.allowMultipleAnswers)
        : false;
    if (body.type !== undefined && !isQuestionType(body.type)) {
      throw new BadRequestException('type must be CHOICE, TEXT, or MATCHING');
    }

    if (body.type !== undefined && body.type !== q.type) {
      if (body.type === QuestionType.CHOICE && body.options === undefined) {
        throw new BadRequestException(
          'When changing type to CHOICE, options are required',
        );
      }
      if (
        body.type === QuestionType.MATCHING &&
        body.matchingPairs === undefined
      ) {
        throw new BadRequestException(
          'When changing type to MATCHING, matchingPairs are required',
        );
      }
      if (body.type === QuestionType.TEXT && body.options === undefined) {
        throw new BadRequestException(
          'When changing type to TEXT, one correct answer option is required',
        );
      }
      await this.prisma.questionOption.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      if (body.type !== QuestionType.TEXT) {
        await this.prisma.question.update({
          where: { id: questionId },
          data: { acceptedVariants: [] },
        });
      }
    }

    const data: Prisma.QuestionUpdateInput = {};
    if (body.questionText !== undefined) {
      const t = body.questionText.trim();
      if (!t) throw new BadRequestException('questionText cannot be empty');
      data.questionText = t;
    }
    if (body.orderIndex !== undefined) {
      data.orderIndex = body.orderIndex;
    }
    if (body.type !== undefined) {
      data.type = body.type;
    }
    if (body.allowMultipleAnswers !== undefined || body.type !== undefined) {
      data.allowMultipleAnswers = nextAllowMultipleAnswers;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.question.update({
        where: { id: questionId },
        data,
      });
    }

    if (nextType === QuestionType.CHOICE && body.options !== undefined) {
      const opts = body.options;
      validateChoiceOptions(opts, nextAllowMultipleAnswers);
      await this.prisma.questionOption.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      await this.prisma.questionOption.createMany({
        data: opts.map((o) => ({
          questionId,
          text: o.text!.trim(),
          isCorrect: Boolean(o.isCorrect),
        })),
      });
    } else if (
      nextType === QuestionType.CHOICE &&
      body.allowMultipleAnswers !== undefined
    ) {
      const existingOptions = q.questionOptions.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      }));
      validateChoiceOptions(existingOptions, nextAllowMultipleAnswers);
    }

    if (
      nextType === QuestionType.MATCHING &&
      body.matchingPairs !== undefined
    ) {
      const pairs = body.matchingPairs;
      if (pairs.length < 2) {
        throw new BadRequestException(
          'MATCHING questions require at least two pairs',
        );
      }
      for (const p of pairs) {
        if (!p.leftItem?.trim() || !p.rightItem?.trim()) {
          throw new BadRequestException(
            'Each matching pair needs leftItem and rightItem',
          );
        }
      }
      await this.prisma.questionOption.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.createMany({
        data: pairs.map((p) => ({
          questionId,
          leftItem: p.leftItem!.trim(),
          rightItem: p.rightItem!.trim(),
        })),
      });
    }

    if (nextType === QuestionType.TEXT) {
      if (body.options !== undefined) {
        const normalized = body.options.map((o) => ({
          text: o.text?.trim() ?? '',
          isCorrect: Boolean(o.isCorrect),
        }));
        if (normalized.length !== 1) {
          throw new BadRequestException(
            'TEXT questions require exactly one answer option',
          );
        }
        if (!normalized[0].text) {
          throw new BadRequestException('TEXT answer cannot be empty');
        }
        if (!normalized[0].isCorrect) {
          throw new BadRequestException(
            'TEXT answer option must be marked as correct',
          );
        }
        await this.prisma.questionOption.deleteMany({ where: { questionId } });
        await this.prisma.matchingPair.deleteMany({ where: { questionId } });
        await this.prisma.questionOption.create({
          data: {
            questionId,
            text: normalized[0].text,
            isCorrect: true,
          },
        });
        const variantsInput =
          body.acceptedVariants !== undefined
            ? body.acceptedVariants
            : q.acceptedVariants;
        await this.prisma.question.update({
          where: { id: questionId },
          data: {
            acceptedVariants: sanitizeAcceptedVariants(
              variantsInput,
              normalized[0].text,
            ),
          },
        });
      } else if (body.acceptedVariants !== undefined) {
        const canonical =
          q.questionOptions.find((o) => o.isCorrect)?.text ?? '';
        if (!canonical) {
          throw new BadRequestException(
            'TEXT questions require one correct text answer',
          );
        }
        await this.prisma.question.update({
          where: { id: questionId },
          data: {
            acceptedVariants: sanitizeAcceptedVariants(
              body.acceptedVariants,
              canonical,
            ),
          },
        });
      } else if (body.matchingPairs !== undefined) {
        await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      }
    }

    return this.prisma.question.findFirst({
      where: { id: questionId },
      include: { questionOptions: true, matchingPairs: true },
    });
  }

  async deleteQuestion(userId: string, moduleId: string, questionId: string) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const q = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
    });
    if (!q) {
      throw new NotFoundException('Question not found');
    }
    if (q.questionImageMime) {
      try {
        await unlink(this.questionImageFilePath(questionId));
      } catch {
        // file may already be missing
      }
    }
    await this.prisma.question.delete({ where: { id: questionId } });
    return { ok: true as const };
  }

  async saveQuestionImage(
    userId: string,
    moduleId: string,
    questionId: string,
    buffer: Buffer,
    mime: string,
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const question = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
      select: { id: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (buffer.length > QUESTION_IMAGE_MAX_BYTES) {
      throw new BadRequestException(
        `Image must be at most ${QUESTION_IMAGE_MAX_BYTES / (1024 * 1024)} MB`,
      );
    }
    if (!(QUESTION_IMAGE_ALLOWED_MIMES as readonly string[]).includes(mime)) {
      throw new BadRequestException('Allowed formats: JPEG, PNG, or WebP');
    }
    await writeFile(this.questionImageFilePath(questionId), buffer);
    await this.prisma.question.update({
      where: { id: questionId },
      data: { questionImageMime: mime },
    });
    return this.prisma.question.findFirst({
      where: { id: questionId },
      include: { questionOptions: true, matchingPairs: true },
    });
  }

  async getQuestionImageForDownload(
    userId: string,
    moduleId: string,
    questionId: string,
  ): Promise<{ path: string; mime: string } | null> {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const question = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
      select: { questionImageMime: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (!question.questionImageMime) {
      return null;
    }
    return {
      path: this.questionImageFilePath(questionId),
      mime: question.questionImageMime,
    };
  }

  async clearQuestionImage(
    userId: string,
    moduleId: string,
    questionId: string,
  ) {
    await this.assertLearningModuleAccessAllowed(userId);
    await this.assertQuizModule(moduleId, userId);
    const question = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
      select: { id: true, questionImageMime: true },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (question.questionImageMime) {
      try {
        await unlink(this.questionImageFilePath(questionId));
      } catch {
        // file may already be missing
      }
    }
    await this.prisma.question.update({
      where: { id: questionId },
      data: { questionImageMime: null },
    });
    return { ok: true as const };
  }

  private async assertFlashcardModule(moduleId: string, userId: string) {
    const m = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
    });
    if (!m) {
      throw new NotFoundException('Module not found');
    }
    if (m.type !== ModuleType.FLASHCARD) {
      throw new BadRequestException(
        'Cards can only be managed in FLASHCARD modules',
      );
    }
  }

  private async assertQuizModule(moduleId: string, userId: string) {
    const m = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
      select: { id: true, title: true, type: true },
    });
    if (!m) {
      throw new NotFoundException('Module not found');
    }
    if (m.type !== ModuleType.QUIZ) {
      throw new BadRequestException(
        'Questions can only be managed in QUIZ modules',
      );
    }
    return m;
  }
}
