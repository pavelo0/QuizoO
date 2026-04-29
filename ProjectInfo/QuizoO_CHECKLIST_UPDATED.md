# QuizoO — чеклист

Обновлено: 29 апреля 2026. Фронт: React Router, Redux Toolkit + RTK Query, axios, Tailwind, shadcn/ui.

---

# Краткий чеклист

---

## ✅ Текущее состояние

### Конфигурация

- [x] Монорепозиторий создан
- [x] Git настроен
- [x] Husky + lint-staged + Prettier
- [x] .prettierrc и .prettierignore

### Backend

- [x] NestJS инициализирован
- [x] ESLint + Prettier
- [x] TypeScript конфиг

### Frontend

- [x] Vite + React + TypeScript
- [x] Все зависимости установлены
- [x] Конфиги (Vite, TS, ESLint, Tailwind)
- [x] Структура папок
- [x] Утилита cn.ts
- [x] .env файлы

### Квиз — прохождение и результаты

- [x] Prisma: вопросы, варианты, пары, `allowMultipleAnswers`, `QuizSession`, `QuizAnswer`, миграции
- [x] Backend: API модуля и квиза (вопросы с пагинацией, создание и получение сессии)
- [x] Frontend: `QuizStudyPage`, роут `/app/modules/:moduleId/quiz-study`
- [x] Конструктор: режим один / несколько ответов для CHOICE
- [ ] `components/quiz/*`
- [ ] Модуль `sessions/`, пошаговая отправка ответов

---

## 📝 Задачи для выполнения

### ЭТАП 1: Базовая настройка фронтенда (БЕЗ авторизации)

