import * as z from 'zod';

export const VehicleFuelTypeSchema = z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'HYDROGEN', 'CNG', 'LPG', 'OTHER'])

export type VehicleFuelType = z.infer<typeof VehicleFuelTypeSchema>;