# QuizoO — Детальный чеклист (правильная хронология)

> **Обновлено:** 7 марта 2026  
> **Принцип:** Сначала UI и структура, потом бэкенд, потом связываем

---

# 📋 КРАТКИЙ ЧЕКЛИСТ (для быстрого трекинга)

> Галочки для отслеживания прогресса. Детальные инструкции с кодом — ниже в разделе "Детальный план".

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

---

## 📝 Задачи для выполнения

### ЭТАП 1: Базовая настройка фронтенда (БЕЗ авторизации)

- [ ] 1.1 Заполнить `lib/api/client.ts` (простая версия без токенов)
- [ ] 1.2 Заполнить `app/providers/QueryProvider.tsx`
- [ ] 1.3 Заполнить `routes/__root.tsx`
- [ ] 1.4 Заполнить `routes/index.tsx` (лендинг)
- [ ] 1.5 Обновить `main.tsx` (роутер + провайдеры)
- [ ] 1.6 Запустить и проверить (http://localhost:3000)

### ЭТАП 2: UI Kit

- [ ] 2.1 Создать `components/ui/Button.tsx`
- [ ] 2.2 Создать `components/ui/Input.tsx`
- [ ] 2.3 Создать `components/ui/Card.tsx`
- [ ] 2.4 Создать `components/ui/index.ts` (реэкспорт)
- [ ] 2.5 Обновить лендинг с Button
- [ ] 2.6 Проверить что компоненты работают

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

### ЭТАП 7: Frontend — Zustand стор

- [ ] 7.1 Создать `stores/useAuthStore.ts` (setAuth, logout, isAuthenticated, isAdmin)
- [ ] 7.2 Создать `stores/index.ts` (реэкспорт)

### ЭТАП 8: Frontend — Хуки для авторизации

- [ ] 8.1 Создать `hooks/useAuth.ts` (useLogin, useRegister, useLogout)
- [ ] 8.2 Создать `hooks/index.ts` (реэкспорт)

### ЭТАП 9: Frontend — Страницы авторизации

- [ ] 9.1 Создать `routes/login.tsx` (форма входа)
- [ ] 9.2 Создать `routes/register.tsx` (форма регистрации)
- [ ] 9.3 Обновить `routes/index.tsx` (добавить Link на login/register)
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

- [ ] 14.1 Создать `routes/dashboard.tsx` (список модулей)
- [ ] 14.2 Добавить beforeLoad (защита роута)
- [ ] 14.3 Добавить Header с кнопкой "Выйти"
- [ ] 14.4 Добавить Empty state
- [ ] 14.5 Добавить сетку карточек модулей
- [ ] 14.6 Проверить что всё работает

### ЭТАП 15: Frontend — Создание модуля

- [ ] 15.1 Создать `routes/modules/new.tsx`
  - [ ] Шаг 1: Выбор типа (Карточки / Квиз)
  - [ ] Шаг 2: Заполнение названия и описания
  - [ ] Редирект на редактор после создания

### ЭТАП 16: Frontend — Страница модуля

- [ ] 16.1 Создать `routes/modules/$id.tsx`
  - [ ] Заголовок и описание
  - [ ] Бейдж с типом
  - [ ] Кнопки: Редактировать, Удалить
  - [ ] Главная кнопка: "Учить карточки" или "Начать квиз"
  - [ ] Список карточек (для flashcards)

### ЭТАП 17: Frontend — Редактор карточек

- [ ] 17.1 Создать `hooks/useCards.ts` (useCards, useCreateCard, useUpdateCard, useDeleteCard)
- [ ] 17.2 Создать `routes/modules/$id.edit.tsx`
  - [ ] Форма: название и описание модуля
  - [ ] Список существующих карточек
  - [ ] Форма добавления новой карточки (вопрос + ответ)
  - [ ] Кнопки удаления карточек
  - [ ] Кнопка "Сохранить и вернуться"

### ЭТАП 18: Frontend — Режим карточек (Flashcards)

- [ ] 18.1 Создать `routes/modules/$id.flashcards.tsx`
  - [ ] Загрузка и перемешивание карточек
  - [ ] Отображение текущей карточки
  - [ ] Кнопка "Перевернуть" (анимация flip)
  - [ ] Кнопки "Знал" / "Не знал"
  - [ ] Логика повтора карточек "Не знал"
  - [ ] Финальный экран с результатами
- [ ] 18.2 Добавить CSS для 3D flip анимации

### ЭТАП 19: Backend — Questions для квизов

- [ ] 19.1 Создать структуру папок (questions/, entities/, dto/)
- [ ] 19.2 Добавить модели `Question`, `QuestionOption`, `MatchingPair` в `prisma/schema.prisma`
- [ ] 19.5 Создать `questions.service.ts`
- [ ] 19.6 Создать `questions.controller.ts`
- [ ] 19.7 Создать DTO для каждого типа вопроса
- [ ] 19.8 Создать `questions.module.ts`
- [ ] 19.9 Добавить в `app.module.ts`
- [ ] 19.10 Протестировать через curl

### ЭТАП 20: Frontend — Компоненты вопросов квиза

- [ ] 20.1 Создать `components/quiz/SingleChoiceQuestion.tsx`
  - [ ] 4 варианта ответа
  - [ ] Выбор одного варианта
  - [ ] Подсветка правильного/неправильного
- [ ] 20.2 Создать `components/quiz/TextInputQuestion.tsx`
  - [ ] Поле ввода
  - [ ] Кнопка "Ответить"
  - [ ] Показ правильного ответа
- [ ] 20.3 Создать `components/quiz/MatchingQuestion.tsx`
  - [ ] Две колонки (левая и правая)
  - [ ] Логика соединения пар
  - [ ] Проверка правильности

### ЭТАП 21: Frontend — Режим квиза

- [ ] 21.1 Создать `hooks/useQuestions.ts`
- [ ] 21.2 Создать `routes/modules/$id.quiz.tsx`
  - [ ] Загрузка вопросов
  - [ ] Перемешивание
  - [ ] Показ текущего вопроса
  - [ ] Рендер компонента по типу вопроса
  - [ ] Прогресс-бар
  - [ ] Сохранение ответов
  - [ ] Финальный экран с результатами

### ЭТАП 22: Backend — Sessions (результаты)

- [ ] 22.1 Создать структуру папок (sessions/, dto/)
- [ ] 22.2 Добавить модели `QuizSession`, `QuizAnswer` в `prisma/schema.prisma` и миграции
- [ ] 22.3 Создать `sessions.service.ts`
  - [ ] Метод startSession
  - [ ] Метод submitAnswer
  - [ ] Метод completeSession
  - [ ] Метод getResults
  - [ ] Метод getHistory
- [ ] 22.4 Создать `sessions.controller.ts`
- [ ] 22.5 Создать DTO
- [ ] 22.6 Создать `sessions.module.ts`
- [ ] 22.7 Добавить в `app.module.ts`
- [ ] 22.8 Протестировать через curl

### ЭТАП 23: Frontend — Статистика

- [ ] 23.1 Создать `hooks/useSessions.ts`
- [ ] 23.2 Создать `routes/statistics.tsx`
  - [ ] История всех сессий (таблица)
  - [ ] Средний балл
  - [ ] Фильтры по модулю
  - [ ] Графики прогресса (опционально: recharts)

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
- [ ] 25.2 Создать `routes/admin/index.tsx`
  - [ ] Таблица пользователей
  - [ ] Кнопки блокировки/разблокировки
  - [ ] Пагинация
- [ ] 25.3 Создать `routes/admin/modules.tsx`
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
- [x] Все зависимости установлены (Router, Query, Tailwind, Zustand, Axios)
- [x] Vite конфиг (плагины, алиасы, прокси)
- [x] TypeScript конфиг (strict, path aliases)
- [x] ESLint + Prettier
- [x] Tailwind CSS (конфиг, postcss)
- [x] Структура папок создана
- [x] Утилита `cn.ts` готова
- [x] .env файлы созданы

### Что НЕ готово (пустые файлы)

- [ ] `lib/api/client.ts` — пустой
- [ ] `app/providers/QueryProvider.tsx` — пустой
- [ ] `routes/__root.tsx` — пустой
- [ ] `routes/index.tsx` — пустой
- [ ] `main.tsx` — старая версия без роутера

---

# 🎯 ПЛАН РАЗРАБОТКИ (ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ)

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

### 1.2 ✏️ Заполнить `app/providers/QueryProvider.tsx`

**Зачем:** Обёртка для React Query. Без неё `useQuery` не работает.

**Что писать:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 10, // 10 минут
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Подсказки:**

- Создаём один `QueryClient` с настройками по умолчанию
- `staleTime` — как долго данные свежие
- DevTools — панель для отладки

---

### 1.3 ✏️ Заполнить `routes/__root.tsx`

**Зачем:** Корневой layout. Общая обёртка для всех страниц.

**Что писать:**

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
```

**Подсказки:**

- `Outlet` — место для дочерних роутов
- Минимальная обёртка — только фон
- DevTools для роутера

---

### 1.4 ✏️ Заполнить `routes/index.tsx`

**Зачем:** Лендинг (главная страница). Пока без кликабельных кнопок.

**Что писать:**

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">
          QuizOo
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Платформа закрепления знаний через тесты
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Войти
          </button>
          <button className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
            Регистрация
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          (Кнопки пока не работают — добавим позже)
        </p>
      </div>
    </div>
  );
}
```

**Подсказки:**

- Простой лендинг с заголовком и кнопками
- Кнопки пока без onClick — просто вёрстка
- Tailwind классы для градиента и центрирования

---

### 1.5 ✏️ Обновить `main.tsx`

**Зачем:** Подключить роутер и провайдеры.

**Что писать:**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryProvider } from './app/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Импорт сгенерированного дерева роутов
import { routeTree } from './routeTree.gen';

