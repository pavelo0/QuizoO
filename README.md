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
├── frontend/           # SPA (Vite)
├── backend/            # API NestJS, Prisma
├── nginx/              # nginx.conf, каталог certs/ для TLS
├── docs/               # документация и чеклисты
├── docker-compose.yml  # postgres, backend, frontend-builder, nginx
├── .env.example        # шаблон переменных для Compose
└── package.json        # workspaces, общие скрипты форматирования и линта
```

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
   ```

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
