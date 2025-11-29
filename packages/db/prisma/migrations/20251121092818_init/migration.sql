-- CreateEnum
CREATE TYPE "AddonCategory" AS ENUM ('SAFETY', 'COMFORT', 'SERVICE', 'PERMIT', 'GEAR');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('QUANTITY', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "BillingScheme" AS ENUM ('FIXED', 'PER_DAY');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'HOST', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_HOST', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_PAID', 'AUTHORIZED', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "HandoverType" AS ENUM ('MEET_AT_LOCATION', 'DELIVERY');

-- CreateEnum
CREATE TYPE "TransportationType" AS ENUM ('RENTAL_LOCATION', 'DELIVERY');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('AIRPORT', 'TO_RENTER');

-- CreateEnum
CREATE TYPE "VehicleClass" AS ENUM ('ECONOMY', 'COMPACT', 'STANDARD', 'PREMIUM', 'BUSINESS', 'LUXURY', 'HYPERCAR', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleBodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'MINIVAN', 'COUPE', 'CONVERTIBLE', 'ROADSTER', 'SPORTS_CAR', 'VAN', 'PICKUP', 'MOTORCYCLE', 'BUS', 'SCOOTER', 'BICYCLE', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleFuelType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleTransmissionType" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "VehicleDriveType" AS ENUM ('FWD', 'RWD', 'AWD', 'FOUR_WD');

-- CreateEnum
CREATE TYPE "VehicleEngineLayout" AS ENUM ('INLINE', 'V_TYPE', 'FLAT', 'W_TYPE', 'RADIAL', 'ROTARY', 'U_TYPE', 'H_TYPE', 'X_TYPE', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingMediaStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'LOST_OR_STOLEN', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "VehicleFeatureCategory" AS ENUM ('ENTERTAINMENT', 'SAFETY', 'COMFORT', 'PERFORMANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "MileageUnit" AS ENUM ('KM', 'MI');

-- CreateEnum
CREATE TYPE "FuelPolicy" AS ENUM ('SAME_TO_SAME');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('STRICT', 'FLEXIBLE', 'FREE_CANCELLATION');

-- CreateEnum
CREATE TYPE "TrafficDirection" AS ENUM ('LEFT', 'RIGHT', 'HYBRID');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('POINT_OF_INTEREST', 'HOTEL', 'BUILDING', 'AIRPORT', 'STATION', 'PARK', 'NEIGHBORHOOD', 'OTHER');

-- CreateTable
CREATE TABLE "addon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "category" "AddonCategory" NOT NULL,
    "inputType" "InputType" NOT NULL,
    "billingScheme" "BillingScheme" NOT NULL DEFAULT 'FIXED',
    "maxQuantity" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "iconKey" TEXT,

    CONSTRAINT "addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_translation" (
    "language" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "addon_translation_pkey" PRIMARY KEY ("language","addonId")
);

-- CreateTable
CREATE TABLE "listing_addon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "listingId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',

    CONSTRAINT "listing_addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "username" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN,
    "stripeCustomerId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleSnapshot" JSONB NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_PAID',
    "timezone" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "addonsTotal" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "depositHeld" DOUBLE PRECISION NOT NULL,
    "pickupType" "HandoverType" NOT NULL,
    "pickupLocationId" TEXT,
    "pickupAddress" TEXT,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "dropoffType" "HandoverType" NOT NULL,
    "dropoffLocationId" TEXT,
    "dropoffAddress" TEXT,
    "dropoffLat" DOUBLE PRECISION,
    "dropoffLng" DOUBLE PRECISION,
    "actualPickupTime" TIMESTAMP(3),
    "actualReturnTime" TIMESTAMP(3),
    "startOdometer" INTEGER,
    "endOdometer" INTEGER,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_vehicle" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "licensePlate" TEXT,
    "vin" TEXT,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "odometer" INTEGER,
    "class" "VehicleClass" NOT NULL,
    "bodyType" "VehicleBodyType" NOT NULL,
    "fuelType" "VehicleFuelType" NOT NULL,
    "transmissionType" "VehicleTransmissionType" NOT NULL,
    "driveType" "VehicleDriveType" NOT NULL,
    "doors" INTEGER NOT NULL DEFAULT 4,
    "seats" INTEGER NOT NULL DEFAULT 5,
    "engineLayout" "VehicleEngineLayout" NOT NULL,
    "cylinders" INTEGER NOT NULL,
    "horsepower" INTEGER NOT NULL,
    "torque" INTEGER NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "length" INTEGER,
    "wheelbaseLength" INTEGER,
    "curbWeight" INTEGER,
    "interiorColors" TEXT[],
    "exteriorColors" TEXT[],

    CONSTRAINT "listing_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_feature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT,
    "category" "VehicleFeatureCategory" NOT NULL,

    CONSTRAINT "vehicle_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_feature_translation" (
    "language" TEXT NOT NULL,
    "vehicleFeatureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "vehicle_feature_translation_pkey" PRIMARY KEY ("language","vehicleFeatureId")
);

-- CreateTable
CREATE TABLE "listing_feature" (
    "listingVehicleId" TEXT NOT NULL,
    "vehicleFeatureId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "listing_feature_pkey" PRIMARY KEY ("listingVehicleId","vehicleFeatureId")
);

-- CreateTable
CREATE TABLE "listing_media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "listingId" TEXT NOT NULL,
    "type" "ListingMediaType" NOT NULL,
    "status" "ListingMediaStatus" NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,

    CONSTRAINT "listing_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "organizationId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "bookingDetailsId" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_booking_details" (
    "id" TEXT NOT NULL,
    "hasInstantBooking" BOOLEAN NOT NULL DEFAULT false,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "maxAge" INTEGER NOT NULL DEFAULT 120,
    "minRentalDays" INTEGER NOT NULL DEFAULT 1,
    "maxRentalDays" INTEGER,
    "mileageUnit" "MileageUnit" NOT NULL DEFAULT 'KM',
    "maxMileagePerDay" INTEGER,
    "maxMileagePerRental" INTEGER,
    "preparationTimeMinutes" INTEGER,
    "minNoticeHours" INTEGER,

    CONSTRAINT "listing_booking_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_pricing" (
    "id" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "pricePerDay" DOUBLE PRECISION NOT NULL,
    "weekendPricePerDay" DOUBLE PRECISION,
    "threeDayDiscount" DOUBLE PRECISION,
    "weeklyDiscount" DOUBLE PRECISION,
    "monthlyDiscount" DOUBLE PRECISION,
    "depositAmount" DOUBLE PRECISION,
    "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'STRICT',
    "cancellationFee" DOUBLE PRECISION,
    "refundableDepositAmount" DOUBLE PRECISION,
    "cancelGracePeriodHours" INTEGER,

    CONSTRAINT "listing_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "PlaceStatus" NOT NULL DEFAULT 'DRAFT',
    "phoneCode" TEXT NOT NULL,
    "flag" TEXT,
    "trafficDirection" "TrafficDirection" NOT NULL DEFAULT 'RIGHT',
    "emergencyPhoneNumber" TEXT,
    "minDriverAge" INTEGER NOT NULL DEFAULT 18,
    "title" TEXT,
    "description" TEXT,
    "currencyId" TEXT,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_translation" (
    "language" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "country_translation_pkey" PRIMARY KEY ("language","countryId")
);

-- CreateTable
CREATE TABLE "city" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PlaceStatus" NOT NULL DEFAULT 'DRAFT',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "boundaries" JSONB NOT NULL,
    "googleMapsPlaceId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "isDefaultOfCounry" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "description" TEXT,
    "heroImageUrl" TEXT,
    "heroImageAlt" TEXT,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_translation" (
    "language" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "heroImageAlt" TEXT,

    CONSTRAINT "city_translation_pkey" PRIMARY KEY ("language","cityId")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "status" "PlaceStatus" NOT NULL DEFAULT 'DRAFT',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "googleMapsPlaceId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_translation" (
    "language" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "location_translation_pkey" PRIMARY KEY ("language","locationId")
);

-- CreateTable
CREATE TABLE "currency" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isSymbolBefore" BOOLEAN NOT NULL DEFAULT false,
    "isCrypto" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_translation" (
    "language" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "currency_translation_pkey" PRIMARY KEY ("language","currencyId")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brand" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "originCountryId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "vehicle_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brand_translation" (
    "language" TEXT NOT NULL,
    "vehicleBrandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "vehicle_brand_translation_pkey" PRIMARY KEY ("language","vehicleBrandId")
);

-- CreateTable
CREATE TABLE "vehicle_model" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "vehicle_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_model_translation" (
    "language" TEXT NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT[],

    CONSTRAINT "vehicle_model_translation_pkey" PRIMARY KEY ("language","vehicleModelId")
);

-- CreateTable
CREATE TABLE "_AddonToCountry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AddonToCountry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "addon_slug_key" ON "addon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "booking_referenceCode_key" ON "booking"("referenceCode");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_feature_code_key" ON "vehicle_feature"("code");

-- CreateIndex
CREATE UNIQUE INDEX "listing_vehicleId_key" ON "listing"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_bookingDetailsId_key" ON "listing"("bookingDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_pricingId_key" ON "listing"("pricingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_slug_key" ON "listing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "city_countryId_code_key" ON "city"("countryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "city_slug_key" ON "city"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "location_slug_key" ON "location"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "currency_code_key" ON "currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_brand_slug_key" ON "vehicle_brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_model_slug_key" ON "vehicle_model"("slug");

-- CreateIndex
CREATE INDEX "_AddonToCountry_B_index" ON "_AddonToCountry"("B");

-- AddForeignKey
ALTER TABLE "addon_translation" ADD CONSTRAINT "addon_translation_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_addon" ADD CONSTRAINT "listing_addon_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing_booking_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_addon" ADD CONSTRAINT "listing_addon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_dropoffLocationId_fkey" FOREIGN KEY ("dropoffLocationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_vehicle" ADD CONSTRAINT "listing_vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "vehicle_model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_feature_translation" ADD CONSTRAINT "vehicle_feature_translation_vehicleFeatureId_fkey" FOREIGN KEY ("vehicleFeatureId") REFERENCES "vehicle_feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_feature" ADD CONSTRAINT "listing_feature_listingVehicleId_fkey" FOREIGN KEY ("listingVehicleId") REFERENCES "listing_vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_feature" ADD CONSTRAINT "listing_feature_vehicleFeatureId_fkey" FOREIGN KEY ("vehicleFeatureId") REFERENCES "vehicle_feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "listing_vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_bookingDetailsId_fkey" FOREIGN KEY ("bookingDetailsId") REFERENCES "listing_booking_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "listing_pricing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_pricing" ADD CONSTRAINT "listing_pricing_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_translation" ADD CONSTRAINT "country_translation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_translation" ADD CONSTRAINT "city_translation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_translation" ADD CONSTRAINT "location_translation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_translation" ADD CONSTRAINT "currency_translation_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_brand" ADD CONSTRAINT "vehicle_brand_originCountryId_fkey" FOREIGN KEY ("originCountryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_brand_translation" ADD CONSTRAINT "vehicle_brand_translation_vehicleBrandId_fkey" FOREIGN KEY ("vehicleBrandId") REFERENCES "vehicle_brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model" ADD CONSTRAINT "vehicle_model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "vehicle_brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model_translation" ADD CONSTRAINT "vehicle_model_translation_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "vehicle_model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonToCountry" ADD CONSTRAINT "_AddonToCountry_A_fkey" FOREIGN KEY ("A") REFERENCES "addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddonToCountry" ADD CONSTRAINT "_AddonToCountry_B_fkey" FOREIGN KEY ("B") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
