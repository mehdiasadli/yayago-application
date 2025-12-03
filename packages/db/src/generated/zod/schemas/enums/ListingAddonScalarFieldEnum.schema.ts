import * as z from 'zod';

export const ListingAddonScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'listingId', 'addonId', 'isActive', 'customName', 'customDescription', 'customTerms', 'price', 'currency', 'discountAmount', 'discountType', 'discountValidUntil', 'stockQuantity', 'maxPerBooking', 'minPerBooking', 'isIncludedFree', 'isRecommended', 'displayOrder', 'minDriverAge'])

export type ListingAddonScalarFieldEnum = z.infer<typeof ListingAddonScalarFieldEnumSchema>;