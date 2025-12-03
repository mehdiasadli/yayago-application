import * as z from 'zod';

export const AddonInputTypeSchema = z.enum(['BOOLEAN', 'QUANTITY', 'SELECTION'])

export type AddonInputType = z.infer<typeof AddonInputTypeSchema>;