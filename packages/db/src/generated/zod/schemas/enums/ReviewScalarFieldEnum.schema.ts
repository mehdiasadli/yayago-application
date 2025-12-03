import * as z from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'listingId', 'userId', 'bookingId', 'rating', 'comment', 'wasClean', 'wasAsDescribed', 'wasReliable', 'wasEasyToDrive', 'wasComfortable', 'wasFuelEfficient', 'hadGoodAC', 'wasSpacious', 'wasPickupSmooth', 'wasDropoffSmooth', 'wasHostResponsive', 'wasGoodValue', 'wouldRentAgain', 'wouldRecommend'])

export type ReviewScalarFieldEnum = z.infer<typeof ReviewScalarFieldEnumSchema>;