import { Module } from '@nestjs/common';
import { StudySetsController } from './study-sets.controller';
import { StudySetsService } from './study-sets.service';

@Module({
  controllers: [StudySetsController],
  providers: [StudySetsService],
})
export class StudySetsModule {}
