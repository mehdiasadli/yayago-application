import * as z from 'zod';

export const ListingAddonScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'listingId', 'addonId', 'price', 'discountAmount', 'discountType'])

export type ListingAddonScalarFieldEnum = z.infer<typeof ListingAddonScalarFieldEnumSchema>;