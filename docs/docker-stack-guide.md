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
```

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