// Создание роутера
const router = createRouter({ routeTree });

// Типизация роутера
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </QueryProvider>
  </StrictMode>,
);
```

**Подсказки:**

- `routeTree.gen.ts` создаётся автоматически плагином
- `declare module` — для типизации путей
- Порядок: Query → Router → Toaster

---

### 1.6 ✅ Проверить запуск

**Команды:**

```bash
cd frontend
npm run dev
```

**Открыть:** http://localhost:3000

**Что должно быть:**

- [ ] Лендинг с заголовком "QuizOo"
- [ ] Градиентный фон
- [ ] Две кнопки (пока не кликабельные)
- [ ] Нет ошибок в консоли
- [ ] DevTools Router и Query видны

**Если всё ОК — переходим дальше! ✅**

---

## ЭТАП 2: UI Kit (переиспользуемые компоненты)

**Цель:** Создать базовые компоненты, чтобы потом быстро собирать страницы.

### 2.1 ✏️ Создать `components/ui/Button.tsx`

**Код выше в разделе 2.1 (с вариантами, размерами, isLoading)**

---

### 2.2 ✏️ Создать `components/ui/Input.tsx`

**Код выше в разделе 2.2 (с label, error)**

---

### 2.3 ✏️ Создать `components/ui/Card.tsx`

**Код выше в разделе 2.3 (с CardHeader, CardTitle и т.д.)**

---

### 2.4 ✏️ Создать `components/ui/index.ts`

**Реэкспорт всех компонентов**

---

### 2.5 ✅ Обновить лендинг с Button

**Заменить обычные button на компонент Button** (код выше в разделе 2.5)

**Проверить:**

- [ ] Кнопки выглядят красиво
- [ ] Hover работает

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

## ЭТАП 7: Frontend — Zustand стор для авторизации

**Цель:** Глобальное состояние для пользователя и токенов.

### 7.1 ✏️ Создать `stores/useAuthStore.ts`

**Код выше в старом чеклисте, раздел 3.1**

**Основные методы:**

- `setAuth(user, tokens)` — сохранить после логина
- `logout()` — очистить
- `isAuthenticated()` — проверка
- `isAdmin()` — проверка роли

---

### 7.2 ✏️ Создать `stores/index.ts`

```typescript
export { useAuthStore } from './useAuthStore';
```

---

## ЭТАП 8: Frontend — Хуки для авторизации

**Цель:** React Query хуки для login, register, logout.

### 8.1 ✏️ Создать `hooks/useAuth.ts`

**Код выше в старом чеклисте, раздел 4.1**

**Хуки:**

- `useLogin()` — вход
- `useRegister()` — регистрация
- `useLogout()` — выход

---

### 8.2 ✏️ Создать `hooks/index.ts`

```typescript
export * from './useAuth';
```

---

## ЭТАП 9: Frontend — Страницы авторизации

**Цель:** Формы логина и регистрации.

### 9.1 ✏️ Создать `routes/login.tsx`

**Код выше в старом чеклисте, раздел 6.1**

---

### 9.2 ✏️ Создать `routes/register.tsx`

**Код выше в старом чеклисте, раздел 6.2**

---

### 9.3 ✏️ Обновить `routes/index.tsx` — добавить навигацию

**Заменить обычные button на Link:**

```typescript
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Если авторизован — редирект на dashboard
  if (isAuthenticated) {
    navigate({ to: '/dashboard' });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">
          QuizOo
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Платформа закрепления знаний через тесты
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/login">
            <Button size="lg">Войти</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">Регистрация</Button>
          </Link>
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
- [ ] Выйти (пока через консоль: `useAuthStore.getState().logout()`)

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

## ЭТАП 12: Frontend — Хуки для модулей

**Цель:** React Query хуки для работы с модулями.

### 12.1 ✏️ Создать `hooks/useModules.ts`

**Код выше в старом чеклисте, раздел 4.2**

**Хуки:**

- `useModules()` — список модулей
- `useModule(id)` — один модуль
- `useCreateModule()` — создать
- `useUpdateModule()` — обновить
- `useDeleteModule()` — удалить

---

### 12.2 ✏️ Обновить `hooks/index.ts`

```typescript
export * from './useAuth';
export * from './useModules';
```

---

## ЭТАП 13: Frontend — Dashboard

**Цель:** Главная страница после входа со списком модулей.

### 13.1 ✏️ Создать `routes/dashboard.tsx`

**Код выше в старом чеклисте, раздел 6.3**

**Что должно быть:**

- Header с именем пользователя и кнопкой "Выйти"
- Кнопка "Создать модуль"
- Empty state если модулей нет
- Сетка карточек модулей
- Клик по карточке → переход на `/modules/:id`

---

### 13.2 ✏️ Добавить защиту роута

**В `routes/dashboard.tsx` добавить `beforeLoad`:**

```typescript
import { redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardPage,
});
```

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

### 14.1 ✏️ Создать `routes/modules/new.tsx`

**Код выше в старом чеклисте, раздел 13.3**

**Два шага:**

1. Выбор типа (Карточки или Квиз) — две большие карточки
2. Заполнение названия и описания
3. После создания → редирект на редактор

---

## ЭТАП 15: Frontend — Страница модуля

**Цель:** Просмотр модуля, кнопка запуска режима.

### 15.1 ✏️ Создать `routes/modules/$id.tsx`

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

### 16.2 ✏️ Создать `routes/modules/$id.edit.tsx`

**Что должно быть:**

- Форма: название и описание модуля
- Список карточек с кнопками удаления
- Форма добавления новой карточки (вопрос + ответ)
- Кнопка "Сохранить и вернуться"

---

## ЭТАП 17: Frontend — Режим карточек (Flashcards)

**Цель:** Интерактивный режим изучения карточек.

### 17.1 ✏️ Создать `routes/modules/$id.flashcards.tsx`

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

## ЭТАП 19: Frontend — Режим квиза

**Цель:** Прохождение квиза с разными типами вопросов.

### 19.1 ✏️ Создать компоненты вопросов

**`components/quiz/SingleChoiceQuestion.tsx`:**

- 4 варианта ответа
- Выбор одного
- Подсветка правильного/неправильного после ответа

**`components/quiz/TextInputQuestion.tsx`:**

- Поле ввода
- Кнопка "Ответить"
- Сравнение с эталоном (без учёта регистра)

**`components/quiz/MatchingQuestion.tsx`:**

- Две колонки
- Соединение пар кликом

---

### 19.2 ✏️ Создать `routes/modules/$id.quiz.tsx`

**Логика:**

- Загрузить вопросы
- Перемешать
- Показывать по одному
- Рендерить компонент в зависимости от типа
- Сохранять ответы
- Финальный экран с результатами

---

## ЭТАП 20: Backend — Sessions (результаты)

**Цель:** Сохранение результатов прохождений.

### 20.1 ✏️ Создать Session entity

**Поля:**

- id, userId, moduleId, mode, score, completed, createdAt, completedAt

---

### 20.2 ✏️ Создать SessionsService и Controller

**Эндпоинты:**

- POST /sessions — начать сессию
- POST /sessions/:id/answer — отправить ответ
- PATCH /sessions/:id/complete — завершить
- GET /sessions/history — история
- GET /sessions/:id/results — результаты

---

## ЭТАП 21: Frontend — Статистика

**Цель:** История прохождений и графики.

### 21.1 ✏️ Создать `routes/statistics.tsx`

**Что показывать:**

- История всех сессий (таблица)
- Средний балл
- Графики прогресса (можно использовать recharts)

---

## ЭТАП 22: Backend — Admin панель

**Цель:** Управление пользователями и модулями.

### 22.1 ✏️ Создать RolesGuard

**`auth/guards/roles.guard.ts`:**

Проверка роли (только admin).

---

### 22.2 ✏️ Создать Admin контроллер

**Эндпоинты:**

- GET /admin/users — все пользователи
- PATCH /admin/users/:id/block — блокировка
- GET /admin/modules — все модули
- DELETE /admin/modules/:id — удаление

---

## ЭТАП 23: Frontend — Admin панель

**Цель:** Страницы для администратора.

### 23.1 ✏️ Создать `routes/admin/index.tsx`

**Таблица пользователей с кнопками блокировки**

---

### 23.2 ✏️ Создать `routes/admin/modules.tsx`

**Таблица всех модулей с кнопками удаления**

---

## ЭТАП 24: Docker и Nginx

**Цель:** Контейнеризация и деплой.

### 24.1 ✏️ Создать `frontend/Dockerfile`

**Multi-stage build:**

1. Stage 1: сборка (npm install, npm run build)
2. Stage 2: nginx с статикой

---

### 24.2 ✏️ Создать `backend/Dockerfile`

**Multi-stage build:**

1. Stage 1: установка зависимостей
2. Stage 2: сборка TypeScript
3. Stage 3: production image (только dist и node_modules prod)

---

### 24.3 ✏️ Создать `docker-compose.yml`

**Сервисы:**

- frontend (порт 3000)
- backend (порт 3001)
- postgres (порт 5432)
- nginx (порт 80)

---

### 24.4 ✏️ Настроить `nginx/nginx.conf`

**Маршрутизация:**

- `/api/*` → backend:3001
- `/*` → frontend:3000

---

### 24.5 ✅ Проверить полную сборку

```bash
docker-compose up --build
```

---

## ЭТАП 25: Тестирование

**Цель:** Убедиться что всё работает.

### 25.1 ✏️ Написать unit-тесты (backend)

**Для сервисов:**

- AuthService (register, login)
- ModulesService (CRUD)
- CardsService (CRUD)

---

### 25.2 ✏️ Написать e2e тесты (backend)

**Сценарии:**

- Регистрация → логин → создание модуля → добавление карточек
- Прохождение карточек → сохранение результата
- Прохождение квиза → результаты

---

### 25.3 ✅ Ручное тестирование

**Проверить все сценарии:**

- [ ] Регистрация и логин
- [ ] Создание модуля (оба типа)
- [ ] Добавление карточек
- [ ] Режим карточек
- [ ] Режим квиза
- [ ] Статистика
- [ ] Админка
- [ ] Адаптивность (мобила, планшет, десктоп)

---

## ЭТАП 26: Документация и финализация

### 26.1 ✏️ Обновить README.md

**Что добавить:**

- Описание проекта
- Стек технологий
- Инструкция по запуску (локально и через Docker)
- Структура проекта
- API эндпоинты
- Скриншоты

---

### 26.2 ✏️ Добавить Swagger (опционально)

```bash
cd backend
npm install @nestjs/swagger
```

**В `main.ts` настроить Swagger UI:**

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('QuizOo API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Доступ:** http://localhost:3001/api/docs

---

# 📝 КРАТКИЙ ЧЕКЛИСТ ДЛЯ УТРА

## Прямо сейчас (базовая настройка):

- [ ] Заполнить `lib/api/client.ts` (простая версия без токенов)
- [ ] Заполнить `app/providers/QueryProvider.tsx`
- [ ] Заполнить `routes/__root.tsx`
- [ ] Заполнить `routes/index.tsx` (лендинг)
- [ ] Обновить `main.tsx` (роутер + провайдеры)
- [ ] Запустить `npm run dev` и проверить

## Потом (UI компоненты):

- [ ] Создать Button, Input, Card
- [ ] Обновить лендинг с Button
- [ ] Проверить что компоненты работают

## Затем (типы):

- [ ] Создать types/api.ts, user.ts, module.ts, session.ts
- [ ] Создать types/index.ts (реэкспорт)

## Дальше (бэкенд):

- [ ] Установить зависимости для БД
- [ ] Запустить PostgreSQL
- [ ] Настроить Prisma (schema, PrismaModule)
- [ ] Добавить модель User и UsersModule
- [ ] Установить зависимости для JWT
- [ ] Создать Auth модуль
- [ ] Протестировать регистрацию и логин

## После (фронтенд с авторизацией):

- [ ] Создать Zustand стор (useAuthStore)
- [ ] Создать хуки (useAuth)
- [ ] Создать страницы login и register
- [ ] Протестировать флоу авторизации
- [ ] **ТОЛЬКО ТЕПЕРЬ** обновить client.ts с interceptors для токенов

## Основная функциональность:

- [ ] Backend: Modules и Cards
- [ ] Frontend: хуки для модулей
- [ ] Frontend: dashboard со списком модулей
- [ ] Frontend: создание модуля
- [ ] Frontend: страница модуля
- [ ] Frontend: редактор карточек
- [ ] Frontend: режим карточек
- [ ] Backend: Questions для квизов
- [ ] Frontend: режим квиза
- [ ] Backend: Sessions (результаты)
- [ ] Frontend: статистика

## Финал:

- [ ] Админка (бэк + фронт)
- [ ] Docker и docker-compose
- [ ] Тестирование
- [ ] Документация

---

# 🎓 ЧТО ИЗУЧАТЬ ПО ХОДУ

## Сейчас (этапы 1-3):

- **TanStack Router:** createRootRoute, createFileRoute, Outlet, Link, useNavigate
- **TanStack Query:** QueryClient, QueryClientProvider, defaultOptions
- **React:** forwardRef, useState, useEffect
- **Tailwind CSS:** утилитные классы, responsive design

## Потом (этапы 4-10):

- **Prisma:** `schema.prisma`, `PrismaClient`, связи, `prisma migrate`
- **NestJS:** modules, controllers, services, dependency injection
- **JWT:** access/refresh токены, payload, interceptors
- **bcrypt:** хеширование паролей
- **Axios:** interceptors, request/response

## Дальше (этапы 11-19):

- **TanStack Query:** useQuery, useMutation, queryKey, invalidation
- **Zustand:** create, persist middleware, selectors
- **TypeScript:** generics, union types, utility types
- **React:** controlled components, forms, conditional rendering

## В конце (этапы 20-26):

- **Docker:** Dockerfile, multi-stage build, docker-compose
- **Nginx:** reverse proxy, static files
- **Testing:** Jest, Supertest, e2e tests
- **Swagger:** документирование API

---

# 🚀 РЕКОМЕНДУЕМЫЙ ТЕМП

**Неделя 1:** Этапы 1-10 (настройка фронта, БД, авторизация)  
**Неделя 2:** Этапы 11-16 (модули, карточки, редакторы)  
**Неделя 3:** Этапы 17-21 (режимы обучения, статистика)  
**Неделя 4:** Этапы 22-26 (админка, Docker, тесты, документация)

---

# 💡 ВАЖНЫЕ ПРИНЦИПЫ

1. **Сначала UI, потом бэкенд** — так видишь результат быстрее
2. **Один модуль за раз** — не прыгай между задачами
3. **Тестируй после каждого этапа** — не накапливай баги
4. **Коммить часто** — маленькие коммиты проще откатить
5. **Читай доки** — не гадай, как работает библиотека
6. **Не усложняй** — если можно проще, делай проще

---

**Успехов! 🎉**

**Начинай с этапа 1.1 — заполнения `lib/api/client.ts`**
