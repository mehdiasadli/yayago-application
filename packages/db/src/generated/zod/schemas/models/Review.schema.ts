import * as z from 'zod';

export const ReviewSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  userId: z.string(),
  bookingId: z.string(),
  rating: z.number().int(),
  comment: z.string().nullish(),
  wasClean: z.boolean().nullish(),
  wasAsDescribed: z.boolean().nullish(),
  wasReliable: z.boolean().nullish(),
  wasEasyToDrive: z.boolean().nullish(),
  wasComfortable: z.boolean().nullish(),
  wasFuelEfficient: z.boolean().nullish(),
  hadGoodAC: z.boolean().nullish(),
  wasSpacious: z.boolean().nullish(),
  wasPickupSmooth: z.boolean().nullish(),
  wasDropoffSmooth: z.boolean().nullish(),
  wasHostResponsive: z.boolean().nullish(),
  wasGoodValue: z.boolean().nullish(),
  wouldRentAgain: z.boolean().nullish(),
  wouldRecommend: z.boolean().nullish(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
