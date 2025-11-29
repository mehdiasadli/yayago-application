import * as z from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'listingId', 'userId', 'rating', 'comment'])

export type ReviewScalarFieldEnum = z.infer<typeof ReviewScalarFieldEnumSchema>;