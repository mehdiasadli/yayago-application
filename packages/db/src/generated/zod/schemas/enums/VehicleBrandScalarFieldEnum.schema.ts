import * as z from 'zod';

export const VehicleBrandScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'lookup', 'slug', 'logo', 'website', 'originCountryCode', 'title', 'description', 'keywords'])

export type VehicleBrandScalarFieldEnum = z.infer<typeof VehicleBrandScalarFieldEnumSchema>;