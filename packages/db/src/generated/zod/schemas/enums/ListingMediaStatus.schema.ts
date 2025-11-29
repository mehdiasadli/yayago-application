import * as z from 'zod';

export const ListingMediaStatusSchema = z.enum(['ACTIVE', 'ARCHIVED', 'BLOCKED'])

export type ListingMediaStatus = z.infer<typeof ListingMediaStatusSchema>;