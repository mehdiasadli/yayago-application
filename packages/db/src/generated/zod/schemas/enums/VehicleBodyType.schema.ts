import * as z from 'zod';

export const VehicleBodyTypeSchema = z.enum(['SEDAN', 'HATCHBACK', 'SUV', 'MINIVAN', 'COUPE', 'CONVERTIBLE', 'ROADSTER', 'SPORTS_CAR', 'VAN', 'PICKUP', 'MOTORCYCLE', 'BUS', 'SCOOTER', 'BICYCLE', 'OTHER'])

export type VehicleBodyType = z.infer<typeof VehicleBodyTypeSchema>;