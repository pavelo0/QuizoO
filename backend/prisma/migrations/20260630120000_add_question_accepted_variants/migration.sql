-- AlterTable
ALTER TABLE "questions" ADD COLUMN "acceptedVariants" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Demo TEXT question: capital of France accepts Latin spelling
UPDATE "questions"
SET "acceptedVariants" = ARRAY['Paris', 'paris']
WHERE "id" = 'seed_ru_quiz_q03';
