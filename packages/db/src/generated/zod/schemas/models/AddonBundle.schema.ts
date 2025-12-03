import * as z from 'zod';
import { AddonDiscountTypeSchema } from '../enums/AddonDiscountType.schema';

export const AddonBundleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  slug: z.string(),
  name: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  imageUrl: z.string().nullish(),
  displayOrder: z.number().int(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean(),
  discountType: AddonDiscountTypeSchema.default("PERCENTAGE"),
  discountAmount: z.number(),
  organizationId: z.string().nullish(),
});

export type AddonBundleType = z.infer<typeof AddonBundleSchema>;
