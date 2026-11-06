import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StudySetsService } from './study-sets.service';

function createPrismaMock() {
  return {
    user: { findUnique: jest.fn() },
    studySet: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studySetModule: {
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    module: { findFirst: jest.fn() },
    flashcardSession: { findMany: jest.fn() },
    quizSession: { findMany: jest.fn() },
  } as unknown as PrismaService;
}

const createdAt = new Date('2026-11-01T00:00:00.000Z');
const updatedAt = new Date('2026-11-02T00:00:00.000Z');

function detailSet(
  items: Array<{
    moduleId: string;
    title: string;
    type: ModuleType;
    orderIndex: number;
  }>,
) {
  return {
    id: 's1',
    userId: 'u1',
    title: 'Biology',
    createdAt,
    updatedAt,
    items: items.map((item) => ({
      setId: 's1',
      moduleId: item.moduleId,
      orderIndex: item.orderIndex,
      module: {
        id: item.moduleId,
        title: item.title,
        type: item.type,
      },
    })),
  };
}

describe('StudySetsService', () => {
  let service: StudySetsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'USER' });
    prisma.flashcardSession.findMany = jest.fn().mockResolvedValue([]);
    prisma.quizSession.findMany = jest.fn().mockResolvedValue([]);
    service = new StudySetsService(prisma);
  });

  it('rejects an admin', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'ADMIN' });

    await expect(service.list('admin')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns 0 progress for an empty set', async () => {
    prisma.studySet.findMany = jest.fn().mockResolvedValue([
      {
        id: 's1',
        title: 'Empty',
        createdAt,
        updatedAt,
        items: [],
      },
    ]);

    const findSessions = jest.fn().mockResolvedValue([]);
    prisma.flashcardSession.findMany = findSessions;

    const rows = await service.list('u1');

    expect(rows[0]).toMatchObject({
      moduleCount: 0,
      studiedCount: 0,
      progress: 0,
    });
    expect(findSessions).not.toHaveBeenCalled();
  });

  it('counts a module as studied after one completed session', async () => {
    prisma.studySet.findMany = jest.fn().mockResolvedValue([
      {
        id: 's1',
        title: 'Exam',
        createdAt,
        updatedAt,
        items: [{ moduleId: 'm1' }, { moduleId: 'm2' }],
      },
    ]);
    prisma.flashcardSession.findMany = jest
      .fn()
      .mockResolvedValue([{ moduleId: 'm1' }]);

    const rows = await service.list('u1');

    expect(rows[0]).toMatchObject({
      moduleCount: 2,
      studiedCount: 1,
      progress: 50,
    });
  });

  it('hides another user set', async () => {
    prisma.studySet.findFirst = jest.fn().mockResolvedValue(null);

    await expect(service.getOne('u1', 'foreign')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('does not insert a module that is already in the set', async () => {
    prisma.studySet.findFirst = jest
      .fn()
      .mockResolvedValueOnce({ id: 's1', userId: 'u1' })
      .mockResolvedValueOnce(
        detailSet([
          {
            moduleId: 'm1',
            title: 'Cells',
            type: ModuleType.FLASHCARD,
            orderIndex: 0,
          },
        ]),
      );
    prisma.module.findFirst = jest.fn().mockResolvedValue({ id: 'm1' });
    prisma.studySetModule.findUnique = jest
      .fn()
      .mockResolvedValue({ setId: 's1', moduleId: 'm1' });
    const createMembership = jest.fn();
    prisma.studySetModule.create = createMembership;

    const detail = await service.addModule('u1', 's1', { moduleId: 'm1' });

    expect(createMembership).not.toHaveBeenCalled();
    expect(detail.modules).toHaveLength(1);
  });

  it('rejects a module owned by someone else', async () => {
    prisma.studySet.findFirst = jest
      .fn()
      .mockResolvedValue({ id: 's1', userId: 'u1' });
    prisma.module.findFirst = jest.fn().mockResolvedValue(null);
    const createMembership = jest.fn();
    prisma.studySetModule.create = createMembership;

    await expect(
      service.addModule('u1', 's1', { moduleId: 'foreign' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(createMembership).not.toHaveBeenCalled();
  });
});
