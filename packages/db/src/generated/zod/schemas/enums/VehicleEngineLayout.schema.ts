import * as z from 'zod';

export const VehicleEngineLayoutSchema = z.enum(['INLINE', 'V_TYPE', 'FLAT', 'W_TYPE', 'RADIAL', 'ROTARY', 'U_TYPE', 'H_TYPE', 'X_TYPE', 'OTHER'])

export type VehicleEngineLayout = z.infer<typeof VehicleEngineLayoutSchema>;