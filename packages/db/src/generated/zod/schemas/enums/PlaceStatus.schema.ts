import * as z from 'zod';

export const PlaceStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'COMING_SOON'])

export type PlaceStatus = z.infer<typeof PlaceStatusSchema>;