import * as z from 'zod';
import { OrganizationStatusSchema } from '../enums/OrganizationStatus.schema';

export const OrganizationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo: z.string().nullish(),
  cover: z.string().nullish(),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  legalName: z.string().nullish(),
  taxId: z.string().nullish(),
  email: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  phoneNumberVerified: z.boolean(),
  website: z.string().nullish(),
  cityId: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  address: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  metadata: z.string().nullish(),
  status: OrganizationStatusSchema.default("IDLE"),
  onboardingStep: z.number().int().default(1),
  rejectionReason: z.string().nullish(),
  banReason: z.string().nullish(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;
