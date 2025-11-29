import * as z from 'zod';

export const VehicleTransmissionTypeSchema = z.enum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC', 'CVT'])

export type VehicleTransmissionType = z.infer<typeof VehicleTransmissionTypeSchema>;