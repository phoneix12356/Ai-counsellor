-- AlterTable
ALTER TABLE "onboarding" ALTER COLUMN "preferredCountries" DROP NOT NULL,
ALTER COLUMN "preferredCountries" SET DATA TYPE TEXT;
