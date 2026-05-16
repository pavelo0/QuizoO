# QuizoO — описание REST API (контекст для курсовой записки)

Документ предназначен для передачи в нейросеть: здесь зафиксированы **фактические** маршруты и принципы API backend-приложения **QuizoO** (платформа карточек и квизов, NestJS + Prisma + PostgreSQL).

## 3.3 Описание REST API

REST API серверной части построен вокруг ресурсов **auth**, **users** и **modules**; дополнительно корневой контроллер отдаёт health-check и публичный счётчик обращений. Все пути ниже указаны относительно префикса **`/api`**.

---

## Общие сведения

- **Базовый префикс:** все маршруты начинаются с `/api` (задаётся в `backend/src/main.ts`: `setGlobalPrefix('api')`).
- **Стиль:** REST-подход по ресурсам (`auth`, `users`, `modules`) плюс служебные маршруты корня приложения (`health`, `click`).
- **Формат по умолчанию:** JSON; загрузка файлов — `multipart/form-data` с полем `file`.
- **CORS:** включён с `credentials: true`; список origin задаётся переменной окружения `CORS_ORIGIN` (несколько значений через запятую).

### Аутентификация и авторизация

- **Модель сессии:** после успешного входа, подтверждения email, сброса пароля или OAuth сервер выставляет **httpOnly cookie** с JWT. Имя cookie: `quizoo_access_token` (константа `ACCESS_TOKEN_COOKIE` в `backend/src/auth/constants.ts`).
- **Передача токена:** клиент (axios) запрашивает API с `withCredentials: true`; заголовок `Authorization: Bearer` в проекте **не используется** для обычных запросов.
- **Защита маршрутов:** глобальный **`JwtAuthGuard`**; маршруты без токена помечены декоратором **`@Public()`** на контроллере или методе.
- **Идентификация пользователя:** из валидного JWT извлекается `sub` (id пользователя), далее используется в обработчиках.
- **Отдельного refresh-токена и эндпоинта `/auth/refresh` нет:** срок жизни JWT задаётся при выдаче (см. логику `AuthService`: при `rememberMe: true` — до 7 суток, при `false` — 12 часов).

### Административные маршруты

Эндпоинты с префиксом `/api/users/admin/...` доступны только пользователю с ролью **`ADMIN`** в таблице `users`; иначе ответ с отказом в доступе (проверка в `UsersService`).

---

## Таблица 1 — Полный перечень маршрутов REST API

В колонке «Путь» указан суффикс **после** `/api`. Например, полный URL при локальном backend: `http://localhost:3001/api/modules`.

