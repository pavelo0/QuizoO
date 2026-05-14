6. Руководство программиста

Настоящее руководство описывает порядок развёртывания веб-приложения QuizoO в локальной среде разработки и проверки его работоспособности. Приложение представляет собой клиент-серверную систему, включающую одностраничное веб-приложение, серверную часть, базу данных PostgreSQL и обратный прокси-сервер Nginx. Для развёртывания основной конфигурации используется контейнеризация на базе Docker Compose.

6.1 Требования к среде

Для развёртывания приложения необходимо наличие следующего программного обеспечения: Git, Node.js версии 20 и выше, npm версии 10 и выше, Docker Desktop либо Docker Engine с Compose v2, а также OpenSSL для генерации самоподписанного TLS-сертификата. Для работы с базой данных и миграциями также используется Prisma CLI, входящая в зависимости серверной части проекта.

Разработка и тестирование могут выполняться на операционных системах macOS и Linux, в том числе Ubuntu 22.04 и выше. Репозиторий QuizoO не содержит конфигурации WSL и не требует её. На Windows типичен Docker Desktop (часто с подсистемой WSL 2 на стороне Docker, а не проекта). Установка Node.js и Git возможна нативно или в дистрибутиве WSL по выбору разработчика.

6.2 Состав проекта

Приложение QuizoO включает несколько основных компонентов. Клиентская часть реализована как SPA-приложение на базе React 19, Vite 7, TypeScript и Tailwind CSS 4, серверная часть разработана на NestJS 11 с использованием Prisma 6, а хранение данных осуществляется в PostgreSQL 18. Обработка HTTPS-запросов и проксирование API выполняются через Nginx, настроенный как TLS reverse proxy.

В корневой директории проекта располагаются файлы docker-compose.yml, .env.example, каталоги frontend/ и backend/, а также конфигурация Nginx (nginx/nginx.conf) и каталог для сертификатов nginx/certs/. В серверной части содержатся схема Prisma (backend/prisma/schema.prisma), миграции базы данных и API-логика; в клиентской части — маршрутизация SPA, UI-компоненты и вызов API. При сборке через Compose образ frontend-builder записывает статику во внутренний том frontend_dist, который монтируется в контейнер nginx; том backend_uploads используется для загружаемых файлов (аватары, изображения вопросов).

6.3 Порядок развёртывания

Развёртывание приложения в контейнерной среде выполняется в несколько этапов.

Этап 1. Клонирование репозитория и настройка окружения

На первом этапе необходимо клонировать репозиторий проекта и создать файл переменных окружения в корне проекта на основе шаблона .env.example. Команды для подготовки рабочей директории представлены в листинге 6.1.

git clone <URL_репозитория>
cd QuizoO
cp .env.example .env

Листинг 6.1 – Команды для клонирования репозитория и копирования примеров файлов переменных окружения

Шаблон .env.example в корне задаёт переменные для Docker Compose и подстановки в сервис backend. В таблице 6.1 перечислены ключи корневого файла окружения.

Таблица 6.1 – Переменные корневого файла .env

Переменная Описание Пример значения
POSTGRES_USER Пользователь БД quizoo_user
POSTGRES_PASSWORD Пароль БД quizoo_pass
POSTGRES_DB Имя БД quizoo
JWT_SECRET Секрет подписи JWT длинная случайная строка
AUTH_RETURN_VERIFICATION_CODE При значении true код верификации или сброса может возвращаться в JSON-ответах API false
CORS_ORIGIN Разрешённые Origin через запятую https://localhost,http://localhost
AUTH_FRONTEND_URL Базовый URL фронта для редиректов после OAuth https://localhost
GOOGLE_CLIENT_ID Идентификатор клиента Google OAuth из Google Cloud
GOOGLE_CLIENT_SECRET Секрет клиента Google OAuth из Google Cloud
GOOGLE_REDIRECT_URI Callback URI для Google (можно оставить пустым) пусто или http://localhost:3001/api/auth/google/callback либо https://localhost/api/auth/google/callback в зависимости от схемы доступа к API

Переменные DATABASE_URL, PORT и NODE_ENV в корневом .env.example не задаются: их для контейнера backend формирует docker-compose.yml. Строка подключения Prisma в Compose имеет вид postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public. Для локального запуска backend без Compose используется backend/.env по образцу backend/.env.example.

Этап 2. Генерация TLS-сертификата

Для локального запуска по HTTPS необходимо сгенерировать самоподписанный сертификат и ключ для Nginx. Команды представлены в листинге 6.2.

mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
 -keyout nginx/certs/key.pem \
 -out nginx/certs/cert.pem \
 -subj "/CN=localhost"

