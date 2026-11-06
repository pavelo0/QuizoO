import { BadRequestException, ConflictException } from '@nestjs/common';
import { ModuleType, QuestionType, XpActivity } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTION_IMAGE_MAX_BYTES } from './question-image.constants';
import { ExperienceService } from '../experience/experience.service';
import { pointsForQuiz, RETRY_POINTS } from '../experience/experience.math';
import { QuizAssignmentsService } from '../quiz-assignments/quiz-assignments.service';
import { ModulesService } from './modules.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
}));

function createPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
    },
    module: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;
}

describe('ModulesService', () => {
  let service: ModulesService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let experience: { record: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createPrismaMock();
    prisma.user.findUnique = jest.fn().mockResolvedValue({ role: 'USER' });
    experience = { record: jest.fn() };
    service = new ModulesService(
      prisma,
      { assertOpen: jest.fn() } as unknown as QuizAssignmentsService,
      experience as unknown as ExperienceService,
    );
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
          acceptedVariants: [],
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

    it('scores TEXT answer via acceptedVariants when canonical is Cyrillic', async () => {
      prisma.question.findMany = jest.fn().mockResolvedValue([
        {
          id: 'q1',
          type: QuestionType.TEXT,
          allowMultipleAnswers: false,
          acceptedVariants: ['Paris', 'paris'],
          questionOptions: [{ id: 'o1', text: 'Париж', isCorrect: true }],
          matchingPairs: [],
        },
      ]);

      const tx = {
        quizSession: {
          create: jest.fn().mockResolvedValue({ id: 'sess-2' }),
        },
      };
      prisma.$transaction = jest.fn(async (cb) => cb(tx));
      prisma.quizSession.findFirst = jest.fn().mockResolvedValue({
        id: 'sess-2',
        userId: 'u1',
        moduleId: 'm-quiz',
        totalQuestions: 1,
        correctCount: 1,
        scorePercent: 100,
        completedAt: new Date('2026-05-10T07:00:00.000Z'),
        module: { id: 'm-quiz', title: 'Quiz module' },
        answers: [],
      });

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [{ questionId: 'q1', textAnswer: 'Paris' }],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            correctCount: 1,
            answers: {
              create: [
                expect.objectContaining({
                  questionId: 'q1',
                  isCorrect: true,
                  userAnswer: '{"textAnswer":"paris"}',
                }),
              ],
            },
          }),
        }),
      );
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

    function textQuestion(id: string, points: number) {
      return {
        id,
        type: QuestionType.TEXT,
        points,
        allowMultipleAnswers: false,
        acceptedVariants: [],
        questionOptions: [{ id: `${id}-opt`, text: 'yes', isCorrect: true }],
        matchingPairs: [],
        orderingItems: [],
        fillBlanks: [],
      };
    }

    function stubSession(scorePercent: number) {
      const tx = {
        quizSession: {
          create: jest.fn().mockResolvedValue({ id: 'sess-points' }),
        },
      };
      prisma.$transaction = jest.fn(async (cb) => cb(tx));
      prisma.quizSession.findFirst = jest.fn().mockResolvedValue({
        id: 'sess-points',
        userId: 'u1',
        moduleId: 'm-quiz',
        totalQuestions: 2,
        correctCount: 1,
        scorePercent,
        pointsEarned: null,
        pointsMax: null,
        completedAt: new Date('2026-05-10T07:00:00.000Z'),
        module: { id: 'm-quiz', title: 'Quiz module' },
        answers: [],
      });
      return tx;
    }

    it('ignores stored points while the custom scale is off', async () => {
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 9), textQuestion('q2', 1)]);
      const tx = stubSession(50);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      const data = tx.quizSession.create.mock.calls[0][0].data;
      expect(data.scorePercent).toBe(50);
      expect(data.pointsEarned).toBeUndefined();
      expect(data.pointsMax).toBeUndefined();
    });

    it('scores equal weights the same way as a question count', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 1), textQuestion('q2', 1)]);
      const tx = stubSession(50);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scorePercent: 50,
            pointsEarned: 1,
            pointsMax: 2,
            correctCount: 1,
          }),
        }),
      );
    });

    it('weights a correct answer by its point value', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 9), textQuestion('q2', 1)]);
      const tx = stubSession(90);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scorePercent: 90,
            pointsEarned: 9,
            pointsMax: 10,
          }),
        }),
      );
    });

    it('gives partial fill-blank credit in question points', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest.fn().mockResolvedValue([
        {
          id: 'q1',
          type: QuestionType.FILL_BLANK,
          points: 4,
          allowMultipleAnswers: false,
          questionOptions: [],
          matchingPairs: [],
          orderingItems: [],
          fillBlanks: [
            { blankIndex: 1, answer: 'alpha', acceptedVariants: [] },
            { blankIndex: 2, answer: 'beta', acceptedVariants: [] },
          ],
        },
      ]);
      const tx = stubSession(50);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [{ questionId: 'q1', fillBlankAnswers: ['alpha', 'nope'] }],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            correctCount: 0,
            scorePercent: 50,
            pointsEarned: 2,
            pointsMax: 4,
          }),
        }),
      );
    });

    it('pays quiz experience from the weighted percent', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 9), textQuestion('q2', 1)]);
      const tx = stubSession(90);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      expect(experience.record).toHaveBeenCalledWith(
        tx,
        expect.objectContaining({
          activity: XpActivity.QUIZ,
          points: pointsForQuiz(90),
        }),
      );
    });

    it('stores zero earned points when every weighted answer is wrong', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 9), textQuestion('q2', 1)]);
      const tx = stubSession(0);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'no' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      const data = tx.quizSession.create.mock.calls[0][0].data;
      expect(data.pointsEarned).toBe(0);
      expect(data.pointsMax).toBe(10);
      expect(data.scorePercent).toBe(0);
      expect(data.correctCount).toBe(0);
      expect(experience.record).toHaveBeenCalledWith(
        tx,
        expect.objectContaining({ points: pointsForQuiz(0) }),
      );
    });

    it('scores a perfect weighted quiz as 100 percent', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 3), textQuestion('q2', 7)]);
      const tx = stubSession(100);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'yes' },
        ],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scorePercent: 100,
            pointsEarned: 10,
            pointsMax: 10,
            correctCount: 2,
          }),
        }),
      );
    });

    it('treats a missing point value as 1 on the custom scale', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      const unweighted = textQuestion('q1', 1);
      delete (unweighted as { points?: number }).points;
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([unweighted, textQuestion('q2', 3)]);
      const tx = stubSession(25);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pointsEarned: 1,
            pointsMax: 4,
            scorePercent: 25,
          }),
        }),
      );
    });

    it('combines a correct question with partial fill-blank credit', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest.fn().mockResolvedValue([
        textQuestion('q1', 2),
        {
          id: 'q2',
          type: QuestionType.FILL_BLANK,
          points: 3,
          allowMultipleAnswers: false,
          questionOptions: [],
          matchingPairs: [],
          orderingItems: [],
          fillBlanks: [
            { blankIndex: 1, answer: 'alpha', acceptedVariants: [] },
            { blankIndex: 2, answer: 'beta', acceptedVariants: [] },
            { blankIndex: 3, answer: 'gamma', acceptedVariants: [] },
          ],
        },
      ]);
      const tx = stubSession(60);

      await service.createQuizSession('u1', 'm-quiz', {
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          {
            questionId: 'q2',
            fillBlankAnswers: ['alpha', 'nope', 'nope'],
          },
        ],
      });

      const data = tx.quizSession.create.mock.calls[0][0].data;
      expect(data.correctCount).toBe(1);
      expect(data.pointsEarned).toBeCloseTo(3, 5);
      expect(data.pointsMax).toBe(5);
      expect(data.scorePercent).toBeCloseTo(60, 5);
    });

    it('weights an assignment attempt from the module scale', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 4), textQuestion('q2', 1)]);
      const tx = stubSession(80);

      await service.createQuizSession('u1', 'm-quiz', {
        assignmentId: 'asg-1',
        answers: [
          { questionId: 'q1', textAnswer: 'yes' },
          { questionId: 'q2', textAnswer: 'no' },
        ],
      });

      expect(tx.quizSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignmentId: 'asg-1',
            pointsEarned: 4,
            pointsMax: 5,
            scorePercent: 80,
          }),
        }),
      );
      expect(experience.record).toHaveBeenCalledWith(
        tx,
        expect.objectContaining({
          activity: XpActivity.QUIZ,
          points: pointsForQuiz(80),
        }),
      );
    });

    it('keeps retry experience flat even when the scale is on', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
      prisma.question.findMany = jest
        .fn()
        .mockResolvedValue([textQuestion('q1', 5)]);
      const tx = {
        quizSession: {
          create: jest.fn().mockResolvedValue({ id: 'sess-retry' }),
        },
      };
      prisma.$transaction = jest.fn(async (cb) => cb(tx));
      prisma.quizSession.findFirst = jest
        .fn()
        .mockResolvedValueOnce({
          answers: [{ questionId: 'q1', isCorrect: false }],
        })
        .mockResolvedValue({
          id: 'sess-retry',
          userId: 'u1',
          moduleId: 'm-quiz',
          totalQuestions: 1,
          correctCount: 0,
          scorePercent: 0,
          pointsEarned: 0,
          pointsMax: 5,
          completedAt: new Date('2026-05-10T07:00:00.000Z'),
          module: { id: 'm-quiz', title: 'Quiz module' },
          answers: [],
        });

      await service.createQuizSession('u1', 'm-quiz', {
        retryOfSessionId: 'sess-source',
        answers: [{ questionId: 'q1', textAnswer: 'no' }],
      });

      const data = tx.quizSession.create.mock.calls[0][0].data;
      expect(data.pointsEarned).toBe(0);
      expect(data.pointsMax).toBe(5);
      expect(experience.record).toHaveBeenCalledWith(
        tx,
        expect.objectContaining({
          activity: XpActivity.RETRY,
          points: RETRY_POINTS,
        }),
      );
    });
  });

  describe('question points', () => {
    beforeEach(() => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
        customScoring: true,
      });
    });

    it('defaults omitted points to 1 and stores the upper bound', async () => {
      prisma.question.create = jest.fn().mockResolvedValue({ id: 'q-new' });

      await service.createQuestion('u1', 'm-quiz', {
        questionText: 'Capital',
        type: QuestionType.TEXT,
        options: [{ text: 'Paris', isCorrect: true }],
      });
      expect(prisma.question.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ points: 1 }),
        }),
      );

      await service.createQuestion('u1', 'm-quiz', {
        questionText: 'Capital',
        type: QuestionType.TEXT,
        points: 100,
        options: [{ text: 'Paris', isCorrect: true }],
      });
      expect(prisma.question.create).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ points: 100 }),
        }),
      );
    });

    it('rejects points that are not an integer', async () => {
      await expect(
        service.createQuestion('u1', 'm-quiz', {
          questionText: 'Capital',
          type: QuestionType.TEXT,
          points: '5' as unknown as number,
          options: [{ text: 'Paris', isCorrect: true }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.question.create).not.toHaveBeenCalled();
    });

    it.each([0, 101, 1.5, -3])(
      'rejects question points value %s',
      async (points) => {
        await expect(
          service.createQuestion('u1', 'm-quiz', {
            questionText: 'Capital',
            type: QuestionType.TEXT,
            points,
            options: [{ text: 'Paris', isCorrect: true }],
          }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.question.create).not.toHaveBeenCalled();
      },
    );

    it('updates points without touching the rest of the question', async () => {
      prisma.question.findFirst = jest.fn().mockResolvedValue({
        id: 'q1',
        type: QuestionType.TEXT,
        questionText: 'Capital',
        allowMultipleAnswers: false,
        acceptedVariants: [],
        questionOptions: [{ id: 'o1', text: 'Paris', isCorrect: true }],
        fillBlanks: [],
      });
      prisma.question.update = jest.fn().mockResolvedValue({ id: 'q1' });

      await service.updateQuestion('u1', 'm-quiz', 'q1', { points: 7 });

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { points: 7 },
      });
    });

    it('rejects an out-of-range update and leaves the question unchanged', async () => {
      prisma.question.findFirst = jest.fn().mockResolvedValue({
        id: 'q1',
        type: QuestionType.TEXT,
        questionText: 'Capital',
        allowMultipleAnswers: false,
        acceptedVariants: [],
        questionOptions: [{ id: 'o1', text: 'Paris', isCorrect: true }],
        fillBlanks: [],
      });

      await expect(
        service.updateQuestion('u1', 'm-quiz', 'q1', { points: 0 }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.question.update).not.toHaveBeenCalled();
    });
  });

  describe('custom scoring setting', () => {
    it('rejects the scale on a flashcard module', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-cards',
        userId: 'u1',
        title: 'Cards',
        type: ModuleType.FLASHCARD,
      });

      await expect(
        service.updateModule('u1', 'm-cards', { customScoring: true }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.module.update).not.toHaveBeenCalled();
    });

    it('stores the scale on a quiz module', async () => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        userId: 'u1',
        title: 'Quiz',
        type: ModuleType.QUIZ,
        customScoring: false,
      });
      prisma.module.update = jest.fn().mockResolvedValue({ id: 'm-quiz' });

      await service.updateModule('u1', 'm-quiz', { customScoring: true });

      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'm-quiz' },
        data: { customScoring: true },
      });
    });
  });

  describe('getQuizSession points', () => {
    beforeEach(() => {
      prisma.module.findFirst = jest.fn().mockResolvedValue({
        id: 'm-quiz',
        title: 'Quiz module',
        type: ModuleType.QUIZ,
      });
    });

    it('rounds earned points to one decimal and keeps an old session empty', async () => {
      prisma.quizSession.findFirst = jest.fn().mockResolvedValue({
        id: 'sess-1',
        userId: 'u1',
        moduleId: 'm-quiz',
        assignmentId: null,
        totalQuestions: 1,
        correctCount: 1,
        scorePercent: 66.666,
        pointsEarned: 2.25,
        pointsMax: 3,
        completedAt: new Date('2026-05-10T07:00:00.000Z'),
        module: { id: 'm-quiz', title: 'Quiz module' },
        answers: [],
      });

      const weighted = await service.getQuizSession('u1', 'm-quiz', 'sess-1');
      expect(weighted.pointsEarned).toBe(2.3);
      expect(weighted.pointsMax).toBe(3);
      expect(weighted.scorePercent).toBe(66.7);

      prisma.quizSession.findFirst = jest.fn().mockResolvedValue({
        id: 'sess-old',
        userId: 'u1',
        moduleId: 'm-quiz',
        assignmentId: null,
        totalQuestions: 2,
        correctCount: 1,
        scorePercent: 50,
        pointsEarned: null,
        pointsMax: null,
        completedAt: null,
        module: { id: 'm-quiz', title: 'Quiz module' },
        answers: [],
      });

      const legacy = await service.getQuizSession('u1', 'm-quiz', 'sess-old');
      expect(legacy.pointsEarned).toBeNull();
      expect(legacy.pointsMax).toBeNull();
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
