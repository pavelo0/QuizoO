-- Lab migration: Clerk → self-hosted auth (existing user rows are removed).
DELETE FROM "users";

ALTER TABLE "users" DROP COLUMN "clerkUserId";

ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT NOT NULL;

ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users" ADD COLUMN "emailVerificationCode" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerificationExpiresAt" TIMESTAMP(3);

ALTER TABLE "users" ADD COLUMN "passwordResetCode" TEXT;
ALTER TABLE "users" ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);
