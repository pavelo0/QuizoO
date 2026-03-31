# QuizoO — Техническая архитектура (Курсовая)

> Этот документ — техническое задание для разработки проекта QuizoO.
> Стек: React + NestJS + PostgreSQL + Docker + Nginx

---

## 📁 Структура монорепозитория

```
quizoo/
├── frontend/                  # React приложение
├── backend/                   # NestJS приложение
├── nginx/                     # Конфиг nginx
│   └── nginx.conf
├── docker-compose.yml
└── .env
```

---

## 🐳 Docker Compose

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'

  backend:
    build: ./backend
    ports:
      - '4000:4000'
    env_file: .env
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quizoo
      POSTGRES_USER: quizoo_user
      POSTGRES_PASSWORD: quizoo_pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
```

### Nginx конфиг

```nginx
# nginx/nginx.conf
http {
  server {
    listen 80;

    location / {
      proxy_pass http://frontend:3000;
    }

    location /api/ {
      proxy_pass http://backend:4000/;
    }
  }
}
```

---

## 🗄️ База данных — PostgreSQL

### Схема таблиц

```sql
-- Пользователи
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,         -- bcrypt hash
  username    VARCHAR(100) NOT NULL,
  role        VARCHAR(20) DEFAULT 'user',    -- 'user' | 'admin'
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Модули знаний
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Карточки (основная единица контента)
CREATE TABLE cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID REFERENCES modules(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  position    INTEGER DEFAULT 0,            -- порядок карточки в модуле
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Типы вопросов для квиза
-- 'single_choice' | 'text_input' | 'matching'
CREATE TABLE quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID REFERENCES modules(id) ON DELETE CASCADE,
  card_id       UUID REFERENCES cards(id) ON DELETE CASCADE,
  question_type VARCHAR(30) NOT NULL,
  options       JSONB,                      -- варианты ответа для single_choice
  pairs         JSONB                       -- пары для matching
);

-- Сессии прохождения (flashcard или quiz)
CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id   UUID REFERENCES modules(id) ON DELETE CASCADE,
  mode        VARCHAR(20) NOT NULL,         -- 'flashcard' | 'quiz'
  score       INTEGER,                      -- % правильных (для quiz)
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Результаты по каждой карточке в сессии
CREATE TABLE session_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  card_id     UUID REFERENCES cards(id),
  is_correct  BOOLEAN NOT NULL,
  user_answer TEXT
);
```

---

## 🔧 Backend — NestJS

### Структура

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-refresh.strategy.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       └── login.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── entities/user.entity.ts
│   ├── modules/
│   │   ├── modules.module.ts
│   │   ├── modules.controller.ts
│   │   ├── modules.service.ts
│   │   └── dto/
│   │       ├── create-module.dto.ts
│   │       └── update-module.dto.ts
│   ├── cards/
│   │   ├── cards.module.ts
│   │   ├── cards.controller.ts
│   │   ├── cards.service.ts
│   │   └── dto/
│   │       ├── create-card.dto.ts
│   │       └── update-card.dto.ts
│   ├── sessions/
│   │   ├── sessions.module.ts
│   │   ├── sessions.controller.ts
│   │   ├── sessions.service.ts
│   │   └── dto/
│   │       └── submit-answer.dto.ts
│   └── admin/
│       ├── admin.module.ts
│       ├── admin.controller.ts
│       └── admin.service.ts
├── Dockerfile
└── package.json
```

### Переменные окружения (.env)

```env
DATABASE_URL=postgresql://quizoo_user:quizoo_pass@postgres:5432/quizoo
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
```

---

## 🔐 Авторизация — JWT

### Схема

```
POST /auth/register  →  создать пользователя, вернуть токены
POST /auth/login     →  проверить пароль, вернуть токены
POST /auth/refresh   →  обновить access token по refresh token
POST /auth/logout    →  инвалидировать refresh token
```

### Токены

- **Access token** — живёт 15 минут, передаётся в `Authorization: Bearer <token>`
- **Refresh token** — живёт 7 дней, хранится в httpOnly cookie

### Guards

