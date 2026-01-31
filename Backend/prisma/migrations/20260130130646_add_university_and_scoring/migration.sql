/*
  Warnings:

  - You are about to drop the column `lockedUniversities` on the `onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `shortlistedUniversities` on the `onboarding` table. All the data in the column will be lost.
  - The `gpa` column on the `onboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `budget` column on the `onboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_userId_fkey";

-- AlterTable
ALTER TABLE "onboarding" DROP COLUMN "lockedUniversities",
DROP COLUMN "shortlistedUniversities",
ADD COLUMN     "greScore" INTEGER,
ADD COLUMN     "profileAnalysis" TEXT,
DROP COLUMN "gpa",
ADD COLUMN     "gpa" DOUBLE PRECISION,
DROP COLUMN "budget",
ADD COLUMN     "budget" INTEGER;

-- DropTable
DROP TABLE "tasks";

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "ranking" INTEGER,
    "minScore" INTEGER,
    "fees" INTEGER,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'External',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Shortlisted" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Shortlisted_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Locked" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Locked_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_country_key" ON "universities"("name", "country");

-- CreateIndex
CREATE INDEX "_Shortlisted_B_index" ON "_Shortlisted"("B");

-- CreateIndex
CREATE INDEX "_Locked_B_index" ON "_Locked"("B");

-- AddForeignKey
ALTER TABLE "_Shortlisted" ADD CONSTRAINT "_Shortlisted_A_fkey" FOREIGN KEY ("A") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Shortlisted" ADD CONSTRAINT "_Shortlisted_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Locked" ADD CONSTRAINT "_Locked_A_fkey" FOREIGN KEY ("A") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Locked" ADD CONSTRAINT "_Locked_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
