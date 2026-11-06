import { Injectable } from '@nestjs/common';
import { Prisma, XpActivity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { levelFromXp } from './experience.math';

export const ACHIEVEMENT_IDS = [
  'first-flashcard',
  'first-quiz',
  'first-retry',
  'first-assignment',
  'first-set',
  'five-studies',
  'perfect-quiz',
  'set-complete',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export type AchievementView = {
  id: AchievementId;
  earned: boolean;
  current: number;
  target: number;
};

export type ExperienceProfile = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  achievements: AchievementView[];
};

type XpWriter = PrismaService | Prisma.TransactionClient;

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    db: XpWriter,
    input: {
      userId: string;
      activity: XpActivity;
      sourceId: string;
      points: number;
    },
  ): Promise<void> {
    try {
      await db.xpEvent.create({
        data: {
          userId: input.userId,
          activity: input.activity,
          sourceId: input.sourceId,
          points: input.points,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }

  async getProfile(userId: string): Promise<ExperienceProfile> {
    const [events, perfectQuizzes, sets] = await Promise.all([
      this.prisma.xpEvent.groupBy({
        by: ['activity'],
        where: { userId },
        _count: { _all: true },
        _sum: { points: true },
      }),
      this.prisma.quizSession.count({
        where: { userId, scorePercent: { gte: 100 } },
      }),
      this.prisma.studySet.findMany({
        where: { userId },
        select: { items: { select: { moduleId: true } } },
      }),
    ]);

    const counts = new Map<XpActivity, number>();
    let xp = 0;
    for (const row of events) {
      counts.set(row.activity, row._count._all);
      xp += row._sum.points ?? 0;
    }
    const flash = counts.get(XpActivity.FLASHCARD) ?? 0;
    const quiz = counts.get(XpActivity.QUIZ) ?? 0;
    const retry = counts.get(XpActivity.RETRY) ?? 0;
    const hosted = counts.get(XpActivity.ASSIGNMENT) ?? 0;
    const studies = flash + quiz + retry;
    const setCount = sets.length;
    const completedSets = await this.completedSetCount(userId, sets);

    const level = levelFromXp(xp);
    const achievements: AchievementView[] = [
      row('first-flashcard', flash, 1),
      row('first-quiz', quiz, 1),
      row('first-retry', retry, 1),
      row('first-assignment', hosted, 1),
      row('first-set', setCount, 1),
      row('five-studies', studies, 5),
      row('perfect-quiz', perfectQuizzes, 1),
      row('set-complete', completedSets, 1),
    ];

    return { xp, ...level, achievements };
  }

  private async completedSetCount(
    userId: string,
    sets: Array<{ items: Array<{ moduleId: string }> }>,
  ): Promise<number> {
    const moduleIds = [
      ...new Set(sets.flatMap((set) => set.items.map((item) => item.moduleId))),
    ];
    if (moduleIds.length === 0) return 0;
    const where = {
      userId,
      moduleId: { in: moduleIds },
      completedAt: { not: null },
    };
    const [flash, quiz] = await Promise.all([
      this.prisma.flashcardSession.findMany({
        where,
        select: { moduleId: true },
        distinct: ['moduleId'],
      }),
      this.prisma.quizSession.findMany({
        where,
        select: { moduleId: true },
        distinct: ['moduleId'],
      }),
    ]);
    const studied = new Set([...flash, ...quiz].map((row) => row.moduleId));
    return sets.filter(
      (set) =>
        set.items.length > 0 &&
        set.items.every((item) => studied.has(item.moduleId)),
    ).length;
  }
}

function row(
  id: AchievementId,
  current: number,
  target: number,
): AchievementView {
  const capped = Math.min(current, target);
  return { id, earned: current >= target, current: capped, target };
}
