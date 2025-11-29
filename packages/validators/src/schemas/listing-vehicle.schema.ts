import { ListingVehicleSchema } from '@yayago-app/db/models';
import { z } from 'zod';

export const CreateListingVehicleInputSchema = ListingVehicleSchema.pick({
  year: true,
  bodyType: true,
  class: true,
  doors: true,
  seats: true,
  driveType: true,
  exteriorColors: true,
  fuelType: true,
  odometer: true,
  vin: true,
  licensePlate: true,
  transmissionType: true,
  trim: true,
  listingId: true,
}).extend({
  modelSlug: z.string(),
});

export type CreateListingVehicleInputType = z.infer<typeof CreateListingVehicleInputSchema>;
