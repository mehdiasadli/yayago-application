-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'DISPUTED';

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "refundedAmount" DOUBLE PRECISION,
ADD COLUMN     "stripeDisputeId" TEXT,
ADD COLUMN     "stripeRefundId" TEXT;
