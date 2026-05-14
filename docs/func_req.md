# 3 Реализация web-приложения Quizoo

Проект **Quizoo** — веб-приложение для создания учебных модулей двух типов (модуль карточек и модуль викторины), их прохождения и учёта результатов. Ниже описаны фактически используемые в репозитории средства, схема данных, REST API и ключевые сценарии работы.

## 3.1 Программные средства реализации

Серверная часть реализована на платформе **Node.js** в связке с фреймворком **NestJS** (модульная архитектура, внедрение зависимостей через встроенный IoC-контейнер). В качестве СУБД используется **PostgreSQL** (реляционная модель, ACID-транзакции). Доступ к данным организован через **Prisma ORM**: схема описывается в декларативном файле `schema.prisma`, изменения БД накатываются миграциями в каталоге `backend/prisma/migrations`.

Клиентская часть — одностраничное приложение на **React** со сборкой **Vite**. Стилизация выполняется с использованием **Tailwind CSS**; компонентный слой опирается на примитивы в духе **shadcn/radix-ui**. Маршрутизация — **react-router-dom**; HTTP-запросы — **axios** с `withCredentials: true` для передачи cookie сессии. Локальное состояние форм — **react-hook-form** и **zod**; для части глобального состояния применяется **Redux Toolkit**. Тексты интерфейса вынесены в собственный слой интернационализации (`I18nProvider`, словари сообщений), без пакета `react-i18next`.

### Таблица 3.1 — Соответствие моделей Prisma таблицам базы данных

| Модель Prisma      | Таблица в БД         | Область (NestJS-модуль)         |
| ------------------ | -------------------- | ------------------------------- |
| `User`             | `users`              | `AuthModule`, `UsersModule`     |
| `Module`           | `modules`            | `ModulesModule`                 |
| `Card`             | `cards`              | `ModulesModule`                 |
| `Question`         | `questions`          | `ModulesModule`                 |
| `MatchingPair`     | `matching_pairs`     | `ModulesModule`                 |
| `QuestionOption`   | `question_options`   | `ModulesModule`                 |
| `FlashcardSession` | `flashcard_sessions` | `ModulesModule`                 |
| `QuizSession`      | `quiz_sessions`      | `ModulesModule`                 |
| `QuizAnswer`       | `quiz_answers`       | `ModulesModule`                 |
| `Click`            | `Click`              | `AppModule` (счётчик обращений) |

Перечисленные модели задают доменную область приложения; перечисляемые типы в Prisma: `UserRole` (`USER`, `ADMIN`), `ModuleType` (`FLASHCARD`, `QUIZ`), `QuestionType` (`CHOICE`, `TEXT`, `MATCHING`).

### Таблица 3.2 — Ключевые библиотеки приложения

| Компонент | Библиотека / пакет                              | Версия (по package.json) | Назначение                                                    |
| --------- | ----------------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| Backend   | `@nestjs/common`, `@nestjs/core`                | ^11.0.1                  | Каркас HTTP API                                               |
| Backend   | `@prisma/client`                                | 6.19.0                   | Клиент ORM, типобезопасные запросы                            |
| Backend   | `@nestjs/jwt`                                   | ^11.0.0                  | Подпись и проверка JWT сессии                                 |
| Backend   | `bcrypt`                                        | ^6.0.0                   | Хэширование паролей (10 раундов)                              |
| Backend   | `cookie-parser`                                 | ^1.4.7                   | Разбор cookie в Express                                       |
| Backend   | `class-validator`, `class-transformer`          | ^0.15.1 / ^0.5.1         | Валидация и DTO (частично через глобальный `ValidationPipe`)  |
| Backend   | `@nestjs/platform-express`, `multer` (типы)     | (часть платформы)        | Загрузка файлов в память (`FileInterceptor`, `memoryStorage`) |
| Frontend  | `react`, `react-dom`                            | ^19.2.0                  | UI                                                            |
| Frontend  | `vite`                                          | ^7.3.1                   | Сборка и dev-сервер                                           |
| Frontend  | `axios`                                         | ^1.13.6                  | HTTP-клиент                                                   |
| Frontend  | `@reduxjs/toolkit`, `react-redux`               | ^2.11.2 / ^9.2.2         | Глобальное состояние (где используется)                       |
| Frontend  | `react-hook-form`, `zod`, `@hookform/resolvers` | см. workspaces           | Формы и схемы валидации                                       |
| Frontend  | `@dnd-kit/*`                                    | ^6.x / ^10.x             | Перетаскивание при упорядочивании элементов                   |

