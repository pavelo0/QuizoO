import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleType, Prisma, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

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

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(userId: string) {
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

  async getRecentActivity(userId: string, limit = 10) {
    const take = Math.min(Math.max(limit, 1), 30);
    const [flash, quiz] = await Promise.all([
      this.prisma.flashcardSession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take,
        include: {
          module: { select: { id: true, title: true, type: true } },
        },
      }),
      this.prisma.quizSession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take,
        include: {
          module: { select: { id: true, title: true, type: true } },
        },
      }),
    ]);

    type Row =
      | {
          kind: 'FLASHCARD_SESSION';
          at: Date;
          moduleId: string;
          moduleTitle: string;
          moduleType: ModuleType;
          knownCount: number;
          unknownCount: number;
          totalCards: number;
        }
      | {
          kind: 'QUIZ_SESSION';
          at: Date;
          moduleId: string;
          moduleTitle: string;
          moduleType: ModuleType;
          scorePercent: number;
          correctCount: number;
          totalQuestions: number;
        };

    const items: Row[] = [
      ...flash.map(
        (s): Row => ({
          kind: 'FLASHCARD_SESSION',
          at: s.completedAt!,
          moduleId: s.moduleId,
          moduleTitle: s.module.title,
          moduleType: s.module.type,
          knownCount: s.knownCount,
          unknownCount: s.unknownCount,
          totalCards: s.totalCards,
        }),
      ),
      ...quiz.map(
        (s): Row => ({
          kind: 'QUIZ_SESSION',
          at: s.completedAt!,
          moduleId: s.moduleId,
          moduleTitle: s.module.title,
          moduleType: s.module.type,
          scorePercent: s.scorePercent,
          correctCount: s.correctCount,
          totalQuestions: s.totalQuestions,
        }),
      ),
    ];

    items.sort((a, b) => b.at.getTime() - a.at.getTime());
    return items.slice(0, take).map((i) => ({
      ...i,
      at: i.at.toISOString(),
    }));
  }

  async listModules(userId: string) {
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

  async createModule(userId: string, body: CreateModuleDto) {
    const title = body.title.trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }
    if (!isModuleType(body.type)) {
      throw new BadRequestException('type must be FLASHCARD or QUIZ');
    }
    return this.prisma.module.create({
      data: {
        userId,
        title,
        description:
          body.description === undefined || body.description === null
            ? null
            : String(body.description),
        type: body.type,
      },
    });
  }

  async updateModule(userId: string, moduleId: string, body: UpdateModuleDto) {
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

  async createQuestion(
    userId: string,
    moduleId: string,
    body: {
      questionText?: string;
      type?: string;
      orderIndex?: number;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
    },
  ) {
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
      if (opts.length < 2) {
        throw new BadRequestException(
          'CHOICE questions require at least two options',
        );
      }
      const correct = opts.filter((o) => o.isCorrect).length;
      if (correct < 1) {
        throw new BadRequestException(
          'CHOICE questions require at least one correct option',
        );
      }
      for (const o of opts) {
        if (!o.text?.trim()) {
          throw new BadRequestException('Each option needs non-empty text');
        }
      }
      return this.prisma.question.create({
        data: {
          moduleId,
          questionText,
          type: QuestionType.CHOICE,
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
      if (pairs.length < 1) {
        throw new BadRequestException(
          'MATCHING questions require at least one pair',
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

    return this.prisma.question.create({
      data: {
        moduleId,
        questionText,
        type: QuestionType.TEXT,
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
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
    },
  ) {
    await this.assertQuizModule(moduleId, userId);
    const q = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
    });
    if (!q) {
      throw new NotFoundException('Question not found');
    }

    const nextType = body.type !== undefined ? body.type : q.type;
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
      await this.prisma.questionOption.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.deleteMany({ where: { questionId } });
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

    if (Object.keys(data).length > 0) {
      await this.prisma.question.update({
        where: { id: questionId },
        data,
      });
    }

    if (nextType === QuestionType.CHOICE && body.options !== undefined) {
      const opts = body.options;
      if (opts.length < 2) {
        throw new BadRequestException(
          'CHOICE questions require at least two options',
        );
      }
      const correct = opts.filter((o) => o.isCorrect).length;
      if (correct < 1) {
        throw new BadRequestException(
          'CHOICE questions require at least one correct option',
        );
      }
      for (const o of opts) {
        if (!o.text?.trim()) {
          throw new BadRequestException('Each option needs non-empty text');
        }
      }
      await this.prisma.questionOption.deleteMany({ where: { questionId } });
      await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      await this.prisma.questionOption.createMany({
        data: opts.map((o) => ({
          questionId,
          text: o.text!.trim(),
          isCorrect: Boolean(o.isCorrect),
        })),
      });
    }

    if (
      nextType === QuestionType.MATCHING &&
      body.matchingPairs !== undefined
    ) {
      const pairs = body.matchingPairs;
      if (pairs.length < 1) {
        throw new BadRequestException(
          'MATCHING questions require at least one pair',
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
      if (body.options !== undefined || body.matchingPairs !== undefined) {
        await this.prisma.questionOption.deleteMany({ where: { questionId } });
        await this.prisma.matchingPair.deleteMany({ where: { questionId } });
      }
    }

    return this.prisma.question.findFirst({
      where: { id: questionId },
      include: { questionOptions: true, matchingPairs: true },
    });
  }

  async deleteQuestion(userId: string, moduleId: string, questionId: string) {
    await this.assertQuizModule(moduleId, userId);
    const q = await this.prisma.question.findFirst({
      where: { id: questionId, moduleId },
    });
    if (!q) {
      throw new NotFoundException('Question not found');
    }
    await this.prisma.question.delete({ where: { id: questionId } });
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
    });
    if (!m) {
      throw new NotFoundException('Module not found');
    }
    if (m.type !== ModuleType.QUIZ) {
      throw new BadRequestException(
        'Questions can only be managed in QUIZ modules',
      );
    }
  }
}
