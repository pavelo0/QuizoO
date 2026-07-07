# QuizoO — контекст для AI и разработчиков

**Назначение:** единая точка входа при новых задачах. Компактный dev-контекст без текста курсовой записки.  
**Бэклог:** [`TODO.md`](./TODO.md) · **Правила Cursor:** [`.cursor/`](../.cursor/) · **Карта всех docs:** [`README.md`](./README.md)

**Источник правды по данным:** [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)  
**Источник правды по API:** код контроллеров + [`api.md`](./api.md)

---

## 1. О проекте

**QuizoO** — веб-платформа для самостоятельного изучения материала через **карточки** (flashcards) и **квизы** (тесты). Пользователь создаёт модули знаний, наполняет контентом и проходит обучение.

Два типа модулей:

| Тип         | Режим обучения                                 | Контент                                        |
| ----------- | ---------------------------------------------- | ---------------------------------------------- |
| `FLASHCARD` | Листание карточек, самооценка «знал / не знал» | Пары question → answer                         |
| `QUIZ`      | Тест с автоматической проверкой                | Вопросы типов CHOICE, TEXT, MATCHING, ORDERING |

**Роли:**

| Роль  | Доступ                                                       |
| ----- | ------------------------------------------------------------ |
| Guest | Landing, login, register, forgot-password, OAuth             |
| User  | Свои модули, обучение, профиль, статистика                   |
| Admin | Панель: все пользователи (block/unblock), все модули, сводка |

Подробнее о продукте: [`project-overview.md`](./project-overview.md) (курсовое описание, частично устарело по auth).

---

## 2. Стек и инфраструктура

| Слой     | Технологии                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite 7, TypeScript, React Router 7, Redux Toolkit, Axios, Tailwind 4, shadcn/radix, react-hook-form + Zod |
| Backend  | NestJS 10, Prisma, PostgreSQL 18, JWT, cookie-parser                                                                |
| Infra    | Docker Compose, Nginx 1.28 (TLS + reverse proxy + static SPA), Node 20                                              |

### Поток запроса

```
Browser (HTTPS) → Nginx → React bundle (static)
                       → NestJS /api/* (HTTP, proxy)
                              → Prisma → PostgreSQL (TCP)
```

Nginx: static file server для SPA + reverse proxy для API. PostgreSQL не доступен снаружи.

Подробнее: [`architecture.md`](./architecture.md), [`docker-stack-guide.md`](./docker-stack-guide.md).

### Запуск

```bash
# Docker (рекомендуется)
cp .env.example .env
docker compose up --build

# Локально (dev)
cd backend && npm run start:dev    # :3001
cd frontend && npm run dev         # :5173
```

HTTPS локально: [`https-local.md`](./https-local.md).

---

## 3. Структура репозитория

```
QuizoO/
├── frontend/src/          # React SPA
│   ├── pages/             # экраны (маршруты)
│   ├── components/        # UI: ui/, auth/, modules/
│   ├── layouts/           # AuthLayout, ServiceLayout, LandingLayout
│   ├── auth/              # AuthContext (сессия, cookie JWT)
│   ├── store/             # Redux Toolkit (userSlice)
│   ├── lib/api/           # axios-клиенты по ресурсам
│   ├── hooks/             # useSessions, useDeadlineCountdown
│   ├── types/             # TS-типы
│   ├── schemas/           # Zod (auth forms)
│   ├── i18n/              # messages.ts (ru/en, без react-i18next)
│   ├── theme/             # dark/light
│   ├── router.tsx         # React Router, guards
│   └── main.tsx           # entry point
├── backend/src/
│   ├── auth/              # JWT, OAuth, guards, verification codes
│   ├── users/             # profile, avatar, admin endpoints
│   ├── modules/           # modules.service.ts (⚠️ god object, см. TODO)
│   ├── prisma/            # PrismaService
│   ├── app.module.ts
│   └── main.ts            # global prefix /api, ValidationPipe, CORS
├── backend/prisma/        # schema + migrations
├── nginx/                 # nginx.conf, certs/
├── docs/                  # документация
├── e2e/                   # (планируется) Playwright
├── docker-compose.yml
└── .env.example
```

