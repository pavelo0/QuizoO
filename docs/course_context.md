# QuizoO — единый контекст для курсового проекта (`course_context`)

**Файл:** `docs/course_context.md` (альтернативное имя запроса: `cource_context` — та же суть).  
**Назначение:** один документ для контекста LLM, структуры записки, подготовки к защите.  
**Сборка включает:** оглавление `docs/README.md`, корневой `README.md`, Docker-гайды, архитектуру, продукт, требования, выдержки задания, БД, auth, UI, промпты Stitch, начало чеклиста, актуальные `docker-compose.yml` и `schema.prisma`.  
**Источник правды по данным:** `backend/prisma/schema.prisma`; по контейнерам — корневой `docker-compose.yml`.

---

# Оглавление документации (карта репозитория)

```
# Документация QuizoO

Вся проектная документация собрана в этой папке. Раньше часть файлов лежала в `ProjectInfo/` — содержимое перенесено сюда, дубликаты сведены: актуальный чеклист в [`checklist.md`](./checklist.md), устаревшие варианты — в [`archive/`](./archive/).

## Быстрый старт

| Документ                                           | Описание                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`docker-stack-guide.md`](./docker-stack-guide.md) | Что за контейнеры в Docker Desktop, что коммитить, что делать после `git clone` |
| [`docker-and-deploy.md`](./docker-and-deploy.md)   | Детальная шпаргалка: Dockerfile, Nginx, деплой (Vercel/Render/VPS)              |

## Архитектура и ТЗ

| Документ                                                                                   | Описание                                                                                                 |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [`architecture.md`](./architecture.md)                                                     | Краткая схема стека (Compose, Nginx, React, NestJS, Postgres)                                            |
| [`project-overview.md`](./project-overview.md)                                             | Описание продукта, роли, сущности, режимы обучения                                                       |
| [`requirements-and-diagrams.md`](./requirements-and-diagrams.md)                           | Функциональные требования, ER, use case                                                                  |
| [`zapiska-assignment-excerpt.md`](./zapiska-assignment-excerpt.md)                         | Выдержка формулировок задания (п. 2.1–2.2)                                                               |
| [`archive/architecture-coursework-legacy.md`](./archive/architecture-coursework-legacy.md) | Раннее ТЗ с примерами кода; **актуальная инфраструктура** — в `docker-stack-guide` / `docker-and-deploy` |

## Разработка

| Документ                                                                     | Описание                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`checklist.md`](./checklist.md)                                             | Основной чеклист прогресса (обновляемый)                  |
| [`archive/checklist-legacy-stages.md`](./archive/checklist-legacy-stages.md) | Ранняя нумерация этапов курсовой/диплома с пометкой `(*)` |
| [`techDesign.md`](./techDesign.md)                                           | Техдизайн UI, токены, связь со Stitch                     |
| [`stitch-prompts.md`](./stitch-prompts.md)                                   | Промпты для макетов/атмосферы                             |
| [`frontend-setup-from-step4.md`](./frontend-setup-from-step4.md)             | Пошаговый гайд по фронту                                  |
| [`authentication.md`](./authentication.md)                                   | Аутентификация                                            |
| [`dbSchema.md`](./dbSchema.md)                                               | Схема БД                                                  |
| [`interfacesSysDesign.md`](./interfacesSysDesign.md)                         | Интерфейсы и проектирование                               |
| [`course.md`](./course.md)                                                   | Контекст курса                                            |

## Диаграммы

Файлы `.drawio` и экспортированные `.png`: `architecture`, `database`, `use-case`.
```

# Корень репозитория — README.md

```
<p align="center">
  <strong>QuizoO</strong>
</p>

<p align="center">
  Платформа для закрепления знаний: карточки и квизы на базе собственных модулей.<br />
  Монорепозиторий: <strong>React · NestJS · PostgreSQL · Docker · Nginx</strong>
</p>

---

## О проекте

**QuizoO** помогает учить материал в двух режимах:

- **Карточки** — просмотр вопроса и ответа, самооценка «знал / не знал».
- **Квиз** — вопросы с выбором ответа, текстом или сопоставлением, итоговый балл.

Поддерживаются роли **гость**, **пользователь** и **администратор** (панель пользователей и модулей). Опционально — вход через **Google OAuth** и **JWT** (access + refresh).

Подробное описание продукта, ТЗ и диаграммы: [`docs/`](./docs/README.md).

---

## Стек

| Слой           | Технологии                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Frontend       | React 19, Vite, TypeScript, Redux Toolkit, React Router, Tailwind, Axios |
| Backend        | NestJS, Prisma, PostgreSQL, JWT, cookie-parser                           |
| Инфраструктура | Docker Compose, Nginx 1.28 (TLS + reverse proxy), Node 20                |

---

## Структура репозитория

```

QuizoO/
├── frontend/ # SPA (Vite)
├── backend/ # API NestJS, Prisma
├── nginx/ # nginx.conf, каталог certs/ для TLS
├── docs/ # документация и чеклисты
├── docker-compose.yml # postgres, backend, frontend-builder, nginx
├── .env.example # шаблон переменных для Compose
└── package.json # workspaces, общие скрипты форматирования и линта

````

---

## Требования

- **Node.js** 20+
- **npm** 10+
- **Docker Desktop** (или Docker Engine + Compose v2) — для сценария «всё в контейнерах»

---

## Запуск в Docker (рекомендуется для демо и единой среды)

1. Склонируй репозиторий и перейди в корень проекта.

2. _(Опционально)_ скопируй переменные и задай секреты:

   ```bash
   cp .env.example .env
````

3. Сгенерируй сертификаты для HTTPS (самоподписанные, для локальной разработки):

   ```bash
   mkdir -p nginx/certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/certs/key.pem \
     -out nginx/certs/cert.pem \
     -subj "/CN=localhost"
   ```

4. Подними стек:

   ```bash
   docker compose up --build -d
   ```

5. Открой в браузере **https://localhost** (при предупреждении о сертификате — «Дополнительно» → продолжить). API проксируется как **https://localhost/api/…**.

Остановка:

```bash
docker compose down
```

С удалением томов (включая данные БД):

```bash
docker compose down -v
```

Что означает каждый сервис в Docker Desktop и что коммитить: [`docs/docker-stack-guide.md`](./docs/docker-stack-guide.md).

---

## Локальная разработка (без полного Docker-стека)

Нужен запущенный **PostgreSQL** (например, только сервис `postgres` из `docker compose up postgres -d` или локальная установка).

**Backend**

```bash
cd backend
cp .env.example .env
# выставь DATABASE_URL, JWT_SECRET, при необходимости CORS_ORIGIN и OAuth
npm install
npx prisma migrate deploy
npm run start:dev
```

По умолчанию API: `http://localhost:3001`, глобальный префикс `/api`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Дев-сервер: `http://localhost:3000`; прокси `/api` настроен в `vite.config.ts`.

Каркас фронта и провайдеры: [`docs/frontend-setup-from-step4.md`](./docs/frontend-setup-from-step4.md).

---

## Переменные окружения

- **Docker Compose:** см. [`.env.example`](./.env.example) в корне (`POSTGRES_*`, `JWT_SECRET`, `CORS_ORIGIN`, `AUTH_FRONTEND_URL`, опционально Google OAuth).
- **Backend вне Compose:** [`backend/.env.example`](./backend/.env.example).
- **Frontend:** при отдельном деплое может понадобиться `VITE_API_URL` (см. документацию в `docs/`).

Секреты и файлы `nginx/certs/*.pem` в репозиторий не коммитятся.

---

## Скрипты в корне

```bash
npm run format       # Prettier
npm run format:check
npm run lint         # ESLint во frontend и backend
npm run lint:fix
npm run type-check
npm run check        # format:check + lint + type-check
```

Перед коммитом **husky** / **lint-staged** могут прогонять проверки — не отключай без необходимости.

---

## Git: ветки и сообщения коммитов

Используется явный префикс в заголовке коммита:

| Префикс           | Когда использовать                                    |
| ----------------- | ----------------------------------------------------- |
| `[feat]`          | новая функциональность (часто фронт или общее)        |
| `[feat(backend)]` | изменения в основном в backend                        |
| `[fix]`           | исправление бага                                      |
| `[style]`         | вёрстка, форматирование, UI без смены логики          |
| `[docs]`          | README, документация в `docs/`                        |
| `[chore]`         | инфраструктура, зависимости, мелкий рефактор без фичи |

Примеры:

```text
[feat] add quiz results summary to dashboard
[fix] validate module title on create
[docs] update docker stack guide
```

**Ветки:** короткое описание латиницей, часто в стиле `feat_<тема>` или `tech_<тема>` (как в истории репозитория). Перед слиянием в основную ветку — PR и прохождение проверок, если они подключены.

---

## Документация

| Раздел              | Файл                                                         |
| ------------------- | ------------------------------------------------------------ |
| Оглавление          | [`docs/README.md`](./docs/README.md)                         |
| Docker и GitHub     | [`docs/docker-stack-guide.md`](./docs/docker-stack-guide.md) |
| Деплой и прод       | [`docs/docker-and-deploy.md`](./docs/docker-and-deploy.md)   |
| Краткая архитектура | [`docs/architecture.md`](./docs/architecture.md)             |
| Чеклист разработки  | [`docs/checklist.md`](./docs/checklist.md)                   |

---

## Лицензия

Код в репозитории помечен как **UNLICENSED** (см. `backend/package.json` и `frontend/package.json`). Для открытой лицензии добавь отдельный файл `LICENSE` и обнови поля в пакетах.

````


# Docker Compose: сервисы и практика

# Docker Compose: что к чему

Стек в Docker Desktop (проект **quizoo**) поднимается из корневого [`docker-compose.yml`](../docker-compose.yml). Ниже — роли сервисов и типичные вопросы.

## Сервисы

| Сервис               | Образ / сборка         | Роль                                                                                                                                                                |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **nginx**            | `nginx:1.28-alpine`    | Единая точка входа: **HTTPS** (443), редирект с 80, отдача **статики React** из общего volume, прокси **`/api/*` → backend**.                                       |
| **backend**          | сборка из `./backend`  | **NestJS** + Prisma: API с префиксом `/api`, миграции при старте (`prisma migrate deploy`). Порт **3001** только внутри сети compose, наружу не пробрасывается.     |
| **frontend-builder** | сборка из `./frontend` | **Одноразовый контейнер**: собирает фронт и копирует `dist` в volume `frontend_dist`. В Docker Desktop статус **Exited (0)** после успешной сборки — это нормально. |
| **postgres**         | `postgres:18`          | База данных; данные в volume `postgres18_data`. Порт **5432** проброшен для локальных инструментов (опционально можно убрать в проде).                              |

Поток запроса: **браузер → Nginx (TLS) → backend (HTTP) → Postgres (TCP)** — как в [`architecture.md`](./architecture.md).

## Почему в списке контейнеров что-то «остановлено»

- **frontend-builder** после копирования файлов **завершается** — он не сервер, а шаг сборки. Nginx читает уже готовые файлы из volume.
- **backend**, **nginx**, **postgres** должны быть **Running**. Если **backend** не виден в скриншоте — прокрути список или открой вкладку со всеми контейнерами проекта.

## Сертификаты

Nginx ожидает файлы в `nginx/certs/`:

- `cert.pem`
- `key.pem`

Локально их можно сгенерировать самоподписанными — см. [`nginx/certs/README.md`](../nginx/certs/README.md). В браузере будет предупреждение о недоверенном сертификате — для разработки это ожидаемо.

## Переменные окружения

- Шаблон для compose: [`.env.example`](../.env.example) в корне репозитория.
- Скопируй в `.env` и при необходимости измени секреты:

```bash
cp .env.example .env
````

В `docker-compose.yml` для основных переменных заданы **значения по умолчанию**, поэтому минимальный запуск возможен и без `.env`.

Важно про источники env:

- В Docker-режиме (`docker compose up ...`) backend читает переменные из **корневого** `.env` через `docker-compose.yml`.
- Файл `backend/.env` используется только при локальном запуске backend вне Docker (например `npm run start:dev` в папке `backend`).
- Для Google OAuth в Docker указывай `GOOGLE_REDIRECT_URI=https://localhost/api/auth/google/callback` и добавляй этот же URL в Google Cloud Console (Authorized redirect URIs).

Подробнее про деплой и прод: [`docker-and-deploy.md`](./docker-and-deploy.md).

---

## Что коммитить в Git

**Коммить имеет смысл:**

- `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/.dockerignore`, `frontend/.dockerignore`
- `nginx/nginx.conf`, `nginx/certs/.gitkeep`, `nginx/certs/README.md`
- `.env.example`, обновлённый `.gitignore`

**Не коммить** (уже в `.gitignore` или должны быть только локально):

- корневой `.env` с реальными секретами
- `nginx/certs/*.pem` — приватные ключи и сертификаты
- `backend/.env` с прод-секретами и OAuth

Пример коммита:

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile nginx/ .env.example .gitignore
git status   # убедись, что .env и *.pem не попали
git commit -m "Add Docker Compose stack with Nginx, backend, Postgres, and frontend build"
```

---

## После `git clone` — что сделать

1. **Клонировать репозиторий**

   ```bash
   git clone <url-репозитория>
   cd QuizoO
   ```

2. **Окружение для compose (по желанию)**

   ```bash
   cp .env.example .env
   # отредактируй JWT_SECRET, пароли БД и т.д.
   ```

3. **TLS для Nginx** (если в `nginx/certs/` ещё нет `cert.pem` / `key.pem`)

   ```bash
   mkdir -p nginx/certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/certs/key.pem \
     -out nginx/certs/cert.pem \
     -subj "/CN=localhost"
   ```

4. **Запуск**

   ```bash
   docker compose up --build -d
   ```

5. **Проверка**
   - Открой в браузере: `https://localhost` (при самоподписанном сертификате — «Дополнительно → перейти»).
   - API через прокси: например `https://localhost/api/` (должен отвечать backend).

6. **Остановка**

   ```bash
   docker compose down
   ```

   Полная очистка **включая данные БД**:

   ```bash
   docker compose down -v
   ```

Разработка **без** Docker (как раньше): backend и frontend локально — см. [`frontend-setup-from-step4.md`](./frontend-setup-from-step4.md) и `backend/.env.example`.

# Docker, Nginx и деплой (шпаргалка)

# Docker, Nginx и деплой QuizoO

> Этот файл — шпаргалка по контейнеризации и публикации проекта.  
> Docker и деплой — **этап 26** чеклиста. Сначала пиши приложение, потом сюда.

> Кратко «что за контейнер в Docker Desktop» и сценарий после `git clone`: [`docker-stack-guide.md`](./docker-stack-guide.md).

---

## Архитектура (как на схеме)

```
Браузер
  │ HTTPS
  ▼
[Nginx 1.28] ← React bundle (статика) + X.509 сертификат
  │ HTTP
  ▼
[NestJS 10 / NodeJS 20] ← Prisma ORM
  │ TCP
  ▼
[PostgreSQL 18]
```

Четыре сервиса в одном `docker-compose.yml` (включая одноразовую сборку фронта). Nginx — единственная точка входа снаружи. Подробнее: [`docker-stack-guide.md`](./docker-stack-guide.md).

---

## Структура файлов (что нужно создать)

