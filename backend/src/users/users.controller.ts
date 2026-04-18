import { Controller, Get, NotFoundException } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { PublicUser } from './user-public.select';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUserId() userId: string): Promise<PublicUser> {
    const user = await this.usersService.findPublicById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
