import * as z from 'zod';

export const ListingBookingDetailsScalarFieldEnumSchema = z.enum(['id', 'listingId', 'hasInstantBooking', 'minAge', 'maxAge', 'minRentalDays', 'maxRentalDays', 'mileageUnit', 'maxMileagePerDay', 'maxMileagePerRental', 'preparationTimeMinutes', 'minNoticeHours', 'deliveryEnabled', 'deliveryMaxDistance', 'deliveryBaseFee', 'deliveryPerKmFee', 'deliveryFreeRadius', 'deliveryNotes'])

export type ListingBookingDetailsScalarFieldEnum = z.infer<typeof ListingBookingDetailsScalarFieldEnumSchema>;