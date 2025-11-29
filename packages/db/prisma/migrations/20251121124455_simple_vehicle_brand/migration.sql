/*
  Warnings:

  - You are about to drop the column `originCountryId` on the `vehicle_brand` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vehicle_brand" DROP CONSTRAINT "vehicle_brand_originCountryId_fkey";

-- AlterTable
ALTER TABLE "vehicle_brand" DROP COLUMN "originCountryId",
ADD COLUMN     "originCountryCode" TEXT;
