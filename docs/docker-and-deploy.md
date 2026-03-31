# Docker, Nginx и деплой QuizoO

> Этот файл — шпаргалка по контейнеризации и публикации проекта.  
> Docker и деплой — **этап 26** чеклиста. Сначала пиши приложение, потом сюда.

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

Три контейнера, один `docker-compose.yml`. Nginx — единственная точка входа снаружи.

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
