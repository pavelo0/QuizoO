-- CreateTable
CREATE TABLE "study_sets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_set_modules" (
    "setId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "study_set_modules_pkey" PRIMARY KEY ("setId","moduleId")
);

-- CreateIndex
CREATE INDEX "study_sets_userId_idx" ON "study_sets"("userId");

-- CreateIndex
CREATE INDEX "study_set_modules_moduleId_idx" ON "study_set_modules"("moduleId");

-- AddForeignKey
ALTER TABLE "study_sets" ADD CONSTRAINT "study_sets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_set_modules" ADD CONSTRAINT "study_set_modules_setId_fkey" FOREIGN KEY ("setId") REFERENCES "study_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_set_modules" ADD CONSTRAINT "study_set_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
