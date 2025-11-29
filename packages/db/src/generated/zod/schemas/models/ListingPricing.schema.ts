import * as z from 'zod';
import { CancellationPolicySchema } from '../enums/CancellationPolicy.schema';
import { PartialDayPolicySchema } from '../enums/PartialDayPolicy.schema';
import { PricingModeSchema } from '../enums/PricingMode.schema';

export const ListingPricingSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  currency: z.string(),
  pricePerHour: z.number().nullish(),
  pricePerDay: z.number(),
  pricePerThreeDays: z.number().nullish(),
  pricePerWeek: z.number().nullish(),
  pricePerMonth: z.number().nullish(),
  weekendPricePerDay: z.number().nullish(),
  dynamicPricingRules: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  depositAmount: z.number().nullish(),
  securityDepositRequired: z.boolean().default(true),
  securityDepositAmount: z.number().nullish(),
  acceptsSecurityDepositWaiver: z.boolean(),
  securityDepositWaiverCost: z.number().nullish(),
  cancellationPolicy: CancellationPolicySchema.default("STRICT"),
  cancellationFee: z.number().nullish(),
  refundableDepositAmount: z.number().nullish(),
  cancelGracePeriodHours: z.number().int().nullish(),
  partialDayPolicy: PartialDayPolicySchema.default("ROUND_UP_FULL_DAY"),
  pricingMode: PricingModeSchema.default("PRO_RATE"),
  taxRate: z.number().nullish(),
});

export type ListingPricingType = z.infer<typeof ListingPricingSchema>;