- [ ] 1.1 Заполнить `lib/api/client.ts` (простая версия без токенов)
- [ ] 1.2 Настроить `store/` (`configureStore`, `hooks.ts`) и `app/providers/StoreProvider.tsx`
- [ ] 1.3 Собрать каркас маршрутов в `App.tsx` (`BrowserRouter`, `Routes`, `Route`)
- [ ] 1.4 Создать `pages/Home.tsx` (лендинг)
- [ ] 1.5 Обновить `main.tsx` (Redux `Provider` + роутер + провайдеры)
- [ ] 1.6 Запустить и проверить (http://localhost:3000)

### ЭТАП 2: UI Kit (shadcn/ui)

- [ ] 2.1 Добавить нужные примитивы shadcn (`npx shadcn add …`) под макеты и `docs/techDesign.md`
- [ ] 2.2 Подключить тему (токены в `index.css`, классы на обёртках)
- [ ] 2.3 При необходимости — тонкая обёртка `components/ui` над shadcn для единообразия
- [ ] 2.4 Обновить лендинг с `Button` / ссылками
- [ ] 2.5 Проверить что компоненты и стили совпадают с гайдом

### ЭТАП 3: Типы данных

- [ ] 3.1 Создать `types/api.ts`
- [ ] 3.2 Создать `types/user.ts`
- [ ] 3.3 Создать `types/module.ts`
- [ ] 3.4 Создать `types/session.ts`
- [ ] 3.5 Создать `types/index.ts` (реэкспорт)

### ЭТАП 4: Backend — База данных

- [ ] 4.1 Установить зависимости (`@prisma/client`, `prisma` dev, `@nestjs/config`)
- [ ] 4.2 Запустить PostgreSQL (Docker или локально)
- [ ] 4.3 Создать `backend/.env` и `.env.example` (`DATABASE_URL`)
- [ ] 4.4 Настроить Prisma (`schema.prisma`, `PrismaModule` / `PrismaService`) в NestJS
- [ ] 4.5 Проверить подключение к БД

### ЭТАП 5: Backend — Users модуль

- [ ] 5.1 Создать структуру папок (users/)
- [ ] 5.2 Добавить модель `User` в `prisma/schema.prisma` и миграцию
- [ ] 5.3 Создать `users.service.ts`
- [ ] 5.4 Создать `users.controller.ts`
- [ ] 5.5 Создать `users.module.ts`
- [ ] 5.6 Добавить UsersModule в `app.module.ts`
- [ ] 5.7 Проверить что таблица users создалась

### ЭТАП 6: Backend — Auth модуль

- [ ] 6.1 Установить зависимости (JWT, passport, bcrypt, class-validator)
- [ ] 6.2 Добавить JWT секреты в `.env`
- [ ] 6.3 Создать структуру папок (auth/, dto/, guards/, strategies/, decorators/)
- [ ] 6.4 Создать `dto/register.dto.ts`
- [ ] 6.5 Создать `dto/login.dto.ts`
- [ ] 6.6 Создать `auth.service.ts` (register, login, refresh, generateTokens)
- [ ] 6.7 Создать `strategies/jwt.strategy.ts`
- [ ] 6.8 Создать `guards/jwt-auth.guard.ts`
- [ ] 6.9 Создать `decorators/current-user.decorator.ts`
- [ ] 6.10 Создать `auth.controller.ts` (register, login, refresh, logout)
- [ ] 6.11 Создать `auth.module.ts`
- [ ] 6.12 Добавить AuthModule в `app.module.ts`
- [ ] 6.13 Включить ValidationPipe в `main.ts`
- [ ] 6.14 Протестировать через curl (register, login)

### ЭТАП 7: Frontend — Redux: slice авторизации

- [ ] 7.1 Создать `store/authSlice.ts` (setAuth, logout, селекторы isAuthenticated / isAdmin)
- [ ] 7.2 Подключить slice в `store/index.ts` и при необходимости `redux-persist` только для токенов (по желанию)

### ЭТАП 8: Frontend — Хуки для авторизации

- [ ] 8.1 Создать `hooks/useAuth.ts` (useLogin, useRegister, useLogout)
- [ ] 8.2 Создать `hooks/index.ts` (реэкспорт)

### ЭТАП 9: Frontend — Страницы авторизации

- [ ] 9.1 Создать `pages/Login.tsx` (форма входа)
- [ ] 9.2 Создать `pages/Register.tsx` (форма регистрации)
- [ ] 9.3 Обновить `pages/Home.tsx` (добавить Link на login/register)
- [ ] 9.4 Протестировать флоу (регистрация → логин → редирект)

### ЭТАП 10: Frontend — Interceptors с токенами

- [ ] 10.1 Обновить `lib/api/client.ts` (добавить request/response interceptors)
- [ ] 10.2 Проверить автообновление токена при 401

### ЭТАП 11: Backend — Modules

- [ ] 11.1 Создать структуру папок (modules/, dto/)
- [ ] 11.2 Добавить модель `Module` в `prisma/schema.prisma` и миграцию
- [ ] 11.3 Создать `modules.service.ts`
- [ ] 11.4 Создать `modules.controller.ts` (с JwtAuthGuard)
- [ ] 11.5 Создать DTO (create, update)
- [ ] 11.6 Создать `modules.module.ts`
- [ ] 11.7 Добавить в `app.module.ts`
- [ ] 11.8 Протестировать через curl

### ЭТАП 12: Backend — Cards

- [ ] 12.1 Создать структуру папок (cards/, dto/)
- [ ] 12.2 Добавить модель `Card` в `prisma/schema.prisma` и миграцию
- [ ] 12.3 Создать `cards.service.ts`
- [ ] 12.4 Создать `cards.controller.ts`
- [ ] 12.5 Создать DTO (create, update)
- [ ] 12.6 Создать `cards.module.ts`
- [ ] 12.7 Добавить в `app.module.ts`
- [ ] 12.8 Протестировать через curl

### ЭТАП 13: Frontend — Хуки для модулей

- [ ] 13.1 Создать `hooks/useModules.ts` (useModules, useModule, useCreateModule, useUpdateModule, useDeleteModule)
- [ ] 13.2 Обновить `hooks/index.ts`

### ЭТАП 14: Frontend — Dashboard

- [ ] 14.1 Создать `pages/Dashboard.tsx` (список модулей)
- [ ] 14.2 Добавить beforeLoad (защита роута)
- [ ] 14.3 Добавить Header с кнопкой "Выйти"
- [ ] 14.4 Добавить Empty state
- [ ] 14.5 Добавить сетку карточек модулей
- [ ] 14.6 Проверить что всё работает

### ЭТАП 15: Frontend — Создание модуля

- [ ] 15.1 Создать `pages/modules/new.tsx`
  - [ ] Шаг 1: Выбор типа (Карточки / Квиз)
  - [ ] Шаг 2: Заполнение названия и описания
  - [ ] Редирект на редактор после создания

### ЭТАП 16: Frontend — Страница модуля

- [ ] 16.1 Создать `pages/modules/$id.tsx`
  - [ ] Заголовок и описание
  - [ ] Бейдж с типом
  - [ ] Кнопки: Редактировать, Удалить
  - [ ] Главная кнопка: "Учить карточки" или "Начать квиз"
  - [ ] Список карточек (для flashcards)

### ЭТАП 17: Frontend — Редактор карточек

- [ ] 17.1 Создать `hooks/useCards.ts` (useCards, useCreateCard, useUpdateCard, useDeleteCard)
- [ ] 17.2 Создать `pages/modules/$id.edit.tsx`
  - [ ] Форма: название и описание модуля
  - [ ] Список существующих карточек
  - [ ] Форма добавления новой карточки (вопрос + ответ)
  - [ ] Кнопки удаления карточек
  - [ ] Кнопка "Сохранить и вернуться"

### ЭТАП 18: Frontend — Режим карточек (Flashcards)

- [ ] 18.1 Создать `pages/modules/$id.flashcards.tsx`
  - [ ] Загрузка и перемешивание карточек
  - [ ] Отображение текущей карточки
  - [ ] Кнопка "Перевернуть" (анимация flip)
  - [ ] Кнопки "Знал" / "Не знал"
  - [ ] Логика повтора карточек "Не знал"
  - [ ] Финальный экран с результатами
- [ ] 18.2 Добавить CSS для 3D flip анимации

### ЭТАП 19: Backend — Questions для квизов

- [ ] 19.1 Создать структуру папок (questions/, entities/, dto/)
- [x] 19.2 Добавить модели `Question`, `QuestionOption`, `MatchingPair`, `allowMultipleAnswers` в `prisma/schema.prisma`
- [x] 19.5 Создать `questions.service.ts`
- [x] 19.6 Создать `questions.controller.ts`
- [x] 19.7 Создать DTO для каждого типа вопроса
- [x] 19.8 Создать `questions.module.ts`
- [x] 19.9 Добавить в `app.module.ts`
- [ ] 19.10 Протестировать через curl

### ЭТАП 20: Frontend — Компоненты вопросов квиза

- [x] 20.1 Создать `components/quiz/SingleChoiceQuestion.tsx`
  - [x] Варианты ответа
  - [x] Выбор одного или нескольких
  - [ ] Подсветка правильного/неправильного во время прохождения
- [x] 20.2 Создать `components/quiz/TextInputQuestion.tsx`
  - [x] Поле ввода
  - [ ] Кнопка "Ответить"
  - [x] Показ правильного ответа
- [x] 20.3 Создать `components/quiz/MatchingQuestion.tsx`
  - [x] Две колонки (левая и правая)
  - [ ] Соединение пар кликом (линии)
  - [x] Проверка правильности

### ЭТАП 21: Frontend — Режим квиза

- [ ] 21.1 Создать `hooks/useQuestions.ts`
- [x] 21.2 Создать `pages/modules/$id.quiz.tsx`
  - [x] Загрузка вопросов
  - [x] Перемешивание
  - [x] Показ текущего вопроса
  - [x] Рендер компонента по типу вопроса
  - [x] Прогресс-бар
  - [x] Сохранение ответов
  - [x] Финальный экран с результатами

### ЭТАП 22: Backend — Sessions (результаты)

- [ ] 22.1 Создать структуру папок (sessions/, dto/)
- [x] 22.2 Добавить модели `QuizSession`, `QuizAnswer` в `prisma/schema.prisma` и миграции
- [x] 22.3 Создать `sessions.service.ts`
  - [ ] Метод startSession
  - [ ] Метод submitAnswer
  - [x] Метод completeSession
  - [x] Метод getResults
  - [ ] Метод getHistory
- [ ] 22.4 Создать `sessions.controller.ts`
- [ ] 22.5 Создать DTO
- [ ] 22.6 Создать `sessions.module.ts`
- [x] 22.7 Добавить в `app.module.ts`
- [ ] 22.8 Протестировать через curl

### ЭТАП 23: Frontend — Статистика

- [x] 23.1 Создать `hooks/useSessions.ts`
- [x] 23.2 Создать `pages/statistics.tsx`
  - [x] История всех сессий (таблица)
  - [x] Средний балл
  - [x] Фильтры по модулю
  - [x] Графики прогресса (опционально: recharts)

### ЭТАП 24: Backend — Admin панель

- [ ] 24.1 Создать `auth/guards/roles.guard.ts`
- [ ] 24.2 Создать `auth/decorators/roles.decorator.ts`
- [ ] 24.3 Создать структуру папок (admin/)
- [ ] 24.4 Создать `admin.controller.ts`
  - [ ] GET /admin/users (все пользователи)
  - [ ] PATCH /admin/users/:id/block (блокировка)
  - [ ] GET /admin/modules (все модули)
  - [ ] DELETE /admin/modules/:id (удаление)
  - [ ] GET /admin/stats (статистика платформы)
- [ ] 24.5 Создать `admin.service.ts`
- [ ] 24.6 Создать `admin.module.ts`
- [ ] 24.7 Добавить в `app.module.ts`
- [ ] 24.8 Протестировать (создать admin пользователя)

### ЭТАП 25: Frontend — Admin панель

- [ ] 25.1 Создать `hooks/useAdmin.ts`
- [ ] 25.2 Создать `pages/admin/index.tsx`
  - [ ] Таблица пользователей
  - [ ] Кнопки блокировки/разблокировки
  - [ ] Пагинация
- [ ] 25.3 Создать `pages/admin/modules.tsx`
  - [ ] Таблица всех модулей
  - [ ] Кнопки удаления
  - [ ] Поиск и фильтры
- [ ] 25.4 Добавить защиту роутов (только admin)

### ЭТАП 26: Docker и Nginx

- [ ] 26.1 Создать `frontend/Dockerfile` (multi-stage build)
- [ ] 26.2 Создать `backend/Dockerfile` (multi-stage build)
- [ ] 26.3 Создать `docker-compose.yml`
  - [ ] Сервис frontend
  - [ ] Сервис backend
  - [ ] Сервис postgres
  - [ ] Сервис nginx
  - [ ] Volumes для postgres
  - [ ] Networks
- [ ] 26.4 Настроить `nginx/nginx.conf`
  - [ ] Проксирование /api/\* → backend
  - [ ] Раздача статики / → frontend
- [ ] 26.5 Создать `.dockerignore` (frontend и backend)
- [ ] 26.6 Проверить сборку: `docker-compose up --build`
- [ ] 26.7 Проверить что все сервисы работают

### ЭТАП 27: Тестирование

- [ ] 27.1 Backend: Unit-тесты
  - [ ] AuthService (register, login)
  - [ ] ModulesService (CRUD)
  - [ ] CardsService (CRUD)
  - [ ] SessionsService (start, answer, complete)
- [ ] 27.2 Backend: E2E тесты
  - [ ] Auth флоу (register → login → protected route)
  - [ ] Modules CRUD
  - [ ] Cards CRUD
  - [ ] Session флоу
- [ ] 27.3 Frontend: Ручное тестирование
  - [ ] Регистрация и логин
  - [ ] Создание модуля (оба типа)
  - [ ] Добавление карточек
  - [ ] Режим карточек
  - [ ] Режим квиза
  - [ ] Статистика
  - [ ] Админка
- [ ] 27.4 Адаптивность
  - [ ] Mobile (<768px)
  - [ ] Tablet (768-1024px)
  - [ ] Desktop (>1024px)

### ЭТАП 28: Документация и финализация

- [ ] 28.1 Обновить `README.md`
  - [ ] Описание проекта
  - [ ] Стек технологий
  - [ ] Инструкция по запуску (локально)
  - [ ] Инструкция по запуску (Docker)
  - [ ] Структура проекта
  - [ ] API эндпоинты
  - [ ] Скриншоты
- [ ] 28.2 Добавить Swagger (опционально)
- [ ] 28.3 Создать демо-данные для защиты
- [ ] 28.4 Проверить что нет захардкоженных секретов
- [ ] 28.5 Проверить что .env.example актуальны
- [ ] 28.6 Финальная проверка всех функций

---

# 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

## ✅ Что уже готово

### Конфигурация

- [x] Монорепозиторий (frontend, backend, nginx)
- [x] Git + .gitignore
- [x] Husky + lint-staged + Prettier (корень)
- [x] .prettierrc и .prettierignore

### Backend

- [x] NestJS проект инициализирован
- [x] ESLint + Prettier настроены
- [x] TypeScript конфиг

### Frontend

- [x] Vite + React + TypeScript
- [x] Все зависимости установлены (React Router, Redux Toolkit, Tailwind, shadcn, Axios)
- [x] Vite конфиг (плагины, алиасы, прокси)
- [x] TypeScript конфиг (strict, path aliases)
- [x] ESLint + Prettier
- [x] Tailwind CSS (конфиг, postcss)
- [x] Структура папок создана
- [x] Утилита `cn.ts` готова
- [x] .env файлы созданы

### Остальное по плану

- [ ] См. раздел «Задачи для выполнения» и «План разработки» ниже.

---

# План разработки

---

## ЭТАП 1: Базовая настройка фронтенда (БЕЗ авторизации)

**Цель:** Запустить фронтенд с роутингом и увидеть лендинг.

### 1.1 ✏️ Заполнить `lib/api/client.ts` (простая версия)

**Зачем:** HTTP-клиент для запросов. **Пока без токенов** — просто базовая настройка.

**Что писать:**

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - только логирование ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);
```

**Подсказки:**

- Минимальная настройка — только baseURL и timeout
- **Токены добавим позже**, когда будет авторизация на бэке
- Interceptor пока только для логов

---

### 1.2 ✏️ Настроить Redux store и `StoreProvider`

**Зачем:** глобальное состояние (авторизация, UI) и дальше — **RTK Query** для запросов к API вместо React Query.

**Минимум в `store/index.ts`:**

```typescript
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // auth: authReducer — добавите после этапа 7
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**`app/providers/StoreProvider.tsx`:** обернуть `children` в `<Provider store={store}>` из `react-redux`.

