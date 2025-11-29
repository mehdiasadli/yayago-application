import * as z from 'zod';

export const ListingBookingDetailsScalarFieldEnumSchema = z.enum(['id', 'listingId', 'hasInstantBooking', 'minAge', 'maxAge', 'minRentalDays', 'maxRentalDays', 'mileageUnit', 'maxMileagePerDay', 'maxMileagePerRental', 'preparationTimeMinutes', 'minNoticeHours'])

export type ListingBookingDetailsScalarFieldEnum = z.infer<typeof ListingBookingDetailsScalarFieldEnumSchema>;