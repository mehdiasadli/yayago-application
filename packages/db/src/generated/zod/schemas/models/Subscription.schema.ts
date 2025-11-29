import * as z from 'zod';
import { SubscriptionStatusSchema } from '../enums/SubscriptionStatus.schema';

export const SubscriptionSchema = z.object({
  id: z.string(),
  plan: z.string(),
  referenceId: z.string(),
  stripeCustomerId: z.string().nullish(),
  stripeSubscriptionId: z.string().nullish(),
  status: SubscriptionStatusSchema,
  periodStart: z.date().nullish(),
  periodEnd: z.date().nullish(),
  cancelAtPeriodEnd: z.boolean().nullish(),
  seats: z.number().int().nullish(),
  trialStart: z.date().nullish(),
  trialEnd: z.date().nullish(),
  organizationId: z.string().nullish(),
  currentListings: z.number().int(),
  currentFeaturedListings: z.number().int(),
  currentMembers: z.number().int(),
  currentTotalImages: z.number().int(),
  currentTotalVideos: z.number().int(),
  maxListings: z.number().int().nullish(),
  maxFeaturedListings: z.number().int().nullish(),
  maxMembers: z.number().int().nullish(),
  maxImagesPerListing: z.number().int().nullish(),
  maxVideosPerListing: z.number().int().nullish(),
  hasAnalytics: z.boolean().nullish(),
  extraListingCost: z.number().int().nullish(),
  extraFeaturedListingCost: z.number().int().nullish(),
  extraMemberCost: z.number().int().nullish(),
  extraImageCost: z.number().int().nullish(),
  extraVideoCost: z.number().int().nullish(),
  extraAnalyticsCost: z.number().int().nullish(),
});

export type SubscriptionType = z.infer<typeof SubscriptionSchema>;
