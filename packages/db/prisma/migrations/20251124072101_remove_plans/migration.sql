/*
  Warnings:

  - The `description` column on the `addon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currencyId` on the `booking` table. All the data in the column will be lost.
  - The `title` column on the `city` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `city` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `heroImageAlt` column on the `city` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currencyId` on the `country` table. All the data in the column will be lost.
  - The `title` column on the `country` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `country` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currencyId` on the `listing_pricing` table. All the data in the column will be lost.
  - The `title` column on the `location` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `location` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `plan` on the `subscription` table. All the data in the column will be lost.
  - The `title` column on the `vehicle_brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `vehicle_brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `keywords` column on the `vehicle_brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `vehicle_feature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `title` column on the `vehicle_model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `vehicle_model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `keywords` column on the `vehicle_model` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `addon_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `city_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `country_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `currency_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `location_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_brand_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_feature_translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_model_translation` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `name` on the `addon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `currency` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `city` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `country` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `currency` to the `listing_pricing` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `location` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `vehicle_brand` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `vehicle_feature` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `vehicle_model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlanInterval" AS ENUM ('month', 'year');

-- DropForeignKey
ALTER TABLE "addon_translation" DROP CONSTRAINT "addon_translation_addonId_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "city_translation" DROP CONSTRAINT "city_translation_cityId_fkey";

-- DropForeignKey
ALTER TABLE "country" DROP CONSTRAINT "country_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "country_translation" DROP CONSTRAINT "country_translation_countryId_fkey";

-- DropForeignKey
ALTER TABLE "currency_translation" DROP CONSTRAINT "currency_translation_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "listing_pricing" DROP CONSTRAINT "listing_pricing_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "location_translation" DROP CONSTRAINT "location_translation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_brand_translation" DROP CONSTRAINT "vehicle_brand_translation_vehicleBrandId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_feature_translation" DROP CONSTRAINT "vehicle_feature_translation_vehicleFeatureId_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_model_translation" DROP CONSTRAINT "vehicle_model_translation_vehicleModelId_fkey";

-- AlterTable
ALTER TABLE "addon" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "currencyId",
ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "city" ADD COLUMN     "lookup" TEXT[],
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB,
DROP COLUMN "heroImageAlt",
ADD COLUMN     "heroImageAlt" JSONB;

-- AlterTable
ALTER TABLE "country" DROP COLUMN "currencyId",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "lookup" TEXT[],
ADD COLUMN     "minDriverLicenseAge" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "listing_pricing" DROP COLUMN "currencyId",
ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "lookup" TEXT[],
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "plan",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "vehicle_brand" ADD COLUMN     "lookup" TEXT[],
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB,
DROP COLUMN "keywords",
ADD COLUMN     "keywords" JSONB;

-- AlterTable
ALTER TABLE "vehicle_feature" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "vehicle_model" ADD COLUMN     "lookup" TEXT[],
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "title",
ADD COLUMN     "title" JSONB,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB,
DROP COLUMN "keywords",
ADD COLUMN     "keywords" JSONB;

-- DropTable
DROP TABLE "addon_translation";

-- DropTable
DROP TABLE "city_translation";

-- DropTable
DROP TABLE "country_translation";

-- DropTable
DROP TABLE "currency";

-- DropTable
DROP TABLE "currency_translation";

-- DropTable
DROP TABLE "location_translation";

-- DropTable
DROP TABLE "vehicle_brand_translation";

-- DropTable
DROP TABLE "vehicle_feature_translation";

-- DropTable
DROP TABLE "vehicle_model_translation";

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
