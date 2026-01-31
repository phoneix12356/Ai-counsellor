/*
  Warnings:

  - You are about to drop the `_Locked` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Shortlisted` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Locked" DROP CONSTRAINT "_Locked_A_fkey";

-- DropForeignKey
ALTER TABLE "_Locked" DROP CONSTRAINT "_Locked_B_fkey";

-- DropForeignKey
ALTER TABLE "_Shortlisted" DROP CONSTRAINT "_Shortlisted_A_fkey";

-- DropForeignKey
ALTER TABLE "_Shortlisted" DROP CONSTRAINT "_Shortlisted_B_fkey";

-- DropTable
DROP TABLE "_Locked";

-- DropTable
DROP TABLE "_Shortlisted";

-- CreateTable
CREATE TABLE "shortlisted" (
    "userId" INTEGER NOT NULL,
    "universityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortlisted_pkey" PRIMARY KEY ("userId","universityId")
);

-- CreateTable
CREATE TABLE "locked" (
    "userId" INTEGER NOT NULL,
    "universityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locked_pkey" PRIMARY KEY ("userId","universityId")
);

-- AddForeignKey
ALTER TABLE "shortlisted" ADD CONSTRAINT "shortlisted_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlisted" ADD CONSTRAINT "shortlisted_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locked" ADD CONSTRAINT "locked_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locked" ADD CONSTRAINT "locked_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
