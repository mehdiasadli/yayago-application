import * as z from 'zod';
import { PlaceStatusSchema } from '../enums/PlaceStatus.schema';
import { TrafficDirectionSchema } from '../enums/TrafficDirection.schema';

export const CountrySchema = z.object({
  id: z.uuid('country.id.invalid'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  name: z.object({ en: z.string(), az: z.string(), ru: z.string(), ar: z.string() }),
  lookup: z.array(z.string()).min(1, 'country.lookup.min'),
  code: z.string().length(2, 'country.code.invalid'),
  status: PlaceStatusSchema.default("DRAFT"),
  phoneCode: z.string().startsWith('+'),
  flag: z.string().min(1, 'country.flag.minLength').nullish(),
  trafficDirection: TrafficDirectionSchema.default("RIGHT"),
  emergencyPhoneNumber: z.string().nullish(),
  minDriverAge: z.number().int().min(14, 'country.minDriverAge.invalid').max(120, 'country.minDriverAge.invalid').default(18),
  minDriverLicenseAge: z.number().int().default(1),
  title: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  currency: z.string().length(3, 'country.currency.invalid').default("USD"),
});

export type CountryType = z.infer<typeof CountrySchema>;
