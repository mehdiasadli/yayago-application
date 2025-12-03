import * as z from 'zod';

export const AddonDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT'])

export type AddonDiscountType = z.infer<typeof AddonDiscountTypeSchema>;