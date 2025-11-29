import * as z from 'zod';

export const AddonCategorySchema = z.enum(['SAFETY', 'COMFORT', 'SERVICE', 'PERMIT', 'GEAR'])

export type AddonCategory = z.infer<typeof AddonCategorySchema>;