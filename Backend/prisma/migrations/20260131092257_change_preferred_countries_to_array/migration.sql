/*
  Warnings:

  - The `preferredCountries` column on the `onboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "onboarding" DROP COLUMN "preferredCountries",
ADD COLUMN     "preferredCountries" TEXT[];
