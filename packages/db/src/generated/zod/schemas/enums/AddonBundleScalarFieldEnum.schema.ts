import * as z from 'zod';

export const AddonBundleScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'slug', 'name', 'description', 'imageUrl', 'displayOrder', 'isActive', 'isFeatured', 'discountType', 'discountAmount', 'organizationId'])

export type AddonBundleScalarFieldEnum = z.infer<typeof AddonBundleScalarFieldEnumSchema>;