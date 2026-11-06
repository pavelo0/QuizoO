import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { CreateQuizAssignmentDto } from './dto/create-quiz-assignment.dto';
import { QuizAssignmentsService } from './quiz-assignments.service';

@Controller('quiz-assignments')
export class QuizAssignmentsController {
  constructor(private readonly assignments: QuizAssignmentsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.assignments.list(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUserId() userId: string,
    @Body() body: CreateQuizAssignmentDto,
  ) {
    return this.assignments.create(userId, body);
  }

  @Get('by-code/:code')
  findByCode(@CurrentUserId() userId: string, @Param('code') code: string) {
    return this.assignments.findByCode(userId, code);
  }

  @Get(':assignmentId')
  getOne(
    @CurrentUserId() userId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignments.getOne(userId, assignmentId);
  }

  @Delete(':assignmentId')
  remove(
    @CurrentUserId() userId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignments.remove(userId, assignmentId);
  }
}
