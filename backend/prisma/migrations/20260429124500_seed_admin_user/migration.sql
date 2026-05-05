-- Seed/ensure local admin account for admin panel access.
-- Email:    admin@quizo.local
-- Password: Admin12345!
--
-- Safe behavior:
-- - inserts admin if missing
-- - if user already exists with this email, only elevates role and unblocks account
--   (does not overwrite passwordHash on existing rows)

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
  'QuizoO Admin',
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
