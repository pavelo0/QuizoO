import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuizAssignmentsService } from './quiz-assignments.service';

function createPrismaMock() {
  return {
    user: { findUnique: jest.fn() },
    module: { findFirst: jest.fn() },
    quizAssignment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('QuizAssignmentsService', () => {
  let service: QuizAssignmentsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'USER' });
    service = new QuizAssignmentsService(prisma);
  });

  it('rejects an admin', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'ADMIN' });

    await expect(service.list('admin')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects a flashcard module', async () => {
    const create = jest.fn();
    prisma.quizAssignment.create = create;
    prisma.module.findFirst = jest.fn().mockResolvedValue({
      id: 'm1',
      title: 'Cards',
      type: ModuleType.FLASHCARD,
      _count: { questions: 0 },
    });

    await expect(
      service.create('u1', {
        moduleId: 'm1',
        deadline: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a quiz without questions', async () => {
    prisma.module.findFirst = jest.fn().mockResolvedValue({
      id: 'm1',
      title: 'Empty',
      type: ModuleType.QUIZ,
      _count: { questions: 0 },
    });

    await expect(
      service.create('u1', {
        moduleId: 'm1',
        deadline: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a deadline in the past', async () => {
    const findModule = jest.fn();
    prisma.module.findFirst = findModule;

    await expect(
      service.create('u1', {
        moduleId: 'm1',
        deadline: new Date(Date.now() - 60_000).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findModule).not.toHaveBeenCalled();
  });

  it('creates an assignment with a short code', async () => {
    prisma.module.findFirst = jest.fn().mockResolvedValue({
      id: 'm1',
      title: 'Biology',
      type: ModuleType.QUIZ,
      _count: { questions: 2 },
    });
    prisma.quizAssignment.create = jest
      .fn()
      .mockImplementation((args: { data: { code: string; deadline: Date } }) =>
        Promise.resolve({
          id: 'a1',
          code: args.data.code,
          moduleId: 'm1',
          deadline: args.data.deadline,
          createdAt: new Date('2026-11-06T12:00:00.000Z'),
          module: { title: 'Biology' },
          _count: { sessions: 0 },
        }),
      );

    const created = await service.create('u1', {
      moduleId: 'm1',
      deadline: '2026-12-01T18:00:00.000Z',
    });

    expect(created.code).toHaveLength(6);
    expect(created.moduleTitle).toBe('Biology');
    expect(created.attemptCount).toBe(0);
    expect(created.closed).toBe(false);
  });

  it('hides an unknown code', async () => {
    prisma.quizAssignment.findUnique = jest.fn().mockResolvedValue(null);

    await expect(service.findByCode('u1', 'zzzzzz')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('marks a past deadline as closed', async () => {
    prisma.quizAssignment.findUnique = jest.fn().mockResolvedValue({
      id: 'a1',
      code: 'AB23CD',
      deadline: new Date('2020-01-01T00:00:00.000Z'),
      module: {
        id: 'm1',
        title: 'Biology',
        _count: { questions: 3 },
      },
    });

    const found = await service.findByCode('u1', 'ab23cd');

    expect(found.closed).toBe(true);
    expect(found.questionCount).toBe(3);
  });

  it('does not show another author the journal', async () => {
    prisma.quizAssignment.findFirst = jest.fn().mockResolvedValue(null);

    await expect(service.getOne('u2', 'a1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects study after the deadline', async () => {
    prisma.quizAssignment.findFirst = jest.fn().mockResolvedValue({
      deadline: new Date('2020-01-01T00:00:00.000Z'),
    });

    await expect(service.assertOpen('a1', 'm1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
