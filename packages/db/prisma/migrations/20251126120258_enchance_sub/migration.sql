-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "currentFeaturedListings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentListings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentMembers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentTotalImages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentTotalVideos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extraFeaturedListingCost" INTEGER,
ADD COLUMN     "extraImageCost" INTEGER,
ADD COLUMN     "extraListingCost" INTEGER,
ADD COLUMN     "extraMemberCost" INTEGER,
ADD COLUMN     "extraVideoCost" INTEGER,
ADD COLUMN     "maxFeaturedListings" INTEGER,
ADD COLUMN     "maxImagesPerListing" INTEGER,
ADD COLUMN     "maxListings" INTEGER,
ADD COLUMN     "maxMembers" INTEGER,
ADD COLUMN     "maxVideosPerListing" INTEGER;

-- CreateTable
CREATE TABLE "subscription_plan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "stripeProductId" TEXT NOT NULL,
    "maxListings" INTEGER NOT NULL,
    "maxFeaturedListings" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "maxImagesPerListing" INTEGER NOT NULL,
    "maxVideosPerListing" INTEGER NOT NULL,
    "extraListingCost" INTEGER,
    "extraFeaturedListingCost" INTEGER,
    "extraMemberCost" INTEGER,
    "extraImageCost" INTEGER,
    "extraVideoCost" INTEGER,
    "trialEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_price" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'aed',
    "interval" "PlanInterval" NOT NULL DEFAULT 'month',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscription_plan_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_feature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "isIncluded" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "subscription_plan_feature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_slug_key" ON "subscription_plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_stripeProductId_key" ON "subscription_plan"("stripeProductId");

-- CreateIndex
CREATE INDEX "subscription_plan_isActive_idx" ON "subscription_plan"("isActive");

-- CreateIndex
CREATE INDEX "subscription_plan_sortOrder_idx" ON "subscription_plan"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_price_stripePriceId_key" ON "subscription_plan_price"("stripePriceId");

-- CreateIndex
CREATE INDEX "subscription_plan_price_planId_idx" ON "subscription_plan_price"("planId");

-- CreateIndex
CREATE INDEX "subscription_plan_feature_planId_idx" ON "subscription_plan_feature"("planId");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "subscription_organizationId_idx" ON "subscription"("organizationId");

-- CreateIndex
CREATE INDEX "subscription_plan_idx" ON "subscription"("plan");

-- AddForeignKey
ALTER TABLE "subscription_plan_price" ADD CONSTRAINT "subscription_plan_price_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plan_feature" ADD CONSTRAINT "subscription_plan_feature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