---

### 1.3 ✏️ Каркас маршрутов в `App.tsx`

**Зачем:** явный роутинг **react-router-dom** v6 — без файлового дерева TanStack Router.

**Пример:**

```tsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/Home';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
```

Общий layout (фон, контейнер) можно вынести в обёртку вокруг `<Routes>` или отдельный `RootLayout`.

---

### 1.4 ✏️ Создать `pages/Home.tsx`

**Зачем:** лендинг по `/`. Пока без рабочих ссылок на логин — только вёрстка (по желанию сразу с компонентами shadcn).

---

### 1.5 ✏️ Обновить `main.tsx`

**Зачем:** порядок провайдеров: **Redux** → **BrowserRouter** → `App` → при необходимости `Toaster`.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { App } from './App';
import { Toaster } from 'react-hot-toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
```

---

### 1.6 ✅ Проверить запуск

**Команды:**

```bash
cd frontend
npm run dev
```

**Открыть:** http://localhost:3000

**Что должно быть:**

- [ ] Лендинг с заголовком «QuizOo» (или аналог)
- [ ] Нет ошибок в консоли
- [ ] Redux DevTools видит store (расширение браузера)

**Если всё ОК — переходим дальше! ✅**

---

## ЭТАП 2: UI Kit (shadcn/ui)

**Цель:** не плодить с нуля кнопки/инпуты — взять примитивы из **shadcn/ui** и привести к токенам из `docs/techDesign.md` / `index.css`.

### 2.1 ✏️ Добавить компоненты через CLI

**Пример:** `npx shadcn@latest add button input card … -y` (список — под экраны из `QuizoO_STITCH_PROMPTS.md`).

### 2.2 ✏️ Согласовать радиусы, цвета и шрифты

Проверить `components.json`, Tailwind и CSS variables — как в техническом гайде.

### 2.3 ✏️ Реэкспорт (по желанию)

`components/ui/index.ts` — реэкспорт только тех примитивов, которые реально используются в приложении.

### 2.4 ✅ Обновить лендинг

Использовать `Button` (shadcn) и ссылки `react-router-dom` на `/login` и `/register`, когда маршруты появятся.

**Проверить:**

- [ ] Внешний вид близок к макетам Stitch
- [ ] Состояния hover / focus читаемы

---

## ЭТАП 3: Типы данных

**Цель:** Описать структуру данных до того, как начнём писать API.

### 3.1 ✏️ Создать `types/api.ts`

**Зачем:** Общие типы для ответов API.

**Что писать:**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

### 3.2 ✏️ Создать `types/user.ts`

```typescript
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}
```

---

### 3.3 ✏️ Создать `types/module.ts`

```typescript
export type ModuleType = 'flashcards' | 'quiz';

