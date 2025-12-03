/*
  Warnings:

  - The values [SAFETY,SERVICE,PERMIT,GEAR] on the enum `AddonCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `available` on the `addon` table. All the data in the column will be lost.
  - You are about to drop the column `billingScheme` on the `addon` table. All the data in the column will be lost.
  - The `inputType` column on the `addon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `discountType` column on the `listing_addon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[listingId,addonId]` on the table `listing_addon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `maxQuantity` on table `addon` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bookingId` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddonBillingType" AS ENUM ('FIXED', 'PER_DAY', 'PER_HOUR', 'PER_USE');

-- CreateEnum
CREATE TYPE "AddonInputType" AS ENUM ('BOOLEAN', 'QUANTITY', 'SELECTION');

-- CreateEnum
CREATE TYPE "AddonDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "AddonBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('BOOKING', 'LISTING', 'REVIEW', 'ORGANIZATION', 'FINANCIAL', 'FAVORITE', 'VERIFICATION', 'SYSTEM', 'PROMOTIONAL', 'SECURITY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED_BY_USER', 'BOOKING_CANCELLED_BY_HOST', 'BOOKING_STARTED', 'BOOKING_COMPLETED', 'BOOKING_REMINDER', 'BOOKING_PICKUP_REMINDER', 'BOOKING_RETURN_REMINDER', 'BOOKING_OVERDUE', 'BOOKING_DISPUTE', 'LISTING_PUBLISHED', 'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_SUSPENDED', 'LISTING_EXPIRED', 'LISTING_VIEWS_MILESTONE', 'LISTING_INQUIRY', 'REVIEW_RECEIVED', 'REVIEW_REMINDER', 'REVIEW_RESPONSE', 'ORG_MEMBER_JOINED', 'ORG_MEMBER_LEFT', 'ORG_MEMBER_ROLE_CHANGED', 'ORG_INVITATION_RECEIVED', 'ORG_INVITATION_ACCEPTED', 'ORG_STATUS_CHANGED', 'ORG_DOCUMENT_EXPIRING', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYOUT_PROCESSED', 'PAYOUT_FAILED', 'REFUND_ISSUED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_EXPIRING', 'SUBSCRIPTION_CANCELLED', 'INVOICE_GENERATED', 'FAVORITE_PRICE_DROP', 'FAVORITE_AVAILABLE', 'FAVORITE_ENDING_SOON', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'VERIFICATION_EXPIRING', 'VERIFICATION_REQUIRED', 'SYSTEM_ANNOUNCEMENT', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SYSTEM_POLICY_CHANGE', 'PROMO_OFFER', 'PROMO_REFERRAL', 'SECURITY_NEW_LOGIN', 'SECURITY_PASSWORD_CHANGED', 'SECURITY_EMAIL_CHANGED', 'SECURITY_SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterEnum
BEGIN;
CREATE TYPE "AddonCategory_new" AS ENUM ('INSURANCE', 'PROTECTION', 'CHILD_SAFETY', 'NAVIGATION', 'CONNECTIVITY', 'COMFORT', 'WINTER', 'OUTDOOR', 'MOBILITY', 'DRIVER', 'DELIVERY', 'FUEL', 'CLEANING', 'TOLL', 'BORDER', 'PARKING', 'OTHER');
ALTER TABLE "addon" ALTER COLUMN "category" TYPE "AddonCategory_new" USING ("category"::text::"AddonCategory_new");
ALTER TYPE "AddonCategory" RENAME TO "AddonCategory_old";
ALTER TYPE "AddonCategory_new" RENAME TO "AddonCategory";
DROP TYPE "public"."AddonCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "addon" DROP COLUMN "available",
DROP COLUMN "billingScheme",
ADD COLUMN     "allowedVehicleBodyTypes" JSONB,
ADD COLUMN     "allowedVehicleClasses" JSONB,
ADD COLUMN     "billingType" "AddonBillingType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRefundable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isTaxExempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPrice" DOUBLE PRECISION,
ADD COLUMN     "maxRentalDays" INTEGER,
ADD COLUMN     "minDriverAge" INTEGER,
ADD COLUMN     "minQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minRentalDays" INTEGER,
ADD COLUMN     "refundPolicy" JSONB,
ADD COLUMN     "selectionOptions" JSONB,
ADD COLUMN     "shortName" JSONB,
ADD COLUMN     "suggestedPrice" DOUBLE PRECISION,
ADD COLUMN     "termsAndConditions" JSONB,
DROP COLUMN "inputType",
ADD COLUMN     "inputType" "AddonInputType" NOT NULL DEFAULT 'BOOLEAN',
ALTER COLUMN "maxQuantity" SET NOT NULL,
ALTER COLUMN "maxQuantity" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "depositRefundId" TEXT,
ADD COLUMN     "depositRefundStatus" TEXT,
ADD COLUMN     "depositRefundedAt" TIMESTAMP(3),
ADD COLUMN     "partnerPaidAt" TIMESTAMP(3),
ADD COLUMN     "partnerPayoutAmount" DOUBLE PRECISION,
ADD COLUMN     "partnerPayoutId" TEXT,
ADD COLUMN     "partnerPayoutStatus" TEXT,
ADD COLUMN     "platformCommission" DOUBLE PRECISION,
ADD COLUMN     "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "platformRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "country" ADD COLUMN     "hasCarRentalAgeExceptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxCarRentalAge" INTEGER,
ADD COLUMN     "platformCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05;

-- AlterTable
ALTER TABLE "listing_addon" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'AED',
ADD COLUMN     "customDescription" JSONB,
ADD COLUMN     "customName" JSONB,
ADD COLUMN     "customTerms" JSONB,
ADD COLUMN     "discountValidUntil" TIMESTAMP(3),
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isIncludedFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPerBooking" INTEGER,
ADD COLUMN     "minDriverAge" INTEGER,
ADD COLUMN     "minPerBooking" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stockQuantity" INTEGER,
DROP COLUMN "discountType",
ADD COLUMN     "discountType" "AddonDiscountType" NOT NULL DEFAULT 'PERCENTAGE';

-- AlterTable
ALTER TABLE "listing_vehicle" ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "style" TEXT;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" TEXT,
ADD COLUMN     "stripeOnboardingCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "hadGoodAC" BOOLEAN,
ADD COLUMN     "wasAsDescribed" BOOLEAN,
ADD COLUMN     "wasClean" BOOLEAN,
ADD COLUMN     "wasComfortable" BOOLEAN,
ADD COLUMN     "wasDropoffSmooth" BOOLEAN,
ADD COLUMN     "wasEasyToDrive" BOOLEAN,
ADD COLUMN     "wasFuelEfficient" BOOLEAN,
ADD COLUMN     "wasGoodValue" BOOLEAN,
ADD COLUMN     "wasHostResponsive" BOOLEAN,
ADD COLUMN     "wasPickupSmooth" BOOLEAN,
ADD COLUMN     "wasReliable" BOOLEAN,
ADD COLUMN     "wasSpacious" BOOLEAN,
ADD COLUMN     "wouldRecommend" BOOLEAN,
ADD COLUMN     "wouldRentAgain" BOOLEAN;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "driverLicenseCountryCode" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "selfieUrl" TEXT,
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "BillingScheme";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "InputType";

-- CreateTable
CREATE TABLE "booking_addon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT NOT NULL,
    "listingAddonId" TEXT NOT NULL,
    "addonSnapshot" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "selectedOption" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "AddonBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "cancelledAt" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "refundAmount" DOUBLE PRECISION,

    CONSTRAINT "booking_addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_bundle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "discountType" "AddonDiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "addon_bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_bundle_item" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bundleId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "addon_bundle_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseFrontUrl" TEXT NOT NULL,
    "licenseBackUrl" TEXT NOT NULL,
    "selfieUrl" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "DriverLicenseStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "category" "NotificationCategory" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "userId" TEXT,
    "organizationId" TEXT,
    "targetRole" TEXT,
    "targetOrgRole" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "sentViaEmail" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "sentViaPush" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" TIMESTAMP(3),
    "sentViaSms" BOOLEAN NOT NULL DEFAULT false,
    "smsSentAt" TIMESTAMP(3),
    "inAppDeliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT,
    "listingId" TEXT,
    "reviewId" TEXT,
    "metadata" JSONB,
    "actorId" TEXT,
    "groupKey" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "listingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reviewEnabled" BOOLEAN NOT NULL DEFAULT true,
    "organizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "financialEnabled" BOOLEAN NOT NULL DEFAULT true,
    "favoriteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "verificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemEnabled" BOOLEAN NOT NULL DEFAULT true,
    "promotionalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "securityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailForHigh" BOOLEAN NOT NULL DEFAULT true,
    "emailForMedium" BOOLEAN NOT NULL DEFAULT true,
    "emailForLow" BOOLEAN NOT NULL DEFAULT false,
    "pushForHigh" BOOLEAN NOT NULL DEFAULT true,
    "pushForMedium" BOOLEAN NOT NULL DEFAULT true,
    "pushForLow" BOOLEAN NOT NULL DEFAULT false,
    "smsForHigh" BOOLEAN NOT NULL DEFAULT false,
    "smsForMedium" BOOLEAN NOT NULL DEFAULT false,
    "smsForLow" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "quietHoursTimezone" TEXT,
    "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" TEXT,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dhKey" TEXT NOT NULL,
    "authKey" TEXT NOT NULL,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_addon_bookingId_idx" ON "booking_addon"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "addon_bundle_slug_key" ON "addon_bundle"("slug");

-- CreateIndex
CREATE INDEX "addon_bundle_isActive_isFeatured_idx" ON "addon_bundle"("isActive", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "addon_bundle_item_bundleId_addonId_key" ON "addon_bundle_item"("bundleId", "addonId");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_userId_createdAt_idx" ON "notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_organizationId_isRead_idx" ON "notification"("organizationId", "isRead");

-- CreateIndex
CREATE INDEX "notification_organizationId_createdAt_idx" ON "notification"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- CreateIndex
CREATE INDEX "notification_category_idx" ON "notification"("category");

-- CreateIndex
CREATE INDEX "notification_groupKey_idx" ON "notification"("groupKey");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_key" ON "notification_preference"("userId");

-- CreateIndex
CREATE INDEX "push_subscription_userId_idx" ON "push_subscription"("userId");

-- CreateIndex
CREATE INDEX "addon_category_idx" ON "addon"("category");

-- CreateIndex
CREATE INDEX "addon_isActive_isFeatured_idx" ON "addon"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "listing_addon_listingId_isActive_idx" ON "listing_addon"("listingId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "listing_addon_listingId_addonId_key" ON "listing_addon"("listingId", "addonId");

-- CreateIndex
CREATE UNIQUE INDEX "review_bookingId_key" ON "review"("bookingId");

-- CreateIndex
CREATE INDEX "review_listingId_idx" ON "review"("listingId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE INDEX "review_bookingId_idx" ON "review"("bookingId");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- AddForeignKey
ALTER TABLE "booking_addon" ADD CONSTRAINT "booking_addon_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_addon" ADD CONSTRAINT "booking_addon_listingAddonId_fkey" FOREIGN KEY ("listingAddonId") REFERENCES "listing_addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_bundle" ADD CONSTRAINT "addon_bundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_bundle_item" ADD CONSTRAINT "addon_bundle_item_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "addon_bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_bundle_item" ADD CONSTRAINT "addon_bundle_item_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_attempt" ADD CONSTRAINT "verification_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
