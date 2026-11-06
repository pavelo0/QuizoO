import { Prisma, XpActivity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExperienceService } from './experience.service';

function createPrismaMock() {
  return {
    xpEvent: {
      create: jest.fn(),
      groupBy: jest.fn(),
    },
    quizSession: { count: jest.fn(), findMany: jest.fn() },
    studySet: { findMany: jest.fn() },
    flashcardSession: { findMany: jest.fn() },
  } as unknown as PrismaService;
}

describe('ExperienceService', () => {
  let service: ExperienceService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ExperienceService(prisma);
  });

  it('ignores a duplicate award', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.xpEvent.create = jest.fn().mockRejectedValue(error);

    await expect(
      service.record(prisma, {
        userId: 'u1',
        activity: XpActivity.QUIZ,
        sourceId: 's1',
        points: 15,
      }),
    ).resolves.toBeUndefined();
  });

  it('sums XP and unlocks the first quiz badge', async () => {
    prisma.xpEvent.groupBy = jest.fn().mockResolvedValue([
      {
        activity: XpActivity.QUIZ,
        _count: { _all: 1 },
        _sum: { points: 25 },
      },
    ]);
    prisma.quizSession.count = jest.fn().mockResolvedValue(1);
    prisma.studySet.findMany = jest.fn().mockResolvedValue([]);

    const profile = await service.getProfile('u1');

    expect(profile.xp).toBe(25);
    expect(profile.level).toBe(1);
    expect(
      profile.achievements.find((item) => item.id === 'first-quiz'),
    ).toEqual({ id: 'first-quiz', earned: true, current: 1, target: 1 });
    expect(
      profile.achievements.find((item) => item.id === 'perfect-quiz')?.earned,
    ).toBe(true);
    expect(
      profile.achievements.find((item) => item.id === 'first-flashcard')
        ?.earned,
    ).toBe(false);
  });
});