```
QuizoO/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── nginx/
│   ├── nginx.conf
│   └── certs/          ← сюда кладём сертификаты
│       ├── cert.pem
│       └── key.pem
└── docker-compose.yml
```

---

## Файлы конфигурации

### `backend/Dockerfile`

```dockerfile
# Stage 1: сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### `backend/.dockerignore`

```
node_modules
dist
.env
*.log
```

### `frontend/Dockerfile`

```dockerfile
# Stage 1: сборка React bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# После сборки dist/ содержит статику

# Stage 2: копируем dist в volume — Nginx заберёт оттуда
FROM alpine:latest AS export
WORKDIR /dist
COPY --from=builder /app/dist .
```

> **Примечание:** Nginx — отдельный контейнер. Он подключает React bundle через shared volume.

### `frontend/.dockerignore`

```
node_modules
dist
.env*
*.log
```

### `nginx/nginx.conf`

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate     /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    # React bundle
    root /usr/share/nginx/html;
    index index.html;

    # /api/* → NestJS backend
    location /api/ {
        proxy_pass http://backend:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SPA fallback — все роуты отдаём в index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP → HTTPS редирект
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_USER: quizoo_user
      POSTGRES_PASSWORD: quizoo_pass
      POSTGRES_DB: quizoo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  backend:
    build:
      context: ./backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://quizoo_user:quizoo_pass@postgres:5432/quizoo
      JWT_SECRET: change_me_in_production_12345
      JWT_REFRESH_SECRET: change_me_refresh_in_production_67890
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      NODE_ENV: production
      PORT: 3001
    depends_on:
      - postgres
    networks:
      - app-network

  frontend-builder:
    build:
      context: ./frontend
    volumes:
      - frontend_dist:/dist

  nginx:
    image: nginx:1.28-alpine
    restart: unless-stopped
    ports:
      - '443:443'
      - '80:80'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - frontend_dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
      - frontend-builder
    networks:
      - app-network

volumes:
  postgres_data:
  frontend_dist:

networks:
  app-network:
    driver: bridge
```

---

## Генерация самоподписанного X.509 сертификата (для разработки)

На MacBook Pro Intel — через встроенный OpenSSL:

```bash
mkdir -p nginx/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out nginx/certs/cert.pem \
  -subj "/CN=localhost"
```

Браузер покажет предупреждение "небезопасное соединение" — нажать "Продолжить".  
Это нормально для локальной разработки и демонстрации курсача.

---

## Запуск

```bash
# Из корня проекта
docker-compose up --build

# В фоне
docker-compose up --build -d

# Остановить
docker-compose down

# Остановить и удалить volumes (данные БД тоже удалятся!)
docker-compose down -v
```

