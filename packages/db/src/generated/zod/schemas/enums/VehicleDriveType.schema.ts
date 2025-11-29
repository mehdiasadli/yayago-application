import * as z from 'zod';

export const VehicleDriveTypeSchema = z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD'])

export type VehicleDriveType = z.infer<typeof VehicleDriveTypeSchema>;