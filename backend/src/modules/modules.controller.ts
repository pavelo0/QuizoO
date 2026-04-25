import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get('summary')
  getSummary(@CurrentUserId() userId: string) {
    return this.modules.getDashboardSummary(userId);
  }

  @Get('activity')
  getActivity(
    @CurrentUserId() userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.modules.getRecentActivity(userId, limit);
  }

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.modules.listModules(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUserId() userId: string, @Body() body: CreateModuleDto) {
    return this.modules.createModule(userId, body);
  }

  @Get(':moduleId')
  getOne(@CurrentUserId() userId: string, @Param('moduleId') moduleId: string) {
    return this.modules.getModule(userId, moduleId);
  }

  @Patch(':moduleId')
  update(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: UpdateModuleDto,
  ) {
    return this.modules.updateModule(userId, moduleId, body);
  }

  @Delete(':moduleId')
  remove(@CurrentUserId() userId: string, @Param('moduleId') moduleId: string) {
    return this.modules.deleteModule(userId, moduleId);
  }

  @Post(':moduleId/cards')
  addCard(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: { question?: string; answer?: string; orderIndex?: number },
  ) {
    return this.modules.createCard(userId, moduleId, body);
  }

  @Patch(':moduleId/cards/:cardId')
  patchCard(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('cardId') cardId: string,
    @Body() body: { question?: string; answer?: string; orderIndex?: number },
  ) {
    return this.modules.updateCard(userId, moduleId, cardId, body);
  }

  @Delete(':moduleId/cards/:cardId')
  removeCard(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.modules.deleteCard(userId, moduleId, cardId);
  }

  @Post(':moduleId/questions')
  addQuestion(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body()
    body: {
      questionText?: string;
      type?: string;
      orderIndex?: number;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
    },
  ) {
    return this.modules.createQuestion(userId, moduleId, body);
  }

  @Patch(':moduleId/questions/:questionId')
  patchQuestion(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
    @Body()
    body: {
      questionText?: string;
      orderIndex?: number;
      type?: string;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
    },
  ) {
    return this.modules.updateQuestion(userId, moduleId, questionId, body);
  }

  @Delete(':moduleId/questions/:questionId')
  removeQuestion(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.modules.deleteQuestion(userId, moduleId, questionId);
  }
}
