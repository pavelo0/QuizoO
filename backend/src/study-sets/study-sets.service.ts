import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddStudySetModuleDto } from './dto/add-study-set-module.dto';
import { CreateStudySetDto } from './dto/create-study-set.dto';
import { UpdateStudySetDto } from './dto/update-study-set.dto';
import { MAX_STUDY_SET_TITLE_LENGTH } from './study-set.constants';

export type StudySetModuleView = {
  id: string;
  title: string;
  type: ModuleType;
  studied: boolean;
  orderIndex: number;
};

export type StudySetSummary = {
  id: string;
  title: string;
  moduleCount: number;
  studiedCount: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type StudySetDetail = StudySetSummary & {
  modules: StudySetModuleView[];
};

export type StudySetSessionStat = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  kind: 'FLASHCARD' | 'QUIZ';
  at: string;
  knownCount: number | null;
  totalCards: number | null;
  scorePercent: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
};

export type StudySetStat = {
  id: string;
  title: string;
  moduleCount: number;
  studiedCount: number;
  progress: number;
  sessionCount: number;
  recent: StudySetSessionStat[];
};

function progressPercent(studiedCount: number, moduleCount: number): number {
  if (moduleCount === 0) return 0;
  return Math.round((studiedCount / moduleCount) * 100);
}

function normalizeTitle(raw: string): string {
  const title = raw.trim();
  if (!title) {
    throw new BadRequestException('title is required');
  }
  if (title.length > MAX_STUDY_SET_TITLE_LENGTH) {
    throw new BadRequestException('title is too long');
  }
  return title;
}

