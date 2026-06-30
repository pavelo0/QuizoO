# Черновик приложений (Г-М): код и подписи

В документ для каждого приложения используйте **один блок кода** и **одну подпись** к листингу (строка «Подпись в Word»).

**Приложения А, Б, В:** кода нет — вставьте только рисунки диаграмм.

---

## Приложение Г - схема данных Prisma

**Подпись в Word:** Листинг Г - Описание моделей базы данных (Prisma Schema), проект QuizoO

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Click {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  username      String?
  role          UserRole @default(USER)
  isBlocked     Boolean  @default(false)
  oauthProvider String?
  oauthId       String?

  emailVerified Boolean @default(false)

  emailVerificationCode      String?
  emailVerificationExpiresAt DateTime?

  passwordResetCode      String?
  passwordResetExpiresAt DateTime?

  avatarMime String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  modules             Module[]
  flashcardSessions   FlashcardSession[]
  quizSessions        QuizSession[]

  @@unique([oauthProvider, oauthId])
  @@map("users")
}

enum ModuleType {
  FLASHCARD
  QUIZ
}

enum QuestionType {
  CHOICE
  TEXT
  MATCHING
}

model Module {
  id          String     @id @default(cuid())
  userId      String
  title       String
  description String?
  type        ModuleType
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards             Card[]
  questions         Question[]
  flashcardSessions FlashcardSession[]
  quizSessions      QuizSession[]

  @@index([userId])
  @@map("modules")
}

model Card {
  id         String   @id @default(cuid())
  moduleId   String
  question   String
  answer     String
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())

  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@index([moduleId])
  @@map("cards")
}

model Question {
  id           String       @id @default(cuid())
  moduleId     String
  questionText String
  type         QuestionType
  allowMultipleAnswers Boolean @default(false)
  questionImageMime String?
  orderIndex   Int          @default(0)
  createdAt    DateTime     @default(now())

  module          Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  matchingPairs   MatchingPair[]
  questionOptions QuestionOption[]
  quizAnswers     QuizAnswer[]

  @@index([moduleId])
  @@map("questions")
}

model MatchingPair {
  id         String @id @default(cuid())
  questionId String
  leftItem   String
  rightItem  String

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("matching_pairs")
}

model QuestionOption {
  id         String  @id @default(cuid())
  questionId String
  text       String
  isCorrect  Boolean @default(false)

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("question_options")
}

model FlashcardSession {
  id           String    @id @default(cuid())
  userId       String
  moduleId     String
  totalCards   Int
  knownCount   Int
  unknownCount Int
  completedAt  DateTime?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([moduleId])
  @@map("flashcard_sessions")
}

model QuizSession {
  id             String    @id @default(cuid())
  userId         String
  moduleId       String
  totalQuestions Int
  correctCount   Int
  scorePercent   Float
  completedAt    DateTime?

  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  module  Module       @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  answers QuizAnswer[]

  @@index([userId])
  @@index([moduleId])
  @@map("quiz_sessions")
}

model QuizAnswer {
  id         String  @id @default(cuid())
  sessionId  String
  questionId String
  userAnswer String?
  isCorrect  Boolean

  session  QuizSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, questionId])
  @@index([sessionId])
  @@index([questionId])
  @@map("quiz_answers")
}
```

---

## Приложение Д - контроллер учебных модулей

**Подпись в Word:** Листинг Д - REST API ресурса `modules`, класс `ModulesController`, проект QuizoO

```typescript
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
```

---

## Приложение Е - сервис учебных модулей

**Подпись в Word:** Листинг Е - Эндпойнты бизнес-логики: создание учебного модуля (`createModule`) и завершение сессии квиза с проверкой ответов (`createQuizSession`), класс `ModulesService`, проект QuizoO

```typescript
// --- ModulesService.createModule ---
async createModule(userId: string, body: CreateModuleDto) {
    const title = body.title.trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }
    if (!isModuleType(body.type)) {
      throw new BadRequestException('type must be FLASHCARD or QUIZ');
    }
    let resolvedTitle = title;
    const defaultTitle =
      body.type === ModuleType.QUIZ ? 'New quiz module' : 'New module';
    if (title === defaultTitle) {
      resolvedTitle = await this.generateUniqueDefaultModuleTitle(
        userId,
        body.type,
      );
    } else {
      await this.ensureUniqueModuleTitle(userId, title);
    }
    return this.prisma.module.create({
      data: {
        userId,
        title: resolvedTitle,
        description:
          body.description === undefined || body.description === null
            ? null
            : String(body.description),
        type: body.type,
      },
    });
  }

