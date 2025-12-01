import * as z from 'zod';

export const FavoriteScalarFieldEnumSchema = z.enum(['id', 'userId', 'listingId', 'createdAt'])

export type FavoriteScalarFieldEnum = z.infer<typeof FavoriteScalarFieldEnumSchema>;