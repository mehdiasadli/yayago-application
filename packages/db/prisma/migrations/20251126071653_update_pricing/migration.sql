/*
  Warnings:

  - You are about to drop the column `monthlyDiscount` on the `listing_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `threeDayDiscount` on the `listing_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyDiscount` on the `listing_pricing` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PartialDayPolicy" AS ENUM ('ROUND_UP_FULL_DAY', 'CHARGE_HOURLY');

-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('PRO_RATE');

-- AlterTable
ALTER TABLE "listing_pricing" DROP COLUMN "monthlyDiscount",
DROP COLUMN "threeDayDiscount",
DROP COLUMN "weeklyDiscount",
ADD COLUMN     "acceptsSecurityDepositWaiver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dynamicPricingRules" JSONB,
ADD COLUMN     "partialDayPolicy" "PartialDayPolicy" NOT NULL DEFAULT 'ROUND_UP_FULL_DAY',
ADD COLUMN     "pricePerHour" DOUBLE PRECISION,
ADD COLUMN     "pricePerMonth" DOUBLE PRECISION,
ADD COLUMN     "pricePerThreeDays" DOUBLE PRECISION,
ADD COLUMN     "pricePerWeek" DOUBLE PRECISION,
ADD COLUMN     "pricingMode" "PricingMode" NOT NULL DEFAULT 'PRO_RATE',
ADD COLUMN     "securityDepositAmount" DOUBLE PRECISION,
ADD COLUMN     "securityDepositRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "securityDepositWaiverCost" DOUBLE PRECISION,
ADD COLUMN     "taxRate" DOUBLE PRECISION;
