import * as z from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  userId: z.string(),
  bookingId: z.string(),
  vehicleSnapshot: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  bookingSnapshot: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  rating: z.number().int(),
  comment: z.string().nullish(),
  wasClean: z.boolean().nullish(),
  wasAsDescribed: z.boolean().nullish(),
  wasReliable: z.boolean().nullish(),
  wasEasyToDrive: z.boolean().nullish(),
  wasComfortable: z.boolean().nullish(),
  wasFuelEfficient: z.boolean().nullish(),
  hadGoodAC: z.boolean().nullish(),
  wasSpacious: z.boolean().nullish(),
  wasPickupSmooth: z.boolean().nullish(),
  wasDropoffSmooth: z.boolean().nullish(),
  wasHostResponsive: z.boolean().nullish(),
  wasGoodValue: z.boolean().nullish(),
  wouldRentAgain: z.boolean().nullish(),
  wouldRecommend: z.boolean().nullish(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