**Внешние сервисы.** Для входа через **Google** используется стандартный OAuth 2.0 / OpenID Connect: перенаправление на `accounts.google.com`, обмен кода на токен на `oauth2.googleapis.com`, получение профиля с `openidconnect.googleapis.com`. Переменные окружения: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (либо вычисляемый callback на бэкенд).

**Доставка кодов подтверждения email и сброса пароля** в текущей реализации не использует почтовый провайдер: сервис `VerificationCodeDeliveryService` пишет код в **лог сервера**; при `AUTH_RETURN_VERIFICATION_CODE=true` код может дублироваться в JSON-ответе API (удобно для отладки). Срок жизни кода — 15 минут (`CODE_TTL_MS` в `AuthService`).

**Архитектурные приёмы.** Внедрение зависимостей — стандарт NestJS. Доступ к данным идёт через **PrismaService** (обёртка над клиентом Prisma), а не через отдельные классы «репозиториев»; граница модулей (`Auth`, `Users`, `Modules`) разделяет ответственность на уровне сервисов и контроллеров.

## 3.2 Реализация базы данных

Подключение к БД задаётся строкой **`DATABASE_URL`** (формат URL PostgreSQL для Prisma). Генерация клиента: `npx prisma generate`; создание/применение миграций в разработке — `npx prisma migrate dev`; в production-образе бэкенда перед стартом вызывается **`npx prisma migrate deploy`**.

Первичные ключи сущностей — строковые **CUID** (`@default(cuid())`), за исключением счётчика `Click` с тем же подходом. Для пользователя с OAuth задано составное уникальное ограничение `@@unique([oauthProvider, oauthId])`. Каскадное удаление (`onDelete: Cascade`) используется на связях модулей с карточками, вопросами и сессиями — при удалении модуля или пользователя зависимые строки очищаются на уровне БД.

Триггеры и хранимые процедуры в проекте **не** задействованы; бизнес-правила (проверка владельца модуля, расчёт результата квиза, загрузка изображений вопросов на диск `uploads/`) реализованы в сервисах NestJS.

## 3.3 Описание REST API

Все маршруты API имеют глобальный префикс **`/api`** (`app.setGlobalPrefix('api')` в `main.ts`). Защита по умолчанию — глобальный **`JwtAuthGuard`**: для непубличных маршрутов ожидается **httpOnly cookie** с именем `quizoo_access_token`, содержащая JWT с полезной нагрузкой `{ sub: userId }`. Маркер `@Public()` отключает проверку для отдельных эндпоинтов. CORS включает `credentials: true`; список origin задаётся переменной **`CORS_ORIGIN`** (через запятую).

**Сессия.** При входе (`login`, `verify-email`, `reset-password`, успешный OAuth) сервер выставляет cookie с JWT. Время жизни токена: при **`rememberMe: true`** (по умолчанию) — **7 суток** (и `maxAge` cookie); при `rememberMe: false` — **12 часов** (`SESSION_TOKEN_TTL_SECONDS`). Отдельного refresh-токена и эндпоинта обновления пары токенов **нет** — модель проще, чем двухтокеновая схема.

### Таблица 3.3 — Маршруты REST API (обзор)

