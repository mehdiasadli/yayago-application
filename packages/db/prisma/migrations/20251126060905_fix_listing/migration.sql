/*
  Warnings:

  - You are about to drop the column `bookingDetailsId` on the `listing` table. All the data in the column will be lost.
  - You are about to drop the column `pricingId` on the `listing` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `listing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listingId]` on the table `listing_booking_details` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[listingId]` on the table `listing_pricing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[listingId]` on the table `listing_vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listingId` to the `listing_booking_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `listing_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `listing_vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "listing" DROP CONSTRAINT "listing_bookingDetailsId_fkey";

-- DropForeignKey
ALTER TABLE "listing" DROP CONSTRAINT "listing_pricingId_fkey";

-- DropForeignKey
ALTER TABLE "listing" DROP CONSTRAINT "listing_vehicleId_fkey";

-- DropIndex
DROP INDEX "listing_bookingDetailsId_key";

-- DropIndex
DROP INDEX "listing_pricingId_key";

-- DropIndex
DROP INDEX "listing_vehicleId_key";

-- AlterTable
ALTER TABLE "listing" DROP COLUMN "bookingDetailsId",
DROP COLUMN "pricingId",
DROP COLUMN "vehicleId";

-- AlterTable
ALTER TABLE "listing_booking_details" ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "listing_pricing" ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "listing_vehicle" ADD COLUMN     "listingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "listing_booking_details_listingId_key" ON "listing_booking_details"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_pricing_listingId_key" ON "listing_pricing"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_vehicle_listingId_key" ON "listing_vehicle"("listingId");

-- AddForeignKey
ALTER TABLE "listing_vehicle" ADD CONSTRAINT "listing_vehicle_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_booking_details" ADD CONSTRAINT "listing_booking_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_pricing" ADD CONSTRAINT "listing_pricing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
