/*
  Warnings:

  - Changed the type of `type` on the `listing_media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `location` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ListingMediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "LocationKind" AS ENUM ('POINT_OF_INTEREST', 'HOTEL', 'BUILDING', 'AIRPORT', 'STATION', 'PARK', 'NEIGHBORHOOD', 'OTHER');

-- AlterTable
ALTER TABLE "listing_media" DROP COLUMN "type",
ADD COLUMN     "type" "ListingMediaKind" NOT NULL;

-- AlterTable
ALTER TABLE "location" DROP COLUMN "type",
ADD COLUMN     "type" "LocationKind" NOT NULL;

-- DropEnum
DROP TYPE "ListingMediaType";

-- DropEnum
DROP TYPE "LocationType";
