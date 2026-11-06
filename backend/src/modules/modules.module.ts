import { Module } from '@nestjs/common';
import { QuizAssignmentsModule } from '../quiz-assignments/quiz-assignments.module';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

@Module({
  imports: [QuizAssignmentsModule],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
