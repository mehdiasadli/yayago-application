import * as z from 'zod';

export const CancellationPolicySchema = z.enum(['STRICT', 'FLEXIBLE', 'FREE_CANCELLATION'])

export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;