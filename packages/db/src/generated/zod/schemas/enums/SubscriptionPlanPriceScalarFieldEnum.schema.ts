import * as z from 'zod';

export const SubscriptionPlanPriceScalarFieldEnumSchema = z.enum(['id', 'planId', 'stripePriceId', 'amount', 'currency', 'interval', 'isActive'])

export type SubscriptionPlanPriceScalarFieldEnum = z.infer<typeof SubscriptionPlanPriceScalarFieldEnumSchema>;