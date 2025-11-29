import * as z from 'zod';

export const DiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED'])

export type DiscountType = z.infer<typeof DiscountTypeSchema>;