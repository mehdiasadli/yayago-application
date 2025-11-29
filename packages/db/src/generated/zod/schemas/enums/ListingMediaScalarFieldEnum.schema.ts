import * as z from 'zod';

export const ListingMediaScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'listingId', 'displayOrder', 'type', 'status', 'rejectionReason', 'verificationStatus', 'isPrimary', 'publicId', 'url', 'alt', 'caption', 'width', 'height', 'size', 'mimeType'])

export type ListingMediaScalarFieldEnum = z.infer<typeof ListingMediaScalarFieldEnumSchema>;