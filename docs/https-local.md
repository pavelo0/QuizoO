# Локальный HTTPS без зачеркнутого замка (macOS)

Этот гайд нужен для разработки, чтобы `https://localhost` открывался как доверенный, без предупреждения браузера.

## Коротко

- Для Nginx в проекте нужны файлы `nginx/certs/cert.pem` и `nginx/certs/key.pem`.
- Самоподписанный сертификат через `openssl` работает, но обычно показывает предупреждение.
- Чтобы замок не был зачеркнут, лучше выпустить локальный сертификат через `mkcert` и доверить его в системе.

## Вариант 1 (рекомендуется): `mkcert`

### 1) Установить `mkcert`

Через Homebrew:

```bash
brew install mkcert nss
```

### 2) Установить локальный корневой CA

```bash
mkcert -install
```

Команда добавит локальный сертификат в системное хранилище доверия macOS.
На macOS может запроситься пароль администратора (через `sudo`/Keychain prompt) — это ожидаемо.

### 3) Выпустить сертификат для localhost

Из корня проекта:

```bash
mkdir -p nginx/certs
mkcert -cert-file nginx/certs/cert.pem -key-file nginx/certs/key.pem localhost 127.0.0.1 ::1
```

### 4) Перезапустить стек

```bash
docker compose up --build -d
```

### 5) Проверить

- Открой `https://localhost`.
- Нажми на значок замка в браузере: сертификат должен быть валидным для `localhost`.

## Вариант 2: `openssl` (если `mkcert` не используешь)

```bash
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out nginx/certs/cert.pem \
  -subj "/CN=localhost"
```

После этого сертификат нужно вручную доверить в `Keychain Access` (Связка ключей):

1. Открыть `Keychain Access`.
2. Импортировать `nginx/certs/cert.pem` в связку `System`.
3. Открыть сертификат -> `Trust` -> `When using this certificate` = `Always Trust`.
4. Перезапустить браузер.

Без этого шага браузер обычно показывает предупреждение и зачеркнутый `https`.

## Частые проблемы

- **Старый сертификат кешируется браузером**: перезапусти браузер полностью.
- **Nginx не стартует**: проверь, что существуют оба файла: `cert.pem` и `key.pem`.
- **Сертификат не подходит домену**: убедись, что открываешь именно `https://localhost`, а не другой host.
- **После mkcert всё еще красный `https`**: корневой CA не установлен в доверенные.
  - Запусти `mkcert -install` в обычном терминале macOS и подтверди пароль.
  - Если нужно вручную: открой `$(mkcert -CAROOT)` и импортируй `rootCA.pem` в `System` keychain, затем поставь `Always Trust`.

## Безопасность

- Не коммить `nginx/certs/*.pem` в git.
- Локальные сертификаты используй только для разработки.

Связанные документы: [`docs/docker-stack-guide.md`](./docker-stack-guide.md), [`nginx/certs/README.md`](../nginx/certs/README.md).
