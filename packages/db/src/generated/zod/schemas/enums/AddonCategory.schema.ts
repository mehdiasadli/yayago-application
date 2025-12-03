import * as z from 'zod';

export const AddonCategorySchema = z.enum(['INSURANCE', 'PROTECTION', 'CHILD_SAFETY', 'NAVIGATION', 'CONNECTIVITY', 'COMFORT', 'WINTER', 'OUTDOOR', 'MOBILITY', 'DRIVER', 'DELIVERY', 'FUEL', 'CLEANING', 'TOLL', 'BORDER', 'PARKING', 'OTHER'])

export type AddonCategory = z.infer<typeof AddonCategorySchema>;