Листинг 6.2 – Команды для генерации самоподписанного TLS-сертификата

Файлы key.pem и cert.pem размещаются в nginx/certs/. Nginx обслуживает статику по HTTPS и проксирует префикс /api/ на сервис backend:3001.

Этап 3. Запуск контейнеров и миграции базы данных

При сборке контейнер frontend-builder формирует статику и завершает работу; backend запускает NestJS; nginx слушает порты 80 и 443. Команда запуска представлена в листинге 6.3.

docker compose up --build -d

Листинг 6.3 – Сборка и запуск стека Docker Compose

Миграции Prisma применяются при старте контейнера backend (команда npx prisma migrate deploy && node dist/main.js в backend/Dockerfile). Повторный ручной вызов docker compose exec backend npx prisma migrate deploy не обязателен.

После старта приложение доступно по адресу https://localhost. Полная очистка томов: docker compose down -v (тома БД, фронта, uploads).

Этап 4. Альтернативный запуск без полного Docker Compose

PostgreSQL — отдельный сервис Compose (docker compose up postgres -d) или локальная установка.

Локальный запуск серверной части — листинг 6.4.

cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev

Листинг 6.4 – Локальный запуск серверной части

При изменении схемы БД вместо migrate deploy используют npx prisma migrate dev. API: http://localhost:3001, префикс маршрутов /api.

Локальный запуск клиентской части — листинг 6.5.

cd frontend
npm install
npm run dev

Листинг 6.5 – Локальный запуск клиентской части

После npm run dev интерфейс открывается на http://localhost:3000 (порт задаётся в vite.config.ts); запросы с префиксом /api проксируются на http://localhost:3001. Файл frontend/.env в этом сценарии обычно не нужен; создают его при необходимости задать переменную VITE_API_URL.

Через Docker пользователь открывает https://localhost (порт 443); порт 80 перенаправляет на HTTPS — доступ к интерфейсу не через :3000.

Для согласования CORS при локальном фронте и backend в backend/.env часто указывают CORS_ORIGIN=http://localhost:3000 (см. backend/.env.example).

6.4 Проверка работоспособности

Таблица 6.2 – Порядок проверки работоспособности

№ Проверка Команда или действие Ожидаемый результат
1 Статус контейнеров docker compose ps Сервисы postgres, backend, nginx — running; frontend-builder после сборки часто в статусе Exited (0)
2 Интерфейс Открыть https://localhost в браузере Стартовая страница QuizoO
3 API curl -k https://localhost/api/health JSON со статусом сервиса
4 Авторизация curl -k https://localhost/api/users/me Ответ 401 без cookie сессии
5 БД docker compose exec postgres psql -U quizoo_user -d quizoo -c "\dt" Список таблиц (подставить свои POSTGRES_USER и POSTGRES_DB из .env)
6 Логи backend docker compose logs backend Нет фатальных ошибок после миграций и старта
7 Регистрация Страница /auth/register Учётная запись создаётся; код подтверждения — в логах backend или в ответе API при AUTH_RETURN_VERIFICATION_CODE=true

Проверка охватывает контейнеры, интерфейс по HTTPS, API, базу данных и сценарий регистрации. Отправка кодов по реальной почте в типовой конфигурации может не использоваться.

Просмотр логов — листинг 6.6.

docker compose logs postgres
docker compose logs backend
docker compose logs nginx

Листинг 6.6 – Просмотр журналов контейнеров

6.5 Запуск автоматизированных тестов

Из каталога backend (листинг 6.7):

cd backend
npm install
npm run test
npm run test:cov
npm run test:e2e

Листинг 6.7 – Тесты серверной части (Jest)

Отчёт о покрытии после npm run test:cov формируется в каталоге backend/coverage/.

Для фронтенда: npm run build и npm run preview в каталоге frontend/. В корне монорепозитория: npm run lint, npm run type-check, npm run check (см. корневой package.json).

6.6 Выводы по разделу

В разделе зафиксированы:

— требования к среде (Git, Node.js 20+, npm, Docker Compose, OpenSSL) и уточнение по Windows и WSL (WSL не является частью репозитория);

— состав проекта QuizoO и роль сервисов Compose;

— порядок настройки корневого .env, генерации сертификатов, запуска docker compose up --build -d и автоматических миграций при старте backend;

— локальный режим разработки (backend на порту 3001, Vite на 3000 с прокси /api) и отличие от доступа через Nginx (https://localhost);

— контрольный список проверки и команды просмотра логов;

— запуск тестов Jest и расположение backend/coverage/.

Руководство относится к приложению QuizoO; точное число тестовых кейсов зависит от версии репозитория и проверяется командой npm run test в каталоге backend.
