/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `organization_document` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `organization_document` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DocumentMediaFormat" AS ENUM ('PDF', 'DOCX', 'JPEG', 'PNG');

-- AlterTable
ALTER TABLE "country_document_requirement" ADD COLUMN     "allowedFormats" "DocumentMediaFormat"[];

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "organization_document" DROP COLUMN "fileUrl",
DROP COLUMN "type";

-- CreateTable
CREATE TABLE "organization_file" (
    "id" TEXT NOT NULL,
    "organizationDocumentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "format" "DocumentMediaFormat" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization_file" ADD CONSTRAINT "organization_file_organizationDocumentId_fkey" FOREIGN KEY ("organizationDocumentId") REFERENCES "organization_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
