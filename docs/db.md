## Актуальная схема БД QuizoO (по `backend/prisma/schema.prisma`)

Ниже зафиксирована структура, которая **должна считаться источником истины** и полностью соответствует Prisma-схеме.

### Справочники и enum-ы

- `UserRole`: `USER`, `ADMIN`
- `ModuleType`: `FLASHCARD`, `QUIZ`
- `QuestionType`: `CHOICE`, `TEXT`, `MATCHING`

### Техническая модель

#### `Click` (таблица по умолчанию `Click`)

- `id` (PK, `String`, `cuid()`)
- `createdAt` (`DateTime`, `now()`)

Используется как простая техническая сущность (в учебный контур не входит).

### Основные сущности

#### `User` (`users`)

- `id` (PK)
- `email` (UNIQUE)
- `passwordHash`
- `username` (nullable)
- `role` (`UserRole`, default `USER`)
- `isBlocked` (default `false`)
- `oauthProvider` (nullable)
- `oauthId` (nullable)
- `emailVerified` (default `false`)
- `emailVerificationCode` (nullable)
- `emailVerificationExpiresAt` (nullable)
- `passwordResetCode` (nullable)
- `passwordResetExpiresAt` (nullable)
- `avatarMime` (nullable)
- `createdAt`
- `updatedAt`

Ограничения:

- `@@unique([oauthProvider, oauthId])`

Связи:

- `User 1 -> M Module`
- `User 1 -> M FlashcardSession`
- `User 1 -> M QuizSession`

#### `Module` (`modules`)

- `id` (PK)
- `userId` (FK -> `users.id`)
- `title`
- `description` (nullable)
- `type` (`ModuleType`)
- `createdAt`
- `updatedAt`

Связи:

- `Module M -> 1 User` (`onDelete: Cascade`)
- `Module 1 -> M Card`
- `Module 1 -> M Question`
- `Module 1 -> M FlashcardSession`
- `Module 1 -> M QuizSession`

#### `Card` (`cards`)

- `id` (PK)
- `moduleId` (FK -> `modules.id`)
- `question`
- `answer`
- `orderIndex` (default `0`)
- `createdAt`

Связи:

- `Card M -> 1 Module` (`onDelete: Cascade`)

#### `Question` (`questions`)

- `id` (PK)
- `moduleId` (FK -> `modules.id`)
- `questionText`
- `type` (`QuestionType`)
- `allowMultipleAnswers` (default `false`)
- `questionImageMime` (nullable)
- `orderIndex` (default `0`)
- `acceptedVariants` (`String[]`, default `[]`) — допустимые синонимы для TEXT (напр. `Paris` при эталоне `Париж`)
- `createdAt`

Связи:

- `Question M -> 1 Module` (`onDelete: Cascade`)
- `Question 1 -> M QuestionOption`
- `Question 1 -> M MatchingPair`
- `Question 1 -> M QuizAnswer`

#### `QuestionOption` (`question_options`)

- `id` (PK)
- `questionId` (FK -> `questions.id`)
- `text`
- `isCorrect` (default `false`)

Связи:

- `QuestionOption M -> 1 Question` (`onDelete: Cascade`)

#### `MatchingPair` (`matching_pairs`)

- `id` (PK)
- `questionId` (FK -> `questions.id`)
- `leftItem`
- `rightItem`

Связи:

- `MatchingPair M -> 1 Question` (`onDelete: Cascade`)

### Сущности результатов обучения

#### `FlashcardSession` (`flashcard_sessions`)

- `id` (PK)
- `userId` (FK -> `users.id`)
- `moduleId` (FK -> `modules.id`)
- `totalCards`
- `knownCount`
- `unknownCount`
- `completedAt` (nullable)

Связи:

- `FlashcardSession M -> 1 User` (`onDelete: Cascade`)
- `FlashcardSession M -> 1 Module` (`onDelete: Cascade`)

#### `QuizSession` (`quiz_sessions`)

- `id` (PK)
- `userId` (FK -> `users.id`)
- `moduleId` (FK -> `modules.id`)
- `totalQuestions`
- `correctCount`
- `scorePercent` (`Float`)
- `completedAt` (nullable)

Связи:

- `QuizSession M -> 1 User` (`onDelete: Cascade`)
- `QuizSession M -> 1 Module` (`onDelete: Cascade`)
- `QuizSession 1 -> M QuizAnswer`

#### `QuizAnswer` (`quiz_answers`)

- `id` (PK)
- `sessionId` (FK -> `quiz_sessions.id`)
- `questionId` (FK -> `questions.id`)
- `userAnswer` (nullable)
- `isCorrect`

Ограничения:

- `@@unique([sessionId, questionId])`

Связи:

- `QuizAnswer M -> 1 QuizSession` (`onDelete: Cascade`)
- `QuizAnswer M -> 1 Question` (`onDelete: Cascade`)

### Важные замечания по соответствию

- Все внешние ключи в Prisma заданы с `onDelete: Cascade`.
- Для названий таблиц используются `@@map(...)` (кроме `Click`, где имя остается `Click`).
- Поля `allowMultipleAnswers`, `questionImageMime` (в `Question`) и поля верификации/сброса пароля (в `User`) являются обязательной частью актуальной схемы и должны присутствовать в документации/диаграмме.
