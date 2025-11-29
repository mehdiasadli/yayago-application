/*
  Warnings:

  - You are about to drop the column `group` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `limits` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `subscription` table. All the data in the column will be lost.
  - Changed the type of `role` on the `member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "member" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "group",
DROP COLUMN "limits",
DROP COLUMN "priceId";

-- DropEnum
DROP TYPE "OrganizationMemberRole";
