import * as z from 'zod';

export const MileageUnitSchema = z.enum(['KM', 'MI'])

export type MileageUnit = z.infer<typeof MileageUnitSchema>;