### Целевая структура frontend (FSD)

Миграция постепенная, см. [`TODO.md`](./TODO.md) фазы D и D.5:

```
frontend/src/
  app/          # providers, router, layouts
  pages/        # route screens (тонкие композиции)
  widgets/      # dashboard-module-list, quiz-player, quiz-editor, service-shell, …
  features/     # auth-login, create-module, edit-question-*, auth-guard, …
  entities/     # module, user, session, question, admin
  shared/       # ui/, lib/, api/, i18n/, hooks/, config/
```

**Legacy proxies** (re-export на старых путях): `lib/`, `types/`, `i18n/`, `theme/`, `hooks/`, `layouts/`, `components/` — удаляются поэтапно (TODO фаза D.5.4). `components/ui/` удалена (D.5.1). **В proxy-папки новый код не класть.**

**Строгий FSD:** импорты только через FSD-пути (`@/shared/*`, `@/entities/*`, `@/widgets/*`, `@/features/*`, `@/app/*`). При правке файла с legacy-импортами — мигрировать в том же PR. Правила для Cursor: [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc), [`.cursor/rules/frontend.mdc`](../.cursor/rules/frontend.mdc).

> **Устарело:** [`frontend-setup-from-step4.md`](./frontend-setup-from-step4.md) описывает структуру «без FSD».

---

## 4. Backend

### NestJS-модули

| Модуль          | Файлы      | Ответственность                                                            |
| --------------- | ---------- | -------------------------------------------------------------------------- |
| `AuthModule`    | `auth/`    | register, login, logout, verify-email, forgot/reset password, Google OAuth |
| `UsersModule`   | `users/`   | `/users/me`, avatar, admin CRUD                                            |
| `ModulesModule` | `modules/` | модули, карточки, вопросы, сессии, images, dashboard                       |
| `PrismaModule`  | `prisma/`  | Prisma client singleton                                                    |

### Ключевые endpoints (префикс `/api`)

Полная таблица (44 endpoint): [`api.md`](./api.md).

| Группа     | Примеры                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Health     | `GET /`, `GET /health`                                                                               |
| Auth       | `POST /auth/register`, `/login`, `/logout`, `/verify-email`, `GET /auth/google`                      |
| User       | `GET /users/me`, `PATCH /users/me`, `POST /users/me/avatar`                                          |
| Admin      | `GET /users/admin/users`, `PATCH /users/admin/users/:id/block`                                       |
| Modules    | `GET /modules`, `POST /modules`, `GET /modules/:id`                                                  |
| Flashcards | `POST /modules/:id/cards`, `POST /modules/:id/flashcard-sessions`                                    |
| Quiz       | `POST /modules/:id/questions`, `POST /modules/:id/quiz-sessions`, `GET .../quiz-sessions/:sessionId` |

**Важно:** маршруты `GET /modules/summary` и `GET /modules/activity` объявлены **до** `:moduleId` в контроллере.

### Tech debt backend

- [`modules.service.ts`](../backend/src/modules/modules.service.ts) — ~1324 строк, требует декомпозиции (см. TODO фаза A)
- DTO с `class-validator` только для create/update module; quiz endpoints — inline types
- Grading logic inline в `createQuizSession`, без shared normalizer для TEXT
- Raw SQL в `getRecentActivity`
- Нет Sentry, нет structured logging

---

## 5. База данных

Источник правды: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). Краткая сводка: [`db.md`](./db.md).

### Enum-ы

```
UserRole:       USER | ADMIN
ModuleType:     FLASHCARD | QUIZ
QuestionType:   CHOICE | TEXT | MATCHING | ORDERING
```

### Основные сущности

```
User 1──M Module 1──M Card          (FLASHCARD)
                 1──M Question 1──M QuestionOption
                                1──M MatchingPair
                 1──M FlashcardSession
                 1──M QuizSession 1──M QuizAnswer
```

### Хранение ответов quiz