| Метод  | Маршрут                                              | Контроллер          | Доступ                  | Назначение                                               |
| ------ | ---------------------------------------------------- | ------------------- | ----------------------- | -------------------------------------------------------- |
| GET    | `/api`                                               | `AppController`     | Публичный               | Проверка отклика                                         |
| GET    | `/api/health`                                        | `AppController`     | Публичный               | Health-check                                             |
| POST   | `/api/click`                                         | `AppController`     | Публичный               | Учёт обращения (запись в `Click`)                        |
| GET    | `/api/clicks`                                        | `AppController`     | Публичный               | Количество записей `Click`                               |
| POST   | `/api/auth/register`                                 | `AuthController`    | Публичный               | Регистрация, выдача кода верификации                     |
| POST   | `/api/auth/resend-verification`                      | `AuthController`    | Публичный               | Повторная выдача кода верификации                        |
| POST   | `/api/auth/verify-email`                             | `AuthController`    | Публичный               | Подтверждение email, установка сессии                    |
| POST   | `/api/auth/login`                                    | `AuthController`    | Публичный               | Вход (только если email подтверждён)                     |
| POST   | `/api/auth/logout`                                   | `AuthController`    | Публичный               | Очистка cookie сессии                                    |
| POST   | `/api/auth/forgot-password`                          | `AuthController`    | Публичный               | Запрос кода сброса (лог сервера)                         |
| POST   | `/api/auth/reset-password`                           | `AuthController`    | Публичный               | Смена пароля по коду, установка сессии                   |
| GET    | `/api/auth/google`                                   | `AuthController`    | Публичный               | Редирект на Google OAuth                                 |
| GET    | `/api/auth/google/callback`                          | `AuthController`    | Публичный               | Callback OAuth, редирект на фронтенд                     |
| GET    | `/api/users/me`                                      | `UsersController`   | Авторизован             | Текущий пользователь (публичное представление)           |
| GET    | `/api/users/me/avatar`                               | `UsersController`   | Авторизован             | Отдача файла аватара                                     |
| PATCH  | `/api/users/me`                                      | `UsersController`   | Авторизован             | Обновление `username`                                    |
| PATCH  | `/api/users/me/password`                             | `UsersController`   | Авторизован             | Смена пароля с проверкой текущего                        |
| PATCH  | `/api/users/me/email`                                | `UsersController`   | Авторизован             | Смена email (повторная верификация)                      |
| POST   | `/api/users/me/avatar`                               | `UsersController`   | Авторизован             | Загрузка аватара (`multipart/form-data`, поле `file`)    |
| DELETE | `/api/users/me/avatar`                               | `UsersController`   | Авторизован             | Удаление аватара                                         |
| GET    | `/api/users/admin/overview`                          | `UsersController`   | Авторизован, роль ADMIN | Сводка для админ-панели                                  |
| GET    | `/api/users/admin/users`                             | `UsersController`   | ADMIN                   | Список пользователей                                     |
| PATCH  | `/api/users/admin/users/:targetUserId/block`         | `UsersController`   | ADMIN                   | Блокировка / разблокировка (`isBlocked`)                 |
| GET    | `/api/users/admin/modules`                           | `UsersController`   | ADMIN                   | Список модулей всех пользователей                        |
| GET    | `/api/modules/summary`                               | `ModulesController` | Авторизован             | Сводка дашборда                                          |
| GET    | `/api/modules/activity`                              | `ModulesController` | Авторизован             | Недавняя активность (`limit`)                            |
| GET    | `/api/modules`                                       | `ModulesController` | Авторизован             | Список модулей пользователя                              |
| POST   | `/api/modules`                                       | `ModulesController` | Авторизован             | Создание модуля (`CreateModuleDto`)                      |
| GET    | `/api/modules/:moduleId`                             | `ModulesController` | Авторизован             | Детали модуля и содержимого                              |
| GET    | `/api/modules/:moduleId/quiz-questions`              | `ModulesController` | Авторизован             | Постраничная выдача вопросов (`take`, `cursor`)          |
| PATCH  | `/api/modules/:moduleId`                             | `ModulesController` | Авторизован             | Обновление метаданных модуля                             |
| DELETE | `/api/modules/:moduleId`                             | `ModulesController` | Авторизован             | Удаление модуля                                          |
| POST   | `/api/modules/:moduleId/cards`                       | `ModulesController` | Авторизован             | Добавление карточки (flashcard-модуль)                   |
| PATCH  | `/api/modules/:moduleId/cards/:cardId`               | `ModulesController` | Авторизован             | Редактирование карточки                                  |
| DELETE | `/api/modules/:moduleId/cards/:cardId`               | `ModulesController` | Авторизован             | Удаление карточки                                        |
| POST   | `/api/modules/:moduleId/flashcard-sessions`          | `ModulesController` | Авторизован             | Завершение сессии карточек (статистика «знаю / не знаю») |
| POST   | `/api/modules/:moduleId/quiz-sessions`               | `ModulesController` | Авторизован             | Отправка ответов, создание записи результата             |
| GET    | `/api/modules/:moduleId/quiz-sessions/:sessionId`    | `ModulesController` | Авторизован             | Детали прошедшей сессии квиза                            |
| POST   | `/api/modules/:moduleId/questions`                   | `ModulesController` | Авторизован             | Создание вопроса (`CHOICE` / `TEXT` / `MATCHING`)        |
| PATCH  | `/api/modules/:moduleId/questions/:questionId`       | `ModulesController` | Авторизован             | Обновление вопроса и связанных вариантов / пар           |
| DELETE | `/api/modules/:moduleId/questions/:questionId`       | `ModulesController` | Авторизован             | Удаление вопроса                                         |
| POST   | `/api/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован             | Загрузка изображения к вопросу                           |
| GET    | `/api/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован             | Выдача изображения                                       |
| DELETE | `/api/modules/:moduleId/questions/:questionId/image` | `ModulesController` | Авторизован             | Удаление изображения вопроса                             |

