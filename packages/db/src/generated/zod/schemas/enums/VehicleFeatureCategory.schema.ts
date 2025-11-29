import * as z from 'zod';

export const VehicleFeatureCategorySchema = z.enum(['ENTERTAINMENT', 'SAFETY', 'COMFORT', 'PERFORMANCE', 'CONVENIENCE', 'TECHNOLOGY', 'ACCESSIBILITY', 'OTHER'])

export type VehicleFeatureCategory = z.infer<typeof VehicleFeatureCategorySchema>;