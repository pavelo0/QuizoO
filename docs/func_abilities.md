# QuizoO — функциональные возможности (контекст для курсовой записки)

Документ описывает **фактически реализованные** возможности приложения **QuizoO**: веб-платформы для создания учебных модулей (карточки и квизы), их прохождения, учёта результатов и базового администрирования. Сервер: **NestJS + Prisma + PostgreSQL**; клиент: **React + Vite**.

В проекте **нет** WebSocket-/Socket.io-каналов, **нет** массовой почтовой рассылки через внешний API (коды верификации в текущей реализации выводятся в лог сервера или опционально возвращаются в JSON при флаге окружения).

---

## 3.4 Реализация функций приложения

Ниже функции сгруппированы по пользовательским сценариям и сопоставлены с REST API (`/api`, см. `docs/api.md`) и маршрутами SPA (`frontend/src/router.tsx`).

### 3.4.1 Публичная зона и служебные запросы

- **Лендинг** (`/`): ознакомительная страница для неавторизованного посетителя.
- **Счётчик обращений**: публичные `POST /api/click` и `GET /api/clicks` — учёт записей в таблице `Click` без аутентификации.
- **Проверка работоспособности API**: `GET /api/health`.

### 3.4.2 Регистрация и подтверждение email

- Пользователь отправляет **POST `/api/auth/register`** с `email`, `password`, опционально `username`.
- Сервер создаёт запись в `users` с `emailVerified: false`, хэширует пароль (**bcrypt**), генерирует **шестизначный код** и срок его действия (**15 минут**), вызывает сервис доставки кода (по умолчанию — **запись в лог**; при `AUTH_RETURN_VERIFICATION_CODE=true` код может дублироваться в теле ответа).
- Клиент: страница **`/auth/register`**, затем ввод кода и **POST `/api/auth/resend-verification`** при необходимости, **POST `/api/auth/verify-email`** с `email`, `code`, `rememberMe` — при успехе выставляется **httpOnly cookie** с JWT (`quizoo_access_token`).

### 3.4.3 Вход, выход, сброс пароля

- **POST `/api/auth/login`**: вход по email и паролю только если `emailVerified === true`; при успехе — cookie с JWT.
- **POST `/api/auth/logout`**: очистка cookie сессии.
- **POST `/api/auth/forgot-password`** / **POST `/api/auth/reset-password`**: выдача и проверка кода сброса (аналогично логике верификации по сроку и доставке).
- Минимальная длина пароля на сервере — **8 символов** (константа в `AuthService`).

### 3.4.4 Вход через Google (OAuth 2.0)

- **GET `/api/auth/google`**: редирект на Google; state в httpOnly cookie.
- **GET `/api/auth/google/callback`**: обмен кода, создание или связывание пользователя, редирект на фронтенд (`AUTH_FRONTEND_URL`).
- Клиент: **`/auth/oauth/callback`** обрабатывает query-параметры после редиректа.

### 3.4.5 Профиль пользователя

- **GET `/api/users/me`**: данные текущего пользователя в «публичном» виде (без хэша пароля и служебных полей кодов).
- **PATCH `/api/users/me`**: обновление `username` (поле в теле обязательно).
- **PATCH `/api/users/me/password`**: смена пароля с проверкой текущего.
- **PATCH `/api/users/me/email`**: смена email с подтверждением паролем и повторной выдачей кода верификации.
- **POST / DELETE `/api/users/me/avatar`**, **GET `/api/users/me/avatar`**: загрузка аватара (JPEG/PNG/WebP, ограничение размера на сервере), удаление, отдача файла с диска `uploads/`.
- Клиент: **`/app/profile`**, onboarding и элементы шапки сервиса.

### 3.4.6 Рабочий кабинет: модули, дашборд, статистика

- **Список и сводка**: **GET `/api/modules`**, **GET `/api/modules/summary`**, **GET `/api/modules/activity`** (недавние сессии; опционально `limit`).
- **Создание модуля**: **POST `/api/modules`** — тип `FLASHCARD` или `QUIZ`, заголовок и описание (`CreateModuleDto`).
- **Просмотр и редактирование метаданных**: **GET/PATCH `/api/modules/:moduleId`**.
- **Удаление модуля**: **DELETE `/api/modules/:moduleId`** (каскадно удаляются карточки, вопросы, сессии — по схеме Prisma).
- Клиент: **`/app`**, **`/app/modules/create`**, редакторы **`/app/modules/:id/edit`** (карточки), **`/app/modules/:id/quiz-edit`** (квиз), **`/app/statistics`**.

### 3.4.7 Модуль «Карточки»: содержимое и обучение

- **CRUD карточек**: **POST/PATCH/DELETE** `/api/modules/:moduleId/cards` и `/cards/:cardId`; поля «вопрос / ответ», порядок `orderIndex`.
- **Режим занятий**: **`/app/modules/:moduleId/flash-study`**; по завершении — **POST `/api/modules/:moduleId/flashcard-sessions`** с агрегатами `totalCards`, `knownCount`, `unknownCount`.
- Ограничение: не более **10 карточек** на модуль (`MAX_FLASHCARDS_PER_MODULE` на клиенте).

### 3.4.8 Модуль «Квиз»: вопросы, изображения, обучение

