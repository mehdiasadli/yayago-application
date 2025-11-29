import * as z from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  userId: z.string(),
  rating: z.number().int(),
  comment: z.string().nullish(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
