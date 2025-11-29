import * as z from 'zod';

export const ListingFeatureScalarFieldEnumSchema = z.enum(['listingVehicleId', 'vehicleFeatureId', 'available'])

export type ListingFeatureScalarFieldEnum = z.infer<typeof ListingFeatureScalarFieldEnumSchema>;