import * as z from 'zod';
import { AddonCategorySchema } from '../enums/AddonCategory.schema';
import { BillingSchemeSchema } from '../enums/BillingScheme.schema';
import { InputTypeSchema } from '../enums/InputType.schema';

export const AddonSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  available: z.boolean().default(true),
  slug: z.string(),
  name: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  category: AddonCategorySchema,
  inputType: InputTypeSchema,
  billingScheme: BillingSchemeSchema.default("FIXED"),
  maxQuantity: z.number().int().nullish(),
  requiresApproval: z.boolean(),
  iconKey: z.string().nullish(),
});

export type AddonType = z.infer<typeof AddonSchema>;
