import * as z from 'zod';

export const AddonBillingTypeSchema = z.enum(['FIXED', 'PER_DAY', 'PER_HOUR', 'PER_USE'])

export type AddonBillingType = z.infer<typeof AddonBillingTypeSchema>;