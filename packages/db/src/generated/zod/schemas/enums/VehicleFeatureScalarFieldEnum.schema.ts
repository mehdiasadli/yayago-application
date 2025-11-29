import * as z from 'zod';

export const VehicleFeatureScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'available', 'code', 'name', 'description', 'iconKey', 'category'])

export type VehicleFeatureScalarFieldEnum = z.infer<typeof VehicleFeatureScalarFieldEnumSchema>;