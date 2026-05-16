# Database Structure (Current)

Актуальный источник структуры: `backend/prisma/schema.prisma`.
СУБД: PostgreSQL, ORM: Prisma.

## Enums

- `UserRole`: `USER`, `ADMIN`
- `ModuleType`: `FLASHCARD`, `QUIZ`
- `QuestionType`: `CHOICE`, `TEXT`, `MATCHING`

## `Click` (таблица в БД: `Click`)

| Поле        | Тип             | Ограничения                    | Описание                   |
| ----------- | --------------- | ------------------------------ | -------------------------- |
| `id`        | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()` | Идентификатор записи клика |
| `createdAt` | `DateTime`      | `NOT NULL, DEFAULT now()`      | Время создания записи      |

## `User` (таблица в БД: `users`)

| Поле                         | Тип              | Ограничения                    | Описание                                |
| ---------------------------- | ---------------- | ------------------------------ | --------------------------------------- |
| `id`                         | `String (CUID)`  | `PK, NOT NULL, DEFAULT cuid()` | Идентификатор пользователя              |
| `email`                      | `String`         | `UNIQUE, NOT NULL`             | Email пользователя                      |
| `passwordHash`               | `String`         | `NOT NULL`                     | Хеш пароля                              |
| `username`                   | `String`         | `NULL`                         | Отображаемое имя                        |
| `role`                       | `Enum(UserRole)` | `NOT NULL, DEFAULT USER`       | Роль (`USER`/`ADMIN`)                   |
| `isBlocked`                  | `Boolean`        | `NOT NULL, DEFAULT false`      | Флаг блокировки пользователя            |
| `oauthProvider`              | `String`         | `NULL`                         | Провайдер OAuth (например, `google`)    |
| `oauthId`                    | `String`         | `NULL`                         | Идентификатор пользователя у провайдера |
| `emailVerified`              | `Boolean`        | `NOT NULL, DEFAULT false`      | Подтвержден ли email                    |
| `emailVerificationCode`      | `String`         | `NULL`                         | Код подтверждения email                 |
| `emailVerificationExpiresAt` | `DateTime`       | `NULL`                         | Срок действия кода подтверждения        |
| `passwordResetCode`          | `String`         | `NULL`                         | Код сброса пароля                       |
| `passwordResetExpiresAt`     | `DateTime`       | `NULL`                         | Срок действия кода сброса               |
| `avatarMime`                 | `String`         | `NULL`                         | MIME-тип аватара                        |
| `createdAt`                  | `DateTime`       | `NOT NULL, DEFAULT now()`      | Дата создания                           |
| `updatedAt`                  | `DateTime`       | `NOT NULL, @updatedAt`         | Дата последнего обновления              |

Доп. ограничения:

- `@@unique([oauthProvider, oauthId])`

## `Module` (таблица в БД: `modules`)

| Поле          | Тип                | Ограничения                       | Описание                        |
| ------------- | ------------------ | --------------------------------- | ------------------------------- |
| `id`          | `String (CUID)`    | `PK, NOT NULL, DEFAULT cuid()`    | Идентификатор модуля            |
| `userId`      | `String`           | `FK -> users.id, NOT NULL, INDEX` | Владелец модуля                 |
| `title`       | `String`           | `NOT NULL`                        | Название модуля                 |
| `description` | `String`           | `NULL`                            | Описание модуля                 |
| `type`        | `Enum(ModuleType)` | `NOT NULL`                        | Тип модуля (`FLASHCARD`/`QUIZ`) |
| `createdAt`   | `DateTime`         | `NOT NULL, DEFAULT now()`         | Дата создания                   |
| `updatedAt`   | `DateTime`         | `NOT NULL, @updatedAt`            | Дата последнего обновления      |

## `Card` (таблица в БД: `cards`)

| Поле         | Тип             | Ограничения                         | Описание                              |
| ------------ | --------------- | ----------------------------------- | ------------------------------------- |
| `id`         | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`      | Идентификатор карточки                |
| `moduleId`   | `String`        | `FK -> modules.id, NOT NULL, INDEX` | Модуль, к которому относится карточка |
| `question`   | `String`        | `NOT NULL`                          | Вопрос карточки                       |
| `answer`     | `String`        | `NOT NULL`                          | Ответ карточки                        |
| `orderIndex` | `Int`           | `NOT NULL, DEFAULT 0`               | Порядок карточки в модуле             |
| `createdAt`  | `DateTime`      | `NOT NULL, DEFAULT now()`           | Дата создания                         |

## `Question` (таблица в БД: `questions`)

| Поле                   | Тип                  | Ограничения                         | Описание                                 |
| ---------------------- | -------------------- | ----------------------------------- | ---------------------------------------- |
| `id`                   | `String (CUID)`      | `PK, NOT NULL, DEFAULT cuid()`      | Идентификатор вопроса                    |
| `moduleId`             | `String`             | `FK -> modules.id, NOT NULL, INDEX` | Модуль, к которому относится вопрос      |
| `questionText`         | `String`             | `NOT NULL`                          | Текст вопроса                            |
| `type`                 | `Enum(QuestionType)` | `NOT NULL`                          | Тип вопроса (`CHOICE`/`TEXT`/`MATCHING`) |
| `allowMultipleAnswers` | `Boolean`            | `NOT NULL, DEFAULT false`           | Можно ли выбрать несколько ответов       |
| `questionImageMime`    | `String`             | `NULL`                              | MIME-тип изображения вопроса             |
| `orderIndex`           | `Int`                | `NOT NULL, DEFAULT 0`               | Порядок вопроса в модуле                 |
| `createdAt`            | `DateTime`           | `NOT NULL, DEFAULT now()`           | Дата создания                            |

