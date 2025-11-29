import * as z from 'zod';
import { DiscountTypeSchema } from '../enums/DiscountType.schema';

export const ListingAddonSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  addonId: z.string(),
  price: z.number(),
  discountAmount: z.number().nullish(),
  discountType: DiscountTypeSchema.default("PERCENTAGE"),
});

export type ListingAddonType = z.infer<typeof ListingAddonSchema>;