```typescript
// Применяется к защищённым роутам
@UseGuards(JwtAuthGuard)

// Применяется к admin-only роутам
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

---

## 📡 REST API — Эндпоинты

### Auth

| Метод | URL            | Описание       | Auth |
| ----- | -------------- | -------------- | ---- |
| POST  | /auth/register | Регистрация    | —    |
| POST  | /auth/login    | Вход           | —    |
| POST  | /auth/refresh  | Обновить токен | —    |
| POST  | /auth/logout   | Выход          | ✅   |

### Modules

| Метод  | URL          | Описание         | Auth |
| ------ | ------------ | ---------------- | ---- |
| GET    | /modules     | Все модули юзера | ✅   |
| POST   | /modules     | Создать модуль   | ✅   |
| GET    | /modules/:id | Получить модуль  | ✅   |
| PATCH  | /modules/:id | Обновить модуль  | ✅   |
| DELETE | /modules/:id | Удалить модуль   | ✅   |

### Cards

| Метод  | URL                | Описание            | Auth |
| ------ | ------------------ | ------------------- | ---- |
| GET    | /modules/:id/cards | Все карточки модуля | ✅   |
| POST   | /modules/:id/cards | Добавить карточку   | ✅   |
| PATCH  | /cards/:id         | Обновить карточку   | ✅   |
| DELETE | /cards/:id         | Удалить карточку    | ✅   |

### Sessions (обучение)

| Метод | URL                    | Описание          | Auth |
| ----- | ---------------------- | ----------------- | ---- |
| POST  | /sessions              | Начать сессию     | ✅   |
| POST  | /sessions/:id/answer   | Отправить ответ   | ✅   |
| PATCH | /sessions/:id/complete | Завершить сессию  | ✅   |
| GET   | /sessions/history      | История сессий    | ✅   |
| GET   | /sessions/:id/results  | Результаты сессии | ✅   |

### Admin

| Метод  | URL                    | Описание            | Auth     |
| ------ | ---------------------- | ------------------- | -------- |
| GET    | /admin/users           | Все пользователи    | ✅ Admin |
| PATCH  | /admin/users/:id/block | Заблокировать юзера | ✅ Admin |
| GET    | /admin/modules         | Все модули          | ✅ Admin |
| DELETE | /admin/modules/:id     | Удалить модуль      | ✅ Admin |

---

## ⚛️ Frontend — React

### Структура

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/                    # axios инстанс + все запросы
│   │   ├── axios.ts
│   │   ├── auth.api.ts
│   │   ├── modules.api.ts
│   │   ├── cards.api.ts
│   │   └── sessions.api.ts
│   ├── store/                  # Zustand или Context
│   │   ├── auth.store.ts
│   │   └── module.store.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ModuleDetail.tsx
│   │   ├── ModuleEditor.tsx
│   │   ├── FlashcardMode.tsx
│   │   ├── QuizMode.tsx
│   │   ├── SessionResults.tsx
│   │   ├── Statistics.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsers.tsx
│   │       └── AdminModules.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ui/                 # переиспользуемые UI компоненты
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── modules/
│   │   │   ├── ModuleCard.tsx
│   │   │   └── ModuleList.tsx
│   │   ├── flashcard/
│   │   │   ├── FlashCard.tsx   # 3D flip анимация
│   │   │   └── ProgressBar.tsx
│   │   └── quiz/
│   │       ├── SingleChoice.tsx
│   │       ├── TextInput.tsx
│   │       └── Matching.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useModules.ts
│   │   └── useSession.ts
│   ├── types/
│   │   └── index.ts            # все TypeScript интерфейсы
│   └── utils/
│       ├── tokenStorage.ts
│       └── shuffleArray.ts
├── Dockerfile
└── package.json
```

### Роутинг

```typescript
// App.tsx — основные роуты
/                        → Landing (неавторизованным) / Dashboard (авторизованным)
/login                   → Login
/register                → Register
/dashboard               → Dashboard (Protected)
/modules/:id             → ModuleDetail (Protected)
/modules/:id/edit        → ModuleEditor (Protected)
/modules/:id/flashcards  → FlashcardMode (Protected)
/modules/:id/quiz        → QuizMode (Protected)
/sessions/:id/results    → SessionResults (Protected)
/statistics              → Statistics (Protected)
/admin                   → AdminDashboard (Admin only)
/admin/users             → AdminUsers (Admin only)
/admin/modules           → AdminModules (Admin only)
```

---

## 🎮 Игровая логика режимов

### Flashcard Mode — логика

```typescript
// Состояние сессии карточек
interface FlashcardState {
  cards: Card[]; // все карточки модуля
  currentIndex: number; // текущая карточка
  isFlipped: boolean; // перевёрнута ли карточка
  known: string[]; // id карточек отмеченных "знал"
  unknown: string[]; // id карточек "не знал" → повторить
  phase: 'study' | 'review' | 'complete';
}

// Алгоритм:
// 1. Показываем все cards по порядку (phase: 'study')
// 2. Юзер оценивает каждую: known / unknown
// 3. Если unknown.length > 0 → переходим в phase: 'review'
// 4. В review показываем только unknown карточки заново
// 5. Повторяем пока unknown не опустеет → phase: 'complete'
```

