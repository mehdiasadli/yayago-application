import * as z from 'zod';

export const PricingModeSchema = z.enum(['PRO_RATE'])

export type PricingMode = z.infer<typeof PricingModeSchema>;