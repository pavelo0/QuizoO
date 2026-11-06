-- AlterTable
ALTER TABLE "modules" ADD COLUMN "customScoring" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "quiz_sessions" ADD COLUMN "pointsEarned" DOUBLE PRECISION,
ADD COLUMN "pointsMax" INTEGER;
