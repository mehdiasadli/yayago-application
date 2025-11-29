import * as z from 'zod';

export const AddonScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'available', 'slug', 'name', 'description', 'category', 'inputType', 'billingScheme', 'maxQuantity', 'requiresApproval', 'iconKey'])

export type AddonScalarFieldEnum = z.infer<typeof AddonScalarFieldEnumSchema>;