// --- ModulesService.createQuizSession ---
async createQuizSession(
    userId: string,
    moduleId: string,
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
    await this.assertQuizModule(moduleId, userId);
    const answers = body.answers ?? [];
    if (!Array.isArray(answers)) {
      throw new BadRequestException('answers must be an array');
    }
    if (answers.length < 1) {
      throw new BadRequestException('answers cannot be empty');
    }

    const questionIds = Array.from(
      new Set(
        answers
          .map((a) => (a.questionId ?? '').trim())
          .filter((id) => id.length > 0),
      ),
    );
    if (questionIds.length !== answers.length) {
      throw new BadRequestException('Each answer must have a questionId');
    }

    const questions = await this.prisma.question.findMany({
      where: { moduleId, id: { in: questionIds } },
      include: { questionOptions: true, matchingPairs: true },
    });
    if (questions.length !== questionIds.length) {
      throw new BadRequestException(
        'Some questions do not belong to this module',
      );
    }
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const normalizedAnswers = answers.map((a) => {
      const q = questionById.get(a.questionId!);
      if (!q) {
        throw new BadRequestException('Invalid questionId');
      }

      let isCorrect = false;
      let userAnswer: string | null = null;

      if (q.type === QuestionType.CHOICE) {
        const optionIds = Array.isArray(a.choiceOptionIds)
          ? a.choiceOptionIds
          : a.choiceOptionId
            ? [a.choiceOptionId]
            : [];
        const selectedIds = Array.from(
          new Set(
            optionIds
              .map((id) => String(id ?? '').trim())
              .filter((id) => id.length > 0),
          ),
        );

        if (selectedIds.length < 1) {
          isCorrect = false;
          userAnswer = null;
        } else {
          const optionsById = new Map(q.questionOptions.map((o) => [o.id, o]));
          if (selectedIds.some((id) => !optionsById.has(id))) {
            throw new BadRequestException(
              'choiceOptionId must belong to the question',
            );
          }

          const correctIds = q.questionOptions
            .filter((o) => o.isCorrect)
            .map((o) => o.id);

          if (q.allowMultipleAnswers) {
            const selectedSorted = [...selectedIds].sort();
            const correctSorted = [...correctIds].sort();
            isCorrect =
              selectedSorted.length === correctSorted.length &&
              selectedSorted.every((id, idx) => id === correctSorted[idx]);
            userAnswer = JSON.stringify({ choiceOptionIds: selectedSorted });
          } else {
            const selected = selectedIds[0] ?? '';
            isCorrect =
              selectedIds.length === 1 && correctIds.includes(selected);
            userAnswer = JSON.stringify({ choiceOptionId: selected });
          }
        }
      } else if (q.type === QuestionType.TEXT) {
        const raw = a.textAnswer ?? '';
        const t = String(raw).trim();
        const correct = q.questionOptions.find((o) => o.isCorrect)?.text ?? '';
        const norm = (s: string) => s.trim().toLowerCase();
        isCorrect = t.length > 0 && norm(t) === norm(correct);
        userAnswer = JSON.stringify({ textAnswer: t });
      } else if (q.type === QuestionType.MATCHING) {
        const map = a.matchingAnswer ?? null;
        if (!map || typeof map !== 'object') {
          isCorrect = false;
          userAnswer = null;
        } else {
          const allPairs = q.matchingPairs;
          const matchingAnswerMap = map as Record<string, unknown>;
          const entries = allPairs.map((p) => {
            const rawValue = matchingAnswerMap[p.id];
            const value = typeof rawValue === 'string' ? rawValue : '';
            return [p.id, value] as const;
          });
          const allAnswered = entries.every(([, v]) => v.length > 0);
          isCorrect =
            allAnswered &&
            entries.every(([leftId, rightId]) => rightId === leftId);
          userAnswer = JSON.stringify({
            matchingAnswer: Object.fromEntries(entries),
          });
        }
      } else {
        throw new BadRequestException('Unsupported question type');
      }

      return {
        questionId: q.id,
        userAnswer,
        isCorrect,
      };
    });

    const correctCount = normalizedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = normalizedAnswers.length;
    const scorePercent =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizSession.create({
        data: {
          userId,
          moduleId,
          totalQuestions,
          correctCount,
          scorePercent,
          completedAt: new Date(),
          answers: {
            create: normalizedAnswers.map((a) => ({
              questionId: a.questionId,
              userAnswer: a.userAnswer,
              isCorrect: a.isCorrect,
            })),
          },
        },
      });
      return created;
    });

    return this.getQuizSession(userId, moduleId, session.id);
  }
