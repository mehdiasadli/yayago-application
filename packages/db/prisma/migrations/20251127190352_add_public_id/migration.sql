/*
  Warnings:

  - Added the required column `publicId` to the `listing_media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "listing_media" ADD COLUMN     "publicId" TEXT NOT NULL;
