-- CreateEnum
CREATE TYPE "ListingDocumentStatus" AS ENUM ('PENDING_UPLOAD', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'REQUIRES_RENEWAL');

-- CreateEnum
CREATE TYPE "DiscountConditionType" AS ENUM ('DURATION', 'EARLY_BOOKING', 'LATE_BOOKING', 'SEASONAL', 'MULTI_VEHICLE', 'FIRST_TIME_USER', 'RETURNING_USER', 'REFERRAL', 'PROMO_CODE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('BASIC', 'STANDARD', 'COMPREHENSIVE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPAIR', 'UNUSABLE', 'UNKNOWN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FuelPolicy" ADD VALUE 'FULL_TO_FULL';
ALTER TYPE "FuelPolicy" ADD VALUE 'PREPAID_FUEL';

-- AlterEnum
ALTER TYPE "ListingMediaKind" ADD VALUE 'DOCUMENT';

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VehicleFeatureCategory" ADD VALUE 'CONVENIENCE';
ALTER TYPE "VehicleFeatureCategory" ADD VALUE 'TECHNOLOGY';
ALTER TYPE "VehicleFeatureCategory" ADD VALUE 'ACCESSIBILITY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VehicleFuelType" ADD VALUE 'HYDROGEN';
ALTER TYPE "VehicleFuelType" ADD VALUE 'CNG';
ALTER TYPE "VehicleFuelType" ADD VALUE 'LPG';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VehicleTransmissionType" ADD VALUE 'SEMI_AUTOMATIC';
ALTER TYPE "VehicleTransmissionType" ADD VALUE 'CVT';

-- DropForeignKey
ALTER TABLE "listing_addon" DROP CONSTRAINT "listing_addon_listingId_fkey";

-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "bookingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featuredUntil" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "listing_media" ADD COLUMN     "caption" JSONB,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "listing_vehicle" ADD COLUMN     "acceleration0to100" DOUBLE PRECISION,
ADD COLUMN     "batterCapacity" DOUBLE PRECISION,
ADD COLUMN     "cargoCapacity" INTEGER,
ADD COLUMN     "conditionNotes" TEXT,
ADD COLUMN     "electricRange" DOUBLE PRECISION,
ADD COLUMN     "engineDisplacement" DOUBLE PRECISION,
ADD COLUMN     "fuelEfficiencyCity" DOUBLE PRECISION,
ADD COLUMN     "fuelEfficiencyHighway" DOUBLE PRECISION,
ADD COLUMN     "fuelTankCapacity" DOUBLE PRECISION,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "lastServiceDate" TIMESTAMP(3),
ADD COLUMN     "nextServiceDue" TIMESTAMP(3),
ADD COLUMN     "registrationExpiry" TIMESTAMP(3),
ADD COLUMN     "topSpeed" INTEGER,
ADD COLUMN     "towingCapacity" INTEGER,
ALTER COLUMN "cylinders" DROP NOT NULL,
ALTER COLUMN "horsepower" DROP NOT NULL,
ALTER COLUMN "torque" DROP NOT NULL;

-- CreateTable
CREATE TABLE "vehicle_inspection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingVehicleId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "odometer" INTEGER NOT NULL,
    "brakes" "InspectionStatus" NOT NULL,
    "tires" "InspectionStatus" NOT NULL,
    "engine" "InspectionStatus" NOT NULL,
    "interior" "InspectionStatus" NOT NULL,
    "exterior" "InspectionStatus" NOT NULL,
    "otherResults" JSONB,
    "notes" TEXT,
    "nextInspectionDue" TIMESTAMP(3),

    CONSTRAINT "vehicle_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_inspection_listingVehicleId_inspectionDate_idx" ON "vehicle_inspection"("listingVehicleId", "inspectionDate");

-- CreateIndex
CREATE INDEX "listing_media_listingId_isPrimary_idx" ON "listing_media"("listingId", "isPrimary");

-- CreateIndex
CREATE INDEX "listing_media_listingId_displayOrder_idx" ON "listing_media"("listingId", "displayOrder");

-- AddForeignKey
ALTER TABLE "listing_addon" ADD CONSTRAINT "listing_addon_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspection" ADD CONSTRAINT "vehicle_inspection_listingVehicleId_fkey" FOREIGN KEY ("listingVehicleId") REFERENCES "listing_vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
