import * as z from 'zod';

export const SubscriptionStatusSchema = z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid'])

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;