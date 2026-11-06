-- CreateTable
CREATE TABLE "quiz_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_assignments_code_key" ON "quiz_assignments"("code");

-- CreateIndex
CREATE INDEX "quiz_assignments_userId_idx" ON "quiz_assignments"("userId");

-- CreateIndex
CREATE INDEX "quiz_assignments_moduleId_idx" ON "quiz_assignments"("moduleId");

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "quiz_sessions" ADD COLUMN "assignmentId" TEXT;

-- CreateIndex
CREATE INDEX "quiz_sessions_assignmentId_idx" ON "quiz_sessions"("assignmentId");

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "quiz_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