Итого в таблице зафиксированы **все** объявленные в коде маршруты контроллеров (порядок объявления статических сегментов в `ModulesController` важен: `summary`, `activity` объявлены до параметрического `:moduleId`).

### Форматы данных (кратко)

- **Регистрация:** тело `{ email, password, username? }`; ответ — сообщение и опционально `verificationCode` при флаге окружения.
- **Вход / верификация / сброс пароля:** в теле присутствует флаг `rememberMe`; успешный ответ — объект пользователя в «публичном» виде (без хэша пароля и служебных полей кодов), cookie сессии выставляется автоматически.
- **Модули:** создание и обновление через DTO с полями вроде `title`, `description`, `type` (`FLASHCARD` | `QUIZ`). Вопросы передают `questionText`, `type`, `allowMultipleAnswers`, массивы `options` и `matchingPairs` в зависимости от типа.
- **Сессия квиза:** тело содержит массив ответов с идентификаторами вопросов и полями для выбора вариантов, текста или сопоставления (`matchingAnswer` как отображение «левый id → правый id» по логике сервера).

Фронтенд обращается к API по базовому URL `import.meta.env.VITE_API_URL` или относительному префиксу `/api` в production за reverse-proxy.

Фрагмент извлечения токена из cookie в глобальном guard:

```54:61:backend/src/auth/jwt-auth.guard.ts
  private extractToken(request: Request): string | null {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const raw = cookies?.[ACCESS_TOKEN_COOKIE];
    if (typeof raw !== 'string' || !raw.trim()) {
      return null;
    }
    return raw.trim();
  }
```

## 3.4 Реализация функций приложения (соответствие клиентским страницам)

Ниже — связка типовых операций бэкенда и маршрутов SPA (`frontend/src/router.tsx`).

### 3.4.1 Регистрация и подтверждение email

Пользователь отправляет **POST `/api/auth/register`**. Сервер проверяет уникальность email, сохраняет `passwordHash` (bcrypt), выставляет `emailVerified: false`, генерирует шестизначный код и срок действия, вызывает доставку кода (лог). Клиент: страницы `/auth/register` и поток ввода кода верификации с **POST `/api/auth/verify-email`** (`email`, `code`, `rememberMe`).

### 3.4.2 Аутентификация и выход

**POST `/api/auth/login`** доступен только после `emailVerified === true`; заблокированный пользователь (`isBlocked`) получает отказ. **POST `/api/auth/logout`** очищает cookie. Пароль минимум **8 символов** (`MIN_PASSWORD_LEN`).

### 3.4.3 Вход через Google

Пользователь переходит на **GET `/api/auth/google`**, затем после согласия Google вызывается **GET `/api/auth/google/callback`**; state хранится в отдельной httpOnly cookie, затем сравнивается. При успехе выполняется редирект на фронтенд (`AUTH_FRONTEND_URL` / fallback из CORS), страница **`/auth/oauth/callback`** обрабатывает query-параметры.

### 3.4.4 Профиль и аватар

**GET `/api/users/me`** используется при загрузке сессии. **PATCH `/api/users/me`** обновляет отображаемое имя. Аватары хранятся как файлы на сервере, MIME тип — в поле `avatarMime`; скачивание через **GET `/api/users/me/avatar`**.

### 3.4.5 Обучение: карточки

