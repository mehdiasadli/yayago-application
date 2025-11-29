-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "extraAnalyticsCost" INTEGER,
ADD COLUMN     "hasAnalytics" BOOLEAN;

-- AlterTable
ALTER TABLE "subscription_plan" ADD COLUMN     "extraAnalyticsCost" INTEGER,
ADD COLUMN     "hasAnalytics" BOOLEAN NOT NULL DEFAULT false;
