import * as z from 'zod';

export const ListingMediaKindSchema = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT'])

export type ListingMediaKind = z.infer<typeof ListingMediaKindSchema>;