/*
  Warnings:

  - You are about to drop the column `canceledAt` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodEnd` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodStart` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `subscription` table. All the data in the column will be lost.
  - Added the required column `plan` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_userId_fkey";

-- DropIndex
DROP INDEX "subscription_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "canceledAt",
DROP COLUMN "createdAt",
DROP COLUMN "planName",
DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCurrentPeriodStart",
DROP COLUMN "stripePriceId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "plan" TEXT NOT NULL,
ADD COLUMN     "referenceId" TEXT NOT NULL,
ADD COLUMN     "seats" INTEGER,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "trialStart" TIMESTAMP(3),
ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;
