/*
  Warnings:

  - Changed the type of `status` on the `subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'PAUSED', 'TRIALING', 'UNPAID');

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "group" TEXT,
ADD COLUMN     "limits" JSONB,
ADD COLUMN     "priceId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL;
