import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { memoryStorage } from 'multer';
import { CurrentUserId } from '../auth/current-user.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesService } from './modules.service';
import { QUESTION_IMAGE_MAX_BYTES } from './question-image.constants';

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
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.modules.getRecentActivity(userId, {
      take: take ?? limit,
      cursor,
    });
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

  @Get(':moduleId/quiz-questions')
  getQuizQuestionsPage(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.modules.getQuizQuestionsPage(userId, moduleId, {
      take,
      cursor,
    });
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

  @Post(':moduleId/flashcard-sessions')
  @HttpCode(HttpStatus.CREATED)
  completeFlashcardSession(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body()
    body: { totalCards?: number; knownCount?: number; unknownCount?: number },
  ) {
    return this.modules.createFlashcardSession(userId, moduleId, body);
  }

  @Post(':moduleId/quiz-sessions')
  @HttpCode(HttpStatus.CREATED)
  completeQuizSession(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body()
    body: {
      answers?: Array<{
        questionId?: string;
        choiceOptionId?: string | null;
        choiceOptionIds?: string[] | null;
        textAnswer?: string | null;
        matchingAnswer?: Record<string, string> | null;
      }>;
    },
  ) {
    return this.modules.createQuizSession(userId, moduleId, body);
  }

  @Get(':moduleId/quiz-sessions/:sessionId')
  getQuizSession(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.modules.getQuizSession(userId, moduleId, sessionId);
  }

  @Post(':moduleId/questions')
  addQuestion(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Body()
    body: {
      questionText?: string;
      type?: string;
      allowMultipleAnswers?: boolean;
      orderIndex?: number;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
      acceptedVariants?: string[];
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
      allowMultipleAnswers?: boolean;
      options?: Array<{ text?: string; isCorrect?: boolean }>;
      matchingPairs?: Array<{ leftItem?: string; rightItem?: string }>;
      acceptedVariants?: string[];
    },
  ) {
    return this.modules.updateQuestion(userId, moduleId, questionId, body);
  }

  @Post(':moduleId/questions/:questionId/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: QUESTION_IMAGE_MAX_BYTES },
    }),
  )
  uploadQuestionImage(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Image file is required');
    }
    return this.modules.saveQuestionImage(
      userId,
      moduleId,
      questionId,
      file.buffer,
      file.mimetype,
    );
  }

  @Get(':moduleId/questions/:questionId/image')
  async getQuestionImage(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const meta = await this.modules.getQuestionImageForDownload(
      userId,
      moduleId,
      questionId,
    );
    if (!meta) {
      throw new NotFoundException();
    }
    res.setHeader('Content-Type', meta.mime);
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return new StreamableFile(createReadStream(meta.path));
  }

  @Delete(':moduleId/questions/:questionId/image')
  removeQuestionImage(
    @CurrentUserId() userId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.modules.clearQuestionImage(userId, moduleId, questionId);
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
