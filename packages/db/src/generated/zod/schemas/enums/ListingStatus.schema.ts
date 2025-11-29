import * as z from 'zod';

export const ListingStatusSchema = z.enum(['DRAFT', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'LOST_OR_STOLEN', 'ARCHIVED', 'BLOCKED', 'PENDING_VERIFICATION'])

export type ListingStatus = z.infer<typeof ListingStatusSchema>;