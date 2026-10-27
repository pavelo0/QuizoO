-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'FILL_BLANK';

-- CreateTable
CREATE TABLE "fill_blanks" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "blankIndex" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "acceptedVariants" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "fill_blanks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fill_blanks_questionId_idx" ON "fill_blanks"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "fill_blanks_questionId_blankIndex_key" ON "fill_blanks"("questionId", "blankIndex");

-- AddForeignKey
ALTER TABLE "fill_blanks" ADD CONSTRAINT "fill_blanks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