```

---

## Приложение Ж - сервис аутентификации

**Подпись в Word:** Листинг Ж - Регистрация и верификация почты, вход и выход пользователя, формирование JWT в httpOnly cookie (`setAuthCookie`), класс `AuthService`, проект QuizoO

```typescript
// --- AuthService: register, verifyEmailAndSignIn ---
async register(input: {
    email: string;
    password: string;
    username?: string | null;
  }): Promise<{ message: string }> {
    const email = input.email.trim().toLowerCase();
    this.assertPassword(input.password);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const code = this.generateSixDigitCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        username: input.username?.trim() || null,
        role: UserRole.USER,
        emailVerified: false,
        emailVerificationCode: code,
        emailVerificationExpiresAt: expires,
      },
    });

    await this.codes.emailVerification(email, code);

    return {
      message: 'Verification code sent to your email address.',
    };
  }

  async verifyEmailAndSignIn(
    emailRaw: string,
    codeRaw: string,
    res: Response,
    rememberMe = true,
  ): Promise<PublicUser> {
    const email = emailRaw.trim().toLowerCase();
    const code = codeRaw.trim();
    if (!code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid verification code');
    }
    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }
    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== code ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
      select: userPublicSelect,
    });

    await this.setAuthCookie(updated.id, res, { rememberMe });
    return updated;
  }

// --- AuthService: login, logout ---
async login(
    emailRaw: string,
    password: string,
    res: Response,
    rememberMe = true,
  ): Promise<PublicUser> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Verify your email before signing in');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.setAuthCookie(user.id, res, { rememberMe });
    const safe = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: userPublicSelect,
    });
    if (!safe) {
      throw new NotFoundException('User not found');
    }
    return safe;
  }

  logout(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
  }

// --- AuthService: setAuthCookie ---
private async setAuthCookie(
    userId: string,
    res: Response,
    options?: { rememberMe?: boolean },
  ): Promise<void> {
    const rememberMe = options?.rememberMe ?? true;
    const token = await this.jwt.signAsync(
      { sub: userId },
      { expiresIn: rememberMe ? '7d' : SESSION_TOKEN_TTL_SECONDS },
    );
    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax';
      path: string;
      maxAge?: number;
    } = {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    };
    if (rememberMe) {
      cookieOptions.maxAge = REMEMBER_ME_TTL_MS;
    }
    res.cookie(ACCESS_TOKEN_COOKIE, token, cookieOptions);
  }
```

---

## Приложение З - профиль пользователя (клиентская часть)

**Подпись в Word:** Листинг З - Обработчики профиля: выход, отображаемое имя, аватар, смена пароля и email (запросы к REST API), компонент `ProfilePage`, проект QuizoO

```tsx
const handleLogout = async () => {
  setLogoutPending(true);
  try {
    await apiClient.post('/auth/logout');
    signOutLocal();
    toast.success(t('profile.toastSignedOut'), { duration: 3500 });
    navigate('/', { replace: true });
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setLogoutPending(false);
    setLogoutOpen(false);
  }
};

const handleSaveNickname = async () => {
  const parsed = profileDisplayNameSchema.safeParse({
    displayName: nickname,
  });
  if (!parsed.success) {
    const err = fieldErrorsFromZod(parsed.error);
    setDisplayNameError(err.displayName ?? t('errors.invalidDisplayName'));
    return;
  }
  setDisplayNameError(null);
  const next = parsed.data.displayName === '' ? null : parsed.data.displayName;
  if (next === (user.username ?? null)) {
    toast(t('profile.toastNoChanges'), { duration: 2500 });
    return;
  }
  setNicknamePending(true);
  try {
    await apiClient.patch<ApiPublicUser>('/users/me', { username: next });
    await refresh();
    toast.success(t('profile.toastDisplayNameUpdated'));
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setNicknamePending(false);
  }
};

