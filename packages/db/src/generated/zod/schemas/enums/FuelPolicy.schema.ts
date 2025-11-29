import * as z from 'zod';

export const FuelPolicySchema = z.enum(['SAME_TO_SAME', 'FULL_TO_FULL', 'PREPAID_FUEL'])

export type FuelPolicy = z.infer<typeof FuelPolicySchema>;