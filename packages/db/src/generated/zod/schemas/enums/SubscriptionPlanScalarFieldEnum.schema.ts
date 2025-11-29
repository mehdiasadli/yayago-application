import * as z from 'zod';

export const SubscriptionPlanScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'slug', 'name', 'description', 'stripeProductId', 'maxListings', 'maxFeaturedListings', 'maxMembers', 'maxImagesPerListing', 'maxVideosPerListing', 'hasAnalytics', 'extraListingCost', 'extraFeaturedListingCost', 'extraMemberCost', 'extraImageCost', 'extraVideoCost', 'extraAnalyticsCost', 'trialEnabled', 'trialDays', 'isActive', 'isPopular', 'sortOrder'])

export type SubscriptionPlanScalarFieldEnum = z.infer<typeof SubscriptionPlanScalarFieldEnumSchema>;