const handleAvatarFile = async (file: File | undefined) => {
  if (!file) return;

  if (!PROFILE_AVATAR_ACCEPT.split(',').includes(file.type)) {
    toast.error(t('profile.toastUseImageTypes'));
    return;
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    toast.error(t('profile.toastImageTooLarge'));
    return;
  }

  setAvatarPending(true);
  try {
    const fd = new FormData();
    fd.append('file', file);
    await apiClient.post<ApiPublicUser>('/users/me/avatar', fd, {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
      timeout: 60_000,
    });
    await refresh();
    toast.success(t('profile.toastPhotoUpdated'));
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setAvatarPending(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

const handleRemoveAvatar = async () => {
  if (!hasCustomAvatar) return;
  setAvatarPending(true);
  try {
    await apiClient.delete<ApiPublicUser>('/users/me/avatar');
    await refresh();
    toast.success(t('profile.toastPhotoRemoved'));
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setAvatarPending(false);
  }
};

const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  const parsed = profileChangePasswordSchema.safeParse({
    currentPassword: pwdCurrent,
    newPassword: pwdNew,
    passwordConfirm: pwdConfirm,
  });
  if (!parsed.success) {
    setPwdErrors(
      fieldErrorsFromZod(parsed.error) as Partial<
        Record<'currentPassword' | 'newPassword' | 'passwordConfirm', string>
      >,
    );
    return;
  }
  setPwdErrors({});
  setPwdPending(true);
  try {
    await apiClient.patch<ApiPublicUser>('/users/me/password', {
      currentPassword: pwdCurrent,
      newPassword: pwdNew,
    });
    await refresh();
    toast.success(t('profile.toastPasswordUpdated'));
    setPwdOpen(false);
    resetPasswordForm();
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setPwdPending(false);
  }
};

const handleChangeEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  const parsed = profileChangeEmailSchema.safeParse({
    newEmail: emailNew,
    currentPassword: emailPassword,
  });
  if (!parsed.success) {
    setEmailErrors(
      fieldErrorsFromZod(parsed.error) as Partial<
        Record<'newEmail' | 'currentPassword', string>
      >,
    );
    return;
  }
  const trimmed = parsed.data.newEmail.trim().toLowerCase();
  if (trimmed === user.email.toLowerCase()) {
    setEmailErrors({
      newEmail: t('profile.sameEmailError'),
    });
    return;
  }
  setEmailErrors({});
  setEmailPending(true);
  try {
    const { data } = await apiClient.patch<{
      user: ApiPublicUser;
      message: string;
    }>('/users/me/email', {
      newEmail: trimmed,
      currentPassword: parsed.data.currentPassword,
    });
    await refresh();
    toast.success(data.message, { duration: 5000 });
    setEmailOpen(false);
    resetEmailForm();
  } catch (err) {
    toast.error(apiErrorText(err, t));
  } finally {
    setEmailPending(false);
  }
};
```

---

## Приложение И - клиентский слой доступа к REST API

**Подпись в Word:** Листинг И - HTTP-клиент с передачей cookie и функции вызова API учебных модулей (`client.ts`, `modules.ts`), проект QuizoO

```typescript
// === frontend/src/lib/api/client.ts ===
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
});

type SessionExpiredHandler = () => boolean;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

const ignoredSessionEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-verification',
  '/auth/google',
];

function shouldHandleSessionExpiry(url?: string): boolean {
  if (!url) return true;
  return !ignoredSessionEndpoints.some((endpoint) => url.includes(endpoint));
}

export function setSessionExpiredHandler(
  handler: SessionExpiredHandler | null,
): void {
  sessionExpiredHandler = handler;
}

export function resetSessionExpiredNotification(): void {
  sessionExpiredNotified = false;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url;
      if (!sessionExpiredNotified && shouldHandleSessionExpiry(requestUrl)) {
        const handled = sessionExpiredHandler?.() ?? false;
        if (handled) {
          sessionExpiredNotified = true;
        }
      }
    }
    return Promise.reject(error);
  },
);

// === frontend/src/lib/api/modules.ts ===
import { apiClient } from '@/lib/api/client';
import type {
  CreateModuleResult,
  ModuleCard,
  ModuleDetail,
  ModuleId,
  ModuleListItem,
  ModuleQuestion,
  ModuleSessionActivity,
  ModuleType,
  ModulesDashboardSummary,
  QuizQuestionsPage,
  QuizSessionDetail,
  QuestionType,
} from '@/types/module';

