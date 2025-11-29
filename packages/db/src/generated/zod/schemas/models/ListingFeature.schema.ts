import * as z from 'zod';

export const ListingFeatureSchema = z.object({
  listingVehicleId: z.string(),
  vehicleFeatureId: z.string(),
  available: z.boolean().default(true),
});

export type ListingFeatureType = z.infer<typeof ListingFeatureSchema>;
