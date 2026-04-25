-- AlterTable
ALTER TABLE "users" ADD COLUMN "oauthId" TEXT,
ADD COLUMN "oauthProvider" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_sessionId_questionId_key" ON "quiz_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauthProvider_oauthId_key" ON "users"("oauthProvider", "oauthId");
