/*
  Warnings:

  - You are about to drop the column `budget` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `educationLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fieldOfStudy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fundingPlan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gpa` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `graduationYear` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `greStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `intakeYear` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `intendedDegree` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `major` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferredCountries` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sopStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `testStatus` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "budget",
DROP COLUMN "educationLevel",
DROP COLUMN "fieldOfStudy",
DROP COLUMN "fundingPlan",
DROP COLUMN "gpa",
DROP COLUMN "graduationYear",
DROP COLUMN "greStatus",
DROP COLUMN "intakeYear",
DROP COLUMN "intendedDegree",
DROP COLUMN "major",
DROP COLUMN "preferredCountries",
DROP COLUMN "sopStatus",
DROP COLUMN "testStatus";

-- CreateTable
CREATE TABLE "onboarding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "educationLevel" TEXT,
    "major" TEXT,
    "graduationYear" INTEGER,
    "gpa" TEXT,
    "intendedDegree" TEXT,
    "fieldOfStudy" TEXT,
    "intakeYear" INTEGER,
    "preferredCountries" TEXT,
    "budget" TEXT,
    "fundingPlan" TEXT,
    "testStatus" TEXT,
    "greStatus" TEXT,
    "sopStatus" TEXT,

    CONSTRAINT "onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userChatHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_userId_key" ON "onboarding"("userId");

-- AddForeignKey
ALTER TABLE "onboarding" ADD CONSTRAINT "onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userChatHistory" ADD CONSTRAINT "userChatHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
