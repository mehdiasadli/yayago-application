-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "DriverLicenseStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "listing_booking_details" ADD COLUMN     "deliveryBaseFee" DOUBLE PRECISION,
ADD COLUMN     "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryFreeRadius" DOUBLE PRECISION,
ADD COLUMN     "deliveryMaxDistance" DOUBLE PRECISION,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "deliveryPerKmFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "acceptedCurrencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "additionalDriverPolicy" JSONB,
ADD COLUMN     "agePolicy" JSONB,
ADD COLUMN     "amenitiesJson" JSONB,
ADD COLUMN     "businessHours" JSONB,
ADD COLUMN     "cancellationPolicy" JSONB,
ADD COLUMN     "certificationsJson" JSONB,
ADD COLUMN     "crossBorderPolicy" JSONB,
ADD COLUMN     "damagePolicy" JSONB,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "fleetSize" INTEGER,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "fuelPolicy" JSONB,
ADD COLUMN     "holidayHours" JSONB,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "insurancePolicy" JSONB,
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lateReturnPolicy" JSONB,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "mileagePolicy" JSONB,
ADD COLUMN     "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "petPolicy" JSONB,
ADD COLUMN     "smokingPolicy" JSONB,
ADD COLUMN     "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressCountry" TEXT,
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressState" TEXT,
ADD COLUMN     "addressZipCode" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "driverLicenseBackUrl" TEXT,
ADD COLUMN     "driverLicenseCountry" TEXT,
ADD COLUMN     "driverLicenseExpiry" TIMESTAMP(3),
ADD COLUMN     "driverLicenseFrontUrl" TEXT,
ADD COLUMN     "driverLicenseNumber" TEXT,
ADD COLUMN     "driverLicenseRejectionReason" TEXT,
ADD COLUMN     "driverLicenseVerificationStatus" "DriverLicenseStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "driverLicenseVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "notificationPreferences" JSONB,
ADD COLUMN     "preferredCurrency" TEXT DEFAULT 'AED',
ADD COLUMN     "preferredDistanceUnit" TEXT DEFAULT 'km',
ADD COLUMN     "preferredLanguage" TEXT DEFAULT 'en';

-- CreateTable
CREATE TABLE "favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_userId_idx" ON "favorite"("userId");

-- CreateIndex
CREATE INDEX "favorite_listingId_idx" ON "favorite"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_userId_listingId_key" ON "favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "listing_lat_lng_idx" ON "listing"("lat", "lng");

-- CreateIndex
CREATE INDEX "listing_cityId_idx" ON "listing"("cityId");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