| Метод  | Путь                                             | Контроллер          | Доступ      | Назначение                                                |
| ------ | ------------------------------------------------ | ------------------- | ----------- | --------------------------------------------------------- |
| GET    | `/`                                              | `AppController`     | Публичный   | Проверка отклика (строка приветствия)                     |
| GET    | `/health`                                        | `AppController`     | Публичный   | Health-check `{ status: 'ok' }`                           |
| POST   | `/click`                                         | `AppController`     | Публичный   | Запись события «клик» (модель `Click`)                    |
| GET    | `/clicks`                                        | `AppController`     | Публичный   | Количество записей `Click`                                |
| POST   | `/auth/register`                                 | `AuthController`    | Публичный   | Регистрация; выдача кода подтверждения email              |
| POST   | `/auth/resend-verification`                      | `AuthController`    | Публичный   | Повторная отправка кода верификации                       |
| POST   | `/auth/verify-email`                             | `AuthController`    | Публичный   | Подтверждение email по коду; установка cookie сессии      |
| POST   | `/auth/login`                                    | `AuthController`    | Публичный   | Вход (только если email подтверждён); cookie              |
| POST   | `/auth/logout`                                   | `AuthController`    | Публичный   | Очистка cookie сессии                                     |
| POST   | `/auth/forgot-password`                          | `AuthController`    | Публичный   | Запрос кода сброса пароля                                 |
| POST   | `/auth/reset-password`                           | `AuthController`    | Публичный   | Смена пароля по коду; cookie                              |
| GET    | `/auth/google`                                   | `AuthController`    | Публичный   | Редирект на Google OAuth                                  |
| GET    | `/auth/google/callback`                          | `AuthController`    | Публичный   | Callback OAuth; редирект на фронтенд                      |
| GET    | `/users/me`                                      | `UsersController`   | Авторизован | Текущий пользователь (публичное DTO)                      |
| GET    | `/users/me/avatar`                               | `UsersController`   | Авторизован | Скачивание файла аватара (binary)                         |
| PATCH  | `/users/me`                                      | `UsersController`   | Авторизован | Обновление `username` (поле обязательно в теле)           |
| PATCH  | `/users/me/password`                             | `UsersController`   | Авторизован | Смена пароля: `currentPassword`, `newPassword`            |
| PATCH  | `/users/me/email`                                | `UsersController`   | Авторизован | Смена email с подтверждением текущим паролем              |
| POST   | `/users/me/avatar`                               | `UsersController`   | Авторизован | Загрузка аватара (`multipart`, поле `file`)               |
| DELETE | `/users/me/avatar`                               | `UsersController`   | Авторизован | Удаление аватара                                          |
| GET    | `/users/admin/overview`                          | `UsersController`   | ADMIN       | Сводка для админ-панели                                   |
| GET    | `/users/admin/users`                             | `UsersController`   | ADMIN       | Список пользователей                                      |
| PATCH  | `/users/admin/users/:targetUserId/block`         | `UsersController`   | ADMIN       | Блокировка/разблокировка: тело `{ isBlocked: boolean }`   |
| GET    | `/users/admin/modules`                           | `UsersController`   | ADMIN       | Список модулей всех пользователей                         |
| GET    | `/modules/summary`                               | `ModulesController` | Авторизован | Сводка дашборда по модулям пользователя                   |
| GET    | `/modules/activity`                              | `ModulesController` | Авторизован | Недавняя активность; query `limit?`                       |
| GET    | `/modules`                                       | `ModulesController` | Авторизован | Список модулей текущего пользователя                      |
| POST   | `/modules`                                       | `ModulesController` | Авторизован | Создание модуля (`CreateModuleDto`)                       |
| GET    | `/modules/:moduleId`                             | `ModulesController` | Авторизован | Детали модуля и контент (карточки / вопросы)              |
| GET    | `/modules/:moduleId/quiz-questions`              | `ModulesController` | Авторизован | Постраничная выдача вопросов квиза: `take?`, `cursor?`    |
| PATCH  | `/modules/:moduleId`                             | `ModulesController` | Авторизован | Обновление модуля (`UpdateModuleDto`)                     |
| DELETE | `/modules/:moduleId`                             | `ModulesController` | Авторизован | Удаление модуля                                           |
| POST   | `/modules/:moduleId/cards`                       | `ModulesController` | Авторизован | Добавление карточки                                       |
| PATCH  | `/modules/:moduleId/cards/:cardId`               | `ModulesController` | Авторизован | Редактирование карточки                                   |
| DELETE | `/modules/:moduleId/cards/:cardId`               | `ModulesController` | Авторизован | Удаление карточки                                         |
| POST   | `/modules/:moduleId/flashcard-sessions`          | `ModulesController` | Авторизован | Завершение сессии карточек (статистика)                   |
| POST   | `/modules/:moduleId/quiz-sessions`               | `ModulesController` | Авторизован | Отправка ответов и создание сессии квиза                  |
| GET    | `/modules/:moduleId/quiz-sessions/:sessionId`    | `ModulesController` | Авторизован | Детали сессии квиза с ответами                            |
| POST   | `/modules/:moduleId/questions`                   | `ModulesController` | Авторизован | Создание вопроса квиза                                    |
| PATCH  | `/modules/:moduleId/questions/:questionId`       | `ModulesController` | Авторизован | Обновление вопроса и вариантов / пар                      |
| DELETE | `/modules/:moduleId/questions/:questionId`       | `ModulesController` | Авторизован | Удаление вопроса                                          |
| POST   | `/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован | Загрузка изображения к вопросу (`multipart`, поле `file`) |
| GET    | `/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован | Выдача изображения вопроса                                |
| DELETE | `/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован | Удаление изображения вопроса                              |

**Порядок маршрутов в `ModulesController` важен:** статические сегменты (`summary`, `activity`) объявлены **раньше** параметрического `:moduleId`, чтобы не перехватывались как id модуля.

**Итого:** в таблице **44** HTTP-эндпоинта (все объявленные в коде контроллеров).

---

## Таблица 2 — Форматы данных: аутентификация (`/api/auth/*`)

| Эндпоинт                         | Тело запроса (JSON)                           | Ответ (упрощённо)                                                                                                                           |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| POST `/auth/register`            | `email`, `password`, опционально `username`   | `{ message, verificationCode? }` — код в ответе только при `AUTH_RETURN_VERIFICATION_CODE=true`; в обычном режиме код пишется в лог сервера |
| POST `/auth/verify-email`        | `email`, `code`, опционально `rememberMe`     | Объект пользователя (`PublicUser`); **Set-Cookie** с JWT                                                                                    |
| POST `/auth/login`               | `email`, `password`, опционально `rememberMe` | `PublicUser` + **cookie**                                                                                                                   |
| POST `/auth/logout`              | —                                             | `{ ok: true }`, очистка cookie                                                                                                              |
| POST `/auth/forgot-password`     | `email`                                       | `{ message, resetCode? }` — аналогично флагу возврата кода                                                                                  |
| POST `/auth/reset-password`      | `email`, `code`, `newPassword`                | `PublicUser` + **cookie**                                                                                                                   |
| POST `/auth/resend-verification` | `email`                                       | `{ message, verificationCode? }`                                                                                                            |
| GET `/auth/google`               | —                                             | **302** на Google                                                                                                                           |
| GET `/auth/google/callback`      | query: `code`, `state`                        | **302** на URL фронтенда (`AUTH_FRONTEND_URL`), возможен query `oauthError`                                                                 |

Коды подтверждения email и сброса пароля — **шестизначные**, время жизни **15 минут** (константа в `AuthService`). Доставка кодов в текущей реализации: **лог сервера** (`VerificationCodeDeliveryService`), не SMTP.

---

## Таблица 3 — Форматы данных: пользователь (`/api/users/*`)

| Эндпоинт                   | Тело / параметры                                | Ответ                                                                       |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| GET `/users/me`            | —                                               | `PublicUser` (без секретных полей)                                          |
| PATCH `/users/me`          | обязательно поле `username` (строка или `null`) | `PublicUser`                                                                |
| PATCH `/users/me/password` | `currentPassword`, `newPassword`                | `PublicUser`                                                                |
| PATCH `/users/me/email`    | `newEmail`, `currentPassword`                   | `{ user, message, verificationCode? }` — повторная верификация нового email |
| POST `/users/me/avatar`    | `multipart/form-data`, поле `file`              | `PublicUser`                                                                |
| DELETE `/users/me/avatar`  | —                                               | `PublicUser`                                                                |
| GET `/users/me/avatar`     | —                                               | Поток файла изображения (`Content-Type` по `avatarMime`)                    |

---

## Таблица 4 — Форматы данных: учебные модули (`/api/modules/*`)

**Создание модуля** POST `/modules`: `title`, `description?`, `type` — значения enum Prisma `FLASHCARD` | `QUIZ` (`CreateModuleDto`).

**Карточки** (модуль типа FLASHCARD): тела для create/update содержат `question`, `answer`, опционально `orderIndex`.

**Вопросы квиза** (модуль QUIZ): `questionText`, `type` (`CHOICE` | `TEXT` | `MATCHING`), `allowMultipleAnswers?`, `orderIndex?`, массивы `options` (для выбора), `matchingPairs` (для соответствий).

**Сессия карточек** POST `.../flashcard-sessions`: `totalCards`, `knownCount`, `unknownCount` (логика валидации — в сервисе).

**Сессия квиза** POST `.../quiz-sessions`: массив `answers` с полями в зависимости от типа вопроса (`choiceOptionId`, `choiceOptionIds`, `textAnswer`, `matchingAnswer` как объект соответствий).

**Постраничная выдача вопросов** GET `.../quiz-questions`: параметры `take`, `cursor` (курсорная пагинация).

---

## Frontend и прокси

- Базовый URL для axios: `import.meta.env.VITE_API_URL` или по умолчанию **`/api`** (относительный путь к backend за Nginx).
- В Docker **Nginx** проксирует `/api/` на контейнер `backend:3001`, TLS на 443.

---

## Чего в API нет (чтобы нейросеть не выдумала)

- Нет ресурсов `teams`, `review-requests`, `code-versions`, `comments`, `notifications`.
- Нет WebSocket-уведомлений и отдельного REST для «лента уведомлений».
- Нет эндпоинтов `POST /auth/refresh`, `GET /auth/me`, `PATCH /auth/change-password` в `AuthController` (смена пароля у пользователя — через `PATCH /users/me/password`).
- Нет выдачи access-токена в **теле** JSON как основного способа авторизации; основной способ — **cookie**.

---

_Источники в репозитории:_ `backend/src/main.ts`, `backend/src/app.controller.ts`, `backend/src/auth/auth.controller.ts`, `backend/src/users/users.controller.ts`, `backend/src/modules/modules.controller.ts`, `backend/src/auth/jwt-auth.guard.ts`, `backend/prisma/schema.prisma`.
