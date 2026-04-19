import {
  BadRequestException,
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
}