export async function fetchModulesDashboardSummary() {
  const { data } =
    await apiClient.get<ModulesDashboardSummary>('/modules/summary');
  return data;
}

export async function fetchRecentModuleActivity(limit?: number) {
  const { data } = await apiClient.get<ModuleSessionActivity[]>(
    '/modules/activity',
    {
      params: limit ? { limit } : undefined,
    },
  );
  return data;
}

export async function fetchModuleList() {
  const { data } = await apiClient.get<ModuleListItem[]>('/modules');
  return data;
}

export async function createModule(payload: {
  title: string;
  description?: string | null;
  type: ModuleType;
}): Promise<CreateModuleResult> {
  const { data } = await apiClient.post<CreateModuleResult>(
    '/modules',
    payload,
  );
  return data;
}

export async function fetchModuleById(moduleId: ModuleId) {
  const { data } = await apiClient.get<ModuleDetail>(`/modules/${moduleId}`);
  return data;
}

export async function updateModule(
  moduleId: ModuleId,
  body: { title?: string; description?: string | null; type?: ModuleType },
) {
  const { data } = await apiClient.patch<CreateModuleResult>(
    `/modules/${moduleId}`,
    body,
  );
  return data;
}

export async function deleteModule(moduleId: ModuleId) {
  await apiClient.delete(`/modules/${moduleId}`);
}

export async function createCard(
  moduleId: ModuleId,
  body: { question: string; answer: string; orderIndex?: number },
) {
  const { data } = await apiClient.post<ModuleCard>(
    `/modules/${moduleId}/cards`,
    body,
  );
  return data;
}

export async function updateCard(
  moduleId: ModuleId,
  cardId: string,
  body: { question?: string; answer?: string; orderIndex?: number },
) {
  const { data } = await apiClient.patch<ModuleCard>(
    `/modules/${moduleId}/cards/${cardId}`,
    body,
  );
  return data;
}

export async function deleteCard(moduleId: ModuleId, cardId: string) {
  await apiClient.delete(`/modules/${moduleId}/cards/${cardId}`);
}

export async function createFlashcardSession(
  moduleId: ModuleId,
  body: { totalCards: number; knownCount: number; unknownCount: number },
) {
  const { data } = await apiClient.post<{
    id: string;
    moduleId: string;
    userId: string;
    totalCards: number;
    knownCount: number;
    unknownCount: number;
    completedAt: string | null;
  }>(`/modules/${moduleId}/flashcard-sessions`, body);
  return data;
}

export async function fetchQuizQuestionsPage(
  moduleId: ModuleId,
  params?: { take?: number; cursor?: string | null },
) {
  const { data } = await apiClient.get<QuizQuestionsPage>(
    `/modules/${moduleId}/quiz-questions`,
    { params },
  );
  return data;
}

export async function createQuizSession(
  moduleId: ModuleId,
  body: {
    answers: Array<{
      questionId: string;
      choiceOptionId?: string | null;
      choiceOptionIds?: string[] | null;
      textAnswer?: string | null;
      matchingAnswer?: Record<string, string> | null;
    }>;
  },
) {
  const { data } = await apiClient.post<QuizSessionDetail>(
    `/modules/${moduleId}/quiz-sessions`,
    body,
  );
  return data;
}

export async function fetchQuizSession(moduleId: ModuleId, sessionId: string) {
  const { data } = await apiClient.get<QuizSessionDetail>(
    `/modules/${moduleId}/quiz-sessions/${sessionId}`,
  );
  return data;
}

export async function createQuestion(
  moduleId: ModuleId,
  body: {
    questionText: string;
    type: QuestionType;
    allowMultipleAnswers?: boolean;
    orderIndex?: number;
    options?: Array<{ text: string; isCorrect: boolean }>;
    matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
  },
) {
  const { data } = await apiClient.post<ModuleQuestion>(
    `/modules/${moduleId}/questions`,
    body,
  );
  return data;
}

export async function updateQuestion(
  moduleId: ModuleId,
  questionId: string,
  body: {
    questionText?: string;
    type?: QuestionType;
    allowMultipleAnswers?: boolean;
    orderIndex?: number;
    options?: Array<{ text: string; isCorrect: boolean }>;
    matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
  },
) {
  const { data } = await apiClient.patch<ModuleQuestion>(
    `/modules/${moduleId}/questions/${questionId}`,
    body,
  );
  return data;
}

