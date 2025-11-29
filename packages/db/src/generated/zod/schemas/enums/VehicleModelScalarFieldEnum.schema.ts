import * as z from 'zod';

export const VehicleModelScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'brandId', 'name', 'lookup', 'slug', 'title', 'description', 'keywords'])

export type VehicleModelScalarFieldEnum = z.infer<typeof VehicleModelScalarFieldEnumSchema>;