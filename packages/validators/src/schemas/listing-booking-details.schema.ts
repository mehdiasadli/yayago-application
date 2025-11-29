import { ListingBookingDetailsSchema } from '@yayago-app/db/models';
import { z } from 'zod';

export const CreateListingBookingDetailsInputSchema = ListingBookingDetailsSchema.pick({
  listingId: true,
  hasInstantBooking: true,
  minAge: true,
  maxMileagePerDay: true,
  maxMileagePerRental: true,
  maxRentalDays: true,
  mileageUnit: true,
  minNoticeHours: true,
  minRentalDays: true,
  preparationTimeMinutes: true,
});

export type CreateListingBookingDetailsInputType = z.infer<typeof CreateListingBookingDetailsInputSchema>;
