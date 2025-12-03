import * as z from 'zod';
import { AddonBookingStatusSchema } from '../enums/AddonBookingStatus.schema';

export const BookingAddonSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  bookingId: z.string(),
  listingAddonId: z.string(),
  addonSnapshot: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  quantity: z.number().int().default(1),
  selectedOption: z.string().nullish(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
  discountApplied: z.number(),
  taxAmount: z.number(),
  status: AddonBookingStatusSchema.default("CONFIRMED"),
  cancelledAt: z.date().nullish(),
  cancelledReason: z.string().nullish(),
  refundAmount: z.number().nullish(),
});

export type BookingAddonType = z.infer<typeof BookingAddonSchema>;
