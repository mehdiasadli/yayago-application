import * as z from 'zod';
import { PlanIntervalSchema } from '../enums/PlanInterval.schema';

export const SubscriptionPlanPriceSchema = z.object({
  id: z.string(),
  planId: z.string(),
  stripePriceId: z.string(),
  amount: z.number().int(),
  currency: z.string().default("aed"),
  interval: PlanIntervalSchema.default("month"),
  isActive: z.boolean().default(true),
});

export type SubscriptionPlanPriceType = z.infer<typeof SubscriptionPlanPriceSchema>;