export interface Module {
  id: string;
  userId: string;
  type: ModuleType;
  title: string;
  description?: string;
  cardsCount?: number;
  questionsCount?: number;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  moduleId: string;
  question: string;
  answer: string;
  position: number;
  createdAt: string;
}

export type QuestionType = 'single_choice' | 'text_input' | 'matching';

export interface Question {
  id: string;
  moduleId: string;
  questionText: string;
  type: QuestionType;
  orderIndex: number;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface MatchingPair {
  id: string;
  questionId: string;
  leftItem: string;
  rightItem: string;
}
```

---

### 3.4 ✏️ Создать `types/session.ts`

```typescript
export type SessionMode = 'flashcard' | 'quiz';

export interface Session {
  id: string;
  userId: string;
  moduleId: string;
  mode: SessionMode;
  score?: number;
  totalCards?: number;
  knownCount?: number;
  unknownCount?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface QuizAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  session: Session;
  answers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  correctCount: number;
}
```

---

### 3.5 ✏️ Создать `types/index.ts`

```typescript
export * from './api';
export * from './user';
export * from './module';
export * from './session';
```

---

## ЭТАП 4: Backend — База данных (PostgreSQL)

**Цель:** Поднять БД и подключить **Prisma** к NestJS.

### 4.1 📦 Установить зависимости

```bash
cd backend
npm install @prisma/client @nestjs/config
npm install -D prisma
npx prisma init
```

**Зачем:**

- `prisma` — CLI (миграции, `prisma generate`, `prisma studio`)
- `@prisma/client` — типизированный клиент к БД (генерируется из `schema.prisma`)
- `@nestjs/config` — загрузка `.env` (в т.ч. `DATABASE_URL`)
- Драйвер PostgreSQL Prisma подключает сама; отдельные `@nestjs/typeorm`, `typeorm`, пакет `pg` **не нужны**

---

### 4.2 🐘 Запустить PostgreSQL

**Вариант 1 — Docker (рекомендуется):**

```bash
docker run --name quizoo-postgres \
  -e POSTGRES_USER=quizoo_user \
  -e POSTGRES_PASSWORD=quizoo_pass \
  -e POSTGRES_DB=quizoo \
  -p 5432:5432 \
  -d postgres:15
```

**Вариант 2 — Локальная установка:**

Установить PostgreSQL и создать БД вручную.

**Проверить подключение:**

```bash
psql -h localhost -U quizoo_user -d quizoo
# Ввести пароль: quizoo_pass
```

---

### 4.3 ✏️ Создать `backend/.env`

```env
# Prisma — одна строка подключения (см. https://www.prisma.io/docs/orm/reference/connection-urls )
DATABASE_URL="postgresql://quizoo_user:quizoo_pass@localhost:5432/quizoo?schema=public"

# Server
PORT=3001
NODE_ENV=development
```

**Создать `backend/.env.example` с теми же ключами (без паролей и секретов).**

---

### 4.4 ✏️ Настроить Prisma в NestJS

**Минимум:**

1. В `prisma/schema.prisma` — `datasource db { provider = "postgresql" url = env("DATABASE_URL") }` и `generator client { provider = "prisma-client-js" }`.
2. `src/prisma/prisma.service.ts` — класс extends `PrismaClient`, в `onModuleInit` → `$connect()`, в `onModuleDestroy` → `$disconnect()`.
3. `src/prisma/prisma.module.ts` — `@Global()` модуль, экспортирует `PrismaService`.
4. В `app.module.ts` подключить `ConfigModule.forRoot({ isGlobal: true })` и `PrismaModule`.

**Пример `app.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**После добавления первых моделей в `schema.prisma`:**

```bash
npx prisma migrate dev --name init
# на раннем прототипе можно: npx prisma db push
```

**Материалы:**

- [Prisma + NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma Schema](https://www.prisma.io/docs/orm/prisma-schema)

---

### 4.5 ✅ Проверить подключение к БД

```bash
cd backend
npm run start:dev
```

**Что проверить:**

- [ ] Бэкенд запустился на порту 3001
- [ ] Нет ошибок при `$connect()` Prisma
- [ ] В логах: "Nest application successfully started"

---

## ЭТАП 5: Backend — Модель User и UsersModule

**Цель:** Создать таблицу пользователей и базовый CRUD через **Prisma**.

### 5.1 📁 Создать структуру

```bash
cd backend/src
mkdir users
cd users
touch users.module.ts users.controller.ts users.service.ts
```

(Модель данных — в `prisma/schema.prisma`, не в отдельном `*.entity.ts`.)

---

### 5.2 ✏️ Добавить модель `User` в `prisma/schema.prisma`

```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String
  password  String
  role      UserRole @default(USER)
  isBlocked Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Затем:

```bash
cd backend
npx prisma migrate dev --name add_user
```

**Что изучить:**

- [Prisma Models](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)

**Подсказки:**

- `@@map("users")` — имя таблицы в PostgreSQL
- `@default(uuid())` — UUID на стороне БД/Prisma
- После изменений схемы — миграция или `db push` (только для dev)

---

### 5.3 ✏️ Создать `users.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    role?: 'USER' | 'ADMIN';
  }) {
    return this.prisma.user.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      username: string;
      role: 'USER' | 'ADMIN';
      isBlocked: boolean;
    }>,
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