export async function deleteQuestion(moduleId: ModuleId, questionId: string) {
  await apiClient.delete(`/modules/${moduleId}/questions/${questionId}`);
}

function normalizedApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || '/api').trim();
  if (!raw) return '/api';
  const withoutTrailing = raw.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(withoutTrailing)) {
    return withoutTrailing;
  }
  return withoutTrailing.startsWith('/')
    ? withoutTrailing
    : `/${withoutTrailing}`;
}

export function questionImageUrl(
  moduleId: ModuleId,
  questionId: string,
  options?: { version?: string | number | null },
) {
  const apiBase = normalizedApiBaseUrl();
  const path = `/modules/${encodeURIComponent(moduleId)}/questions/${encodeURIComponent(questionId)}/image`;
  const base = `${apiBase}${path}`;
  const version = options?.version;
  if (version === undefined || version === null || version === '') {
    return base;
  }
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(String(version))}`;
}

export async function uploadQuestionImage(
  moduleId: ModuleId,
  questionId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ModuleQuestion>(
    `/modules/${moduleId}/questions/${questionId}/image`,
    formData,
    {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
      timeout: 60_000,
    },
  );
  return data;
}

export async function deleteQuestionImage(
  moduleId: ModuleId,
  questionId: string,
) {
  await apiClient.delete(`/modules/${moduleId}/questions/${questionId}/image`);
}
```

---

## Приложение К - редакторы учебных модулей

**Подпись в Word:** Листинг К - Элементы клиентских редакторов: перетаскивание вопросов квиза и работа с flashcard-модулем (`EditQuizModulePage`, `EditFlashcardModulePage`), проект QuizoO

