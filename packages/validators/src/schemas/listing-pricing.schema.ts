import { ListingPricingSchema } from '@yayago-app/db/models';
import { z } from 'zod';

export const CreateListingPricingInputSchema = ListingPricingSchema.pick({
  listingId: true,
  currency: true,
  cancelGracePeriodHours: true,
  cancellationFee: true,
  cancellationPolicy: true,
  depositAmount: true,
  monthlyDiscount: true,
  pricePerDay: true,
  refundableDepositAmount: true,
  threeDayDiscount: true,
  weekendPricePerDay: true,
  weeklyDiscount: true,
  pricePerHour: true,
  pricePerThreeDays: true,
  pricePerWeek: true,
  pricePerMonth: true,
  pricingMode: true,
  partialDayPolicy: true,
});

export type CreateListingPricingInputType = z.infer<typeof CreateListingPricingInputSchema>;