| Тип      | Correct answer                                    | User answer (JSON в QuizAnswer)                       |
| -------- | ------------------------------------------------- | ----------------------------------------------------- |
| CHOICE   | `QuestionOption.isCorrect`                        | `{ choiceOptionId }` или `{ choiceOptionIds: [] }`    |
| TEXT     | единственный `QuestionOption` с `isCorrect: true` | `{ textAnswer: string }`                              |
| MATCHING | `MatchingPair` (id → id)                          | `{ matchingAnswer: Record<pairId, pairId> }`          |
| ORDERING | `OrderingItem.correctOrder`                       | `{ orderingAnswer: string[] }` (массив ID по порядку) |

---

## 6. Frontend

### Маршруты ([`router.tsx`](../frontend/src/router.tsx))

| Path                           | Страница                          | Guard              |
| ------------------------------ | --------------------------------- | ------------------ |
| `/`                            | Landing                           | RedirectIfSignedIn |
| `/auth/login`, `/register`     | Auth                              | GuestOnly          |
| `/auth/oauth/callback`         | OAuthCallback                     | —                  |
| `/app`                         | Dashboard (User) / redirect Admin | RequireAuth        |
| `/app/modules/create`          | CreateModule                      | LearnerOnly        |
| `/app/modules/:id/edit`        | EditFlashcard                     | LearnerOnly        |
| `/app/modules/:id/quiz-edit`   | EditQuiz                          | LearnerOnly        |
| `/app/modules/:id/flash-study` | FlashcardStudy                    | LearnerOnly        |
| `/app/modules/:id/quiz-study`  | QuizStudy                         | LearnerOnly        |
| `/app/statistics`              | Statistics                        | LearnerOnly        |
| `/app/profile`                 | Profile                           | RequireAuth        |
| `/app/admin`                   | AdminDashboard                    | RequireAdmin       |
| `/app/admin/users`             | AdminUsers                        | RequireAdmin       |
| `/app/admin/modules`           | AdminModules                      | RequireAdmin       |

### State

- **AuthContext** — текущий пользователь, login/logout, cookie session
- **Redux** — `userSlice` (минимально)
- **API** — axios instances в `lib/api/` с `withCredentials: true`

### i18n

Собственная реализация в [`messages.ts`](../frontend/src/i18n/messages.ts). Ключи `ru` / `en`. Новые строки — в оба языка.

---

## 7. Аутентификация (фактическая реализация)

> [`authentication.md`](./authentication.md) описывает **рекомендуемый** паттерн access+refresh. В проекте реализовано иначе.

**Факт:**

- JWT в **httpOnly cookie** `quizoo_access_token`
- Клиент: `axios` с `withCredentials: true`, **без** `Authorization: Bearer`
- Глобальный `JwtAuthGuard`; публичные маршруты — `@Public()`
- **Refresh-токена нет.** TTL JWT: `rememberMe: true` → 7 дней, `false` → 12 часов
- Email verification: 6-значный код, 15 мин (логируется на сервер, не SMTP)
- Google OAuth: `GET /auth/google` → callback → redirect на frontend
- Guards на фронте: `RequireAuth`, `RequireAdmin`, `GuestOnlyOutlet`, `RedirectIfSignedIn`

---

## 8. Типы вопросов и grading

### Текущие

| Тип        | UI                 | Grading                                                  |
| ---------- | ------------------ | -------------------------------------------------------- |
| `CHOICE`   | Radio/checkbox     | Сравнение option id(s); multi via `allowMultipleAnswers` |
| `TEXT`     | Text input         | `trim().toLowerCase()` vs correct option text            |
| `MATCHING` | Drag/connect pairs | `rightId === leftId` для каждой пары                     |
| `ORDERING` | Drag-and-drop list | Strict match: порядок ID совпадает с `correctOrder`      |

### Планируемые

См. [`TODO.md`](./TODO.md) фаза C: `TRUE_FALSE`, `FILL_BLANK`, `MULTI_TEXT`, `NUMERIC`.

### Нормализация TEXT (план)

Принимать синонимы/варианты («Paris» = «Париж»), показывать каноническую форму в разборе ошибок. См. TODO фаза B.

**Код grading:** [`modules.service.ts`](../backend/src/modules/modules.service.ts) `createQuizSession` (~строки 682–845). После рефакторинга — `QuizGradingService`.