Открыть: [https://localhost](https://localhost)

---

## Миграции Prisma при старте

Чтобы миграции запускались автоматически при поднятии контейнера, в `backend/Dockerfile` замени `CMD`:

```dockerfile
# Вместо:
CMD ["node", "dist/main.js"]

# Используй:
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

---

## Переменные окружения для production

Не хардкодь секреты в `docker-compose.yml`. Создай файл `.env` рядом с `docker-compose.yml`:

```env
POSTGRES_USER=quizoo_user
POSTGRES_PASSWORD=quizoo_pass
POSTGRES_DB=quizoo
JWT_SECRET=твой_длинный_случайный_секрет
JWT_REFRESH_SECRET=другой_длинный_случайный_секрет
```

И обновись в `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ...
```

---

## Деплой — варианты

---

### Вариант 1: Бесплатно (для учебного проекта) ✅

Самый простой способ показать работающий проект без оплаты.

#### Разделяй части:

| Часть            | Сервис                       | Бесплатно                          |
| ---------------- | ---------------------------- | ---------------------------------- |
| Frontend (React) | [Vercel](https://vercel.com) | ✅ навсегда                        |
| Backend (NestJS) | [Render](https://render.com) | ✅ (засыпает через 15 мин простоя) |
| PostgreSQL       | [Neon](https://neon.tech)    | ✅ 0.5 GB навсегда                 |

#### Как это сделать:

**1. PostgreSQL на Neon:**

- Зарегистрироваться на [neon.tech](https://neon.tech)
- Создать проект → получить `DATABASE_URL` вида:
  ```
  postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/quizoo?sslmode=require
  ```

**2. Backend на Render:**

- Зарегистрироваться на [render.com](https://render.com)
- New → Web Service → подключить GitHub репозиторий
- Root Directory: `backend`
- Build Command: `npm ci && npx prisma generate && npm run build`
- Start Command: `npx prisma migrate deploy && node dist/main.js`
- Environment Variables: вставить `DATABASE_URL` из Neon + JWT секреты
- Получишь URL вида: `https://quizoo-backend.onrender.com`

**3. Frontend на Vercel:**

- Зарегистрироваться на [vercel.com](https://vercel.com)
- Import Git Repository → выбрать репо
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://quizoo-backend.onrender.com`
- Получишь URL вида: `https://quizoo.vercel.app`

**Минусы бесплатного варианта:**

- Render засыпает при отсутствии запросов (первый запрос после простоя ждёт ~30 сек)
- Нет HTTPS через Nginx с X.509 как на схеме — но есть автоматический HTTPS от Vercel/Render
- Нет единого docker-compose — части разделены по платформам

---

### Вариант 2: VPS с Docker (платно, ~5$/мес)

Точно как на схеме — один сервер, docker-compose, Nginx, X.509.

**Провайдеры:**

- [Timeweb Cloud](https://timeweb.cloud) — от 130 руб/мес (российский)
- [Hetzner](https://hetzner.com) — от 4€/мес (европейский)
- [DigitalOcean](https://digitalocean.com) — от 6$/мес

**Шаги:**

```bash
# 1. На сервере установить Docker
curl -fsSL https://get.docker.com | sh

# 2. Клонировать проект
git clone https://github.com/твой-репо/QuizoO.git
cd QuizoO

# 3. Получить Let's Encrypt сертификат (вместо самоподписанного)
apt install certbot
certbot certonly --standalone -d yourdomain.com
# Сертификаты окажутся в /etc/letsencrypt/live/yourdomain.com/

# 4. Обновить nginx.conf — заменить пути к сертификатам:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# 5. Запустить
docker-compose up -d --build
```

---

### Вариант 3: GitHub Student Pack (бесплатный VPS)

Если ты студент — [education.github.com](https://education.github.com) даёт:

- DigitalOcean $200 кредитов
- Namecheap домен бесплатно на год
- и ещё ~100 сервисов

Оформляется через студенческий email или справку.

---

## Итог: что делать прямо сейчас

1. **Сейчас** — следи за чеклистом (этапы 1–25), пиши приложение
2. **В конце** — создай файлы `Dockerfile`, `docker-compose.yml`, `nginx.conf` как описано выше
3. **Для защиты курсача** — бесплатный деплой на Vercel + Render + Neon (15 минут работы)
4. **Для красоты в резюме** — VPS с Docker Compose как на схеме

---

_Обновлено: март 2026_

# Краткая структурная архитектура (текстовая схема)

Docker Compose 2.39.1
└─ Docker Engine 28.3.2
├─ Proxy Server/Nginx v1.28
│ └─ React bundle v19
│ X.509 Certificate
├─ Application Server
│ └─ NodeJS 20
│ NestJS 10
│ Prisma ORM
└─ Database Server
└─ PostgreSQL 18

Web Browser/Google Chrome 146.0.7680.80
└─ React v19
И связи между блоками такие:

Web Browser/Google Chrome 146.0.7680.80 → Proxy Server/Nginx v1.28 по HTTPS.

Proxy Server/Nginx v1.28 → Application Server по HTTP.

Application Server → Database Server по TCP.

# Обзор продукта и дорожная карта до диплома

# QuizoO — Платформа закрепления знаний через тесты

---

## О проекте

**QuizoO** — это веб-приложение для самостоятельного изучения и закрепления знаний через интерактивные карточки и квизы. Пользователь создаёт собственные модули знаний, наполняет их материалом и выбирает удобный режим обучения: спокойно листать карточки или проверить себя через тест с вопросами.

Идея проекта вдохновлена такими платформами как Quizlet и Anki, однако QuizoO делает акцент на простоте создания контента, гибкости типов вопросов и постепенном расширении до полноценной образовательной платформы с мультиплеером и аналитикой.

---

## Стек технологий

| Слой               | Технология                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| **Frontend**       | React, React Router, Redux Toolkit (RTK Query), Axios, Tailwind, shadcn/ui |
| **Backend**        | Node.js, NestJS                                                            |
| **База данных**    | PostgreSQL                                                                 |
| **Инфраструктура** | Docker, Docker Compose, Nginx                                              |
| **Real-time**      | WebSocket (Socket.io) — диплом                                             |
| **Авторизация**    | JWT (Access + Refresh токены); опционально Google OAuth 2.0                |

---

## Роли пользователей

### Guest (Гость)

Незарегистрированный посетитель. Доступны только страницы **регистрации** и **входа** (по заданию на курсовой проект). Дополнительно в проекте предусмотрен **вход через Google (OAuth 2.0)** — удобная альтернатива паролю.

### User (Пользователь)

Авторизованный пользователь. Создаёт модули типа «Карточки» или «Квиз», редактирует и удаляет свои модули, управляет карточками и вопросами, проходит режимы обучения, просматривает результаты сессии и статистику по модулю. На странице **профиля** — общая статистика и **редактирование данных** (username, email, смена пароля). Может **выйти из системы** (завершение сессии и инвалидация refresh-токена). Видит только свои модули.

### Admin (Администратор)

Имеет доступ к административной панели: список всех пользователей с блокировкой/разблокировкой, просмотр всех модулей платформы, удаление любого модуля, сводная статистика (расширение спецификации проекта).

---

## Ключевые сущности

**Модуль** — основная единица контента. Есть **два типа модулей**, пользователь выбирает тип при создании:

1. **Модуль «Карточки» (Flashcards)** — набор пар «вопрос / термин → ответ / определение» для запоминания. Редактор: только добавление карточек (вопрос + ответ), изменение порядка, удаление.
2. **Модуль «Квиз» (Quiz)** — набор вопросов для теста. Редактор: добавление вопросов с выбором типа (выбор варианта, ввод текста, соответствие), у каждого вопроса свои поля (варианты ответа, правильный ответ, пары и т.д.).

**Создание модуля:** на дашборде кнопка «Создать модуль» → полноэкранный выбор типа («Набор карточек» или «Квиз») → открывается соответствующий редактор.

**Карточка** — пара «вопрос → ответ». Используется в модулях типа «Карточки»; в квизах вместо единой карточки задаются отдельные вопросы с выбранным типом (тест, свой ответ, соответствие).

---

## Режимы обучения

QuizoO строится вокруг двух принципиально разных подходов к обучению:

---

### 📇 Режим 1 — Карточки (Flashcards)

Режим для **запоминания материала**. Пользователь не проверяет себя строго — он изучает.

**Механика:**

- Карточки листаются по одной
- На лицевой стороне — вопрос или термин
- Пользователь думает над ответом, затем переворачивает карточку
- На обратной стороне — правильный ответ или определение
- После просмотра пользователь оценивает себя: **«Знал»** или **«Не знал»**
- Карточки с отметкой «Не знал» возвращаются в стопку и показываются повторно

**Результат сессии:** сколько карточек знал с первого раза, сколько пришлось повторить.

---

### 📝 Режим 2 — Квиз (Тестирование)

Режим для **проверки знаний**. Пользователь проходит тест и получает объективную оценку.

Внутри квиза поддерживается три типа вопросов, которые можно миксовать в рамках одного теста:

#### 🔘 Выбор варианта ответа

Классический формат. К вопросу предлагается 4 варианта ответа, один из которых правильный. Варианты генерируются из других карточек модуля автоматически.

#### ✏️ Свой ответ (ввод текста)

Пользователь видит вопрос и вводит ответ вручную. Система сравнивает введённый текст с эталонным ответом (с учётом регистра и пробелов).

#### 🔗 Соответствие

Две колонки: слева — термины, справа — определения в перемешанном порядке. Нужно соединить каждый термин с правильным определением.

**По итогу квиза:**

- Процент правильных ответов
- Разбор ошибок: что спросили, что ответил, что было правильно
- Запись результата в историю

---

## Статистика и прогресс

- История всех прохождений по каждому модулю
- Процент правильных ответов в динамике
- Общее количество изученных карточек
- Простые графики прогресса по времени

---

## Архитектура приложения (кратко)

```
[React App]
    │
    ▼
[Nginx] ──── статика + проксирование
    │
    ▼
[NestJS API] ──── REST + JWT
    │
    ▼
[PostgreSQL]

Docker Compose объединяет все сервисы
```

---

---

# Дипломная работа — расширение QuizoO

На этапе диплома проект превращается из персонального инструмента в **полноценную образовательную платформу** с социальными функциями, мультиплеером и умным обучением.

---

## Новые режимы обучения

### ⚡ Режим «Спринт»

60 секунд, максимальное количество правильных ответов подряд. Карточки летят одна за другой, нужно быстро выбирать правильный вариант. Таблица рекордов по модулю.

### 🧠 Умные карточки (Spaced Repetition)

Алгоритм интервального повторения (по аналогии с Anki). Карточки, которые пользователь знает хорошо, показываются реже. Те, которые вызывают затруднения — чаще. Система сама строит расписание повторений.

---

## Мультиплеер — WebSocket

Ключевая техническая фича дипломной версии.

**Механика:**

1. Пользователь создаёт **live-сессию** на основе своего модуля
2. Получает короткий код комнаты и делится им с участниками
3. Все участники заходят по коду и видят лобби
4. Хост запускает тест — все получают вопросы одновременно
5. Таймер на каждый вопрос
6. После каждого вопроса — **live-таблица лидеров** обновляется в реальном времени
7. По итогу — финальный рейтинг участников

**Технически:** Socket.io комнаты, события `question:start`, `answer:submit`, `leaderboard:update`, `session:end`.

---

## Социальные функции

- **Публичные модули** — пользователь может открыть свой модуль для всех
- **Поиск модулей** — поиск по названию, тегам, автору
- **Копирование модуля** — взять чужой публичный модуль и адаптировать под себя
- **Оценки и комментарии** к публичным модулям

---

## AI-функции

- **Автогенерация вопросов** — пользователь вставляет текст (параграф из учебника, статью), система генерирует карточки автоматически
- **Автогенерация вариантов ответа** — для типа «выбор варианта» система сама предлагает правдоподобные, но неправильные варианты

---

## Расширенная аналитика

- **Тепловая карта активности** — GitHub-style календарь с днями занятий
- **Слабые места** — карточки с наибольшим процентом ошибок, вынесены отдельно
- **Сравнение в публичных модулях** — как твой результат соотносится с другими пользователями

---

## Сводная таблица: курсовая vs диплом

| Функциональность                    | Курсовая | Диплом |
| ----------------------------------- | -------- | ------ |
| Регистрация и авторизация (JWT)     | ✅       | ✅     |
| Роли User / Admin                   | ✅       | ✅     |
| Создание модулей и карточек         | ✅       | ✅     |
| Режим «Карточки» (Flashcards)       | ✅       | ✅     |
| Квиз: выбор варианта                | ✅       | ✅     |
| Квиз: ввод ответа                   | ✅       | ✅     |
| Квиз: соответствие                  | ✅       | ✅     |
| Базовая статистика и история        | ✅       | ✅     |
| Административная панель             | ✅       | ✅     |
| Docker + Nginx                      | ✅       | ✅     |
| Режим «Спринт»                      | ❌       | ✅     |
| Spaced Repetition (умные карточки)  | ❌       | ✅     |
| Мультиплеер live-сессии (WebSocket) | ❌       | ✅     |
| Публичные модули и поиск            | ❌       | ✅     |
| AI-генерация вопросов               | ❌       | ✅     |
| Расширенная аналитика               | ❌       | ✅     |

---

## Позиционирование проекта

> **QuizoO** — это не просто «ещё один квиз-сайт». Это персональная платформа закрепления знаний, построенная на принципах активного обучения: ты не читаешь — ты воспроизводишь. Два принципиально разных режима (запоминание и проверка) покрывают разные стадии обучения. На уровне диплома платформа вырастает в социальный инструмент с мультиплеером и умным алгоритмом повторений — полноценный аналог Quizlet, реализованный на современном production-ready стеке.

# Функциональные требования, ER, Use Case

# QuizoO — Функциональные требования, ER и Use Case диаграммы

Ниже **п. «задание»** означает формулировки из официального задания на курсовой проект (роли и перечень функций в пояснительной записке, п. 2.1–2.2). Пометка **(доп.)** — расширение спецификации проекта сверх этого минимума.

---

# 1. Функциональные требования

## 1.1 Роль «Гость» — регистрация и аутентификация (задание)

| ID    | Требование                                                                                        | Примечание                             |
| ----- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR-01 | Система должна поддерживать регистрацию пользователя по email и паролю                            | задание                                |
| FR-02 | Система должна поддерживать авторизацию с выдачей Access и Refresh токенов (JWT)                  | задание + (доп.) детализация через JWT |
| FR-03 | Система должна обновлять Access токен через Refresh токен без повторного логина                   | (доп.)                                 |
| FR-04 | Пароль должен храниться в виде хэша (bcrypt)                                                      | (доп.) безопасное хранение             |
| FR-05 | Незарегистрированный пользователь не имеет доступа ни к одной странице кроме логина и регистрации | задание                                |
| FR-O1 | Опциональный вход через Google OAuth 2.0 (альтернатива паролю)                                    | (доп.) сверх п. 2.1                    |

---

## 1.2 Функциональные требования — Пользователь (USER)

### Управление модулями

| ID    | Требование                                                   |
| ----- | ------------------------------------------------------------ |
| FR-10 | Пользователь может создать модуль типа «Карточки» или «Квиз» |
| FR-11 | Пользователь может редактировать название и описание модуля  |
| FR-12 | Пользователь может удалить свой модуль                       |
| FR-13 | Пользователь видит только свои модули на дашборде            |

### Карточки

| ID    | Требование                                                                      |
| ----- | ------------------------------------------------------------------------------- |
| FR-20 | Пользователь может добавлять карточки (вопрос + ответ) в модуль типа «Карточки» |
| FR-21 | Пользователь может редактировать и удалять карточки внутри модуля               |
| FR-22 | Минимальное количество карточек для запуска режима — 2                          |

### Квизы

| ID    | Требование                                                                        |
| ----- | --------------------------------------------------------------------------------- |
| FR-30 | Пользователь может добавлять вопросы в модуль типа «Квиз»                         |
| FR-31 | Вопрос может быть одного из трёх типов: выбор варианта, ввод текста, соответствие |
| FR-32 | Для типа «выбор варианта» пользователь задаёт 4 варианта и отмечает правильный    |
| FR-33 | Для типа «ввод текста» пользователь задаёт вопрос и эталонный ответ               |
| FR-34 | Для типа «соответствие» пользователь задаёт минимум 3 пары «термин → определение» |
| FR-35 | Минимальное количество вопросов для запуска квиза — 2                             |

### Режим карточек (Flashcards)

| ID    | Требование                                                             |
| ----- | ---------------------------------------------------------------------- |
| FR-40 | Пользователь может запустить режим карточек для модуля типа «Карточки» |
| FR-41 | Карточки показываются по одной, сначала лицевая сторона (вопрос)       |
| FR-42 | Пользователь может перевернуть карточку, чтобы увидеть ответ           |
| FR-43 | После просмотра пользователь отмечает «Знал» или «Не знал»             |
| FR-44 | Карточки с отметкой «Не знал» показываются повторно в конце стопки     |
| FR-45 | По завершении сессии отображается итог: кол-во «Знал» и «Не знал»      |

### Режим квиза

| ID    | Требование                                                                                   |
| ----- | -------------------------------------------------------------------------------------------- |
| FR-50 | Пользователь может запустить квиз для модуля типа «Квиз»                                     |
| FR-51 | Вопросы показываются последовательно, по одному                                              |
| FR-52 | Для типа «выбор варианта» — отображаются 4 варианта, нельзя изменить ответ после выбора      |
| FR-53 | Для типа «ввод текста» — сравнение без учёта регистра и лишних пробелов                      |
| FR-54 | Для типа «соответствие» — пользователь соединяет пары кликом                                 |
| FR-55 | По завершении отображается экран результатов: процент, кол-во верных/неверных, разбор ошибок |
| FR-56 | Результат сессии сохраняется в историю                                                       |

### Статистика

| ID    | Требование                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| FR-60 | Пользователь может просмотреть историю прохождений по каждому модулю                                      |
| FR-61 | Пользователь видит процент правильных ответов в динамике (последние N сессий)                             |
| FR-62 | На странице профиля отображается общая статистика: кол-во модулей, сессий, средний балл                   | задание («статистика» в профиле)                                |
| FR-63 | Пользователь может редактировать данные профиля: отображаемое имя (username), email, смена пароля         | задание                                                         |
| FR-64 | Пользователь может выйти из системы (завершение клиентской сессии, инвалидация refresh-токена на сервере) | (доп.) в п. 2.1 явно не названо; необходимо для завершённого UX |

---

## 1.3 Функциональные требования — Администратор (ADMIN)

| ID    | Требование                                                                            |
| ----- | ------------------------------------------------------------------------------------- |
| FR-70 | Администратор имеет доступ к административной панели                                  |
| FR-71 | Администратор может просматривать список всех пользователей с пагинацией              |
| FR-72 | Администратор может заблокировать или разблокировать пользователя                     |
| FR-73 | Заблокированный пользователь не может войти в систему                                 |
| FR-74 | Администратор может просматривать все модули всех пользователей                       |
| FR-75 | Администратор может удалить любой модуль                                              |
| FR-76 | Администратор видит общую статистику платформы: кол-во пользователей, модулей, сессий |

---

## 1.4 Нефункциональные требования

| ID     | Требование                                                                                 | Примечание                 |
| ------ | ------------------------------------------------------------------------------------------ | -------------------------- |
| NFR-01 | Приложение должно быть адаптивным: Mobile (<768px), Tablet (768–1024px), Desktop (1024px+) | (доп.)                     |
| NFR-02 | Все API роуты (кроме auth) защищены JWT                                                    | (доп.)                     |
| NFR-03 | Время ответа API не должно превышать 500мс при нормальной нагрузке                         | (доп.)                     |
| NFR-04 | Приложение разворачивается через Docker Compose одной командой                             | (доп.)                     |
| NFR-05 | Секреты и конфигурация хранятся в .env файлах, не в коде                                   | (доп.)                     |
| NFR-06 | Пользователь не может изменять или удалять чужие модули                                    | задание (следует из ролей) |

### Соответствие п. 2.2 задания (технические ограничения)

| Тема                                                      | Как закрывается в проекте                               |
| --------------------------------------------------------- | ------------------------------------------------------- |
| Асинхронное программирование                              | async/await на сервере (NestJS), асинхронный UI (React) |
| Реляционная БД                                            | PostgreSQL                                              |
| Работа на разных платформах                               | браузер + контейнеризация (Docker)                      |
| Разделение слоёв представления, бизнес-логики и хранилища | React → REST API → NestJS → PostgreSQL                  |
| Язык JavaScript, платформа Node.js                        | TypeScript/JavaScript, Node.js                          |
| Асинхронный, завершённый, понятный UI                     | SPA на React                                            |
| Комментарии в исходном коде                               | по мере реализации модулей                              |

---

# 2. ER Диаграмма (Entity-Relationship)

```mermaid
erDiagram
    USER {
        uuid id PK
        string username
        string email
        string password_hash
        enum role "USER | ADMIN"
        boolean is_blocked
        timestamp created_at
    }

    MODULE {
        uuid id PK
        uuid user_id FK
        string title
        string description
        enum type "FLASHCARD | QUIZ"
        timestamp created_at
        timestamp updated_at
    }

    CARD {
        uuid id PK
        uuid module_id FK
        string question
        string answer
        int order_index
        timestamp created_at
    }

    QUESTION {
        uuid id PK
        uuid module_id FK
        string question_text
        enum type "CHOICE | TEXT | MATCHING"
        int order_index
        timestamp created_at
    }

    QUESTION_OPTION {
        uuid id PK
        uuid question_id FK
        string text
        boolean is_correct
    }

    MATCHING_PAIR {
        uuid id PK
        uuid question_id FK
        string left_item
        string right_item
    }

    FLASHCARD_SESSION {
        uuid id PK
        uuid user_id FK
        uuid module_id FK
        int total_cards
        int known_count
        int unknown_count
        timestamp completed_at
    }

    QUIZ_SESSION {
        uuid id PK
        uuid user_id FK
        uuid module_id FK
        int total_questions
        int correct_count
        float score_percent
        timestamp completed_at
    }

    QUIZ_ANSWER {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        string user_answer
        boolean is_correct
    }

    USER ||--o{ MODULE : "создаёт"
    MODULE ||--o{ CARD : "содержит"
    MODULE ||--o{ QUESTION : "содержит"
    QUESTION ||--o{ QUESTION_OPTION : "имеет варианты"
    QUESTION ||--o{ MATCHING_PAIR : "имеет пары"
    USER ||--o{ FLASHCARD_SESSION : "проходит"
    USER ||--o{ QUIZ_SESSION : "проходит"
    MODULE ||--o{ FLASHCARD_SESSION : "используется в"
    MODULE ||--o{ QUIZ_SESSION : "используется в"
    QUIZ_SESSION ||--o{ QUIZ_ANSWER : "содержит"
    QUESTION ||--o{ QUIZ_ANSWER : "относится к"
```

---

# 3. Use Case Диаграмма

```mermaid
graph TB
    subgraph Actors["Участники"]
        Guest["👤 Гость"]
        User["👤 Пользователь"]
        Admin["👤 Администратор"]
    end

    subgraph Auth["Авторизация"]
        UC1["Зарегистрироваться"]
        UC2["Войти в систему"]
        UC2a["Войти через Google (OAuth)"]
        UC3["Выйти из системы"]
        UC4["Обновить токен"]
    end

    subgraph Modules["Управление модулями"]
        UC10["Создать модуль (Карточки)"]
        UC11["Создать модуль (Квиз)"]
        UC12["Редактировать модуль"]
        UC13["Удалить модуль"]
        UC14["Просмотреть свои модули"]
    end

    subgraph Cards["Карточки"]
        UC20["Добавить карточку"]
        UC21["Редактировать карточку"]
        UC22["Удалить карточку"]
    end

    subgraph Questions["Вопросы квиза"]
        UC30["Добавить вопрос: Выбор варианта"]
        UC31["Добавить вопрос: Ввод текста"]
        UC32["Добавить вопрос: Соответствие"]
        UC33["Редактировать вопрос"]
        UC34["Удалить вопрос"]
    end

    subgraph Learning["Обучение"]
        UC40["Запустить режим Карточки"]
        UC41["Перевернуть карточку"]
        UC42["Отметить Знал / Не знал"]
        UC43["Запустить квиз"]
        UC44["Ответить на вопрос"]
        UC45["Просмотреть результат квиза"]
    end

    subgraph Stats["Статистика и профиль"]
        UC50["Просмотреть историю сессий"]
        UC51["Просмотреть прогресс по модулю"]
        UC52["Просмотреть профиль и общую статистику"]
        UC53["Редактировать профиль"]
    end

    subgraph AdminPanel["Администрирование"]
        UC60["Просмотреть всех пользователей"]
        UC61["Заблокировать пользователя"]
        UC62["Разблокировать пользователя"]
        UC63["Просмотреть все модули"]
        UC64["Удалить любой модуль"]
        UC65["Просмотреть статистику платформы"]
    end

    Guest --> UC1
    Guest --> UC2
    Guest --> UC2a

    User --> UC2
    User --> UC2a
    User --> UC3
    User --> UC4
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC20
    User --> UC21
    User --> UC22
    User --> UC30
    User --> UC31
    User --> UC32
    User --> UC33
    User --> UC34
    User --> UC40
    User --> UC41
    User --> UC42
    User --> UC43
    User --> UC44
    User --> UC45
    User --> UC50
    User --> UC51
    User --> UC52
    User --> UC53

    Admin --> UC60
    Admin --> UC61
    Admin --> UC62
    Admin --> UC63
    Admin --> UC64
    Admin --> UC65
    Admin --> UC3
```

---

# 4. Краткое описание Use Case — ключевые сценарии

## UC-40: Запустить режим Карточки

- **Актор:** Пользователь
- **Предусловие:** Модуль типа «Карточки» содержит не менее 2 карточек
- **Основной поток:**
  1. Пользователь открывает модуль и нажимает «Карточки»
  2. Система перемешивает карточки и показывает первую (лицевая сторона)
  3. Пользователь нажимает «Перевернуть»
  4. Система показывает обратную сторону (ответ)
  5. Пользователь нажимает «Знал» или «Не знал»
  6. Шаги 2–5 повторяются; карточки «Не знал» добавляются в конец стопки
  7. Когда все карточки пройдены — отображается итоговый экран
- **Постусловие:** Сессия сохраняется в историю

## UC-43: Запустить квиз

- **Актор:** Пользователь
- **Предусловие:** Модуль типа «Квиз» содержит не менее 2 вопросов
- **Основной поток:**
  1. Пользователь открывает модуль и нажимает «Квиз»
  2. Система показывает вопросы по одному в случайном порядке
  3. Пользователь отвечает на каждый вопрос
  4. Система фиксирует правильность ответа (нельзя изменить после отправки)
  5. После последнего вопроса — экран результатов с разбором ошибок
- **Постусловие:** Результат сессии сохраняется в историю

## UC-53: Редактировать профиль

- **Актор:** Пользователь
- **Предусловие:** Пользователь авторизован
- **Основной поток:**
  1. Пользователь открывает страницу профиля
  2. Изменяет username, email и/или пароль (с подтверждением старого пароля при смене)
  3. Система валидирует данные и сохраняет изменения
- **Постусловие:** Данные профиля обновлены; при смене email может потребоваться повторная аутентификация (по политике проекта)

## UC-61: Заблокировать пользователя

- **Актор:** Администратор
- **Предусловие:** Пользователь существует и не заблокирован
- **Основной поток:**
  1. Администратор открывает список пользователей
  2. Выбирает пользователя и нажимает «Заблокировать»
  3. Система устанавливает флаг is_blocked = true
  4. Все активные токены пользователя инвалидируются
- **Постусловие:** Пользователь не может войти в систему

# Выдержка формулировок задания (п. 2.1–2.2, краткая)

2.1. Функционально web-приложение должно поддерживать роли «Гость», «Пользователь», «Администратор».
Функции пользователя с ролью «Гость»:

регистрация;
аутентификация;
вход через Google OAuth.

Функции пользователя с ролью «Пользователь»:

создание модуля типа «Карточки» или «Квиз»;
редактирование и удаление модуля;
добавление, редактирование и удаление карточек;
добавление, редактирование и удаление вопросов квиза;
прохождение режима обучения «Карточки»;
прохождение режима обучения «Квиз»;
просмотр результатов текущей сессии;
просмотр статистики по модулю;
редактирование профиля;
выход из аккаунта.

Функции пользователя с ролью «Администратор»:

просмотр списка всех пользователей;
блокировка и разблокировка пользователей;
просмотр всех модулей платформы;
удаление любого модуля.

2.2. Программное средство должно быть выполнено с использованием асинхронного программирования, взаимодействовать с базой данных, реализовано под разными платформами. Программное средство должно представлять собой web-приложение с асинхронным UI. Представление, бизнес-логика и хранилище данных должны быть максимально независимы друг от друга для возможности расширения. Язык разработки проекта JavaScript, платформа Node.js. Web-приложение должно быть логически завершённым. Управление программой должно быть интуитивно понятным и удобным. Листинги проекта должны содержать комментарии.

# Формулировка задания и содержание записки (фрагмент оформления курсовой)

МИНИСТЕРСТВО ОБРАЗОВАНИЯ РЕСПУБЛИКИ БЕЛАРУСЬ

Учреждения образования «БЕЛОРУССКИЙ

ГОСУДАРСТВЕННЫЙ ТЕХНОЛОГИЧЕСКИЙ УНИВЕРСИТЕТ»

Факультет Информационных технологий    

Кафедра Программной инженерии      

Специальность 6-05-0612-01 Программная инженерия (профилизация Программное обеспечение информационных технологий)      

ПОЯСНИТЕЛЬНАЯ ЗАПИСКА

к курсовому проекту на тему:

Web-приложение для создания и прохождения учебных тестов

Выполнил студент    Мельник Павел Сергеевич 

       (Ф.И.О.)

Руководитель проекта     преп.-ст. А. П. Некрасова 

      (учен. степень, звание, должность, подпись, Ф.И.О.)

Заведующий кафедрой    к.т.н., доц. В. В. Смелов  

      (учен. степень, звание, должность, подпись, Ф.И.О.)

Курсовой проект защищен с оценкой        

Минск 2026

МИНИСТЕРСТВО ОБРАЗОВАНИЯ РЕСПУБЛИКИ БЕЛАРУСЬ

Учреждение образования
«БЕЛОРУССКИЙ ГОСУДАРСТВЕННЫЙ ТЕХНОЛОГИЧЕСКИЙ УНИВЕРСИТЕТ»

Факультет информационных технологий
Кафедра программной инженерии

Утверждаю

Заведующий кафедрой

                   В.В.Смелов.

подпись инициалы и фамилия

«**\_»\*\***\_\_\_\_**\*\***2026г.

ЗАДАНИЕ

к курсовому проектированию

по дисциплине

«Программирование серверных кроссплатформенных приложений»

Специальность: 6-05-0612-01 Программная инженерия (профилизация Программное обеспечение информационных технологий)

Группа: 7

Студент: Мельник П.С.

Тема: Web-приложение для создания и прохождения учебных тестов

1. Срок сдачи студентом законченной работы: «23 мая 2026»

2. Исходные данные к проекту:

2.1. Функционально web-приложение должно поддерживать роли «Гость», «Пользователь» и «Администратор».

Функции пользователя с ролью «Гость»:

Регистрация и аутентификация.

Функции пользователя с ролью «Пользователь»:

создание модуля типа «Карточки» или «Квиз»;

редактирование и удаление модуля;

добавление, редактирование и удаление карточек;

добавление, редактирование и удаление вопросов квиза;

прохождение режима обучения «Карточки» и «Квиз»;

просмотр результатов текущей сессии;

просмотр статистики по модулю;

редактирование профиля.

Функции пользователя с ролью «Администратор»:

просмотр списка всех пользователей;

блокировка и разблокировка пользователей;

просмотр всех модулей платформы;

удаление любого модуля.

2.2. Программное средство должно быть реализовано с применением асинхронного программирования и обеспечивать взаимодействие с реляционной базой данных. Приложение должно корректно функционировать на различных платформах. Архитектура системы должна предусматривать чёткое разделение слоёв представления, бизнес-логики и хранилища данных с целью обеспечения возможности дальнейшего масштабирования. Язык разработки – JavaScript, серверная платформа – Node.js. Пользовательский интерфейс должен быть асинхронным, логически завершённым и интуитивно понятным. Исходный код проекта должен содержать комментарии.

3. Содержание расчетно-пояснительной записки

введение;

постановка задачи и обзор аналогичных решений;

проектирование web-приложения;

реализация web-приложения;

тестирование web-приложения;

руководство пользователя;

заключение;

список используемых источников;

приложения.

4. Форма представления выполненного курсового проект:

теоретическая часть курсового проекта должна быть представлена в формате MS Word. Оформление записки должно быть согласно выданным правилам;

необходимые схемы, диаграммы и рисунки допускается делать в MS Office Visio, Rational Rose, WS или копии экрана (интерфейс);

листинги программы представляются частично в приложении;

диаграмму вариантов использования разработать на основе UML, также необходимо разработать логическую схему базы данных и структурную схему приложения.

Календарный план

№

п/п

Наименование этапов курсового проекта

Срок выполнения этапов проекта

Примечание

1

Постановка задачи и обзор аналогичных решений

27.03.2026

2

Проектирование web-приложения

03.04.2026

3

Реализация web-приложения

08.05.2026

4

Тестирование web-приложения

15.05.2026

5

Оформление пояснительной записки

20.05.2026

6

Защита проекта

23.05.2026

5. Дата выдачи задания     

Руководитель**\*\*\*\***\_\_**\*\*\*\***  А.П. Некрасова

   (подпись)     

Задание принял к исполнению \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***

                                                                                (дата и подпись студента)

•••
Go to
Page

# Аутентификация и авторизация (архитектурная справка)

# QuizoO — Аутентификация и авторизация

Документ описывает типовую качественную архитектуру входа пользователя с **JWT**, **refresh-токенами**, защитой API и **protected routes** на фронтенде. Предназначен для согласования реализации backend и frontend.

---

## 1. Роли компонентов

| Компонент                    | Назначение                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JWT (access)**             | Короткоживущий токен, подтверждает личность при запросах к API. Подписан сервером, сервер при каждом запросе **проверяет подпись и срок действия** без обращения к БД (если не используется blocklist). |
| **Refresh-токен**            | Долгоживущий токен **только** для получения новой пары access/refresh без повторного ввода пароля. Хранится и проверяется строже, часто с привязкой к БД.                                               |
| **Protected routes (фронт)** | Условный рендер или редирект: «не показывать экран, пока нет сессии». Улучшает UX, **не заменяет** проверку на сервере.                                                                                 |
| **Защита API**               | Middleware/guard на каждом защищённом маршруте: нет валидного access (или сессии) → **401/403**, данные не отдаются.                                                                                    |

---

## 2. Схема с двумя токенами (рекомендуемый паттерн)

| Токен       | TTL                              | Где используется                                                                                             |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Access**  | Коротко (от минут до пары часов) | Заголовок `Authorization: Bearer <access>` (или cookie, см. ниже)                                            |
| **Refresh** | Дольше (дни/недели)              | Отдельный эндпоинт `POST /auth/refresh`; при **rotation** выдаётся новая пара, старый refresh инвалидируется |

**Зачем два токена:** украденный access быстро перестаёт действовать; refresh можно отозвать в БД, ограничить по устройству и при компрометации оборвать цепочку.

---

## 3. Хранение на клиенте

| Подход                                         | Плюсы                                              | Минусы                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **`localStorage` / `sessionStorage` + Bearer** | Простая реализация SPA                             | Уязвимость при XSS: скрипт может прочитать токен                                                             |
| **HttpOnly + Secure + SameSite cookie**        | JS не читает cookie → меньше риска кражи через XSS | Нужно продумать **CSRF** для state-changing запросов (SameSite=Lax/Strict, CSRF-токен, double-submit и т.д.) |

Частая комбинация: **refresh в HttpOnly cookie**, **access в памяти** (переменная в приложении) или короткоживущий в cookie — зависит от SSR и единого домена API/фронта.

---

## 4. Потоки на backend

### 4.1 Регистрация / вход

1. Проверка учётных данных (пароль — **bcrypt** / **argon2**, не хранить в открытом виде).
2. Опционально: rate limiting на `/login`, 2FA.
3. Выдача **access** + **refresh**; refresh сохраняется в БД (хэш токена), чтобы поддерживать **logout** и **rotation**.

### 4.2 Защищённые эндпоинты

1. Извлечь токен из `Authorization` или cookie.
2. Верифицировать JWT (подпись, `exp`, опционально `iss`/`aud`).
3. Положить в контекст запроса `userId`, роли/permissions.
4. При необходимости проверить права на конкретное действие (RBAC).

### 4.3 Обновление сессии

1. `POST /auth/refresh` с refresh (cookie или тело — по выбранной схеме).
2. Проверить refresh в БД (не отозван, срок, привязка к пользователю/устройству).
3. Выдать **новую** пару токенов; при **refresh rotation** — инвалидировать использованный refresh.

### 4.4 Выход

1. Удалить/пометить refresh в БД.
2. Очистить cookie на клиенте; с клиента убрать access из памяти.

---

## 5. Protected routes (frontend)

### 5.1 Назначение

Скрыть страницы «только для авторизованных» и перенаправить на `/login` (с сохранением `returnUrl`), пока нет валидной сессии. Показать загрузку, пока идёт проверка токена/профиля.

### 5.2 Ограничение

Пользователь может подменить клиентский код или открыть URL напрямую. **Данные всё равно не получит** без валидного access на API. Protected route — про **навигацию и UX**, не про безопасность данных.

### 5.3 Типичная реализация (React Router)

- Обёртка маршрута, например `<ProtectedRoute>`, внутри: контекст auth → если не авторизован → `<Navigate to="/login" state={{ from: location }} />`.
- Для ролей: то же с условием `user.role === 'admin'`.

### 5.4 SSR / fullstack-фреймворки

В **middleware** по cookie/JWT можно редиректить **до** отдачи HTML — пользователь не увидит защищённую разметку; API всё равно остаётся источником истины.

---

## 6. Диаграмма последовательности (обзор)

```mermaid
sequenceDiagram
  participant C as Клиент
  participant API as API
  participant DB as БД

  C->>API: POST /auth/login
  API->>DB: проверка пользователя
  API->>C: access + refresh

  C->>API: GET /resource + Bearer access
  API->>API: verify JWT
  API->>C: 200 + данные

  C->>API: POST /auth/refresh + refresh
  API->>DB: проверка + rotation
  API->>C: новая пара токенов
```

---

## 7. Чеклист безопасности (кратко)

- Пароли: сильный хэш, соль, без логирования паролей.
- HTTPS в продакшене.
- Короткий TTL access; refresh с rotation и хранением в БД.
- Rate limit на логин и чувствительные эндпоинты.
- При cookie: **Secure**, **SameSite**, продуманный **CSRF** для изменяющих запросов.
- `401` при истёкшем/невалидном токене; на клиенте — попытка refresh или редирект на логин.
- Опционально: blocklist для access при logout со всех устройств (если храните jti).

---

## 8. Связь с проектом QuizoO

При внедрении в репозиторий:

- Зафиксировать контракт API (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`) и формат ошибок.
- Единый `AuthProvider` (или аналог) на фронте: хранение состояния пользователя, обёртка для protected routes, перехватчик `fetch`/axios для подстановки Bearer и обработки 401 → refresh.

Этот файл можно дополнять конкретными путями эндпоинтов и полями DTO по мере реализации.

# Логическая схема БД (описание; сверять с Prisma)

# QuizoO — схема базы данных

Доменные сущности и связи. Реализация: [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) (`backend/prisma/schema.prisma`).

---

## Оглавление

1. [ER-диаграмма](#er-диаграмма)
2. [Сущности](#сущности)
3. [Связи (что к чему)](#связи-что-к-чему)
4. [Перечисления](#перечисления)
5. [Поля вне изначально краткой схемы (добавлено)](#поля-вне-изначально-краткой-схемы-добавлено)
6. [Расширения и пояснения](#расширения-и-пояснения)
7. [Заметки и возможные доработки](#заметки-и-возможные-доработки)

---

## ER-диаграмма

```mermaid
erDiagram
  users ||--o{ modules : "владеет"
  users ||--o{ flashcard_sessions : "проходит"
  users ||--o{ quiz_sessions : "проходит"
  modules ||--o{ cards : "содержит"
  modules ||--o{ questions : "содержит"
  modules ||--o{ flashcard_sessions : "контекст"
  modules ||--o{ quiz_sessions : "контекст"
  questions ||--o{ question_options : "имеет"
  questions ||--o{ matching_pairs : "имеет"
  questions ||--o{ quiz_answers : "оценивается"
  quiz_sessions ||--o{ quiz_answers : "содержит"

  users {
    string id PK
    string email UK
    string passwordHash
  }

  modules {
    string id PK
    string userId FK
    string type
  }

  quiz_sessions {
    string id PK
    string userId FK
    string moduleId FK
  }
```

---

## Сущности

### `users` — пользователи

Краткая изначальная схема в репозитории описывала: `id`, `email`, `passwordHash`, `username`, `role`, `isBlocked`, `oauthProvider`, `oauthId`, `createdAt`, `updatedAt`. Ниже — полный список; поля, которых **не было** в той краткой строке, помечены **(добавлено)**.

| Поле                         | Тип    | Описание                                                 |
| ---------------------------- | ------ | -------------------------------------------------------- |
| `id`                         | PK     | Идентификатор (cuid)                                     |
| `email`                      | unique | Почта (логин)                                            |
| `passwordHash`               | string | Хеш пароля (bcrypt)                                      |
| `username`                   | null   | Отображаемое имя                                         |
| `role`                       | enum   | `USER` / `ADMIN`                                         |
| `isBlocked`                  | bool   | Блокировка учётной записи                                |
| `oauthProvider`              | null   | Код провайдера OAuth (например `google`)                 |
| `oauthId`                    | null   | Субъект у провайдера; в паре с `oauthProvider` уникален  |
| `emailVerified`              | bool   | Подтверждён ли email **(добавлено)**                     |
| `emailVerificationCode`      | null   | Одноразовый код подтверждения **(добавлено)**            |
| `emailVerificationExpiresAt` | null   | Срок действия кода **(добавлено)**                       |
| `passwordResetCode`          | null   | Код сброса пароля **(добавлено)**                        |
| `passwordResetExpiresAt`     | null   | Срок действия кода сброса **(добавлено)**                |
| `avatarMime`                 | null   | MIME аватара (файл на диске по `userId`) **(добавлено)** |
| `createdAt`                  | auto   | Создание                                                 |
| `updatedAt`                  | auto   | Обновление                                               |

**Ограничение (добавлено):** уникальная пара `oauthProvider` + `oauthId` — дубли OAuth-аккаунта не заводим; для учёток только с email/паролем оба поля `NULL` (в PostgreSQL для `UNIQUE` это допустимо: несколько строк `NULL, NULL`).

Подробнее о смысле кодов и сроков — в разделе [Расширения и пояснения](#расширения-и-пояснения).

---

### `modules` — учебные модули (наборы карточек или квизов)

| Поле          | Тип          | Описание               |
| ------------- | ------------ | ---------------------- |
| `id`          | PK           |                        |
| `userId`      | FK → `users` | Владелец               |
| `title`       |              | Название               |
| `description` | null         | Описание               |
| `type`        | enum         | `FLASHCARD` или `QUIZ` |
| `createdAt`   |              |                        |
| `updatedAt`   |              |                        |

---

### `cards` — карточки (режим «флэшкарты»)

| Поле         | Тип | Описание               |
| ------------ | --- | ---------------------- |
| `id`         | PK  |                        |
| `moduleId`   | FK  | → `modules`            |
| `question`   |     | Вопрос / лицо карточки |
| `answer`     |     | Ответ                  |
| `orderIndex` | int | Порядок                |
| `createdAt`  |     |                        |

---

### `flashcard_sessions` — сессии прохождения флэшкарт

| Поле           | Тип  | Описание               |
| -------------- | ---- | ---------------------- |
| `id`           | PK   |                        |
| `userId`       | FK   | → `users`              |
| `moduleId`     | FK   | → `modules`            |
| `totalCards`   | int  | Всего карточек         |
| `knownCount`   | int  | «Знаю»                 |
| `unknownCount` | int  | «Не знаю»              |
| `completedAt`  | null | Когда завершена сессия |

---

### `questions` — вопросы (режим «квиз»)

| Поле           | Тип  | Описание                       |
| -------------- | ---- | ------------------------------ |
| `id`           | PK   |                                |
| `moduleId`     | FK   | → `modules`                    |
| `questionText` |      | Текст вопроса                  |
| `type`         | enum | `CHOICE` / `TEXT` / `MATCHING` |
| `orderIndex`   |      | Порядок                        |
| `createdAt`    |      |                                |

---

### `question_options` — варианты ответа (для `CHOICE`)

| Поле         | Тип  | Описание        |
| ------------ | ---- | --------------- |
| `id`         | PK   |                 |
| `questionId` | FK   | → `questions`   |
| `text`       |      | Текст варианта  |
| `isCorrect`  | bool | Верный ли ответ |

---

### `matching_pairs` — пары «слева–справа» (для `MATCHING`)

| Поле         | Тип | Описание      |
| ------------ | --- | ------------- |
| `id`         | PK  |               |
| `questionId` | FK  | → `questions` |
| `leftItem`   |     |               |
| `rightItem`  |     |               |

---

### `quiz_sessions` — сессии прохождения квиза

| Поле             | Тип   | Описание        |
| ---------------- | ----- | --------------- |
| `id`             | PK    |                 |
| `userId`         | FK    | → `users`       |
| `moduleId`       | FK    | → `modules`     |
| `totalQuestions` | int   | Всего вопросов  |
| `correctCount`   | int   | Верных ответов  |
| `scorePercent`   | float | Оценка, %       |
| `completedAt`    | null  | Когда завершена |

---

### `quiz_answers` — ответы в рамках квиз-сессии

| Поле         | Тип  | Описание                           |
| ------------ | ---- | ---------------------------------- |
| `id`         | PK   |                                    |
| `sessionId`  | FK   | → `quiz_sessions`                  |
| `questionId` | FK   | → `questions`                      |
| `userAnswer` | null | Сериализованный ответ (текст/JSON) |
| `isCorrect`  | bool | Верно ли                           |

**Ограничение (добавлено):** уникальная пара `(sessionId, questionId)` — в изначальном перечислении полей не указывалось; в БД: один ответ на вопрос в рамках сессии, без дублей.

---

## Связи (что к чему)

| Родитель (1)    | Потомок (N)          | Ключ / FK                     |
| --------------- | -------------------- | ----------------------------- |
| `users`         | `modules`            | `modules.userId`              |
| `users`         | `flashcard_sessions` | `flashcard_sessions.userId`   |
| `users`         | `quiz_sessions`      | `quiz_sessions.userId`        |
| `modules`       | `cards`              | `cards.moduleId`              |
| `modules`       | `questions`          | `questions.moduleId`          |
| `modules`       | `flashcard_sessions` | `flashcard_sessions.moduleId` |
| `modules`       | `quiz_sessions`      | `quiz_sessions.moduleId`      |
| `questions`     | `question_options`   | `question_options.questionId` |
| `questions`     | `matching_pairs`     | `matching_pairs.questionId`   |
| `questions`     | `quiz_answers`       | `quiz_answers.questionId`     |
| `quiz_sessions` | `quiz_answers`       | `quiz_answers.sessionId`      |

Семантически везде **один ко многим** с каскадом при удалении родителя (см. Prisma `onDelete: Cascade`).

---

## Перечисления

| Имя            | Значения                     |
| -------------- | ---------------------------- |
| `UserRole`     | `USER`, `ADMIN`              |
| `ModuleType`   | `FLASHCARD`, `QUIZ`          |
| `QuestionType` | `CHOICE`, `TEXT`, `MATCHING` |

---

## Поля вне изначально краткой схемы (добавлено)

Сводка: во всех **доменных** таблицах из раздела [Сущности](#сущности) от краткого перечня в `users` отличались только перечисленные выше **(добавлено)**-поля и **помеченные** ограничения; `oauthProvider` / `oauthId` в краткую схему **входили** — к «добавлено» к полям не относятся.

| Сущность / артефакт                                                                                                                          | Статус                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `users`: `emailVerified`, `emailVerificationCode`, `emailVerificationExpiresAt`, `passwordResetCode`, `passwordResetExpiresAt`, `avatarMime` | **(добавлено)**                                                |
| `users`: уникальный индекс `(oauthProvider, oauthId)`                                                                                        | **(добавлено)** — как ограничение, не отдельные колонки        |
| `quiz_answers`: уникальность `(sessionId, questionId)`                                                                                       | **(добавлено)**                                                |
| Таблица `Click`                                                                                                                              | **(добавлено)** — см. ниже, не в доменной схеме квизов/модулей |

### Таблица `Click` **(добавлено)**

| Поле        | Тип  | Описание             |
| ----------- | ---- | -------------------- |
| `id`        | PK   | Идентификатор (cuid) |
| `createdAt` | auto | Метка времени        |

Демо для проверки API; **не** часть учебного домена QuizoO. Можно удалить вместе с демо-эндпоинтами.

---

## Расширения и пояснения

Здесь — зачем поля, помеченные **(добавлено)** у `users` (само­хостинг, email-флоу, аватар), без повторения полного списка.

| Сущность / поле                                        | Назначение                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `emailVerified`                                        | Подтверждён ли email.                                                                                                                                                                                                                                                                                                                                                               |
| `emailVerificationCode` + `emailVerificationExpiresAt` | **Одноразовый код** и **срок жизни**. Код нельзя хранить в JWT надёжно для «ввёл код → залогинен», пока сессия не выдана; хранение в БД вместе с `expires` позволяет: отклонить просроченный код, не держать отдельный Redis, не плодить анонимные сессии до верификации. Альтернатива: Redis `SET key code EX 900` / таблица `verification_tokens` с отдельной строкой на попытку. |
| `passwordResetCode` + `passwordResetExpiresAt`         | Аналогично для **сброса пароля**.                                                                                                                                                                                                                                                                                                                                                   |
| `avatarMime`                                           | Мета для локально сохранённого аватара (файл на диске по `userId`).                                                                                                                                                                                                                                                                                                                 |

---

## Заметки и возможные доработки

1. **OAuth** — в схеме есть `oauthProvider` / `oauthId`; **эндпоинты** «Войти через Google» и т.д. ещё нужно подключить. Если появятся **только** OAuth-аккаунты без пароля, разумно сделать `passwordHash` **опциональным** и в коде запрещать смену пароля без установленного пароля.
2. **Верификация и сброс** — при высоком трафике вынести коды в Redis с TTL, оставив в `users` только `emailVerified` / флаги; для текущего масштаба хранение в `users` проще.
3. **Сессии обучения** — при необходимости **непрошитых** (draft) сессий можно добавить `startedAt`, `durationSec`.
4. **Согласованность `modules.type` и контента** — на уровне приложения: у модуля `QUIZ` не должны создаваться `cards` и т.д.; при желании — CHECK или триггеры в SQL (усложнение).

Если схема в коде разойдётся с этим документом, **источник правды** — `backend/prisma/schema.prisma` и миграции в `backend/prisma/migrations/`.

# Технический дизайн UI и адаптив

# QuizoO — Technical Design System & Adaptive Guide

Технические спецификации (CSS) и логика адаптива для единообразной вёрстки QuizoO на всех устройствах.

**Связь со Stitch:** промпты в [`docs/stitch-prompts.md`](./stitch-prompts.md) задают атмосферу и композицию страниц. Если числа расходятся (например, радиус кнопки 10px в промпте vs 12px ниже), **приоритет у этого файла** — он ближе к реализации в коде.

---

## Цветовая палитра (CSS variables)

Используйте токены в `index.css` (`:root`), в компонентах — `var(--token-name)`.

| Токен                | Значение                  | Назначение                     |
| -------------------- | ------------------------- | ------------------------------ |
| `--bg-color`         | `#0F1117`                 | Основной фон (deep navy-black) |
| `--surface-color`    | `#1A1D2E`                 | Карточки, панели               |
| `--input-bg`         | `#222640`                 | Фон полей ввода                |
| `--primary-accent`   | `#6C63FF`                 | Основной акцент (фиолетовый)   |
| `--secondary-accent` | `#00D4AA`                 | Вторичный акцент (mint/teal)   |
| `--danger-color`     | `#FF5C5C`                 | Ошибки, деструктивные действия |
| `--text-primary`     | `#FFFFFF`                 | Основной текст                 |
| `--text-secondary`   | `#8B8FA8`                 | Подписи, вторичный текст       |
| `--border-default`   | `#2E3250`                 | Границы по умолчанию           |
| `--purple-glow`      | `rgba(108, 99, 255, 0.3)` | Свечение кнопок, фокус         |

```css
:root {
  --bg-color: #0f1117;
  --surface-color: #1a1d2e;
  --input-bg: #222640;
  --primary-accent: #6c63ff;
  --secondary-accent: #00d4aa;
  --danger-color: #ff5c5c;
  --text-primary: #ffffff;
  --text-secondary: #8b8fa8;
  --border-default: #2e3250;
  --purple-glow: rgba(108, 99, 255, 0.3);
}
```

**Светлая тема (будущее):** из общего промпта Stitch — фон `#F4F5FF`, карточки `#FFFFFF`, текст `#1A1D2E`, акцент тот же фиолетовый.

---

## Адаптив: брейкпоинты и сетка

| Устройство  | Ширина       | Стратегия                  | Max-width контейнера                   |
| ----------- | ------------ | -------------------------- | -------------------------------------- |
| **Mobile**  | &lt; 768px   | Одна колонка, стек         | 100% + горизонтальные отступы **20px** |
| **Tablet**  | 768px–1024px | 2 колонки или fluid grid   | **720px**                              |
| **Desktop** | &gt; 1024px  | Несколько колонок, сайдбар | **1200px**                             |

### Поведение

- **Навигация:** на десктопе — строка; на мобиле — бургер или упрощённый top-bar.
- **Сетки:** 3 колонки (desktop) → 2 (tablet) → 1 (mobile).
- **Сплит-экраны (login и т.п.):** 55/45 (desktop/tablet) → 100% стек (mobile).
- **Заголовки:** на mobile уменьшать крупные заголовки примерно на **~20%**, чтобы не было горизонтального overflow.

В Tailwind ориентиры: `md:` ≈ 768px, `lg:` ≈ 1024px (уточнить под `tailwind.config` при необходимости).

---

## Типографика

### Семейства

| Роль                 | Шрифт                         | Вес                          |
| -------------------- | ----------------------------- | ---------------------------- |
| Заголовки            | **Syne**, sans-serif          | 700, letter-spacing `0.02em` |
| Тело, подписи        | **DM Sans**, sans-serif       | 400 / 500                    |
| Счётчики, тех. метки | **JetBrains Mono**, monospace | 500                          |

### Размеры (desktop → mobile)

| Уровень       | Desktop | Mobile |
| ------------- | ------- | ------ |
| H1 (hero)     | 72px    | 48px   |
| H2 (секция)   | 36px    | 28px   |
| H3 (карточка) | 24px    | 20px   |
| Body          | 16px    | 16px   |
| Small / muted | 14px    | 14px   |

---

## Компоненты (спеки)

### 1. Button

| Параметр       | Значение                                                    |
| -------------- | ----------------------------------------------------------- |
| Высота         | **48px** (стандарт), **56px** (крупный CTA)                 |
| Скругление     | **12px**                                                    |
| Padding        | **0 24px** (горизонтально согласовано с размерами в UI Kit) |
| Шрифт          | Syne, 16px, bold                                            |
| Primary shadow | `0 4px 15px var(--purple-glow)` (аналог мягкого glow)       |

Варианты: primary, outline («ghost»), secondary (mint), danger.

### 2. Input

| Параметр   | Значение                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| Высота     | **52px**                                                                          |
| Скругление | **10px**                                                                          |
| Фон        | `var(--input-bg)`                                                                 |
| Бордер     | `1px solid var(--border-default)`                                                 |
| Focus      | `border-color: var(--primary-accent)` + `box-shadow: 0 0 10px var(--purple-glow)` |

### 3. Card

| Параметр           | Значение                                           |
| ------------------ | -------------------------------------------------- |
| Скругление         | **16px** (обычная), **24px** (крупная / hero)      |
| Фон                | `var(--surface-color)`                             |
| Бордер             | `1px solid var(--border-default)`                  |
| Hover (интерактив) | `translateY(-4px)`, бордер `var(--primary-accent)` |

---

## Эффекты и анимация

- **Halo / glow фона:**  
  `radial-gradient(circle at center, rgba(108, 99, 255, 0.15) 0%, transparent 70%)`
- **Переходы:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` — для hover/focus на карточках и кнопках.

---

## Карта страниц (Stitch)

Кратко: какой промпт к какой задаче UI (подробности — в `QuizoO_STITCH_PROMPTS.md`).

| Промпт         | Экран                                               |
| -------------- | --------------------------------------------------- |
| 1              | Landing                                             |
| 2              | Login (split 55/45)                                 |
| 3              | Register (центрированная карточка)                  |
| 4              | Dashboard                                           |
| Далее по файлу | Модули, квиз, flashcards, профиль, настройки и т.д. |

Компоненты из этого документа переиспользуются на всех экранах; отличия — композиция и контент, не «другая кнопка».

---

## Frontend-стек (реализация)

| Область                             | Библиотека                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Роутинг                             | **react-router-dom** v6 (`BrowserRouter`, `Routes`, `Route`, `Navigate`, layout-роуты)                                                                       |
| Глобальный стейт и серверные данные | **Redux Toolkit** (`configureStore`, slices) и **RTK Query** (`createApi`, кэш, инвалидация тегов) — вместо Zustand и TanStack Query                         |
| HTTP                                | **axios** (`lib/api/client.ts`) + базовый URL и интерцепторы JWT                                                                                             |
| Стили                               | **Tailwind CSS**                                                                                                                                             |
| Компоненты UI                       | **shadcn/ui** (Radix UI + `class-variance-authority` + токены из `:root` выше); кастомные только там, где нет готового примитива (например 3D-flip карточки) |

Детальный пошаговый гайд по папкам и провайдерам: `docs/frontend-setup-from-step4.md`.

# Описание экранов (layout guide)

# Техническое описание интерфейсов QuizoO (Layout Guide)

Этот документ содержит детальное описание структуры и элементов каждого экрана платформы QuizoO для реализации верстки.

---

## Общие параметры (Global Styles)

- **Background:** `#0F1117` (основной темный фон).
- **Cards:** `#1A1D2E` (фон карточек и панелей).
- **Accent:** `#6C63FF` (основной фиолетовый).
- **Success:** `#00D4AA` (тиловый/мятный).
- **Fonts:** `Syne` (заголовки), `DM Sans` (основной текст), `JetBrains Mono` (числа/статистика).

---

## 1. Landing Page (Главная страница)

**Структура (сверху вниз):**

1.  **Navbar (Fixed):**
    - Слева: Текстовое лого "QuizoO" (Syne Bold, White).
    - Центр: Ссылки "Features", "Pricing", "How it works" (DM Sans, White).
    - Справа: Кнопка "Log in" (Ghost/Outline) и "Get started" (Solid Purple). Переключатель темы (Moon icon).
2.  **Hero Section:**
    - Центр: Заголовок "Learn smarter. Remember longer." (Syne, 72px+, White).
    - Подзаголовок: Текст в 2 строки (#8B8FA8).
    - Кнопки: "Start for free" (Purple with arrow) и "See how it works" (Outline).
    - Социальное доказательство: "1,200+ modules created" (JetBrains Mono).
    - Фон: 3D иллюстрация учебных карточек и мягкое фиолетовое свечение.
3.  **Features Grid:**
    - Заголовок секции по центру.
    - 3 карточки в ряд: Иконка в круге, заголовок (Syne), описание (#8B8FA8). Эффект при ховере — поднятие и свечение границ.
4.  **How It Works:**
    - Горизонтальная линия с 3 шагами. Крупные цифры "01, 02, 03" (JetBrains Mono, Faded Purple).
5.  **Footer:**
    - Логотип, ссылки по колонкам ("Platform", "Community", "Contact").

---

## 2. Login Page (Страница входа)

**Layout:** Split-screen (55% Branding / 45% Form).

- **Левая часть:** Темный градиент. Центрированное лого "QuizoO" и слоган. 3 парящие карточки со статистикой ("15-day streak" и т.д.) в шахматном порядке.
- **Правая часть:**
  - Заголовок "Welcome back" (Syne Bold).
  - Поля ввода: Email и Password (с иконкой глаза).
  - Кнопка "Sign In" (Full width, Purple glow).
  - Разделитель "OR" с линиями. Кнопки соцсетей (Google, Apple).

---

## 3. Registration Page (Регистрация)

**Layout:** Центральная карточка (max-width: 480px) на темном фоне с тиловым свечением снизу.

- **Внутри карточки:**
  - Логотип по центру сверху. Заголовок "Create your account".
  - Поля: Username, Email, Password, Confirm Password (все с иконками слева).
  - **Password Strength:** 4 цветовых индикатора (red to green) + текст "Medium/Strong" (JetBrains Mono).
  - Кнопка "Create account" и ссылка на логин внизу.

---

## 4. Dashboard (Панель управления)

**Layout:** Navbar + Main Content + Right Sidebar.

- **Верхняя панель:** Приветствие "Good evening, Alex 👋" и 3 мини-карточки статистики (Total Modules, Cards, Avg Score).
- **Секция модулей:**
  - Заголовок "My Modules" и кнопка "+ New Module".
  - Поиск (Search bar) во всю ширину.
  - **Сетка карточек:** 3 колонки. Каждая карточка содержит: тег типа (Flashcards/Quiz), заголовок, описание, дату последнего изучения, кнопки Edit/Delete и основную кнопку действия (Study/Start Quiz).
- **Sidebar (справа):** Список "Recent Activity" с иконками типов активностей и временем.

---

## 5. Module Detail (Детали модуля)

- **Header Card:** Крупный блок с градиентным фоном. Название модуля, описание и статистика справа. Огромная кнопка запуска (Teal для карточек, Purple для квиза).
- **Список контента:** Таблица/список всех карточек или вопросов. Каждая строка — Question + Answer/Type. Кнопки управления при ховере.
- **Floating Bar:** Внизу экрана всегда висит кнопка "+ Add New Card/Question".

---

## 6. Study Modes (Режимы обучения)

- **Flashcard Mode:**
  - Минималистичный интерфейс. Большая центральная карточка с 3D-поворотом.
  - Кнопки снизу (появляются после переворота): "Didn't know" (Red) и "I knew it" (Teal).
  - Счетчик прогресса внизу (Known/Unknown/Remaining).
- **Quiz Mode:**
  - Карточка вопроса с тегом типа (Multiple Choice и т.д.).
  - Варианты ответа в виде кликабельных плиток (A, B, C, D).
  - После выбора — подсветка правильного (Green) или неправильного (Red).

---

## 7. Admin Panel (Админка)

- **Sidebar (слева):** Вертикальное меню с иконками, логотип с бейджем "ADMIN".
- **Users Management:** Большая таблица пользователей. Колонки: User (Avatar + Name), Role, Modules, Status (Pill badges). Кнопки "Block/View".
- **Modal:** Всплывающее окно подтверждения блокировки с красной иконкой предупреждения.

---

## Технические детали компонентов

- **Border-radius:** 12px для кнопок, 16px для карточек, 8px для инпутов.
- **Shadows:** Фиолетовое свечение (`box-shadow: 0 0 20px rgba(108, 99, 255, 0.2)`) для активных элементов.
- **Transitions:** Плавная анимация 0.3s для всех ховер-эффектов.

# Настройка фронтенда (структура, Redux, роутинг)

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

**Что сделать:** инициализировать shadcn (`components.json` в корне `frontend/`), добавить нужные примитивы (`button`, `input`, `card`, …) по макетам из [`docs/stitch-prompts.md`](./stitch-prompts.md) и токенам из этого репозитория.

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

# Stitch / промпты для UI (полный текст)

# QuizoO — Stitch AI UI Prompts

> Промты для генерации полного UI макета проекта QuizoO. Каждый промт —
> отдельная страница. Копируй и вставляй в Stitch AI по одному.

---

## 🎨 Общий Design System (читать перед всеми промтами)

Перед генерацией каждой страницы держи в голове общую систему:

- **Название:** QuizoO
- **Общая атмосфера:** современный EdTech, тёмная основная тема, энергичный но
  не кричащий
- **Цветовая палитра:**
  - Фон основной: `#0F1117` (почти чёрный с синеватым оттенком)
  - Фон карточек/панелей: `#1A1D2E` (тёмно-синий)
  - Фон seconday: `#222640`
  - Акцент primary: `#6C63FF` (яркий фиолетовый)
  - Акцент secondary: `#00D4AA` (мятный/бирюзовый)
  - Текст primary: `#FFFFFF`
  - Текст secondary: `#8B8FA8`
  - Danger/ошибка: `#FF5C5C`
  - Success/правильно: `#00D4AA`
- **Шрифты:**
  - Заголовки: **Syne** (жирный, широкий, modern)
  - Тело текста: **DM Sans** (чистый, читаемый)
  - Акценты/метки: **JetBrains Mono** (моноширинный для счётчиков, процентов)
- **Радиус скруглений:** 16px для карточек, 10px для кнопок, 8px для инпутов
- **Тень:** мягкая фиолетовая подсветка на активных элементах
  `0 0 20px rgba(108,99,255,0.3)`
- **Кнопка смены темы:** иконка солнца/луны в правом углу navbar — переключает
  на светлую тему
- **Светлая тема:** фон `#F4F5FF`, карточки `#FFFFFF`, текст `#1A1D2E`, акцент
  тот же фиолетовый

---

## 📄 Промт 1 — Landing Page (Главная / приветственная страница)

```
Design a landing page for a web application called "QuizoO" — a knowledge retention platform using flashcards and quizzes.

ATMOSPHERE: Dark, modern, EdTech. Feels like a premium SaaS product. Energetic but clean. Slight purple glow aesthetic.

COLORS:
- Background: #0F1117 (deep dark navy-black)
- Cards/panels: #1A1D2E
- Primary accent: #6C63FF (vivid purple)
- Secondary accent: #00D4AA (mint/teal)
- Text primary: #FFFFFF
- Text secondary: #8B8FA8

FONTS:
- Headlines: Syne (bold, wide-tracking)
- Body: DM Sans
- Numbers/labels: JetBrains Mono

LAYOUT (top to bottom):

1. NAVBAR (fixed, top)
- Left: Logo "QuizoO" — the "O" letters styled as circular flashcard icons, text in Syne bold, white with purple accent
- Right: navigation links "Features", "How it works" | buttons: "Log in" (ghost/outline) and "Get started" (solid purple #6C63FF)
- Far right corner: dark/light theme toggle button (moon icon for dark, sun for light)
- Navbar background: semi-transparent #1A1D2E with backdrop blur

2. HERO SECTION (centered, full viewport height)
- Big bold headline in Syne: "Learn smarter. Remember longer." — white text, very large (72px+)
- Subheading in DM Sans: "Create your own modules, study with flashcards, test yourself with quizzes." — color #8B8FA8
- Two CTA buttons side by side: "Start for free" (solid #6C63FF, with arrow icon) and "See how it works" (ghost outline white)
- Below buttons: small social proof text in JetBrains Mono: "1,200+ modules created" — muted teal color
- Background: subtle purple radial gradient glow in the center of the dark background, like a soft halo

3. FEATURE CARDS SECTION (3 cards in a row)
- Section title: "Everything you need to learn effectively" — Syne bold, white, centered
- Card 1: icon of stacked cards → "Flashcard Mode" — flip through cards, mark what you know
- Card 2: icon of a checklist → "Quiz Mode" — multiple choice, text input, matching questions
- Card 3: icon of a bar chart → "Track Your Progress" — detailed history and statistics
- Card style: background #1A1D2E, border 1px solid #222640, rounded 16px, icon in purple circle, title in white Syne, description in #8B8FA8 DM Sans
- Hover effect: card lifts slightly, border glows purple

4. HOW IT WORKS SECTION
- 3 steps with large numbered labels in JetBrains Mono (01, 02, 03) in faded purple
- Step 1: "Create a module" — add your topic and cards
- Step 2: "Choose a mode" — flashcards for learning, quiz for testing
- Step 3: "Track your growth" — see your progress over time
- Layout: horizontal steps connected by a dashed purple line

5. FOOTER
- Logo + tagline left side
- Links: "About", "Contact", "GitHub"
- Right: theme toggle again (moon icon)
- Background: #1A1D2E, border-top 1px solid #222640
```

---

## 📄 Промт 2 — Login Page (Страница входа)

```
Design a login page for "QuizoO" — a knowledge retention web app.

ATMOSPHERE: Minimal, focused, dark. Single-purpose screen. Feels clean and trustworthy.

COLORS:
- Page background: #0F1117 with a very subtle purple radial glow in the top-left corner
- Form card background: #1A1D2E
- Accent: #6C63FF (purple)
- Secondary accent: #00D4AA (mint)
- Text: #FFFFFF primary, #8B8FA8 secondary
- Input background: #222640
- Input border default: #2E3250, focused: #6C63FF with glow

FONTS: Syne for title, DM Sans for labels and body, JetBrains Mono for small labels

LAYOUT:
- Split screen — left 55% / right 45%

LEFT SIDE (decorative/branding):
- Full height, background: dark gradient from #0F1117 to #1A1D2E
- Large logo "QuizoO" centered, Syne bold, white with purple "O" accent
- Tagline below: "Your personal learning companion" — DM Sans, #8B8FA8
- Below tagline: 3 floating cards showing mini stats, staggered arrangement:
  Card 1: "🔥 15-day streak"
  Card 2: "📚 48 cards learned today"
  Card 3: "✅ 92% quiz accuracy"
  Each card: #1A1D2E background, subtle purple border, white text

RIGHT SIDE (form area):
- White/light panel OR same dark theme (matches theme toggle)
- Centered vertically
- Title: "Welcome back" — Syne bold, large, white
- Subtitle: "Log in to continue your learning" — DM Sans, #8B8FA8
- Form fields (stacked):
  - Email input: label "Email" above, placeholder "you@example.com"
  - Password input: label "Password" above, placeholder "••••••••", eye icon to toggle visibility
- "Forgot password?" link — small, right-aligned, purple #6C63FF
- Submit button: full width, solid #6C63FF, "Log in" text, Syne font, slight glow on hover
- Divider: "or" with lines on each side
- "Don't have an account? Sign up" — link in purple at the bottom
- Theme toggle button: top-right corner of the right panel (sun/moon icon)
```

---

## 📄 Промт 3 — Register Page (Страница регистрации)

```
Design a registration page for "QuizoO" — a knowledge retention platform.

ATMOSPHERE: Same as login page — dark, clean, focused. Slightly more welcoming since it's onboarding.

COLORS:
- Background: #0F1117
- Form panel: #1A1D2E
- Accent: #6C63FF
- Secondary: #00D4AA
- Text: #FFFFFF / #8B8FA8
- Inputs: #222640 background, #6C63FF border on focus

FONTS: Syne (headings), DM Sans (body/labels), JetBrains Mono (step indicator)

LAYOUT — centered single column with decorative background:
- Background: dark with a soft teal glow in the bottom-right area
- Centered card, max-width 480px, rounded 20px, #1A1D2E, subtle shadow

INSIDE CARD (top to bottom):
- Logo at top: "QuizoO" small, centered
- Title: "Create your account" — Syne bold, white, 32px
- Subtitle: "Start learning in minutes" — DM Sans, #8B8FA8

FORM FIELDS:
- Username: input with person icon inside, placeholder "your_username"
- Email: input with envelope icon, placeholder "you@example.com"
- Password: input with lock icon, eye toggle for visibility
- Confirm password: same style as password field
- All inputs: background #222640, border 1px solid #2E3250, rounded 8px, white text, purple focus glow

PASSWORD STRENGTH INDICATOR (below password field):
- 4 small horizontal bars, colored progressively: red → orange → yellow → green
- Small label in JetBrains Mono showing strength: "Weak" / "Medium" / "Strong"

SUBMIT BUTTON:
- Full width, solid #6C63FF, "Create account" in Syne bold white
- Subtle purple glow shadow on hover

BOTTOM:
- "Already have an account? Log in" — link in #6C63FF

TOP-RIGHT:
- Theme toggle (sun/moon icon)
```

---

## 📄 Промт 4 — Dashboard (Главная страница пользователя)

```
Design a dashboard page for "QuizoO" — a learning platform. This is the main hub where users see and manage their knowledge modules.

ATMOSPHERE: Organized, spacious, motivating. Dark theme. Feels like a personal learning workspace.

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA secondary, #FFFFFF/#8B8FA8 text

FONTS: Syne (headings), DM Sans (body), JetBrains Mono (stats/numbers)

LAYOUT:

TOP NAVBAR (fixed):
- Left: "QuizoO" logo
- Center: navigation — "My Modules", "Statistics", "Settings"
- Right: user avatar circle (initials inside) + username + dropdown arrow | theme toggle (sun/moon icon)

PAGE CONTENT:

SECTION 1 — Welcome Banner:
- Greeting: "Good evening, Alex 👋" — Syne bold, 36px, white
- Subtext: "You have 5 modules. Keep it up!" — DM Sans, #8B8FA8
- Quick stats row (3 mini cards in JetBrains Mono numbers):
  - "12" — Total Modules
  - "248" — Cards Studied
  - "87%" — Avg Quiz Score
  Each stat card: #1A1D2E, rounded, small purple icon above number

SECTION 2 — My Modules:
- Section header row: "My Modules" (Syne bold, left) + "New Module" button (right, solid #6C63FF, plus icon, rounded 10px)
- Search bar below: input with magnifier icon, placeholder "Search modules...", #222640 background

MODULE CARDS GRID (3 columns, responsive):
Each module card design:
- Background: #1A1D2E
- Top-left: two small pills: one showing module type ("Flashcards" or "Quiz") and one showing card/question count, e.g. "Flashcards · 24 cards" or "Quiz · 12 questions", JetBrains Mono, pill shape, teal/purple backgrounds
- Module title: Syne bold, white, 18px
- Module description: DM Sans, #8B8FA8, 2 lines max
- Bottom row: "Last studied: 2 days ago" in small DM Sans | two icon buttons: Edit (pencil) and Delete (trash), muted color
- Bottom CTA: one primary action button depending on the module type:
  - For flashcards modules: "📇 Study flashcards" (teal outline or solid).
  - For quiz modules: "📝 Start quiz" (purple outline or solid).
- Hover: card lifts, purple glow border appears

NEW MODULE FLOW:
- Clicking the "New Module" button opens a full-screen overlay (or modal) with two large selectable cards:
  - Left card: "Create Flashcards set" — short description, icon of stacked cards.
  - Right card: "Create Quiz" — short description, icon of a checklist.
- Each choice card has a big title, 1–2 line description, and a primary "Continue" button on hover/click.
- Once the user selects a type, they are taken to the corresponding editor screen (Flashcards Module Editor or Quiz Module Editor).

EMPTY STATE (if no modules):
- Centered illustration: a large empty card outline with a "+" symbol
- Text: "No modules yet. Create your first one!" — DM Sans
- Big "Create module" button below — solid purple

RIGHT SIDEBAR (optional, only on wide screens):
- "Recent Activity" section
- List of last 5 sessions: module name, mode (flashcard/quiz), score if quiz, time ago
- Each item: small colored icon (📇 or 📝), text, date — separated by thin dividers
```

---

## 📄 Промт 5 — Module Detail Page (Просмотр модуля)

```
Design a module detail page for "QuizoO". This page shows a single module (either Flashcards or Quiz type) and lets the user start the matching session. Module type is fixed when the module is created.

CONTEXT: There are two module types. For a **Flashcards** module — show one main CTA "Study with Flashcards" and list the cards (question/answer pairs). For a **Quiz** module — show one main CTA "Start quiz" and list the questions (with their types). Do not show both CTAs on the same card; the page reflects the module type.

ATMOSPHERE: Focused and informative. Dark theme. Clear hierarchy between module info and content list.

COLORS: #0F1117 background, #1A1D2E panels, #6C63FF accent, #00D4AA secondary

FONTS: Syne (titles), DM Sans (body), JetBrains Mono (card numbers, stats)

LAYOUT:

TOP NAVBAR: same as dashboard — logo left, nav center, avatar + theme toggle right

BREADCRUMB:
- "My Modules > English B1" — small DM Sans, #8B8FA8, with ">" separator

MODULE HEADER CARD (full width, rounded 16px):
- Background: gradient from #1A1D2E to #222640
- Left side: Module title "English B1" — Syne bold 36px white | description below — DM Sans #8B8FA8
- Right side: stats in JetBrains Mono:
  - "32 cards"
  - "4 sessions completed"
  - "Last studied: Yesterday"
- Bottom of header: one main action button depending on module type:
  - If Flashcards module: single button "📇 Study with Flashcards" — #00D4AA teal solid, Syne bold.
  - If Quiz module: single button "📝 Start quiz" — #6C63FF purple solid, Syne bold.
  Button large, rounded 12px, icon + text.

For Quiz modules only (optional row below header):
- "Shuffle questions" toggle switch (purple when on).

CARDS / QUESTIONS LIST SECTION:
- Section header: "Cards (N)" for Flashcards module or "Questions (N)" for Quiz module — Syne bold | right side: "Edit" button (outline purple, pencil icon)
- Search bar: "Search cards..." or "Search questions..." accordingly

LIST (stacked rows):
- Flashcards module: each row = one card — left: index (e.g. "01"); center: question + answer (answer in #8B8FA8); right: edit + delete on hover.
- Quiz module: each row = one question — left: index; center: question text + small type pill (Multiple choice / Text input / Matching); right: edit + delete on hover.
- Separated by thin #222640 divider lines; hover: row background lightens slightly.

BOTTOM FLOATING BAR:
- Fixed at bottom of screen
- "Add card" for Flashcards module or "Add question" for Quiz module — full width inside bar, solid purple, large, "+" icon
```

---

## 📄 Промт 6 — Module Editor (Создание и редактирование модуля)

```
Design editor screens for creating and editing modules in "QuizoO". After clicking "New Module" on the dashboard and choosing a module type, the user lands on one of two editor variants:
- Flashcards Module Editor — for simple question/answer study sets.
- Quiz Module Editor — for quizzes with different question types (multiple choice, text input, matching).

ATMOSPHERE: Productive, workspace-like. Dark. Clean form UI. No distractions.

COLORS: #0F1117 background, #1A1D2E card panels, #6C63FF accent, #222640 input backgrounds

FONTS: Syne (headings), DM Sans (labels, inputs), JetBrains Mono (card counter)

LAYOUT:

TOP NAVBAR: same consistent navbar with theme toggle

PAGE TITLE AREA:
- "Create New Module" or "Edit Module" — Syne bold 32px white
- Subtitle: "Add your cards below. You can always edit them later." — DM Sans #8B8FA8

FLASHCARDS MODULE EDITOR:

MODULE INFO FORM (top card, #1A1D2E, rounded 16px):
- Field 1: "Module title" — label + text input (full width), placeholder "e.g. Spanish Vocabulary Level A2"
- Field 2: "Description (optional)" — label + textarea, placeholder "What is this module about?", 3 rows tall
- Both inputs: #222640 background, border #2E3250, focus border #6C63FF with glow, white text, rounded 8px

CARDS SECTION (below module info):
- Section header row: "Cards" left | card counter in JetBrains Mono right: "8 cards added"

CARD ROWS (stacked, each is an editable card):
Each card row design:
- Container: #1A1D2E, rounded 12px, 1px border #2E3250
- Left: drag handle icon (6 dots), muted gray — for reordering
- Card number badge: JetBrains Mono, purple, e.g. "#01"
- Two inputs side by side:
  - Left input: "Question / Term" — placeholder "e.g. What is the capital of France?"
  - Right input: "Answer / Definition" — placeholder "e.g. Paris"
  Both: #222640 background, rounded, full inner width, white text
- Right side: trash/delete icon button — appears on hover, red on hover
- Hover entire card: subtle border glow

ADD CARD BUTTON:
- Full width, dashed border #6C63FF, rounded 12px, "+" icon + "Add card" text
- Hover: solid purple background

BOTTOM ACTION ROW (sticky at bottom or at end of page):
- Left: "Cancel" button — ghost/outline
- Right: "Save Module" button — solid #6C63FF, Syne bold, arrow icon

QUIZ MODULE EDITOR:

- Same overall shell (navbar, page title area, module info form) as the flashcards editor, but the main content area shows a list of quiz questions instead of simple Q/A cards.
- Section header: "Questions" left | JetBrains Mono counter right: "5 questions added".

QUESTION ROWS:
- Container: #1A1D2E, rounded 12px, 1px border #2E3250.
- Left: drag handle icon for reordering.
- Top row inside each question:
  - Small pill showing question type: "Multiple choice", "Text input", or "Matching".
  - A compact type switcher (dropdown or pill group) so the user can change the question type.
  - On the far right: trash/delete icon button (red on hover).

QUESTION TYPE LAYOUTS:

- Multiple choice:
  - Question text input at the top.
  - Below: a vertical list of answer options; each row has a radio icon or "Correct" badge, an input field, and a small drag handle for reordering options.
  - One option is marked as correct; others are distractors. A "+ Add option" link lets the user add more options.

- Text input:
  - Question text input at the top.
  - Below: a single "Correct answer" text input with helper text like "User's answer will be compared to this value".

- Matching:
  - Two columns inside the card:
    - Left column: "Term" inputs listed vertically.
    - Right column: "Definition" inputs listed vertically, aligned with the terms.
  - Each row is a pair; a "+ Add pair" button adds another term/definition row.

BOTTOM OF EDITOR:
- Under the questions list: a large "+ Add Question" button (dashed outline, purple border; solid purple on hover).
- Sticky bottom action row similar to flashcards editor with "Cancel" (ghost) on the left and "Save Quiz" (solid purple) on the right.
```

---

## 📄 Промт 7 — Flashcard Mode (Режим карточек)

```
Design the flashcard study mode page for "QuizoO". The user is studying a module by flipping through cards one by one.

ATMOSPHERE: Immersive, focused. Dark background to reduce distractions. The card is the center of everything. Calm but engaging.

COLORS: #0F1117 background with very subtle purple ambient glow, #1A1D2E card face, #6C63FF accent, #00D4AA for "Known" action

FONTS: Syne (card question/answer), DM Sans (UI text), JetBrains Mono (progress counter)

LAYOUT:

TOP BAR (minimal, not full navbar):
- Left: "← Back to module" small link, DM Sans, #8B8FA8
- Center: module name "English B1" in DM Sans white
- Right: progress counter in JetBrains Mono: "Card 7 / 32" | theme toggle icon

PROGRESS BAR:
- Thin full-width bar below top bar
- Fill: gradient from #6C63FF to #00D4AA
- Shows % of cards seen

MAIN FLASHCARD (center of screen, large):
- Size: roughly 600x380px, centered both horizontally and vertically in remaining space
- Shape: rounded 24px, very slight 3D perspective appearance
- FRONT FACE:
  - Background: #1A1D2E
  - Top-right corner: small label in JetBrains Mono: "QUESTION" muted purple
  - Center: question text in Syne bold, white, large (28-32px), centered
  - Bottom center: "Tap to flip" hint in small DM Sans #8B8FA8 with flip icon
  - Subtle purple shadow/glow around the card
- BACK FACE (after flip, 3D CSS flip animation):
  - Background: gradient from #1A1D2E to #222640
  - Top-right: "ANSWER" label in JetBrains Mono, teal color #00D4AA
  - Center: answer text in Syne, white, centered
  - Border: subtle teal glow on back face instead of purple

FLIP ANIMATION NOTE: show the card mid-flip (tilted at 90 degrees or slightly) to imply 3D flip interaction

BELOW CARD — action buttons (only visible after card is flipped):
- Two large buttons side by side, rounded 12px:
  - "✗ Didn't know" — background #FF5C5C red, Syne bold white, left button
  - "✓ I knew it" — background #00D4AA teal, Syne bold white, right button
- Keyboard hint below buttons: small DM Sans #8B8FA8: "← Didn't know  |  → Knew it"

BOTTOM STATS ROW:
- Three mini counters in JetBrains Mono:
  - "✓ 12 Known" in teal
  - "✗ 3 Unknown" in red
  - "○ 17 Remaining" in muted gray
```

---

## 📄 Промт 8 — Quiz Mode (Режим квиза)

```
Design the quiz mode page for "QuizoO". The user is answering questions in a test format. Three question types appear: multiple choice, text input, and matching.

ATMOSPHERE: Focused, test-like, but not sterile. Dark theme. Progress is clearly visible. Each question type has distinct visual style.

COLORS: #0F1117 background, #1A1D2E question card, #6C63FF accent, #00D4AA correct, #FF5C5C incorrect

FONTS: Syne (question text), DM Sans (options/labels), JetBrains Mono (question counter, score)

LAYOUT:

TOP BAR (minimal):
- Left: "← Exit quiz" — small DM Sans link, #8B8FA8
- Center: module name — DM Sans white
- Right: question counter in JetBrains Mono "Q 5 / 20" | score so far "Score: 80%" in teal | theme toggle

PROGRESS BAR: same as flashcard — thin, purple-to-teal gradient

QUESTION CARD (centered, large, #1A1D2E, rounded 20px):
- Top-left badge: question type label — e.g. "MULTIPLE CHOICE" or "TEXT INPUT" or "MATCHING" — JetBrains Mono, small pill shape, purple background
- Question text: Syne bold, white, 24-28px, centered with good padding

--- QUESTION TYPE 1: MULTIPLE CHOICE ---
Below question text: 4 answer options as large clickable cards:
- Each option: rounded 12px, background #222640, border 1px #2E3250
- Left: letter badge A / B / C / D in JetBrains Mono, small square, purple background
- Option text: DM Sans white
- STATES:
  - Default: #222640 background
  - Hovered: border turns purple, slight glow
  - Selected before submit: border solid purple, background tints purple lightly
  - Correct (after submit): border teal, background teal tint, checkmark icon right side
  - Incorrect (after submit): border red, background red tint, X icon right side

--- QUESTION TYPE 2: TEXT INPUT ---
- Large text input field below question: #222640, white text, rounded 10px, centered or full width
- Placeholder: "Type your answer here..."
- After submission: if correct → green border + "✓ Correct! Answer: Paris" teal message | if wrong → red border + "✗ Incorrect. Correct answer: Paris" red message

--- QUESTION TYPE 3: MATCHING ---
- Two columns side by side:
  LEFT COLUMN: terms (word/phrase) as draggable pills — purple background
  RIGHT COLUMN: definitions as drop zones — dashed border, #222640
- Correctly matched pairs: green connected with a line
- Incorrectly matched: red highlight on wrong pairing
- Header labels above each column: "Terms" | "Definitions" in DM Sans #8B8FA8 small

BOTTOM OF CARD:
- "Submit Answer" button — solid #6C63FF, full width of card, Syne bold
- After submission it changes to "Next Question →" — teal color
```

---

## 📄 Промт 9 — Quiz Session Results (Результаты после квиза)

```
Design the results page for "QuizoO" that appears **only after completing a quiz session** (not after flashcards). Quiz has a real score and per-question correct/wrong; this screen shows that.

ATMOSPHERE: Rewarding, celebratory but informative. Dark theme with pops of color. User should feel motivated to study again.

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA success

FONTS: Syne (big numbers, titles), DM Sans (body), JetBrains Mono (stats)

LAYOUT (top to bottom, centered):

HERO SCORE SECTION:
- Large circular score badge (centered):
  - Circle ring: progress ring SVG showing % filled, gradient purple-to-teal
  - Inside: big score number in Syne bold e.g. "84%" — white, very large (56px)
  - Below number: "Quiz complete!" — DM Sans #8B8FA8
- Module name above circle: "English B1 — Quiz Results" Syne 24px white

RESULT INTERPRETATION:
- A badge below the circle showing rating:
  - 90-100%: "🏆 Excellent!" — gold color
  - 70-89%: "🎯 Good job!" — teal color
  - 50-69%: "📚 Keep studying!" — yellow
  - <50%: "💪 More practice needed!" — red
- Text in Syne bold

STATS ROW (3 mini cards in a row):
- "✓ 17 Correct" — teal
- "✗ 3 Incorrect" — red
- "⏱ 4:32" — time taken, purple
Each: #1A1D2E, rounded 12px, JetBrains Mono for number, DM Sans for label

ACTION BUTTONS (2 buttons, side by side):
- "Try Again" — outline #6C63FF, rounded 10px, DM Sans
- "Study Flashcards" — solid #6C63FF, rounded 10px, DM Sans

DETAILED BREAKDOWN (below buttons):
- Section title: "Question Breakdown" — Syne bold, left aligned
- List of all questions:
  Each row:
    - Left: ✓ or ✗ icon (teal or red circle)
    - Question text — DM Sans white
    - Your answer: green text if correct, red if wrong
    - Correct answer: shown in teal if you were wrong
  Rows separated by thin dividers, alternating very slightly in background shade
  Scrollable if many questions

BOTTOM:
- "← Back to module" link — DM Sans, #8B8FA8
```

---

## 📄 Промт 9b — Flashcard Session Complete (Итог сессии карточек)

```
Design the **end-of-session summary screen for the Flashcards mode** in "QuizoO". Shown when the user finishes a flashcard session (no score — user only self-marked "Knew" / "Didn't know"). This is NOT a "results" page like the quiz; it is a short summary and next actions.

CONTEXT: In flashcard mode there is no "correct/incorrect" — the user flips cards and marks "Knew" or "Didn't know". Cards marked "Didn't know" were repeated in the stack. So the summary is: how many cards were seen, how many marked "Knew", how many "Didn't know" (repeated). No percentage score, no per-card breakdown.

ATMOSPHERE: Calm, encouraging, minimal. Dark theme. Feels like "session done, here's a quick recap."

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA for "known" stat, #8B8FA8 muted text

FONTS: Syne (title), DM Sans (body, labels), JetBrains Mono (numbers)

LAYOUT (centered, compact):

TITLE:
- "Session complete" or "Done! 👋" — Syne bold, white, 28–32px
- Module name below: e.g. "English B1" — DM Sans #8B8FA8

STATS ROW (2–3 mini cards in a row, no big circle):
- "Cards reviewed: 24" — JetBrains Mono number, DM Sans label
- "✓ Knew: 20" — teal #00D4AA
- "✗ To review again: 4" or "Repeated: 4" — muted or soft red, meaning "you marked these as didn't know"
Each stat: #1A1D2E, rounded 12px, same style as app

ACTION BUTTONS (2 buttons, side by side):
- "← Back to module" — outline/ghost, DM Sans
- "Study again" or "Repeat" — solid #6C63FF, primary

BOTTOM:
- Optional: "View statistics" or "My modules" text link — DM Sans #8B8FA8

No score ring, no question-by-question breakdown. Keep it short and clear.
```

---

## 📄 Промт 10 — Statistics Page (Страница статистики)

```
Design a statistics/progress page for "QuizoO" where users see their overall learning progress.

ATMOSPHERE: Data-driven but warm. Dark with colorful charts. Feels like a personal analytics dashboard. Motivating.

COLORS: #0F1117 background, #1A1D2E chart panels, #6C63FF purple, #00D4AA teal, #FF5C5C red for errors

FONTS: Syne (section titles), DM Sans (labels), JetBrains Mono (numbers/stats)

LAYOUT:

TOP NAVBAR: same consistent navbar, theme toggle top right

PAGE TITLE:
- "Your Progress" — Syne bold 36px white left aligned
- Subtitle: "Track how your knowledge grows over time" — DM Sans #8B8FA8

TOP STATS ROW (4 cards):
- "Total Sessions: 47" — purple icon
- "Cards Studied: 842" — teal icon
- "Avg Quiz Score: 79%" — green icon
- "Study Streak: 🔥 8 days" — orange icon
Each: #1A1D2E, rounded 16px, large JetBrains Mono number, DM Sans label, small icon top-left

MAIN CHART (full width, below stats):
- Panel: #1A1D2E, rounded 16px, padding
- Title: "Quiz Score Over Time" — Syne bold white left aligned
- Chart type: line chart with area fill
  - X axis: dates
  - Y axis: score %
  - Line: #6C63FF with a soft purple gradient fill below
  - Data points: small circles, pulse glow on hover
- Time filter pills top-right of chart: "7 days" | "30 days" | "All time" — active pill: solid purple, inactive: outline

MODULE BREAKDOWN TABLE (below chart):
- Title: "Performance by Module" — Syne bold
- Table design:
  - Headers: "Module", "Sessions", "Best Score", "Last Studied" — DM Sans bold #8B8FA8, small caps
  - Rows: white text, DM Sans, alternating background #1A1D2E / #161926
  - "Best Score" shown as a colored pill: green if >80%, yellow if >60%, red if <60%
  - "Last Studied" in JetBrains Mono, muted
  - Rounded table container, no hard borders inside

WEAK CARDS SECTION:
- Title: "Cards to review 🔁" — Syne bold
- Cards that had most wrong answers across sessions
- List of 5-8 card rows:
  - Question text | "X times wrong" in red JetBrains Mono | "Study" link in purple
```

---

## 📄 Промт 11 — Admin Dashboard (Панель администратора)

```
Design an admin dashboard for "QuizoO". The admin manages users and modules of the platform.

ATMOSPHERE: Professional, utilitarian but still on-brand dark theme. Data-heavy. Feels like a control center.

COLORS: Same palette — #0F1117, #1A1D2E, #6C63FF, #00D4AA, #FF5C5C for danger actions

FONTS: Syne (page titles), DM Sans (table data, labels), JetBrains Mono (numbers, IDs)

LAYOUT:

LEFT SIDEBAR (fixed, collapsible):
- Top: "QuizoO" logo + "ADMIN" badge in red pill
- Navigation items (icon + label):
  - 🏠 Dashboard
  - 👥 Users
  - 📚 Modules
  - 📊 Analytics (greyed — future)
- Bottom: avatar + admin username + "Logout" link
- Background: #1A1D2E, border-right 1px #222640

MAIN CONTENT AREA (to the right of sidebar):

PAGE: ADMIN DASHBOARD (overview)
- Page title: "Admin Overview" — Syne bold, white

STAT CARDS ROW (4 cards):
- Total Users: 1,240
- Total Modules: 5,880
- Sessions Today: 320
- Flagged Content: 3 (in red with warning icon)

RECENT USERS TABLE (below stats):
- Title: "Recently Registered Users"
- Columns: Avatar+Name, Email, Join Date, Modules Count, Status, Actions
- Status badge: "Active" green pill | "Blocked" red pill
- Actions column: "Block" (red text button) | "View" (purple text button)
- Table: #1A1D2E, alternating row shades, DM Sans, JetBrains Mono for dates

RECENT MODULES TABLE (below users):
- Title: "Recently Created Modules"
- Columns: Module Title, Created By, Cards Count, Created At, Actions
- Actions: "Delete" (red, with confirm modal) | "View" (purple)

THEME TOGGLE: top-right of main content header bar (sun/moon icon)
```

---

## 📄 Промт 12 — Admin Users Page (Управление пользователями)

```
Design the users management page for the "QuizoO" admin panel.

ATMOSPHERE: Clean data table. Professional. Dark theme consistent with admin panel.

COLORS: #0F1117 / #1A1D2E / #6C63FF / #FF5C5C (block action) / #00D4AA (active status)

FONTS: Syne (page title), DM Sans (table content), JetBrains Mono (IDs, dates)

LAYOUT (with same left sidebar as admin dashboard):

PAGE TITLE ROW:
- Left: "Users" — Syne bold 32px white
- Right: search input "Search by name or email..." + filter dropdown "All / Active / Blocked"

FULL WIDTH USERS TABLE:
Columns:
- # (row number, JetBrains Mono, muted)
- User (avatar circle with initials + username + email below, two-line)
- Role: "user" or "admin" — pill badge, purple for admin, gray for user
- Modules: number in JetBrains Mono
- Joined: date in JetBrains Mono, muted
- Status: "Active" green pill | "Blocked" red pill
- Actions: "Block" red text button | "Unblock" teal text button | "View modules" purple text button

TABLE STYLE:
- Container: #1A1D2E, rounded 16px
- Row height: comfortable, 64px
- Row hover: background slightly lighter, actions become more visible
- Dividers: 1px #222640 between rows
- Pagination at bottom: "← Previous | Page 1 of 12 | Next →" — DM Sans, purple active page

CONFIRM MODAL (appears when "Block" clicked):
- Dark overlay background
- Modal card: #1A1D2E, rounded 16px, centered
- Warning icon in red circle
- Title: "Block this user?" — Syne bold
- Text: "They will lose access to their account immediately." — DM Sans #8B8FA8
- Buttons: "Cancel" outline | "Block User" solid red

THEME TOGGLE: top-right corner of header
```

# Чеклист разработки (файл checklist.md без дубля «Текущее состояние» и без блока «План разработки»)

# QuizoO — чеклист

Обновлено: 29 апреля 2026. Фронт: React Router, Redux Toolkit + RTK Query, axios, Tailwind, shadcn/ui.

Альтернативная нумерация этапов курсовой с пометкой `(*)`: [`archive/checklist-legacy-stages.md`](./archive/checklist-legacy-stages.md).

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

---

> **Примечание.** Развёрнутый учебный план с примерами кода после строки `# План разработки` в файле `docs/checklist.md` здесь не дублируется (~1500+ строк). Для пошаговых инструкций этапов открывайте исходный `docs/checklist.md`.

# Приложение A — актуальный `docker-compose.yml` (корень репозитория)

```yaml
services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-quizoo_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-quizoo_pass}
      POSTGRES_DB: ${POSTGRES_DB:-quizoo}
    ports:
      - '5432:5432'
    volumes:
      - postgres18_data:/var/lib/postgresql
    networks:
      - app-network

  backend:
    build:
      context: ./backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-quizoo_user}:${POSTGRES_PASSWORD:-quizoo_pass}@postgres:5432/${POSTGRES_DB:-quizoo}?schema=public
      PORT: 3001
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET:-local_docker_dev_secret_change_me}
      AUTH_RETURN_VERIFICATION_CODE: ${AUTH_RETURN_VERIFICATION_CODE:-false}
      CORS_ORIGIN: ${CORS_ORIGIN:-https://localhost,http://localhost}
      AUTH_FRONTEND_URL: ${AUTH_FRONTEND_URL:-https://localhost}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
      GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI:-}
    depends_on:
      - postgres
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - app-network

  frontend-builder:
    build:
      context: ./frontend
    volumes:
      - frontend_dist:/out
    networks:
      - app-network

  nginx:
    image: nginx:1.28-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - frontend_dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
      - frontend-builder
    networks:
      - app-network

volumes:
  postgres18_data:
  frontend_dist:
  backend_uploads:

networks:
  app-network:
    driver: bridge
```

# Приложение B — `backend/prisma/schema.prisma` (источник правды по БД)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Click {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  username      String?
  role          UserRole @default(USER)
  isBlocked     Boolean  @default(false)
  oauthProvider String?
  oauthId       String?

  emailVerified Boolean @default(false)

  emailVerificationCode      String?
  emailVerificationExpiresAt DateTime?

  passwordResetCode      String?
  passwordResetExpiresAt DateTime?

  avatarMime String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  modules             Module[]
  flashcardSessions   FlashcardSession[]
  quizSessions        QuizSession[]

  @@unique([oauthProvider, oauthId])
  @@map("users")
}

enum ModuleType {
  FLASHCARD
  QUIZ
}

enum QuestionType {
  CHOICE
  TEXT
  MATCHING
}

model Module {
  id          String     @id @default(cuid())
  userId      String
  title       String
  description String?
  type        ModuleType
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards             Card[]
  questions         Question[]
  flashcardSessions FlashcardSession[]
  quizSessions      QuizSession[]

  @@index([userId])
  @@map("modules")
}

model Card {
  id         String   @id @default(cuid())
  moduleId   String
  question   String
  answer     String
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())

  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@index([moduleId])
  @@map("cards")
}

model Question {
  id           String       @id @default(cuid())
  moduleId     String
  questionText String
  type         QuestionType
  allowMultipleAnswers Boolean @default(false)
  questionImageMime String?
  orderIndex   Int          @default(0)
  createdAt    DateTime     @default(now())

  module          Module           @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  matchingPairs   MatchingPair[]
  questionOptions QuestionOption[]
  quizAnswers     QuizAnswer[]

  @@index([moduleId])
  @@map("questions")
}

model MatchingPair {
  id         String @id @default(cuid())
  questionId String
  leftItem   String
  rightItem  String

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("matching_pairs")
}

model QuestionOption {
  id         String  @id @default(cuid())
  questionId String
  text       String
  isCorrect  Boolean @default(false)

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("question_options")
}

model FlashcardSession {
  id           String    @id @default(cuid())
  userId       String
  moduleId     String
  totalCards   Int
  knownCount   Int
  unknownCount Int
  completedAt  DateTime?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([moduleId])
  @@map("flashcard_sessions")
}

model QuizSession {
  id             String    @id @default(cuid())
  userId         String
  moduleId       String
  totalQuestions Int
  correctCount   Int
  scorePercent   Float
  completedAt    DateTime?

  user    User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  module  Module       @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  answers QuizAnswer[]

  @@index([userId])
  @@index([moduleId])
  @@map("quiz_sessions")
}

model QuizAnswer {
  id         String  @id @default(cuid())
  sessionId  String
  questionId String
  userAnswer String?
  isCorrect  Boolean

  session  QuizSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, questionId])
  @@index([sessionId])
  @@index([questionId])
  @@map("quiz_answers")
}
```

# Приложение C — реализованные расширения сверх текстовых ТЗ в `docs/`

- **Уникальность названия модуля** у пользователя (без учёта регистра), автогенерация имён по умолчанию, ответ **409 Conflict** при дубликате при переименовании.
- **Порядок вопросов квиза:** перетаскивание (DnD) в редакторе с сохранением `orderIndex`.
- **Иллюстрация к вопросу квиза:** одно изображение на вопрос, поле `questionImageMime`, файлы под `/app/uploads`, том **`backend_uploads`** в Compose; ограничения размера/типов задаются на бэкенде.
- **Навигация:** отдельная страница Settings убрана из меню; маршрут может перенаправляться на `/app`.
- **Multipart (FormData):** глобальный `Content-Type: application/json` на HTTP-клиенте ломает загрузку файлов — для FormData заголовок не должен быть принудительно JSON.

**Расхождения документов и кода:** NestJS в доках часто «10», в `backend/package.json` — **v11**. В ER-диаграммах записки добавьте **`allowMultipleAnswers`**, **`questionImageMime`** для `questions`. Чекбоксы в `checklist.md` могут быть устаревшими относительно фактической реализации.
