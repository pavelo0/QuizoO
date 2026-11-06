import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleType, Prisma, XpActivity } from '@prisma/client';
import { randomBytes } from 'crypto';
import { ExperienceService } from '../experience/experience.service';
import { ASSIGNMENT_POINTS } from '../experience/experience.math';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizAssignmentDto } from './dto/create-quiz-assignment.dto';
import {
  ASSIGNMENT_CODE_ALPHABET,
  ASSIGNMENT_CODE_LENGTH,
  ASSIGNMENT_MAX_DEADLINE_DAYS,
} from './quiz-assignment.constants';

export type QuizAssignmentSummary = {
  id: string;
  code: string;
  moduleId: string;
  moduleTitle: string;
  deadline: string;
  createdAt: string;
  attemptCount: number;
  closed: boolean;
};

export type QuizAssignmentAttempt = {
  id: string;
  userId: string;
  username: string | null;
  email: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  completedAt: string | null;
};

export type QuizAssignmentDetail = QuizAssignmentSummary & {
  attempts: QuizAssignmentAttempt[];
};

export type QuizAssignmentJoin = {
  id: string;
  code: string;
  moduleId: string;
  moduleTitle: string;
  deadline: string;
  questionCount: number;
  closed: boolean;
};

function isClosed(deadline: Date, now = new Date()): boolean {
  return deadline.getTime() <= now.getTime();
}

export function normalizeAssignmentCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function randomCode(): string {
  const bytes = randomBytes(ASSIGNMENT_CODE_LENGTH);
  let code = '';
  for (let index = 0; index < ASSIGNMENT_CODE_LENGTH; index += 1) {
    const alphabetIndex = bytes[index] % ASSIGNMENT_CODE_ALPHABET.length;
    code += ASSIGNMENT_CODE_ALPHABET[alphabetIndex];
  }
  return code;
}

function parseDeadline(raw: string): Date {
  const deadline = new Date(raw);
  if (Number.isNaN(deadline.getTime())) {
    throw new BadRequestException('deadline is invalid');
  }
  const now = Date.now();
  if (deadline.getTime() <= now) {
    throw new BadRequestException('deadline must be in the future');
  }
  const max = now + ASSIGNMENT_MAX_DEADLINE_DAYS * 24 * 60 * 60 * 1000;
  if (deadline.getTime() > max) {
    throw new BadRequestException('deadline is too far in the future');
  }
  return deadline;
}

@Injectable()
export class QuizAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly experience: ExperienceService,
  ) {}

  async list(userId: string): Promise<QuizAssignmentSummary[]> {
    await this.assertLearner(userId);
    const rows = await this.prisma.quizAssignment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        module: { select: { title: true } },
        _count: { select: { sessions: true } },
      },
    });
    return rows.map((row) => this.toSummary(row));
  }

  async create(
    userId: string,
    body: CreateQuizAssignmentDto,
  ): Promise<QuizAssignmentSummary> {
    await this.assertLearner(userId);
    const moduleId = body.moduleId.trim();
    const deadline = parseDeadline(body.deadline);
    const module = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
      select: {
        id: true,
        title: true,
        type: true,
        _count: { select: { questions: true } },
      },
    });
    if (!module) {
      throw new NotFoundException('Module not found');
    }
    if (module.type !== ModuleType.QUIZ) {
      throw new BadRequestException('Only quiz modules can have an assignment');
    }
    if (module._count.questions < 1) {
      throw new BadRequestException('Quiz has no questions');
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const created = await this.prisma.quizAssignment.create({
          data: {
            userId,
            moduleId: module.id,
            code: randomCode(),
            deadline,
          },
          include: {
            module: { select: { title: true } },
            _count: { select: { sessions: true } },
          },
        });
        await this.experience.record(this.prisma, {
          userId,
          activity: XpActivity.ASSIGNMENT,
          sourceId: created.id,
          points: ASSIGNMENT_POINTS,
        });
        return this.toSummary(created);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('Could not allocate an assignment code');
  }

  async getOne(
    userId: string,
    assignmentId: string,
  ): Promise<QuizAssignmentDetail> {
    await this.assertLearner(userId);
    const row = await this.prisma.quizAssignment.findFirst({
      where: { id: assignmentId, userId },
      include: {
        module: { select: { title: true } },
        sessions: {
          orderBy: { completedAt: 'desc' },
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    return {
      ...this.toSummary({
        ...row,
        _count: { sessions: row.sessions.length },
      }),
      attempts: row.sessions.map((session) => ({
        id: session.id,
        userId: session.user.id,
        username: session.user.username,
        email: session.user.email,
        correctCount: session.correctCount,
        totalQuestions: session.totalQuestions,
        scorePercent: Math.round(session.scorePercent * 10) / 10,
        completedAt: session.completedAt?.toISOString() ?? null,
      })),
    };
  }

  async remove(userId: string, assignmentId: string) {
    await this.assertLearner(userId);
    const row = await this.prisma.quizAssignment.findFirst({
      where: { id: assignmentId, userId },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    await this.prisma.quizAssignment.delete({ where: { id: row.id } });
    return { ok: true as const };
  }

  async findByCode(
    userId: string,
    rawCode: string,
  ): Promise<QuizAssignmentJoin> {
    await this.assertLearner(userId);
    const code = normalizeAssignmentCode(rawCode);
    if (code.length !== ASSIGNMENT_CODE_LENGTH) {
      throw new NotFoundException('Assignment not found');
    }
    const row = await this.prisma.quizAssignment.findUnique({
      where: { code },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    return {
      id: row.id,
      code: row.code,
      moduleId: row.module.id,
      moduleTitle: row.module.title,
      deadline: row.deadline.toISOString(),
      questionCount: row.module._count.questions,
      closed: isClosed(row.deadline),
    };
  }

  async assertOpen(assignmentId: string, moduleId: string): Promise<void> {
    const row = await this.prisma.quizAssignment.findFirst({
      where: { id: assignmentId, moduleId },
      select: { deadline: true },
    });
    if (!row) {
      throw new NotFoundException('Assignment not found');
    }
    if (isClosed(row.deadline)) {
      throw new ForbiddenException('Assignment deadline has passed');
    }
  }

  private toSummary(row: {
    id: string;
    code: string;
    moduleId: string;
    deadline: Date;
    createdAt: Date;
    module: { title: string };
    _count: { sessions: number };
  }): QuizAssignmentSummary {
    return {
      id: row.id,
      code: row.code,
      moduleId: row.moduleId,
      moduleTitle: row.module.title,
      deadline: row.deadline.toISOString(),
      createdAt: row.createdAt.toISOString(),
      attemptCount: row._count.sessions,
      closed: isClosed(row.deadline),
    };
  }

  private async assertLearner(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admin cannot manage quiz assignments');
    }
  }
}
