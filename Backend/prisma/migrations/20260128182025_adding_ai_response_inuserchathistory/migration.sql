/*
  Warnings:

  - Added the required column `response` to the `userChatHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "userChatHistory" ADD COLUMN     "response" TEXT NOT NULL;