---

## 9. Конвенции разработки

### Общие

- Минимальный scope изменений — не трогать unrelated code
- TypeScript strict, `async/await`, избегать `any`
- Комментарии — только для non-obvious business logic
- Ответы AI-агенту — **русский**; код и идентификаторы — как в репозитории

### Backend

- Thin controllers → domain services → Prisma
- HTTP errors: `BadRequestException`, `NotFoundException`, `ForbiddenException`
- Один service-файл ≤ ~350 строк (цель после рефакторинга)
- DTO + `class-validator` для всех входящих body

### Frontend

- Functional components, локальный state где возможно
- FSD import rules: слой импортирует только из нижележащих
- i18n для всех user-facing строк
- shadcn/ui в `shared/ui/` (legacy proxy `components/ui/` удалён)

### Тесты

- Backend: Jest unit (`*.spec.ts`), NestJS e2e (`test/*.e2e-spec.ts`)
- План: Playwright в `e2e/` для regression (см. TODO фаза E)
- При изменении grading — обязательны unit-тесты

### Cursor rules

| Файл                                                                  | Область                      |
| --------------------------------------------------------------------- | ---------------------------- |
| [`.cursor/index.mdc`](../.cursor/index.mdc)                           | Глобальные стандарты проекта |
| [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc) | FSD + backend layering       |
| [`.cursor/rules/backend.mdc`](../.cursor/rules/backend.mdc)           | NestJS, services, Prisma     |
| [`.cursor/rules/frontend.mdc`](../.cursor/rules/frontend.mdc)         | React, FSD, i18n             |
| [`.cursor/rules/tests.mdc`](../.cursor/rules/tests.mdc)               | Jest, Playwright, regression |

---

## 10. Карта документации

| Когда                  | Документ                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Любая новая задача** | **`AIContext.md`** (этот файл)                                                                       |
| Бэклог / tech debt     | [`TODO.md`](./TODO.md)                                                                               |
| Полный REST API        | [`api.md`](./api.md)                                                                                 |
| Схема БД               | [`db.md`](./db.md), [`dbSchema.md`](./dbSchema.md)                                                   |
| Docker / деплой        | [`docker-stack-guide.md`](./docker-stack-guide.md), [`docker-and-deploy.md`](./docker-and-deploy.md) |
| UI / design tokens     | [`techDesign.md`](./techDesign.md)                                                                   |
| Прогресс разработки    | [`checklist.md`](./checklist.md)                                                                     |
| Курсовая записка       | [`zapiska.md`](./zapiska.md) — **не для dev-контекста**                                              |
| Задание на курсовую    | [`tasklist.md`](./tasklist.md)                                                                       |
| Ручные тест-сценарии   | [`tests.md`](./tests.md)                                                                             |
| Архив                  | [`archive/`](./archive/)                                                                             |

---

## 11. Tech debt и ограничения (кратко)

| Область                          | Статус                                           |
| -------------------------------- | ------------------------------------------------ |
| `modules.service.ts` god object  | TODO фаза A                                      |
| TEXT answer synonyms             | TODO фаза B                                      |
| Playwright / regression e2e      | TODO фаза E                                      |
| Sentry                           | TODO фаза F                                      |
| FSD frontend                     | Phase D done; D.5 cleanup in progress (see TODO) |
| Refresh JWT                      | Не реализован (by design на текущем этапе)       |
| MATCHING/multi-CHOICE unit tests | Отсутствуют                                      |
| Email delivery                   | Лог сервера, не SMTP                             |

Полный бэклог с чекбоксами: [`TODO.md`](./TODO.md).

---

## 12. Быстрые команды

```bash
# Backend tests
cd backend && npm test
cd backend && npm run test:e2e

# Prisma
cd backend && npx prisma migrate dev
cd backend && npx prisma studio

# Lint/format (root workspaces)
npm run lint
npm run format

# Playwright (после настройки)
npm run test:e2e
```

---

_Последнее обновление: 2026-06-30. При изменении архитектуры обновлять этот файл и [`TODO.md`](./TODO.md)._
