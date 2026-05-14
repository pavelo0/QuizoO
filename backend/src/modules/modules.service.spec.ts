import { BadRequestException, ConflictException } from '@nestjs/common';
import { ModuleType, QuestionType } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTION_IMAGE_MAX_BYTES } from './question-image.constants';
import { ModulesService } from './modules.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
}));

function createPrismaMock() {
  return {
    module: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    flashcardSession: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    quizSession: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    question: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;
}

describe('ModulesService', () => {
  let service: ModulesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createPrismaMock();
    service = new ModulesService(prisma);
  });

  describe('createModule', () => {
    it('generates unique default title for flashcard modules', async () => {
      prisma.module.findMany = jest
        .fn()
        .mockResolvedValue([
          { title: 'New module' },
          { title: 'New module 1' },
        ]);
      prisma.module.create = jest.fn().mockResolvedValue({ id: 'm1' });

      await service.createModule('u1', {
        title: 'New module',
        type: ModuleType.FLASHCARD,
      });

      expect(prisma.module.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'New module 2' }),
        }),
      );
    });

    it('throws conflict when non-default title already exists', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({ id: 'existing' });

      await expect(
        service.createModule('u1', {
          title: 'Biology',
          type: ModuleType.QUIZ,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('createFlashcardSession', () => {
    beforeEach(() => {
      prisma.module.findFirst = jest
        .fn()
        .mockResolvedValue({ id: 'm1', type: ModuleType.FLASHCARD });
    });

    it('rejects invalid counters', async () => {
      await expect(
        service.createFlashcardSession('u1', 'm1', {
          totalCards: 3,
          knownCount: 1,
          unknownCount: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates session with completed timestamp', async () => {
      prisma.flashcardSession.create = jest
        .fn()
        .mockResolvedValue({ id: 's1', totalCards: 2 });

      await service.createFlashcardSession('u1', 'm1', {
        totalCards: 2,
        knownCount: 1,
        unknownCount: 1,
      });

      expect(prisma.flashcardSession.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          moduleId: 'm1',
          totalCards: 2,
          knownCount: 1,
          unknownCount: 1,
          completedAt: expect.any(Date),
        },
      });
    });
  });

  describe('createQuizSession', () => {
    beforeEach(() => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
      });
    });

    it('scores TEXT answer case-insensitively and trims whitespace', async () => {
      prisma.question.findMany = jest.fn().mockResolvedValue([
        {
          id: 'q1',
          type: QuestionType.TEXT,
          allowMultipleAnswers: false,
          questionOptions: [{ id: 'o1', text: 'Paris', isCorrect: true }],
          matchingPairs: [],
        },
      ]);

      const tx = {
        quizSession: {
          create: jest.fn().mockResolvedValue({ id: 'sess-1' }),
        },
      };
      prisma.$transaction = jest.fn(async (cb) => cb(tx));
      prisma.quizSession.findFirst = jest.fn().mockResolvedValue({
        id: 'sess-1',
        userId: 'u1',
        moduleId: 'm-quiz',
        totalQuestions: 1,
        correctCount: 1,
        scorePercent: 100,
        completedAt: new Date('2026-05-10T07:00:00.000Z'),
        module: { id: 'm-quiz', title: 'Quiz module' },
        answers: [
          {
            id: 'a1',
            questionId: 'q1',
            isCorrect: true,
            userAnswer: '{"textAnswer":"paris"}',
            question: { id: 'q1' },
          },
        ],
      });

      const result = await service.createQuizSession('u1', 'm-quiz', {
        answers: [{ questionId: 'q1', textAnswer: '  paris  ' }],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            correctCount: 1,
            scorePercent: 100,
            answers: {
              create: [
                {
                  questionId: 'q1',
                  userAnswer: '{"textAnswer":"paris"}',
                  isCorrect: true,
                },
              ],
            },
          }),
        }),
      );
      expect(result.scorePercent).toBe(100);
    });

    it('rejects CHOICE answer with option from another question', async () => {
      prisma.question.findMany = jest.fn().mockResolvedValue([
        {
          id: 'q1',
          type: QuestionType.CHOICE,
          allowMultipleAnswers: false,
          questionOptions: [{ id: 'valid-opt', text: 'A', isCorrect: true }],
          matchingPairs: [],
        },
      ]);

      await expect(
        service.createQuizSession('u1', 'm-quiz', {
          answers: [{ questionId: 'q1', choiceOptionId: 'wrong-opt' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('saveQuestionImage', () => {
    beforeEach(() => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
      });
      prisma.question.findFirst = jest.fn().mockResolvedValue({ id: 'q1' });
    });

    it('rejects files larger than configured limit', async () => {
      const buffer = Buffer.alloc(QUESTION_IMAGE_MAX_BYTES + 1);

      await expect(
        service.saveQuestionImage('u1', 'm-quiz', 'q1', buffer, 'image/png'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unsupported mime type', async () => {
      await expect(
        service.saveQuestionImage(
          'u1',
          'm-quiz',
          'q1',
          Buffer.from('small'),
          'image/gif',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('writes image to filesystem and updates mime in database', async () => {
      prisma.question.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: 'q1' })
        .mockResolvedValueOnce({
          id: 'q1',
          questionImageMime: 'image/webp',
          questionOptions: [],
          matchingPairs: [],
        });
      prisma.question.update = jest.fn().mockResolvedValue({ id: 'q1' });

      const out = await service.saveQuestionImage(
        'u1',
        'm-quiz',
        'q1',
        Buffer.from('binary-image'),
        'image/webp',
      );

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { questionImageMime: 'image/webp' },
      });
      expect(out).toEqual(
        expect.objectContaining({ id: 'q1', questionImageMime: 'image/webp' }),
      );
    });
  });
});
