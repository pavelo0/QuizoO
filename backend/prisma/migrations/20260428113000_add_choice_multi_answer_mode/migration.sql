-- AlterTable
ALTER TABLE "questions"
ADD COLUMN "allowMultipleAnswers" BOOLEAN NOT NULL DEFAULT false;
