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