**Подсказки:**

- `PrismaService` — обёртка над `PrismaClient` (см. этап 4)
- Типы полей роли соответствуют enum в `schema.prisma`

---

### 5.4 ✏️ Создать `users.controller.ts`

**Пока без защиты (guards добавим позже):**

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
    };
  }
}
```

---

### 5.5 ✏️ Создать `users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

(`PrismaModule` уже глобальный из этапа 4 — отдельно импортировать не нужно.)

---

### 5.6 ✏️ Добавить UsersModule в `app.module.ts`

```typescript
imports: [
  ConfigModule.forRoot({ ... }),
  PrismaModule,
  UsersModule, // добавить
],
```

---

### 5.7 ✅ Проверить что таблица создалась

**Перезапустить бэкенд:**

```bash
npm run start:dev
```

**Проверить в БД:**

```bash
psql -h localhost -U quizoo_user -d quizoo
\dt  # показать таблицы
\d users  # структура таблицы users
```

**Должна быть таблица `users` с полями: id, email, username, password, role, isBlocked, createdAt, updatedAt**

---

## ЭТАП 6: Backend — Авторизация (Auth модуль)

**Цель:** Регистрация, логин, JWT токены.

### 6.1 📦 Установить зависимости

```bash
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

---

### 6.2 ✏️ Добавить в `backend/.env` JWT секреты

```env
# JWT (добавить к существующим)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production_67890
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

