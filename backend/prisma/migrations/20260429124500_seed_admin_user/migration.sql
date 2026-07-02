-- Создание/проверка локальной учетной записи администратора для доступа к админ-панели.
-- Email:    admin@quizo.local
-- Пароль:   Admin12345!
--
-- Безопасное поведение:
-- - добавляет администратора, если его еще нет;
-- - если пользователь с таким email уже существует, повышает роль до ADMIN,
--   снимает блокировку и подтверждает email;
-- - не перезаписывает passwordHash у существующей записи.

INSERT INTO "users" (
  "id",
  "email",
  "passwordHash",
  "username",
  "role",
  "isBlocked",
  "emailVerified",
  "createdAt",
  "updatedAt"
)
VALUES (
  'seed_admin_user',
  'admin@quizo.local',
  '$2b$10$u1JSZ71R.cvOzV0KnZcoDOPKdHBwIyz4Z.U/45Z2fAR24Ot68I9xq',
  'Администратор QuizoO',
  'ADMIN',
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("email")
DO UPDATE SET
  "role" = 'ADMIN',
  "isBlocked" = false,
  "emailVerified" = true,
  "updatedAt" = NOW();
