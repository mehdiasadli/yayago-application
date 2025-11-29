import * as z from 'zod';
import { MileageUnitSchema } from '../enums/MileageUnit.schema';

export const ListingBookingDetailsSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  hasInstantBooking: z.boolean(),
  minAge: z.number().int().default(18),
  maxAge: z.number().int().default(120),
  minRentalDays: z.number().int().default(1),
  maxRentalDays: z.number().int().nullish(),
  mileageUnit: MileageUnitSchema.default("KM"),
  maxMileagePerDay: z.number().int().nullish(),
  maxMileagePerRental: z.number().int().nullish(),
  preparationTimeMinutes: z.number().int().nullish(),
  minNoticeHours: z.number().int().nullish(),
});

export type ListingBookingDetailsType = z.infer<typeof ListingBookingDetailsSchema>;
