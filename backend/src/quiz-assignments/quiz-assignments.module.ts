import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module';
import { QuizAssignmentsController } from './quiz-assignments.controller';
import { QuizAssignmentsService } from './quiz-assignments.service';

@Module({
  imports: [ExperienceModule],
  controllers: [QuizAssignmentsController],
  providers: [QuizAssignmentsService],
  exports: [QuizAssignmentsService],
})
export class QuizAssignmentsModule {}
