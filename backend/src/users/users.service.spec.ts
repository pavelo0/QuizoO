import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

function createPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    flashcardSession: {
      groupBy: jest.fn(),
    },
    quizSession: {
      groupBy: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('UsersService (русские сценарии)', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createPrismaMock();
    service = new UsersService(prisma);
  });

  describe('deleteModuleForAdmin', () => {
    it('удаляет модуль, когда инициатор имеет роль ADMIN', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'ADMIN' });
      prisma.module.findUnique = jest.fn().mockResolvedValue({ id: 'm1' });
      prisma.module.delete = jest.fn().mockResolvedValue({ id: 'm1' });

      const out = await service.deleteModuleForAdmin('admin-1', 'm1');

      expect(prisma.module.delete).toHaveBeenCalledWith({
        where: { id: 'm1' },
      });
      expect(out).toEqual({ ok: true });
    });

    it('отклоняет запрос не-администратора', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'USER' });

      await expect(
        service.deleteModuleForAdmin('user-1', 'm1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('бросает not found для несуществующего модуля', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'ADMIN' });
      prisma.module.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.deleteModuleForAdmin('admin-1', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listModulesForAdmin', () => {
    it('фильтрует модули владельцев с ролью ADMIN', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'ADMIN' });
      prisma.module.findMany = jest.fn().mockResolvedValue([]);

      await service.listModulesForAdmin('admin-1');

      expect(prisma.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user: {
              role: { not: 'ADMIN' },
            },
          },
        }),
      );
    });
  });
});
