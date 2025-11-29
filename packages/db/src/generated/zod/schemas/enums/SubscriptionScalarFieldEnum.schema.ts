import * as z from 'zod';

export const SubscriptionScalarFieldEnumSchema = z.enum(['id', 'plan', 'referenceId', 'stripeCustomerId', 'stripeSubscriptionId', 'status', 'periodStart', 'periodEnd', 'cancelAtPeriodEnd', 'seats', 'trialStart', 'trialEnd', 'organizationId', 'currentListings', 'currentFeaturedListings', 'currentMembers', 'currentTotalImages', 'currentTotalVideos', 'maxListings', 'maxFeaturedListings', 'maxMembers', 'maxImagesPerListing', 'maxVideosPerListing', 'hasAnalytics', 'extraListingCost', 'extraFeaturedListingCost', 'extraMemberCost', 'extraImageCost', 'extraVideoCost', 'extraAnalyticsCost'])

export type SubscriptionScalarFieldEnum = z.infer<typeof SubscriptionScalarFieldEnumSchema>;