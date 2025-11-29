/*
  Warnings:

  - You are about to drop the column `displayName` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "displayName",
ADD COLUMN     "displayUsername" TEXT;
