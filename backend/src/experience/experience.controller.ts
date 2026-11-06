import { Controller, Get } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ExperienceService } from './experience.service';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get('me')
  getMine(@CurrentUserId() userId: string) {
    return this.experience.getProfile(userId);
  }
}
