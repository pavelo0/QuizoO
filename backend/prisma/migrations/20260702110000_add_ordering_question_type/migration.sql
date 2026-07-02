-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'ORDERING';

-- CreateTable
CREATE TABLE "ordering_items" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "correctOrder" INTEGER NOT NULL,

    CONSTRAINT "ordering_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ordering_items_questionId_idx" ON "ordering_items"("questionId");

-- AddForeignKey
ALTER TABLE "ordering_items" ADD CONSTRAINT "ordering_items_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
