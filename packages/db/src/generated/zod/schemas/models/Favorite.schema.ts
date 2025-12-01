import * as z from 'zod';

export const FavoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  listingId: z.string(),
  createdAt: z.date(),
});

export type FavoriteType = z.infer<typeof FavoriteSchema>;
