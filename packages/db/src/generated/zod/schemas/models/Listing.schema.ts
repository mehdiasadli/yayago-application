import * as z from 'zod';
import { ListingStatusSchema } from '../enums/ListingStatus.schema';
import { VerificationStatusSchema } from '../enums/VerificationStatus.schema';

export const ListingSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  title: z.string(),
  description: z.string().nullish(),
  slug: z.string(),
  tags: z.array(z.string()),
  status: ListingStatusSchema.default("DRAFT"),
  verificationStatus: VerificationStatusSchema.default("PENDING"),
  organizationId: z.string(),
  viewCount: z.number().int(),
  bookingCount: z.number().int(),
  reviewCount: z.number().int(),
  favoriteCount: z.number().int(),
  averageRating: z.number().nullish(),
  isFeatured: z.boolean(),
  featuredUntil: z.date().nullish(),
});

export type ListingType = z.infer<typeof ListingSchema>;
