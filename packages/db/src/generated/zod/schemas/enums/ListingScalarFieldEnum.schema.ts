import * as z from 'zod';

export const ListingScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'title', 'description', 'slug', 'tags', 'status', 'verificationStatus', 'organizationId', 'viewCount', 'bookingCount', 'reviewCount', 'favoriteCount', 'averageRating', 'isFeatured', 'featuredUntil'])

export type ListingScalarFieldEnum = z.infer<typeof ListingScalarFieldEnumSchema>;