## `MatchingPair` (таблица в БД: `matching_pairs`)

| Поле         | Тип             | Ограничения                           | Описание             |
| ------------ | --------------- | ------------------------------------- | -------------------- |
| `id`         | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`        | Идентификатор пары   |
| `questionId` | `String`        | `FK -> questions.id, NOT NULL, INDEX` | Вопрос типа MATCHING |
| `leftItem`   | `String`        | `NOT NULL`                            | Левая часть пары     |
| `rightItem`  | `String`        | `NOT NULL`                            | Правая часть пары    |

## `QuestionOption` (таблица в БД: `question_options`)

| Поле         | Тип             | Ограничения                           | Описание                       |
| ------------ | --------------- | ------------------------------------- | ------------------------------ |
| `id`         | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`        | Идентификатор варианта         |
| `questionId` | `String`        | `FK -> questions.id, NOT NULL, INDEX` | Вопрос типа CHOICE             |
| `text`       | `String`        | `NOT NULL`                            | Текст варианта ответа          |
| `isCorrect`  | `Boolean`       | `NOT NULL, DEFAULT false`             | Является ли вариант правильным |

## `FlashcardSession` (таблица в БД: `flashcard_sessions`)

| Поле           | Тип             | Ограничения                         | Описание                         |
| -------------- | --------------- | ----------------------------------- | -------------------------------- |
| `id`           | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`      | Идентификатор сессии             |
| `userId`       | `String`        | `FK -> users.id, NOT NULL, INDEX`   | Пользователь, проходивший сессию |
| `moduleId`     | `String`        | `FK -> modules.id, NOT NULL, INDEX` | Модуль с карточками              |
| `totalCards`   | `Int`           | `NOT NULL`                          | Всего карточек в сессии          |
| `knownCount`   | `Int`           | `NOT NULL`                          | Количество "знаю"                |
| `unknownCount` | `Int`           | `NOT NULL`                          | Количество "не знаю"             |
| `completedAt`  | `DateTime`      | `NULL`                              | Время завершения сессии          |

## `QuizSession` (таблица в БД: `quiz_sessions`)

| Поле             | Тип             | Ограничения                         | Описание                       |
| ---------------- | --------------- | ----------------------------------- | ------------------------------ |
| `id`             | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`      | Идентификатор сессии квиза     |
| `userId`         | `String`        | `FK -> users.id, NOT NULL, INDEX`   | Пользователь, проходивший квиз |
| `moduleId`       | `String`        | `FK -> modules.id, NOT NULL, INDEX` | Модуль квиза                   |
| `totalQuestions` | `Int`           | `NOT NULL`                          | Количество вопросов            |
| `correctCount`   | `Int`           | `NOT NULL`                          | Количество правильных ответов  |
| `scorePercent`   | `Float`         | `NOT NULL`                          | Результат в процентах          |
| `completedAt`    | `DateTime`      | `NULL`                              | Время завершения сессии        |

## `QuizAnswer` (таблица в БД: `quiz_answers`)

| Поле         | Тип             | Ограничения                               | Описание                                            |
| ------------ | --------------- | ----------------------------------------- | --------------------------------------------------- |
| `id`         | `String (CUID)` | `PK, NOT NULL, DEFAULT cuid()`            | Идентификатор ответа                                |
| `sessionId`  | `String`        | `FK -> quiz_sessions.id, NOT NULL, INDEX` | Сессия квиза                                        |
| `questionId` | `String`        | `FK -> questions.id, NOT NULL, INDEX`     | Вопрос, на который дан ответ                        |
| `userAnswer` | `String`        | `NULL`                                    | Ответ пользователя (текст/сериализованное значение) |
| `isCorrect`  | `Boolean`       | `NOT NULL`                                | Корректность ответа                                 |

Доп. ограничения:

- `@@unique([sessionId, questionId])`

## Summary of Relations

- `users (1) -> (N) modules`
- `users (1) -> (N) flashcard_sessions`
- `users (1) -> (N) quiz_sessions`
- `modules (1) -> (N) cards`
- `modules (1) -> (N) questions`
- `modules (1) -> (N) flashcard_sessions`
- `modules (1) -> (N) quiz_sessions`
- `questions (1) -> (N) matching_pairs`
- `questions (1) -> (N) question_options`
- `questions (1) -> (N) quiz_answers`
- `quiz_sessions (1) -> (N) quiz_answers`

## Delete Rules

По всем перечисленным внешним ключам используется `onDelete: Cascade`.

## Notes for Coursework

- Явные роли в БД только две: `USER` и `ADMIN`.
- "Гость" не хранится в поле `role`; это неаутентифицированное состояние пользователя.