```tsx
// --- EditQuizModulePage.tsx: строка списка вопросов (dnd-kit) ---
type SortableQuestionRowProps = {
  q: ModuleQuestion;
  index: number;
  total: number;
  canReorder: boolean;
  onEdit: (q: ModuleQuestion) => void;
  onDelete: (q: ModuleQuestion) => Promise<void>;
  onMoveUp: (questionId: string) => void;
  onMoveDown: (questionId: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const SortableQuestionRow = memo(function SortableQuestionRow({
  q,
  index,
  total,
  canReorder,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  t,
}: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: q.id,
    disabled: !canReorder,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const n = String(index + 1).padStart(2, '0');
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-stretch gap-3 rounded-2xl border border-(--border-default) bg-(--input-bg)/35 px-3 py-3 transition-colors duration-300 sm:px-4',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      <span
        className="w-7 shrink-0 select-none pt-0.5 font-(family-name:--font-jetbrains-mono) text-xs text-(--text-secondary)"
        aria-label={t('aria.order', { number: n })}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-(--text-primary) sm:text-base">
            {q.questionText}
          </h3>
          <span className="inline-flex items-center rounded-full bg-(--module-badge-violet-bg) px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
            {labelByType(q.type, t)}
          </span>
        </div>
        <p className="mt-1 text-sm text-(--text-secondary) sm:text-sm">
          {summarizeQuestion(q, t)}
        </p>
        {q.questionImageMime ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-(--text-secondary)">
            <ImageIcon className="size-3.5" />
            {t('editQuiz.imageAttached')}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {canReorder ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab text-(--text-secondary) hover:text-(--text-primary) active:cursor-grabbing"
            aria-label={t('editQuiz.reorder')}
            title={t('editQuiz.reorder')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveUp(q.id)}
          aria-label={t('editQuiz.moveUp')}
          disabled={!canReorder || index === 0}
        >
          <MoveUp className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveDown(q.id)}
          aria-label={t('editQuiz.moveDown')}
          disabled={!canReorder || index === total - 1}
        >
          <MoveDown className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onEdit(q)}
          aria-label={t('aria.editQuestion')}
        >
          <Pencil className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--danger-color)"
          onClick={() => void onDelete(q)}
          aria-label={t('aria.deleteQuestion')}
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </Button>
      </div>
    </li>
  );
});
SortableQuestionRow.displayName = 'SortableQuestionRow';

// --- EditFlashcardModulePage.tsx: загрузка модуля и CRUD карточек ---
export default function EditFlashcardModulePage() {
  const { t } = useI18n();
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [title, setTitle] = useState(t('edit.common.newFlashModule'));
  const [savedTitle, setSavedTitle] = useState(t('edit.common.newFlashModule'));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [cards, setCards] = useState<ModuleCard[]>([]);
  const [search, setSearch] = useState('');
  const [shuffle, setShuffle] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDurationSec, setTimerDurationSec] =
    useState<SessionTimerDurationSec>(600);

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ModuleCard | null>(null);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [deleteModulePending, setDeleteModulePending] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [importHelpOpen, setImportHelpOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty = title.trim() !== savedTitle;

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: Location;
        nextLocation: Location;
      }) => {
        if (allowNavigation) return false;
        if (!isDirty) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [allowNavigation, isDirty],
    ),
  );

  const leaveOpen = blocker.state === 'blocked';

  const load = useCallback(async () => {
    if (!moduleId) {
      setLoadState('notfound');
      return;
    }
    try {
      const m = await fetchModuleById(moduleId);
      if (m.type !== 'FLASHCARD') {
        setLoadState('wrongType');
        return;
      }
      setTitle(m.title);
      setSavedTitle(m.title);
      setTitleError(null);
      setCards(m.cards);
      setShuffle(readShuffle(m.id));
      setTimerEnabled(readFlashTimerEnabled(m.id));
      setTimerDurationSec(readFlashTimerDurationSec(m.id));
      setLoadState('ok');
    } catch {
      setLoadState('notfound');
    }
  }, [moduleId]);

  useEffect(() => {
    void clearFlashcardDraftInflight();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q),
    );
  }, [cards, search]);

  const openAddCard = useCallback(() => {
    if (cards.length >= MAX_FLASHCARDS_PER_MODULE) {
      toast.error(
        t('editFlash.validationMaxCards', { count: MAX_FLASHCARDS_PER_MODULE }),
      );
      return;
    }
    setEditingCard(null);
    setCardDialogOpen(true);
  }, [cards.length]);

  const openEditCard = useCallback((c: ModuleCard) => {
    setEditingCard(c);
    setCardDialogOpen(true);
  }, []);

  const onCreateCard = useCallback(
    async (question: string, answer: string) => {
      const created = await createCard(moduleId, {
        question,
        answer,
        orderIndex: cards.length,
      });
      setCards((prev) =>
        [...prev, created].sort((x, y) => x.orderIndex - y.orderIndex),
      );
      toast.success(t('editFlash.cardAdded'));
    },
    [cards.length, moduleId],
  );

  const onUpdateCard = useCallback(
    async (cardId: string, question: string, answer: string) => {
      const updated = await updateCard(moduleId, cardId, {
        question,
        answer,
      });
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(t('editFlash.cardUpdated'));
    },
    [moduleId],
  );

  const onDeleteCard = useCallback(
    async (c: ModuleCard) => {
      try {
        await deleteCard(moduleId, c.id);
        setCards((prev) => prev.filter((x) => x.id !== c.id));
        toast.success(t('editFlash.cardRemoved'));
      } catch {
        toast.error(t('editFlash.cardDeleteFailed'));
      }
    },
    [moduleId],
```

---

## Приложение Л - конфигурация развертывания

**Подпись в Word:** Листинг Л - Контейнеризация приложения и обратный прокси (`docker-compose.yml`, `Dockerfile` backend и frontend, `nginx.conf`), проект QuizoO

```text
# docker-compose.yml
services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-quizoo_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-quizoo_pass}
      POSTGRES_DB: ${POSTGRES_DB:-quizoo}
    ports:
      - '5432:5432'
    volumes:
      - postgres18_data:/var/lib/postgresql
    networks:
      - app-network

  backend:
    build:
      context: ./backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-quizoo_user}:${POSTGRES_PASSWORD:-quizoo_pass}@postgres:5432/${POSTGRES_DB:-quizoo}?schema=public
      PORT: 3001
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET:-local_docker_dev_secret_change_me}
      CORS_ORIGIN: ${CORS_ORIGIN:-https://localhost,http://localhost}
      AUTH_FRONTEND_URL: ${AUTH_FRONTEND_URL:-https://localhost}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
      GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI:-}
      SMTP_HOST: ${SMTP_HOST:-smtp.gmail.com}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_SECURE: ${SMTP_SECURE:-false}
      SMTP_USER: ${SMTP_USER:-}
      SMTP_PASS: ${SMTP_PASS:-}
      SMTP_FROM: ${SMTP_FROM:-QuizoO <no-reply@quizoo.local>}
    depends_on:
      - postgres
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - app-network

  frontend-builder:
    build:
      context: ./frontend
    restart: 'no'
    volumes:
      - frontend_dist:/out
    networks:
      - app-network

  nginx:
    image: nginx:1.28-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - frontend_dist:/usr/share/nginx/html:ro
    depends_on:
      backend:
        condition: service_started
      frontend-builder:
        condition: service_completed_successfully
    networks:
      - app-network

volumes:
  postgres18_data:
  frontend_dist:
  backend_uploads:

networks:
  app-network:
    driver: bridge

# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

FROM alpine:3.22 AS export
WORKDIR /app
COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "mkdir -p /out && rm -rf /out/* && cp -r /app/dist/. /out/ && echo 'Frontend bundle exported to /out'"]

# nginx/nginx.conf
server {
    listen 443 ssl;
    server_name localhost;
    client_max_body_size 5m;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    resolver 127.0.0.11 ipv6=off valid=30s;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        set $backend_upstream http://backend:3001;
        proxy_pass $backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name localhost;
    return 301 https://$host$request_uri;
}
```

