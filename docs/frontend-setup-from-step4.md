# Настройка фронтенда QuizOo — с шага 4

Простая структура: без FSD, по папкам по смыслу (`app`, `pages`, `components`, `store`, `lib`, `hooks`, `types`).

**Стек:** React Router, Redux Toolkit + RTK Query, axios, Tailwind, shadcn/ui (см. `docs/techDesign.md`).

---

## Шаг 4: Структура папок

**Что сделать:** создать папки в `frontend/src/`.

**Зачем:** роуты и страницы отдельно, Redux store отдельно, утилиты и API — в своих местах.

**Структура:**

```
src/
  app/                 — провайдеры (Redux `Provider`, при необходимости тема)
  app/providers/
  pages/               — экраны (по одному компоненту на основной маршрут)
  components/          — переиспользуемые блоки
  components/ui/       — shadcn/ui (button, input, card, …)
  store/               — configureStore, slices, RTK Query API
  lib/                 — код без React
  lib/api/             — HTTP-клиент (axios)
  lib/utils/           — утилиты (например `cn` для классов)
  hooks/               — кастомные хуки (часто обёртки над dispatch / selectors)
  types/               — общие TypeScript-типы
```

**Команды:**

```bash
cd frontend/src
mkdir -p app/providers pages components/ui store lib/api lib/utils hooks types
```

---

## Шаг 5: Утилиты и API (lib)

### 5.1 `src/lib/utils.ts` (или `cn.ts`)

**Что сделать:** функция `cn` для склейки CSS-классов (Tailwind + условные классы) — как в shadcn.

**Зачем:** `cn('base', isActive && 'active', className)` без ручного join.

### 5.2 `src/lib/api/client.ts`

**Что сделать:** один экземпляр axios с `baseURL`, таймаутом и интерцепторами (JWT, refresh при 401).

**Пример:**

```ts
import { apiClient } from '@/lib/api/client';
const { data } = await apiClient.get('/modules');
```

`baseURL` из `import.meta.env.VITE_API_URL`.

---

## Шаг 6: Redux store и провайдеры

### 6.1 `src/store/index.ts`

**Зачем:** единая точка входа — `configureStore`, подключение редьюсеров и RTK Query middleware.

**Что внутри:** редьюсер из `authSlice`, `api` из `createApi` (например `baseApi` с `injectEndpoints`), `setupListeners` для refetch при фокусе окна (по желанию).

### 6.2 `src/store/hooks.ts`

**Зачем:** типизированные `useAppDispatch` и `useAppSelector` вместо голых `useDispatch` / `useSelector`.

### 6.3 `src/app/providers/StoreProvider.tsx`

**Зачем:** обернуть дерево в `<Provider store={store}>` из `react-redux`.

**В `main.tsx`:** `StoreProvider` → при необходимости другие провайдеры → `BrowserRouter` (см. шаг 8).

---

## Шаг 7: Роутинг (react-router-dom)

**Что сделать:** описать маршруты в `App.tsx` (или `routes.tsx`): `Routes`, `Route`, вложенные layout-роуты, `Navigate` для редиректов.

**Пример скелета:**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

Защищённые страницы: обёртка, которая читает сессию из Redux (или `localStorage` при гидрации) и редиректит на `/login` через `<Navigate to="/login" replace />`.

**Файлового роутера как у TanStack Router нет** — один файл = один компонент страницы в `pages/`, маршруты объявляются явно.

---

## Шаг 8: Точка входа (`main.tsx`)

**Что сделать:** `createRoot` → `StoreProvider` → `BrowserRouter` → `App` (с `Routes`) → при необходимости `Toaster` (например react-hot-toast).

**Порядок:** Redux store доступен всему дереву; внутри роутера страницы используют `useAppDispatch` / RTK Query хуки.

---

## Шаг 9: Переменные окружения

**Что сделать:** в `frontend/` создать `.env` и `.env.example` с `VITE_API_URL`.

---

## Шаг 10: Типы (`types/`)

Общие типы домена и ответов API — как в прежней версии документа; используются в слайсах, селекторах и компонентах.

---

## Шаг 11: shadcn/ui

**Что сделать:** инициализировать shadcn (`components.json` в корне `frontend/`), добавить нужные примитивы (`button`, `input`, `card`, …) по макетам из `ProjectInfo/QuizoO_STITCH_PROMPTS.md` и токенам из этого репозитория.

**Зачем:** единые кнопки, поля, диалоги, таблицы без дублирования вёрстки.

---

## Шаг 12: Скрипты и линтинг

По желанию: `lint:fix`, `type-check: tsc --noEmit` в `package.json`.

---

## Порядок выполнения (кратко)

1. Создать папки (шаг 4).
2. `lib/api/client.ts` и `cn` (шаг 5).
3. `store/` + `StoreProvider` (шаг 6).
4. Страницы в `pages/` + `App.tsx` с `Routes` (шаги 7–8).
5. `.env` (шаг 9).
6. Типы по мере необходимости (шаг 10).
7. Подключить shadcn-компоненты под дизайн-систему (шаг 11).

После шагов 4–8 у вас: структура, Redux, роутинг и API-клиент; данные с бэкенда удобно тянуть через **RTK Query** endpoints в том же `store`.
