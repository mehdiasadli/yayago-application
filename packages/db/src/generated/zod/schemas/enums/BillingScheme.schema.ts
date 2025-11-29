import * as z from 'zod';

export const BillingSchemeSchema = z.enum(['FIXED', 'PER_DAY'])

export type BillingScheme = z.infer<typeof BillingSchemeSchema>;