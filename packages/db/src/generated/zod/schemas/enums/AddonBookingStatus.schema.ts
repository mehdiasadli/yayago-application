import * as z from 'zod';

export const AddonBookingStatusSchema = z.enum(['CONFIRMED', 'CANCELLED', 'REFUNDED'])

export type AddonBookingStatus = z.infer<typeof AddonBookingStatusSchema>;