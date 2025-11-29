import * as z from 'zod';

export const BookingStatusSchema = z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_HOST', 'DISPUTED'])

export type BookingStatus = z.infer<typeof BookingStatusSchema>;