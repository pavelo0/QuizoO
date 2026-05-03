import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import {
  USER_AVATAR_ALLOWED_MIMES,
  USER_AVATAR_MAX_BYTES,
} from './user-avatar.constants';
import { PublicUser, userPublicSelect } from './user-public.select';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await mkdir(AVATAR_DIR, { recursive: true });
  }

  avatarFilePath(userId: string): string {
    return join(AVATAR_DIR, userId);
  }

  async findPublicById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async updateUsername(
    userId: string,
    username: string | null,
  ): Promise<PublicUser> {
    const normalized =
      username === null || username === undefined
        ? null
        : username.trim() || null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { username: normalized },
      select: userPublicSelect,
    });
  }

  async saveAvatar(
    userId: string,
    buffer: Buffer,
    mime: string,
  ): Promise<PublicUser> {
    if (buffer.length > USER_AVATAR_MAX_BYTES) {
      throw new BadRequestException(
        `Image must be at most ${USER_AVATAR_MAX_BYTES / (1024 * 1024)} MB`,
      );
    }
    if (!(USER_AVATAR_ALLOWED_MIMES as readonly string[]).includes(mime)) {
      throw new BadRequestException('Allowed formats: JPEG, PNG, or WebP');
    }

    const path = this.avatarFilePath(userId);
    await writeFile(path, buffer);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarMime: mime },
      select: userPublicSelect,
    });
  }

  async clearAvatar(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, avatarMime: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarMime) {
      try {
        await unlink(this.avatarFilePath(userId));
      } catch {
        // file may already be missing
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarMime: null },
      select: userPublicSelect,
    });
  }

  async getAvatarForDownload(
    userId: string,
  ): Promise<{ path: string; mime: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarMime: true },
    });
    if (!user?.avatarMime) {
      return null;
    }
    return {
      path: this.avatarFilePath(userId),
      mime: user.avatarMime,
    };
  }

  async getAdminOverview(adminUserId: string) {
    await this.assertAdmin(adminUserId);
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const [totalUsers, totalModules, blockedUsers, flashToday, quizToday] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.module.count(),
        this.prisma.user.count({ where: { isBlocked: true } }),
        this.prisma.flashcardSession.count({
          where: { completedAt: { gte: startToday } },
        }),
        this.prisma.quizSession.count({
          where: { completedAt: { gte: startToday } },
        }),
      ]);

    return {
      totalUsers,
      totalModules,
      sessionsToday: flashToday + quizToday,
      blockedUsers,
    };
  }

  async listUsersForAdmin(adminUserId: string) {
    await this.assertAdmin(adminUserId);
    const users = await this.prisma.user.findMany({
      select: {
        ...userPublicSelect,
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      ...user,
      moduleCount: user._count.modules,
    }));
  }

  async listModulesForAdmin(adminUserId: string) {
    await this.assertAdmin(adminUserId);
    const modules = await this.prisma.module.findMany({
      include: {
        user: {
          select: { id: true, email: true, username: true, isBlocked: true },
        },
        _count: { select: { cards: true, questions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const moduleIds = modules.map((m) => m.id);
    if (moduleIds.length < 1) {
      return [];
    }

    const [flashByModule, quizByModule] = await Promise.all([
      this.prisma.flashcardSession.groupBy({
        by: ['moduleId'],
        where: { moduleId: { in: moduleIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.quizSession.groupBy({
        by: ['moduleId'],
        where: { moduleId: { in: moduleIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const sessionCountMap = new Map<string, number>();
    for (const row of flashByModule) {
      sessionCountMap.set(row.moduleId, row._count._all);
    }
    for (const row of quizByModule) {
      const current = sessionCountMap.get(row.moduleId) ?? 0;
      sessionCountMap.set(row.moduleId, current + row._count._all);
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
      sessionCount: sessionCountMap.get(m.id) ?? 0,
      owner: {
        id: m.user.id,
        email: m.user.email,
        username: m.user.username,
        isBlocked: m.user.isBlocked,
      },
    }));
  }

  async setUserBlockedForAdmin(
    adminUserId: string,
    targetUserId: string,
    isBlocked: boolean,
  ) {
    await this.assertAdmin(adminUserId);
    if (adminUserId === targetUserId) {
      throw new BadRequestException('You cannot block your own account');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === 'ADMIN') {
      throw new BadRequestException('Admin accounts cannot be blocked');
    }
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isBlocked },
      select: userPublicSelect,
    });
  }

  private async assertAdmin(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }
}
