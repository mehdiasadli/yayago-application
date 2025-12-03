import * as z from 'zod';
import { AddonDiscountTypeSchema } from '../enums/AddonDiscountType.schema';

export const ListingAddonSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  addonId: z.string(),
  isActive: z.boolean().default(true),
  customName: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  customDescription: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  customTerms: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  price: z.number(),
  currency: z.string().default("AED"),
  discountAmount: z.number().nullish(),
  discountType: AddonDiscountTypeSchema.default("PERCENTAGE"),
  discountValidUntil: z.date().nullish(),
  stockQuantity: z.number().int().nullish(),
  maxPerBooking: z.number().int().nullish(),
  minPerBooking: z.number().int().default(1),
  isIncludedFree: z.boolean(),
  isRecommended: z.boolean(),
  displayOrder: z.number().int(),
  minDriverAge: z.number().int().nullish(),
});

export type ListingAddonType = z.infer<typeof ListingAddonSchema>;
