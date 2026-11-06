import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module';
import { QuizAssignmentsModule } from '../quiz-assignments/quiz-assignments.module';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

@Module({
  imports: [QuizAssignmentsModule, ExperienceModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
