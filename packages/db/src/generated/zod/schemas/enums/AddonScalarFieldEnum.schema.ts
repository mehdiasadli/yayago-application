import * as z from 'zod';

export const AddonScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'slug', 'name', 'description', 'shortName', 'category', 'iconKey', 'imageUrl', 'displayOrder', 'isFeatured', 'isPopular', 'inputType', 'billingType', 'suggestedPrice', 'maxPrice', 'minQuantity', 'maxQuantity', 'minRentalDays', 'maxRentalDays', 'minDriverAge', 'requiresApproval', 'allowedVehicleClasses', 'allowedVehicleBodyTypes', 'termsAndConditions', 'isRefundable', 'refundPolicy', 'isTaxExempt', 'isActive', 'selectionOptions'])

export type AddonScalarFieldEnum = z.infer<typeof AddonScalarFieldEnumSchema>;