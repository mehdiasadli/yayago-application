import * as z from 'zod';

export const PartialDayPolicySchema = z.enum(['ROUND_UP_FULL_DAY', 'CHARGE_HOURLY'])

export type PartialDayPolicy = z.infer<typeof PartialDayPolicySchema>;