-- CreateEnum
CREATE TYPE "XpActivity" AS ENUM ('FLASHCARD', 'QUIZ', 'RETRY', 'ASSIGNMENT');

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activity" "XpActivity" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xp_events_activity_sourceId_key" ON "xp_events"("activity", "sourceId");

-- CreateIndex
CREATE INDEX "xp_events_userId_idx" ON "xp_events"("userId");

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
