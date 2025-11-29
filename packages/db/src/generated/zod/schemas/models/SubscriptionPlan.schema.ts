import * as z from 'zod';

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  slug: z.string(),
  name: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  stripeProductId: z.string(),
  maxListings: z.number().int(),
  maxFeaturedListings: z.number().int(),
  maxMembers: z.number().int(),
  maxImagesPerListing: z.number().int(),
  maxVideosPerListing: z.number().int(),
  hasAnalytics: z.boolean(),
  extraListingCost: z.number().int().nullish(),
  extraFeaturedListingCost: z.number().int().nullish(),
  extraMemberCost: z.number().int().nullish(),
  extraImageCost: z.number().int().nullish(),
  extraVideoCost: z.number().int().nullish(),
  extraAnalyticsCost: z.number().int().nullish(),
  trialEnabled: z.boolean(),
  trialDays: z.number().int(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean(),
  sortOrder: z.number().int(),
});

export type SubscriptionPlanType = z.infer<typeof SubscriptionPlanSchema>;
