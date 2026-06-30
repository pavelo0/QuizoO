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

Что показано
Снаружи у тебя есть пользовательский браузер, который ходит по HTTPS к Nginx. Внутри Docker Compose расположен контейнер proxy server / Nginx, где лежит React bundle и сертификат X.509, затем запросы по HTTP проксируются в контейнер application server с Node.js 20, NestJS 10 и Prisma ORM. Отдельно вынесен database server с PostgreSQL, к которому backend подключается по TCP.

Если разложить по ролям, получается так:

Browser — отображает React-приложение и выполняет клиентский JS-код.

Nginx / Proxy — отдает статические фронтенд-ассеты и выступает точкой входа для HTTPS.

Application Server — реализует бизнес-логику, REST API или другой backend-интерфейс, а Prisma работает как слой доступа к БД.

PostgreSQL — постоянное хранилище данных, недоступное пользователю напрямую.

Как идет запрос
Типичный сценарий по твоей схеме выглядит так:

Пользователь открывает сайт в браузере и идет по HTTPS на Nginx.

Nginx отдает React bundle как статический фронтенд.

Уже загруженный React в браузере отправляет API-запросы обратно на тот же домен, а Nginx пересылает их на NestJS по HTTP.

NestJS обрабатывает запрос, через Prisma обращается к PostgreSQL, получает данные и возвращает ответ клиенту.

То есть Nginx у тебя играет двойную роль: и static file server для SPA, и reverse proxy для backend API. Это стандартная и хорошая схема для деплоя React + NestJS.

Что в схеме правильно
Вот что у тебя сделано архитектурно верно:

Разделены ответственности: фронтенд, backend и БД живут отдельно.

База не торчит наружу: клиент общается только с приложением, а не напрямую с PostgreSQL.

Есть reverse proxy: Nginx — нормальная точка входа для TLS, маршрутизации и отдачи статики.

Backend отделен от frontend: это упрощает сопровождение, масштабирование и обновление.

Docker Compose подходит для локальной среды, pet-проекта, учебного проекта и даже небольшого production.
