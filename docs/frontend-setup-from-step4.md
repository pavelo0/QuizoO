# Настройка фронтенда QuizOo — с шага 4

Простая структура: без FSD, по папкам по смыслу (app, routes, components, lib, hooks, types).

---

## Шаг 4: Структура папок

**Что сделать:** создать папки в `frontend/src/`.

**Зачем:** чтобы не сваливать всё в кучу: роуты отдельно, провайдеры отдельно, утилиты и API — в своих местах.

**Структура:**

```
src/
  app/              — провайдеры (Query, Router) и конфиг приложения
  app/providers/
  routes/           — файлы роутов TanStack Router (по одному файлу = роут/экран)
  components/       — переиспользуемые компоненты
  components/ui/    — кнопки, инпуты, карточки
  lib/              — код без React
  lib/api/          — HTTP-клиент (axios)
  lib/utils/        — утилиты (например cn для классов)
  hooks/            — кастомные хуки
  types/            — общие TypeScript-типы
```

**Команды:**

```bash
cd frontend/src
mkdir -p app/providers routes components/ui lib/api lib/utils hooks types
```

---

## Шаг 5: Утилиты и API (lib)

### 5.1 `src/lib/utils/cn.ts`

**Что сделать:** один файл с функцией для склейки CSS-классов (Tailwind + условные классы).

**Зачем:** чтобы писать `cn('base', isActive && 'active', className)` вместо ручного join и не ломать Tailwind.

**Пример использования в компоненте:**

```tsx
import { cn } from '@/lib/utils/cn';
<button className={cn('rounded px-4', isPrimary && 'bg-primary-600')}>
  OK
</button>;
```

**Код:** функция объединяет `clsx` и `tailwind-merge` (пакеты уже стоят).

---

### 5.2 `src/lib/api/client.ts`

**Что сделать:** один экземпляр axios с `baseURL`, таймаутом и при необходимости интерцепторами.

**Зачем:** все запросы к бэкенду идут через него; в одном месте можно добавить токен, обработку 401 и т.д.

**Пример использования:**

```ts
import { apiClient } from '@/lib/api/client';
const { data } = await apiClient.get('/quizzes');
```

**Что задать:** `baseURL` из `import.meta.env.VITE_API_URL` (например `http://localhost:3001/api`), `timeout`, заголовок `Content-Type: application/json`. При желании — интерцепторы request (добавить токен) и response (обработка ошибок).

---

## Шаг 6: Провайдеры (app/providers)

**Что сделать:** обернуть приложение в провайдеры TanStack Query и, при необходимости, других библиотек.

### 6.1 `src/app/providers/QueryProvider.tsx`

**Зачем:** дать всему приложению доступ к React Query (useQuery, useMutation).

**Что внутри:** `QueryClientProvider` от `@tanstack/react-query` и опционально `ReactQueryDevtools`. Создать один `QueryClient` с разумными defaults (staleTime, retry и т.д.) и передать его в провайдер.

**Пример использования в main.tsx:** обернуть дерево в `<QueryProvider>`.

---

## Шаг 7: Роуты (routes)

**Что сделать:** завести файловый роутинг TanStack Router. Плагин сам сгенерирует `src/routeTree.gen.ts` по файлам в `src/routes/`.

### 7.1 `src/routes/__root.tsx`

**Зачем:** корневой layout для всего приложения (общая обёртка, Outlet для дочерних роутов).

**Что внутри:** `createRootRoute` из `@tanstack/react-router`, в `component` — разметка с `<Outlet />`. Опционально подключить `TanStackRouterDevtools`.

**Пример:** один корневой div (например с общим header/footer) и внутри `<Outlet />`.

---

### 7.2 `src/routes/index.tsx`

**Зачем:** главная страница по маршруту `/`.

**Что внутри:** `createFileRoute('/')` и компонент страницы (можно в том же файле). В `component` — разметка главной (например заголовок и краткое описание квиза).

**Пример:** простая страница с заголовком "QuizOo" и текстом.

---

## Шаг 8: Точка входа (main.tsx)

**Что сделать:** подключить роутер и провайдеры вместо голого `<App />`.

**Зачем:** приложение должно рендерить дерево роутов и иметь доступ к Query.

**Что сделать по шагам:**

1. Импортировать `createRouter` и `RouterProvider` из `@tanstack/react-router`.
2. Импортировать сгенерированное дерево: `import { routeTree } from './routeTree.gen'`.
3. Создать роутер: `const router = createRouter({ routeTree })`.
4. При необходимости задекларировать типы для роутера (см. доки TanStack Router).
5. В `render` отдать: `QueryProvider` → внутри `RouterProvider router={router}` → внутри при необходимости `Toaster` (react-hot-toast).
6. Удалить импорт и использование `App.tsx`, если он больше не нужен.

**Важно:** после добавления/изменения файлов в `src/routes/` перезапустить dev-сервер или дождаться пересборки — тогда появится/обновится `routeTree.gen.ts`.

---

## Шаг 9: Переменные окружения

**Что сделать:** в `frontend/` создать `.env` и по желанию `.env.example`.

**Зачем:** вынести baseURL API в переменную, чтобы не хардкодить и менять для dev/prod.

**Пример содержимого:**

- `.env`: `VITE_API_URL=http://localhost:3001/api`
- `.env.example`: то же значение как пример (без секретов).

В `lib/api/client.ts` использовать `import.meta.env.VITE_API_URL`.

---

## Шаг 10: Типы (types)

**Что сделать:** завести общие типы в `src/types/`, чтобы использовать и в компонентах, и в API.

**Примеры файлов:**

- `src/types/api.ts` — общий ответ API (например `{ data: T, message?: string }`), тип ошибки, при необходимости пагинация.
- `src/types/quiz.ts` — типы домена: Quiz, Question, Option и т.д. (под вашу модель с бэкенда).

**Зачем:** один источник правды для контракта с API и для типизации стейта/пропсов.

**Пример использования:**

```ts
import type { Quiz } from '@/types/quiz';
const [quiz, setQuiz] = useState<Quiz | null>(null);
```

---

## Шаг 11: Скрипты и линтинг (по желанию)

**Что сделать:** в `frontend/package.json` добавить скрипты для проверки кода.

**Примеры:**

- `"lint:fix": "eslint . --ext ts,tsx --fix"`
- `"format": "prettier --write \"src/**/*.{ts,tsx,css}\""`
- `"format:check": "prettier --check \"src/**/*.{ts,tsx,css}\""`
- `"type-check": "tsc --noEmit"`

**Зачем:** удобно перед коммитом запускать `npm run type-check` и `npm run lint`.

---

## Порядок выполнения (кратко)

1. Создать папки (шаг 4).
2. Написать `lib/utils/cn.ts` и `lib/api/client.ts` (шаг 5).
3. Написать `app/providers/QueryProvider.tsx` (шаг 6).
4. Создать `routes/__root.tsx` и `routes/index.tsx` (шаг 7).
5. Обновить `main.tsx` (шаг 8).
6. Добавить `.env` (шаг 9).
7. Добавить типы в `types/` по мере необходимости (шаг 10).
8. При желании — скрипты (шаг 11).

После шагов 4–8 у вас будет: структура папок, работающий роутинг, Query и API-клиент. Остальное можно дописывать по ходу разработки.
