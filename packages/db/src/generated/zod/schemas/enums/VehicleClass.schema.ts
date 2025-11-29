import * as z from 'zod';

export const VehicleClassSchema = z.enum(['ECONOMY', 'COMPACT', 'STANDARD', 'PREMIUM', 'BUSINESS', 'LUXURY', 'HYPERCAR', 'OTHER'])

export type VehicleClass = z.infer<typeof VehicleClassSchema>;