---

## Приложение М - автоматизированное тестирование серверной части

**Подпись в Word:** Листинг М - Юнит-тесты сервиса и контроллера учебных модулей (Jest, NestJS), проект QuizoO

```typescript
// === modules.service.spec.ts ===
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

// === modules.controller.spec.ts ===
import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

function createModulesServiceMock() {
  return {
    getRecentActivity: jest.fn(),
    createModule: jest.fn(),
    saveQuestionImage: jest.fn(),
    getQuestionImageForDownload: jest.fn(),
    clearQuestionImage: jest.fn(),
  } as unknown as ModulesService;
}

function createResponseMock(): Response {
  return {
    setHeader: jest.fn(),
  } as unknown as Response;
}

describe('ModulesController', () => {
  let controller: ModulesController;
  let modules: ReturnType<typeof createModulesServiceMock>;

  beforeEach(() => {
    modules = createModulesServiceMock();
    controller = new ModulesController(modules);
  });

  it('passes limit to recent activity service method', async () => {
    modules.getRecentActivity = jest.fn().mockResolvedValue([]);

    await controller.getActivity('u1', 15);

    expect(modules.getRecentActivity).toHaveBeenCalledWith('u1', 15);
  });

  it('delegates module creation payload to service', async () => {
    modules.createModule = jest
      .fn()
      .mockResolvedValue({ id: 'm1', title: 'Biology quiz' });

    await controller.create('u1', {
      title: 'Biology quiz',
      type: 'QUIZ' as never,
    });

    expect(modules.createModule).toHaveBeenCalledWith('u1', {
      title: 'Biology quiz',
      type: 'QUIZ',
    });
  });

  it('rejects image upload when multipart file is missing', async () => {
    expect(() =>
      controller.uploadQuestionImage('u1', 'm1', 'q1', undefined),
    ).toThrow(BadRequestException);
  });

  it('uploads question image through service with buffer and mime', async () => {
    modules.saveQuestionImage = jest
      .fn()
      .mockResolvedValue({ id: 'q1', questionImageMime: 'image/png' });

    await controller.uploadQuestionImage('u1', 'm1', 'q1', {
      buffer: Buffer.from('png-bytes'),
      mimetype: 'image/png',
    } as Express.Multer.File);

    expect(modules.saveQuestionImage).toHaveBeenCalledWith(
      'u1',
      'm1',
      'q1',
      expect.any(Buffer),
      'image/png',
    );
  });

  it('throws not found when question image is absent', async () => {
    modules.getQuestionImageForDownload = jest.fn().mockResolvedValue(null);

    await expect(
      controller.getQuestionImage(
        'u1',
        'm1',
        'q1',
        createResponseMock() as Response,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sets response headers and returns streamable image file', async () => {
    modules.getQuestionImageForDownload = jest.fn().mockResolvedValue({
      path: '/etc/hosts',
      mime: 'image/png',
    });
    const res = createResponseMock();

    const stream = await controller.getQuestionImage('u1', 'm1', 'q1', res);

    expect(res.setHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'image/png',
    );
    expect(res.setHeader).toHaveBeenNthCalledWith(
      2,
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    expect(res.setHeader).toHaveBeenNthCalledWith(3, 'Pragma', 'no-cache');
    expect(res.setHeader).toHaveBeenNthCalledWith(4, 'Expires', '0');
    expect(stream).toBeInstanceOf(StreamableFile);
  });
});
```
