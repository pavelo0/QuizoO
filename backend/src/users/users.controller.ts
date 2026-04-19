import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { memoryStorage } from 'multer';
import { AuthService } from '../auth/auth.service';
import { CurrentUserId } from '../auth/current-user.decorator';
import { USER_AVATAR_MAX_BYTES } from './user-avatar.constants';
import { PublicUser } from './user-public.select';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth: AuthService,
  ) {}

  @Get('me')
  async getMe(@CurrentUserId() userId: string): Promise<PublicUser> {
    const user = await this.usersService.findPublicById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('me/avatar')
  async getMyAvatar(
    @CurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const meta = await this.usersService.getAvatarForDownload(userId);
    if (!meta) {
      throw new NotFoundException();
    }
    res.setHeader('Content-Type', meta.mime);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return new StreamableFile(createReadStream(meta.path));
  }

  @Patch('me')
  async patchMe(
    @CurrentUserId() userId: string,
    @Body() body: { username?: string | null },
  ): Promise<PublicUser> {
    if (!Object.prototype.hasOwnProperty.call(body, 'username')) {
      throw new BadRequestException('username is required');
    }
    return this.usersService.updateUsername(userId, body.username ?? null);
  }

  @Patch('me/password')
  async patchPassword(
    @CurrentUserId() userId: string,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ): Promise<PublicUser> {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException(
        'currentPassword and newPassword are required',
      );
    }
    return this.auth.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Patch('me/email')
  patchEmail(
    @CurrentUserId() userId: string,
    @Body() body: { newEmail?: string; currentPassword?: string },
  ): Promise<{
    user: PublicUser;
    message: string;
    verificationCode?: string;
  }> {
    if (!body.newEmail || !body.currentPassword) {
      throw new BadRequestException(
        'newEmail and currentPassword are required',
      );
    }
    return this.auth.changeEmail(userId, body.currentPassword, body.newEmail);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: USER_AVATAR_MAX_BYTES },
    }),
  )
  async uploadAvatar(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<PublicUser> {
    if (!file?.buffer) {
      throw new BadRequestException('Image file is required');
    }
    return this.usersService.saveAvatar(userId, file.buffer, file.mimetype);
  }

  @Delete('me/avatar')
  async deleteAvatar(@CurrentUserId() userId: string): Promise<PublicUser> {
    return this.usersService.clearAvatar(userId);
  }
}