Маршруты SPA: **`/app/modules/:moduleId/edit`** (редактор), **`/app/modules/:moduleId/flash-study`** (режим занятий). Сервер поддерживает CRUD карточек и **POST `.../flashcard-sessions`** для сохранения итогов сессии (`totalCards`, `knownCount`, `unknownCount`, `completedAt`).

### 3.4.6 Обучение: викторина

Редактор: **`/app/modules/:moduleId/quiz-edit`**. Поддерживаются типы вопросов с вариантами, свободным текстом и сопоставлением пар; для вопроса доступна загрузка изображения (эндпоинты `.../image`). Прохождение: **`/app/modules/:moduleId/quiz-study`**, по завершении — **POST `.../quiz-sessions`** и при необходимости **GET `.../quiz-sessions/:sessionId`** для просмотра деталей.

### 3.4.7 Дашборд и статистика

**GET `/api/modules/summary`** и **GET `/api/modules/activity`** питают главную страницу **`/app`**. Отдельная страница **`/app/statistics`** опирается на те же API агрегирования активности (по факту использования в клиенте).

### 3.4.8 Администрирование

Роль **ADMIN** в поле `users.role` открывает разделы **`/app/admin`**, **`/app/admin/users`**, **`/app/admin/modules`**, **`/app/admin/analytics`**. Данные берутся из **GET `/api/users/admin/overview`**, **`.../admin/users`**, **`.../admin/modules`** и агрегируются на клиенте (доли типов модулей, верифицированные email и т.д.). Блокировка пользователя — **PATCH `.../admin/users/:targetUserId/block`** с телом `{ isBlocked: boolean }`.

### 3.4.9 Публичный лендинг и счётчик

Корень сайта **`/`** (лендинг для неавторизованных). Публичные **POST `/api/click`** и **GET `/api/clicks`** позволяют фиксировать обращения и отображать счётчик без аутентификации.

## 3.5 Конфигурация инфраструктуры

Развёртывание описано в **`docker-compose.yml`**:

- **`postgres`** — образ `postgres:18`, том `postgres18_data`, порт 5432.
- **`backend`** — сборка из `./backend`, переменные `DATABASE_URL`, `JWT_SECRET`, настройки CORS и OAuth, том **`backend_uploads`** для пользовательских файлов (аватары, изображения вопросов).
- **`frontend-builder`** — одноразовая сборка Vite, копирование артефакта в именованный том `frontend_dist`.
- **`nginx`** — образ `nginx:1.28-alpine`, монтирование `nginx/nginx.conf` и тома с фронтенд-бандлом; публикация портов **80** и **443**.

Бэкенд-**Dockerfile** (multi-stage): стадия `builder` (`npm install`, `prisma generate`, `nest build`), стадия `production` (`npm install --omit=dev`, запуск **`npx prisma migrate deploy && node dist/main.js`**). Фронтенд-**Dockerfile**: сборка статики, финальный минимальный образ копирует `dist` в том `/out`.

Сеть Compose: **`app-network`** (bridge).

## 3.6 Выводы по разделу

В разделе зафиксировано следующее соответствие проекту **Quizoo** на текущем состоянии репозитория:

- серверная часть: **Node.js 20** (Docker), **NestJS 11**, ORM **Prisma 6.19**, **PostgreSQL 18** в compose-конфигурации;
- клиентская часть: **React 19**, **Vite 7.3**, **Tailwind CSS 4**, axios с cookie-сессией;
- данные описаны моделями Prisma и миграциями; ключевые сущности — пользователь, модуль, карточки, вопросы с вложенными вариантами и парами, сессии обучения;
- REST API с префиксом **`/api`**, без WebSocket и без отдельного refresh-токена: **JWT в httpOnly cookie**;
- реализованы сценарии регистрации с кодом верификации, локального входа, OAuth Google, CRUD модулей, прохождения карточек и квиза, сохранения результатов, базовые админские операции и публичный счётчик `Click`;
- контейнеризация: связка **PostgreSQL + backend + сборка frontend + nginx** с TLS-конфигурацией в каталоге `nginx/` (конкретные сертификаты — локальная настройка окружения).

Документ может служить текстовой базой раздела курсовой записки о реализации; нумерацию таблиц и перекрёстные ссылки с другими главами нужно выровнять под шаблон ВУЗа.