### Quiz Mode — логика

```typescript
// Состояние квиза
interface QuizState {
  questions: QuizQuestion[]; // сгенерированные вопросы
  currentIndex: number;
  answers: UserAnswer[]; // ответы юзера
  phase: 'answering' | 'complete';
}

// Генерация вопросов на фронте:
// 1. Берём все карточки модуля
// 2. Для каждой карточки определяем тип вопроса
//    (или юзер выбирает типы перед стартом)
// 3. Для 'single_choice' → берём 3 рандомных answer из других карточек как дистракторы
// 4. Для 'matching' → берём 4-5 карточек, перемешиваем правую колонку
// 5. Shuffle порядок вопросов

// Проверка text_input:
// normalize(userAnswer) === normalize(correctAnswer)
// normalize = trim + toLowerCase + убрать лишние пробелы
```

---

## 📊 Статистика — логика подсчёта

```typescript
// Данные для страницы статистики
interface UserStats {
  totalSessions: number;
  totalCardsStudied: number;
  averageScore: number; // средний % по всем quiz сессиям
  moduleStats: {
    moduleId: string;
    moduleName: string;
    attempts: number;
    bestScore: number;
    lastAttempt: Date;
  }[];
  recentSessions: Session[]; // последние 10 сессий
}
```

---

## 🔑 TypeScript типы (types/index.ts)

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Module {
  id: string;
  userId: string;
  title: string;
  description?: string;
  cardsCount?: number;
  createdAt: string;
}

export interface Card {
  id: string;
  moduleId: string;
  question: string;
  answer: string;
  position: number;
}

export type QuestionType = 'single_choice' | 'text_input' | 'matching';

export interface QuizQuestion {
  id: string;
  cardId: string;
  question: string;
  type: QuestionType;
  options?: string[]; // для single_choice
  pairs?: { left: string; right: string }[]; // для matching
  correctAnswer: string;
}

export interface Session {
  id: string;
  moduleId: string;
  mode: 'flashcard' | 'quiz';
  score?: number;
  completed: boolean;
  createdAt: string;
}

export interface SessionResult {
  cardId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}
```

---

## ✅ Чеклист разработки (порядок реализации)

### Бэкенд

- [ ] Инициализация NestJS проекта
- [ ] Подключение PostgreSQL через Prisma ORM
- [ ] Модуль Auth (register, login, JWT, refresh)
- [ ] Модуль Users + entities
- [ ] Guards: JwtAuthGuard, RolesGuard
- [ ] Модуль Modules (CRUD)
- [ ] Модуль Cards (CRUD)
- [ ] Модуль Sessions (start, answer, complete, results)
- [ ] Модуль Admin (users list, block, modules list, delete)
- [ ] Валидация DTO через class-validator
- [ ] Глобальный exception filter

### Фронтенд

- [ ] Инициализация Vite + React + TypeScript
- [ ] Axios инстанс с interceptor для refresh токена
- [ ] Zustand store для авторизации
- [ ] Роутинг + ProtectedRoute
- [ ] Страницы: Landing, Login, Register
- [ ] Dashboard + ModuleCard компонент
- [ ] ModuleEditor (создание/редактирование модуля и карточек)
- [ ] FlashcardMode (flip-анимация, логика known/unknown)
- [ ] QuizMode: SingleChoice компонент
- [ ] QuizMode: TextInput компонент
- [ ] QuizMode: Matching компонент
- [ ] SessionResults страница
- [ ] Statistics страница
- [ ] Admin панель

### Инфраструктура

- [ ] Dockerfile для frontend
- [ ] Dockerfile для backend
- [ ] docker-compose.yml
- [ ] nginx.conf
- [ ] .env файл
- [ ] Проверка связи всех сервисов

---

## 📦 Ключевые зависимости

### Backend (NestJS)

```json
{
  "@nestjs/core": "^10",
  "@nestjs/jwt": "^10",
  "@nestjs/passport": "^10",
  "@prisma/client": "^6",
  "bcrypt": "^5",
  "passport-jwt": "^4",
  "class-validator": "^0.14",
  "class-transformer": "^0.5"
}
```

> В `devDependencies`: `prisma` (CLI). Подключение к PostgreSQL задаётся через `DATABASE_URL` в `.env`; отдельный пакет `pg` для Prisma не обязателен.

### Frontend (React)

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "axios": "^1",
  "zustand": "^4",
  "recharts": "^2",
  "@dnd-kit/core": "^6"
}
```
