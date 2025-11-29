/*
  Warnings:

  - The values [host] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[code]` on the table `city` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('IDLE', 'ONBOARDING', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('TRADE_LICENSE', 'TAX_CERTIFICATE', 'ID_CARD_FRONT', 'ID_CARD_BACK', 'SIGNATORY_AUTHORITY');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('user', 'moderator', 'admin');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- DropIndex
DROP INDEX "city_countryId_code_key";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "description" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'IDLE',
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "organization_document" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "DocumentKind" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "documentNumber" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" "DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_document_requirement" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "documentType" "DocumentKind" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "label" JSONB NOT NULL,
    "description" JSONB,

    CONSTRAINT "country_document_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_document_requirement_countryId_documentType_key" ON "country_document_requirement"("countryId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "city_code_key" ON "city"("code");

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_document" ADD CONSTRAINT "organization_document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country_document_requirement" ADD CONSTRAINT "country_document_requirement_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
