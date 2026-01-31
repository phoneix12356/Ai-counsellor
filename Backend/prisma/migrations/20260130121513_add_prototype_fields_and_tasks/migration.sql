-- AlterTable
ALTER TABLE "onboarding" ADD COLUMN     "currentStage" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lockedUniversities" JSONB DEFAULT '[]',
ADD COLUMN     "profileScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shortlistedUniversities" JSONB DEFAULT '[]',
ADD COLUMN     "universityRecommendations" JSONB;

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "category" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