- **Типы вопросов**: `CHOICE` (варианты ответа, один или несколько правильных), `TEXT` (ожидаемый ответ через варианты на стороне API), `MATCHING` (пары левый–правый).
- **CRUD вопросов**: **POST/PATCH/DELETE** `/api/modules/:moduleId/questions` и `.../questions/:questionId`.
- **Изображение к вопросу**: **POST/GET/DELETE** `.../questions/:questionId/image` (файл на диске, MIME в БД); в JSON экспорта/импорта **не входит** — после импорта изображения нужно загрузить вручную при необходимости.
- **Постраничная подгрузка вопросов в редакторе**: **GET** `.../quiz-questions` с `take`, `cursor`.
- **Прохождение квиза**: **`/app/modules/:moduleId/quiz-study`** → **POST** `.../quiz-sessions` с массивом ответов; детали сессии — **GET** `.../quiz-sessions/:sessionId`.
- Ограничение: не более **30 вопросов** на модуль (`MAX_QUESTIONS_PER_MODULE` на клиенте).

### 3.4.9 Экспорт и импорт учебного контента в формате JSON

Функции реализованы **на клиенте** (страницы редакторов), без отдельных маршрутов «export/import» на backend. После импорта данные сохраняются в БД через существующие REST-вызовы (`createCard`, `createQuestion` и т.д.).

**Общие правила формата**

- Корневой объект — JSON-объект (не массив).
- Поле **`formatVersion`**: целое число, сейчас **`1`** — при несовпадении импорт отклоняется.
- Поле **`moduleType`**: **`"FLASHCARD"`** или **`"QUIZ"`** — должно совпадать с типом открытого модуля.
- Поле **`title`**: строка — для человека; **название модуля в приложении не меняется автоматически** при импорте (остаётся как в UI/БД; в экспорте попадает текущий заголовок из редактора).

**Экспорт**

- **Карточки** (`EditFlashcardModulePage`): формируется объект с `formatVersion`, `moduleType: "FLASHCARD"`, `title`, массивом `cards` (`question`, `answer`); файл скачивается через `Blob` и элемент `<a download>`, имя файла — из заголовка модуля (санитизация) или `flashcard-module.json`.
- **Квиз** (`EditQuizModulePage`): объект с `formatVersion`, `moduleType: "QUIZ"`, `title`, массивом `questions` в нормализованном виде:
  - `CHOICE`: `questionText`, `allowMultipleAnswers`, `options: [{ text, isCorrect }]`;
  - `TEXT`: `questionText`, `answer` (ожидаемый текст);
  - `MATCHING`: `questionText`, `pairs: [{ left, right }]` (в БД сохраняются как `leftItem` / `rightItem`).

**Импорт**

- Пользователь выбирает файл `.json`; содержимое читается как текст и разбирается через `JSON.parse`.
- При **непустом** текущем наборе карточек/вопросов показывается подтверждение замены: при согласии существующие элементы **удаляются через API**, затем создаются заново в порядке массива.
- **Карточки**: валидация структуры, лимит **10** карточек; каждая запись — непустые `question` и `answer`.
- **Квиз**: валидация типов, минимум вариантов для `CHOICE`, ровно один правильный при `allowMultipleAnswers: false`, корректные пары для `MATCHING`, непустой `answer` для `TEXT`; лимит **30** вопросов.
- Ошибки синтаксиса JSON и логические ошибки показываются пользователю (toast); эталонные примеры лежат в корне репозитория: `flashcard-import-test.json`, `quiz-import-test.json`.

### 3.4.10 Администрирование

- Доступно пользователю с ролью **`ADMIN`** в поле `users.role`.
- **GET `/api/users/admin/overview`**: сводные метрики.
- **GET `/api/users/admin/users`**, **PATCH** `.../admin/users/:targetUserId/block` с `{ isBlocked: boolean }`: список пользователей и блокировка (нельзя заблокировать админа и свой аккаунт — проверки в сервисе).
- **GET `/api/users/admin/modules`**: обзор модулей всех пользователей.
- Клиент: **`/app/admin`**, **`/app/admin/users`**, **`/app/admin/modules`**, **`/app/admin/analytics`**.

### 3.4.11 Клиентская инфраструктура (кратко)

- **HTTP**: axios с `withCredentials: true`, базовый URL `/api` или `VITE_API_URL`.
- **Маршрутизация**: React Router; защита **`RequireAuth`**, **`RequireAdmin`**, **`GuestOnlyOutlet`**.
- **Состояние**: Redux Toolkit (в т.ч. сессия), формы — react-hook-form + zod; drag-and-drop в редакторах — **@dnd-kit**.
- **Интерфейс**: Tailwind CSS, компоненты в духе shadcn/radix; тексты — собственный слой i18n (`messages.ts`).

---

## 3.5 Выводы по функциональным возможностям

Реализованы сценарии **гостя** (лендинг, регистрация, вход, сброс пароля, OAuth), **пользователя** (профиль, CRUD модулей, карточки и квизы с изображениями к вопросам, прохождение и сохранение сессий, дашборд и статистика, **экспорт/импорт JSON** контента модулей) и **администратора** (обзор пользователей и модулей, блокировка). Взаимодействие с сервером — **REST по HTTPS**; сессия — **JWT в httpOnly cookie**. Формат обмена учебным контентом с внешними файлами зафиксирован полями `formatVersion` и `moduleType` и пригоден для резервного копирования и переноса материалов между экземплярами приложения при совместимой версии формата.

---

_Ориентиры в репозитории:_ `backend/src/auth/`, `backend/src/users/`, `backend/src/modules/`, `frontend/src/pages/EditFlashcardModulePage.tsx`, `frontend/src/pages/EditQuizModulePage.tsx`, `frontend/src/router.tsx`, `docs/api.md`, `docs/db.md`.