### 6.3 📁 Создать структуру Auth

```bash
cd backend/src
mkdir auth
cd auth
mkdir dto guards strategies decorators
touch auth.module.ts auth.controller.ts auth.service.ts
touch dto/register.dto.ts dto/login.dto.ts
touch guards/jwt-auth.guard.ts
touch strategies/jwt.strategy.ts
touch decorators/current-user.decorator.ts
```

---

### 6.4 ✏️ Создать DTO

**`dto/register.dto.ts`:**

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**`dto/login.dto.ts`:**

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

---

### 6.5 ✏️ Создать `auth.service.ts`

**Код с регистрацией, логином, refresh (полный код выше в старом чеклисте, раздел 9.4)**

**Основные методы:**

- `register(dto)` — хеширует пароль, создаёт пользователя, возвращает токены
- `login(dto)` — проверяет пароль, возвращает токены
- `refreshTokens(refreshToken)` — обновляет access token
- `generateTokens(userId, email, role)` — приватный метод генерации

---

### 6.6 ✏️ Создать JWT стратегию

**`strategies/jwt.strategy.ts`:**

**Код выше в старом чеклисте, раздел 9.5**

---

### 6.7 ✏️ Создать JWT Guard

**`guards/jwt-auth.guard.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

### 6.8 ✏️ Создать декоратор CurrentUser

**`decorators/current-user.decorator.ts`:**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

### 6.9 ✏️ Создать `auth.controller.ts`

**Код выше в старом чеклисте, раздел 9.8**

**Эндпоинты:**

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

---

### 6.10 ✏️ Создать `auth.module.ts`

**Код выше в старом чеклисте, раздел 9.9**

---

### 6.11 ✏️ Добавить AuthModule в `app.module.ts`

```typescript
imports: [
  // ...
  UsersModule,
  AuthModule, // добавить
],
```

---

### 6.12 ✏️ Включить валидацию в `main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
```

---

### 6.13 ✅ Протестировать через curl

```bash
# Регистрация
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"123456"}'

# Логин
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

**Проверить:**

- [ ] Регистрация возвращает пользователя и токены
- [ ] Логин возвращает токены
- [ ] В БД появилась запись в таблице users

---

## ЭТАП 7: Frontend — Redux: slice авторизации

**Цель:** глобальное состояние пользователя и токенов в **`authSlice`** (Redux Toolkit).

### 7.1 ✏️ Создать `store/authSlice.ts`

**Основные экшены / селекторы:**

- `setCredentials({ user, accessToken, refreshToken })` — после логина / регистрации
- `logout` — очистить сессию
- Селекторы: `selectIsAuthenticated`, `selectIsAdmin`, `selectCurrentUser`

Токены можно дублировать в `localStorage` и читать при инициализации store (или отдельный `listenerMiddleware`).

---

### 7.2 ✏️ Подключить slice в `store/index.ts`

```typescript
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

---

## ЭТАП 8: Frontend — Логика авторизации (thunks + RTK Query)

**Цель:** асинхронный login / register / logout через **`createAsyncThunk`** или эндпоинты **`createApi`** (RTK Query), без React Query.

### 8.1 ✏️ Создать `features/auth/authApi.ts` (RTK Query) или thunks в `authSlice`

**Варианты:**

- **RTK Query:** `authApi.endpoints.login.matchFulfilled` → диспатч `setCredentials`
- **Thunk:** `loginUser`, `registerUser`, `logoutUser`, внутри — `apiClient` и `dispatch(setCredentials(...))`

**Хуки/обёртки:**

- Обёртки над `useLoginMutation` / `useRegisterMutation` (если Query) или `useAppDispatch` + thunk

---

---

### 8.2 ✏️ Создать `hooks/index.ts`

```typescript
export * from './useAuth';
```

---

## ЭТАП 9: Frontend — Страницы авторизации

**Цель:** Формы логина и регистрации.

### 9.1 ✏️ Создать `pages/Login.tsx`

**Код выше в старом чеклисте, раздел 6.1** (форма; отправка через thunk или RTK Query mutation).

---

### 9.2 ✏️ Создать `pages/Register.tsx`

**Код выше в старом чеклисте, раздел 6.2**

---

### 9.3 ✏️ Обновить `pages/Home.tsx` — добавить навигацию

**Заменить обычные button на `Link` из react-router-dom:**

```tsx
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/authSlice';

export function HomePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">QuizOo</h1>
        <p className="mt-4 text-xl text-gray-600">
          Платформа закрепления знаний через тесты
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/login">Войти</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 9.4 ✅ Протестировать флоу авторизации

**Что проверить:**