@Injectable()
export class StudySetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<StudySetSummary[]> {
    await this.assertLearner(userId);
    const sets = await this.prisma.studySet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { items: { select: { moduleId: true } } },
    });
    const moduleIds = [
      ...new Set(sets.flatMap((set) => set.items.map((item) => item.moduleId))),
    ];
    const studied = await this.studiedModuleIds(userId, moduleIds);
    return sets.map((set) => {
      const moduleCount = set.items.length;
      const studiedCount = set.items.filter((item) =>
        studied.has(item.moduleId),
      ).length;
      return {
        id: set.id,
        title: set.title,
        moduleCount,
        studiedCount,
        progress: progressPercent(studiedCount, moduleCount),
        createdAt: set.createdAt.toISOString(),
        updatedAt: set.updatedAt.toISOString(),
      };
    });
  }

  async create(
    userId: string,
    body: CreateStudySetDto,
  ): Promise<StudySetSummary> {
    await this.assertLearner(userId);
    const title = normalizeTitle(body.title);
    const created = await this.prisma.studySet.create({
      data: { userId, title },
    });
    return {
      id: created.id,
      title: created.title,
      moduleCount: 0,
      studiedCount: 0,
      progress: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async statistics(userId: string): Promise<StudySetStat[]> {
    await this.assertLearner(userId);
    const sets = await this.prisma.studySet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        items: {
          include: { module: { select: { id: true, title: true } } },
        },
      },
    });
    const moduleIds = [
      ...new Set(sets.flatMap((set) => set.items.map((item) => item.moduleId))),
    ];
    const studied = await this.studiedModuleIds(userId, moduleIds);
    const sessions = await this.sessionsForModules(userId, moduleIds);
    return sets.map((set) => {
      const ids = new Set(set.items.map((item) => item.moduleId));
      const own = sessions.filter((session) => ids.has(session.moduleId));
      const studiedCount = set.items.filter((item) =>
        studied.has(item.moduleId),
      ).length;
      const moduleCount = set.items.length;
      return {
        id: set.id,
        title: set.title,
        moduleCount,
        studiedCount,
        progress: progressPercent(studiedCount, moduleCount),
        sessionCount: own.length,
        recent: own.slice(0, 5),
      };
    });
  }

  async getOne(userId: string, setId: string): Promise<StudySetDetail> {
    await this.assertLearner(userId);
    return this.loadDetail(userId, setId);
  }

  async rename(
    userId: string,
    setId: string,
    body: UpdateStudySetDto,
  ): Promise<StudySetDetail> {
    await this.assertLearner(userId);
    await this.requireOwnedSet(userId, setId);
    const title = normalizeTitle(body.title);
    await this.prisma.studySet.update({
      where: { id: setId },
      data: { title },
    });
    return this.loadDetail(userId, setId);
  }

  async remove(userId: string, setId: string) {
    await this.assertLearner(userId);
    await this.requireOwnedSet(userId, setId);
    await this.prisma.studySet.delete({ where: { id: setId } });
    return { ok: true as const };
  }

  async addModule(
    userId: string,
    setId: string,
    body: AddStudySetModuleDto,
  ): Promise<StudySetDetail> {
    await this.assertLearner(userId);
    await this.requireOwnedSet(userId, setId);
    const moduleId = body.moduleId.trim();
    if (!moduleId) {
      throw new BadRequestException('moduleId is required');
    }
    const module = await this.prisma.module.findFirst({
      where: { id: moduleId, userId },
      select: { id: true },
    });
    if (!module) {
      throw new NotFoundException('Module not found');
    }
    const existing = await this.prisma.studySetModule.findUnique({
      where: { setId_moduleId: { setId, moduleId } },
    });
    if (!existing) {
      const last = await this.prisma.studySetModule.aggregate({
        where: { setId },
        _max: { orderIndex: true },
      });
      const orderIndex = (last._max.orderIndex ?? -1) + 1;
      await this.prisma.studySetModule.create({
        data: { setId, moduleId, orderIndex },
      });
    }
    return this.loadDetail(userId, setId);
  }

  async removeModule(
    userId: string,
    setId: string,
    moduleId: string,
  ): Promise<StudySetDetail> {
    await this.assertLearner(userId);
    await this.requireOwnedSet(userId, setId);
    await this.prisma.studySetModule.deleteMany({
      where: { setId, moduleId },
    });
    return this.loadDetail(userId, setId);
  }

  private async assertLearner(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admin cannot manage study sets');
    }
  }

  private async requireOwnedSet(userId: string, setId: string) {
    const set = await this.prisma.studySet.findFirst({
      where: { id: setId, userId },
    });
    if (!set) {
      throw new NotFoundException('Study set not found');
    }
    return set;
  }

  private async loadDetail(
    userId: string,
    setId: string,
  ): Promise<StudySetDetail> {
    const set = await this.prisma.studySet.findFirst({
      where: { id: setId, userId },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: {
            module: { select: { id: true, title: true, type: true } },
          },
        },
      },
    });
    if (!set) {
      throw new NotFoundException('Study set not found');
    }
    const moduleIds = set.items.map((item) => item.moduleId);
    const studied = await this.studiedModuleIds(userId, moduleIds);
    const modules = set.items.map((item) => ({
      id: item.module.id,
      title: item.module.title,
      type: item.module.type,
      studied: studied.has(item.moduleId),
      orderIndex: item.orderIndex,
    }));
    const moduleCount = modules.length;
    const studiedCount = modules.filter((item) => item.studied).length;
    return {
      id: set.id,
      title: set.title,
      moduleCount,
      studiedCount,
      progress: progressPercent(studiedCount, moduleCount),
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
      modules,
    };
  }

  private async sessionsForModules(
    userId: string,
    moduleIds: string[],
  ): Promise<StudySetSessionStat[]> {
    if (moduleIds.length === 0) return [];
    const where = {
      userId,
      moduleId: { in: moduleIds },
      completedAt: { not: null },
    };
    const [flash, quiz] = await Promise.all([
      this.prisma.flashcardSession.findMany({
        where,
        include: { module: { select: { title: true } } },
      }),
      this.prisma.quizSession.findMany({
        where,
        include: { module: { select: { title: true } } },
      }),
    ]);
    const rows: StudySetSessionStat[] = [
      ...flash.map((row) => ({
        id: row.id,
        moduleId: row.moduleId,
        moduleTitle: row.module.title,
        kind: 'FLASHCARD' as const,
        at: row.completedAt?.toISOString() ?? '',
        knownCount: row.knownCount,
        totalCards: row.totalCards,
        scorePercent: null,
        correctCount: null,
        totalQuestions: null,
      })),
      ...quiz.map((row) => ({
        id: row.id,
        moduleId: row.moduleId,
        moduleTitle: row.module.title,
        kind: 'QUIZ' as const,
        at: row.completedAt?.toISOString() ?? '',
        knownCount: null,
        totalCards: null,
        scorePercent: Math.round(row.scorePercent * 10) / 10,
        correctCount: row.correctCount,
        totalQuestions: row.totalQuestions,
      })),
    ];
    rows.sort((left, right) => right.at.localeCompare(left.at));
    return rows;
  }

  private async studiedModuleIds(
    userId: string,
    moduleIds: string[],
  ): Promise<Set<string>> {
    if (moduleIds.length === 0) {
      return new Set();
    }
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
    return new Set([...flash, ...quiz].map((row) => row.moduleId));
  }
}