- [ ] Открыть http://localhost:3000
- [ ] Нажать "Регистрация"
- [ ] Заполнить форму (email, username, password)
- [ ] Отправить форму
- [ ] Должен появиться тост "Регистрация успешна"
- [ ] Редирект на /dashboard (пока пустая страница — создадим дальше)
- [ ] В localStorage появились accessToken и refreshToken
- [ ] Перезагрузить страницу — должен остаться залогиненным
- [ ] Выйти (пока через консоль: `store.dispatch(logout())` или кнопка, вызывающая `logout`)

---

## ЭТАП 10: Frontend — ТЕПЕРЬ добавляем interceptors с токенами

**Цель:** Автоматически добавлять токен в запросы и обновлять его при 401.

### 10.1 ✏️ Обновить `lib/api/client.ts`

**Заменить на полную версию с interceptors:**

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - добавление токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - обработка 401 и refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken },
        );

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

**Подсказки:**

- **Добавляем только после того, как авторизация работает!**
- Request interceptor читает токен из localStorage
- Response interceptor ловит 401 и пытается обновить токен
- Если refresh не работает — редирект на логин

---

## ЭТАП 11: Backend — Modules и Cards

**Цель:** CRUD для модулей и карточек.

### 11.1 📁 Создать структуру Modules

```bash
cd backend/src
mkdir modules
cd modules
mkdir dto
touch modules.module.ts modules.controller.ts modules.service.ts
touch dto/create-module.dto.ts dto/update-module.dto.ts
```

---

### 11.2 ✏️ Добавить модель `Module` в `prisma/schema.prisma`

**Связи и поля — по старому чеклисту (раздел 12.1), в формате Prisma `model Module { ... }`. После правок — `prisma migrate dev`.**

---

### 11.3 ✏️ Создать `modules.service.ts`

**Код выше в старом чеклисте, раздел 12.4**

**Основные методы:**

- `findAllByUser(userId)` — все модули пользователя
- `findOne(id, userId)` — один модуль с проверкой владельца
- `create(userId, dto)` — создать модуль
- `update(id, userId, dto)` — обновить
- `remove(id, userId)` — удалить

---

### 11.4 ✏️ Создать `modules.controller.ts`

**Код выше в старом чеклисте, раздел 12.5**

**Важно:** Добавить `@UseGuards(JwtAuthGuard)` на контроллер.

---

### 11.5 ✏️ Создать DTO

**`dto/create-module.dto.ts`:**

```typescript
import { IsEnum, IsString, IsOptional, MinLength } from 'class-validator';

export enum ModuleType {
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
}

export class CreateModuleDto {
  @IsEnum(ModuleType)
  type: ModuleType;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

**`dto/update-module.dto.ts`:**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}
```

---

### 11.6 ✏️ Создать `modules.module.ts`

**Код выше в старом чеклисте, раздел 12.6**

---

### 11.7 ✏️ Добавить в `app.module.ts`

```typescript
imports: [
  // ...
  ModulesModule,
],
```

---

### 11.8 📁 Аналогично создать Cards модуль

**Структура:**

```bash
cd backend/src
mkdir cards
cd cards
mkdir dto
touch cards.module.ts cards.controller.ts cards.service.ts
touch dto/create-card.dto.ts dto/update-card.dto.ts
```

**Entity, Service, Controller, Module — по аналогии с Modules**

**Эндпоинты:**

- GET /modules/:moduleId/cards
- POST /modules/:moduleId/cards
- PATCH /cards/:id
- DELETE /cards/:id

---

### 11.9 ✅ Протестировать через curl

```bash
# Получить токен
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  | jq -r '.data.tokens.accessToken')

# Создать модуль
curl -X POST http://localhost:3001/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"flashcards","title":"Английские слова","description":"A1 уровень"}'

# Получить модули
curl http://localhost:3001/modules \
  -H "Authorization: Bearer $TOKEN"
```

---

## ЭТАП 12: Frontend — Модули (RTK Query)

**Цель:** загрузка и мутации модулей через **`createApi`** (RTK Query): `useGetModulesQuery`, `useGetModuleQuery`, `useCreateModuleMutation` и т.д.

### 12.1 ✏️ Создать `store/modulesApi.ts` (или общий `api` slice)

**Сгенерированные хуки** из `endpoints` — вместо самописных `useQuery` / `useMutation` из TanStack Query.

**Примеры имён:**

- `useGetModulesQuery`
- `useGetModuleQuery`
- `useCreateModuleMutation`
- `useUpdateModuleMutation`
- `useDeleteModuleMutation`

---

### 12.2 ✏️ Обновить `hooks/index.ts`

```typescript
export * from './useAuth';
export * from './useModules';
```

---

## ЭТАП 13: Frontend — Dashboard

**Цель:** Главная страница после входа со списком модулей.

### 13.1 ✏️ Создать `pages/Dashboard.tsx`

**Код выше в старом чеклисте, раздел 6.3**

**Что должно быть:**

- Header с именем пользователя и кнопкой "Выйти"
- Кнопка "Создать модуль"
- Empty state если модулей нет
- Сетка карточек модулей
- Клик по карточке → переход на `/modules/:id`

---

### 13.2 ✏️ Добавить защиту роута

**Вариант:** компонент-обёртка `ProtectedRoute` или проверка в родительском `Route`: если `!selectIsAuthenticated` → `<Navigate to="/login" replace />`.

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/authSlice';

export function ProtectedLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
```

В `App.tsx`: вложить защищённые страницы в `<Route element={<ProtectedLayout />}>` с дочерними `Route`.

---

### 13.3 ✅ Проверить dashboard

**Что проверить:**

- [ ] После логина редирект на /dashboard
- [ ] Показывается имя пользователя
- [ ] Кнопка "Выйти" работает
- [ ] Если модулей нет — показывается empty state
- [ ] Если есть модули — показываются карточки

---

## ЭТАП 14: Frontend — Создание модуля

**Цель:** Страница выбора типа и создания модуля.

### 14.1 ✏️ Создать `pages/modules/new.tsx`

**Код выше в старом чеклисте, раздел 13.3**

**Два шага:**

1. Выбор типа (Карточки или Квиз) — две большие карточки
2. Заполнение названия и описания
3. После создания → редирект на редактор

---

## ЭТАП 15: Frontend — Страница модуля

**Цель:** Просмотр модуля, кнопка запуска режима.

### 15.1 ✏️ Создать `pages/modules/$id.tsx`

**Код выше в старом чеклисте, раздел 13.2**

**Что должно быть:**

- Заголовок и описание модуля
- Бейдж с типом (Карточки / Квиз)
- Кнопки: "Редактировать", "Удалить"
- Главная кнопка: "Учить карточки" или "Начать квиз"
- Список карточек (если тип flashcards)

---

## ЭТАП 16: Frontend — Редактор карточек

**Цель:** Добавление/удаление карточек в модуле.

### 16.1 ✏️ Создать `hooks/useCards.ts`

**Хуки:**

- `useCards(moduleId)` — список карточек
- `useCreateCard()` — добавить
- `useUpdateCard()` — обновить
- `useDeleteCard()` — удалить

---

### 16.2 ✏️ Создать `pages/modules/$id.edit.tsx`

**Что должно быть:**

- Форма: название и описание модуля
- Список карточек с кнопками удаления
- Форма добавления новой карточки (вопрос + ответ)
- Кнопка "Сохранить и вернуться"

---

## ЭТАП 17: Frontend — Режим карточек (Flashcards)

**Цель:** Интерактивный режим изучения карточек.

### 17.1 ✏️ Создать `pages/modules/$id.flashcards.tsx`

**Логика:**

- Загрузить карточки
- Перемешать
- Показывать по одной
- Состояние: `currentIndex`, `isFlipped`, `known[]`, `unknown[]`
- Кнопка "Перевернуть" → показать ответ
- Кнопки "Знал" / "Не знал" → следующая карточка
- Карточки из `unknown` показываются повторно
- Финальный экран с результатами

**Анимация flip:**

- CSS: `transform: rotateY(180deg)`
- `transition: transform 0.6s`
- `transform-style: preserve-3d`

---

## ЭТАП 18: Backend — Questions для квизов

**Цель:** Сущности для вопросов квиза.

### 18.1 📁 Создать структуру Questions

```bash
cd backend/src
mkdir questions
cd questions
mkdir dto
touch questions.module.ts questions.controller.ts questions.service.ts
```

---

### 18.2 ✏️ Описать модели в `prisma/schema.prisma`

Те же сущности, что в диаграмме БД / логической модели (`Question`, `QuestionOption`, `MatchingPair`, enum `QuestionType`), описываются в **Prisma**: `model Question { ... }`, связи `@relation`, `onDelete: Cascade`, вложенные записи через `create` / nested writes в сервисе.

**Ориентиры:**

- [Relations в Prisma](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Enums](https://www.prisma.io/docs/orm/prisma-schema/data-model/enums)

После изменения схемы: `npx prisma migrate dev`.

---

## ЭТАП 19: Frontend — режим квиза

- [x] Страница прохождения: CHOICE, TEXT, MATCHING
- [x] Пагинация, перемешивание, экран результатов с разбором
- [x] Одиночный и множественный верный ответ (флаг из конструктора)
- [ ] Вынести в `components/quiz/*`
- [ ] Подсветка верно/неверно сразу после ответа
- [ ] Matching: связь пар линиями / drag (сейчас селекты)

---

## ЭТАП 20: Backend — Sessions (результаты)

- [x] Модели и сохранение сессии квиза (`QuizSession`, ответы), эндпоинты в `Modules`
- [ ] Отдельный модуль `sessions/`, REST как в учебном плане (`POST /sessions`, пошаговые ответы)

---

## ЭТАП 21: Frontend — статистика

- [ ] Страница истории сессий, средний балл, графики (например recharts)

---

## ЭТАП 22: Backend — admin

- [ ] `RolesGuard`, только admin
- [ ] `GET /admin/users`, `PATCH /admin/users/:id/block`
- [ ] `GET /admin/modules`, `DELETE /admin/modules/:id`

---

## ЭТАП 23: Frontend — admin

- [ ] `pages/admin/index.tsx` — пользователи и блокировка
- [ ] `pages/admin/modules.tsx` — модули и удаление

---

## ЭТАП 24: Docker и Nginx

- [ ] `frontend/Dockerfile` (multi-stage)
- [ ] `backend/Dockerfile` (multi-stage)
- [ ] `docker-compose.yml` (frontend, backend, postgres, nginx)
- [ ] `nginx/nginx.conf`: `/api/*` → backend, остальное → frontend
- [ ] `docker-compose up --build`

---

## ЭТАП 25: Тестирование

- [ ] Unit: AuthService, ModulesService, CardsService
- [ ] E2E: регистрация → модуль → карточки; карточки → результат; квиз → результаты
- [ ] Ручная проверка: регистрация/логин, модули обоих типов, карточки, квиз, статистика, админка, адаптив

---

## ЭТАП 26: Документация

- [ ] README: проект, стек, запуск (локально + Docker), структура, API, скриншоты
- [ ] Swagger в backend (опционально)

---
