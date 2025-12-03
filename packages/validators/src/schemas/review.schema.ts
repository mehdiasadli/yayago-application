import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

// ============ REVIEW TAGS (Goodreads-style boolean impressions) ============

export const ReviewTagsSchema = z.object({
  // Vehicle condition & quality
  wasClean: z.boolean().optional(), // Was the car clean inside and out?
  wasAsDescribed: z.boolean().optional(), // Was it as described in the listing?
  wasReliable: z.boolean().optional(), // No mechanical issues during rental?

  // Driving experience
  wasEasyToDrive: z.boolean().optional(), // Easy to drive and handle?
  wasComfortable: z.boolean().optional(), // Comfortable for the trip?
  wasFuelEfficient: z.boolean().optional(), // Good fuel economy?
  hadGoodAC: z.boolean().optional(), // AC/heating worked well?
  wasSpacious: z.boolean().optional(), // Enough space for passengers/luggage?

  // Service quality
  wasPickupSmooth: z.boolean().optional(), // Smooth pickup experience?
  wasDropoffSmooth: z.boolean().optional(), // Smooth dropoff experience?
  wasHostResponsive: z.boolean().optional(), // Host was responsive and helpful?

  // Value & recommendation
  wasGoodValue: z.boolean().optional(), // Good value for the price paid?
  wouldRentAgain: z.boolean().optional(), // Would rent this specific car again?
  wouldRecommend: z.boolean().optional(), // Would recommend to a friend?
});

export type ReviewTagsType = z.infer<typeof ReviewTagsSchema>;

// ============ CREATE REVIEW ============

export const CreateReviewInputSchema = z.object({
  bookingId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  // Goodreads-style tags
  tags: ReviewTagsSchema.optional(),
});

export const CreateReviewOutputSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.date(),
});

export type CreateReviewInputType = z.infer<typeof CreateReviewInputSchema>;
export type CreateReviewOutputType = z.infer<typeof CreateReviewOutputSchema>;

// ============ UPDATE REVIEW ============

export const UpdateReviewInputSchema = z.object({
  reviewId: z.uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional().nullable(),
  // Update tags
  tags: ReviewTagsSchema.optional(),
});

export const UpdateReviewOutputSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  updatedAt: z.date(),
});

export type UpdateReviewInputType = z.infer<typeof UpdateReviewInputSchema>;
export type UpdateReviewOutputType = z.infer<typeof UpdateReviewOutputSchema>;

// ============ DELETE REVIEW ============

export const DeleteReviewInputSchema = z.object({
  reviewId: z.uuid(),
});

export const DeleteReviewOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export type DeleteReviewInputType = z.infer<typeof DeleteReviewInputSchema>;
export type DeleteReviewOutputType = z.infer<typeof DeleteReviewOutputSchema>;

// ============ GET REVIEW ============

export const GetReviewInputSchema = z.object({
  reviewId: z.uuid(),
});

export const ReviewOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  rating: z.number(),
  comment: z.string().nullable(),

  // Tags
  wasClean: z.boolean().nullable(),
  wasAsDescribed: z.boolean().nullable(),
  wasReliable: z.boolean().nullable(),
  wasEasyToDrive: z.boolean().nullable(),
  wasComfortable: z.boolean().nullable(),
  wasFuelEfficient: z.boolean().nullable(),
  hadGoodAC: z.boolean().nullable(),
  wasSpacious: z.boolean().nullable(),
  wasPickupSmooth: z.boolean().nullable(),
  wasDropoffSmooth: z.boolean().nullable(),
  wasHostResponsive: z.boolean().nullable(),
  wasGoodValue: z.boolean().nullable(),
  wouldRentAgain: z.boolean().nullable(),
  wouldRecommend: z.boolean().nullable(),

  // User who wrote the review
  user: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),

  // Listing reviewed (with vehicle info from relation)
  listing: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    vehicle: z
      .object({
        year: z.number(),
        model: z.object({
          name: z.string(),
          brand: z.object({
            name: z.string(),
          }),
        }),
      })
      .nullable(),
  }),

  // Booking reference
  booking: z.object({
    id: z.string(),
    referenceCode: z.string(),
  }),
});

export type GetReviewInputType = z.infer<typeof GetReviewInputSchema>;
export type ReviewOutputType = z.infer<typeof ReviewOutputSchema>;

// ============ LIST REVIEWS FOR LISTING (Public) ============

export const ListListingReviewsInputSchema = PaginationInputSchema.extend({
  listingSlug: z.string(),
  rating: z.number().int().min(1).max(5).optional(), // Filter by rating
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export const ListListingReviewsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    rating: z.number(),
    comment: z.string().nullable(),

    // Selected positive tags for quick display
    tags: z.object({
      wasClean: z.boolean().nullable(),
      wasAsDescribed: z.boolean().nullable(),
      wasReliable: z.boolean().nullable(),
      wasEasyToDrive: z.boolean().nullable(),
      wasComfortable: z.boolean().nullable(),
      wasFuelEfficient: z.boolean().nullable(),
      hadGoodAC: z.boolean().nullable(),
      wasSpacious: z.boolean().nullable(),
      wasPickupSmooth: z.boolean().nullable(),
      wasDropoffSmooth: z.boolean().nullable(),
      wasHostResponsive: z.boolean().nullable(),
      wasGoodValue: z.boolean().nullable(),
      wouldRentAgain: z.boolean().nullable(),
      wouldRecommend: z.boolean().nullable(),
    }),

    // User who wrote the review
    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    }),

    // Booking reference for context
    booking: z.object({
      id: z.string(),
      referenceCode: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }),
  })
);

export type ListListingReviewsInputType = z.infer<typeof ListListingReviewsInputSchema>;
export type ListListingReviewsOutputType = z.infer<typeof ListListingReviewsOutputSchema>;

// ============ GET LISTING REVIEW SUMMARY ============

export const GetListingReviewSummaryInputSchema = z.object({
  listingSlug: z.string(),
});

export const GetListingReviewSummaryOutputSchema = z.object({
  totalReviews: z.number(),
  averageRating: z.number().nullable(),

  // Rating distribution
  ratingDistribution: z.object({
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
  }),

  // Tag statistics (percentage of positive responses)
  tagStats: z.object({
    wasClean: z.object({ positive: z.number(), total: z.number() }),
    wasAsDescribed: z.object({ positive: z.number(), total: z.number() }),
    wasReliable: z.object({ positive: z.number(), total: z.number() }),
    wasEasyToDrive: z.object({ positive: z.number(), total: z.number() }),
    wasComfortable: z.object({ positive: z.number(), total: z.number() }),
    wasFuelEfficient: z.object({ positive: z.number(), total: z.number() }),
    hadGoodAC: z.object({ positive: z.number(), total: z.number() }),
    wasSpacious: z.object({ positive: z.number(), total: z.number() }),
    wasPickupSmooth: z.object({ positive: z.number(), total: z.number() }),
    wasDropoffSmooth: z.object({ positive: z.number(), total: z.number() }),
    wasHostResponsive: z.object({ positive: z.number(), total: z.number() }),
    wasGoodValue: z.object({ positive: z.number(), total: z.number() }),
    wouldRentAgain: z.object({ positive: z.number(), total: z.number() }),
    wouldRecommend: z.object({ positive: z.number(), total: z.number() }),
  }),

  // Recent highlights
  recentHighlights: z.array(
    z.object({
      id: z.string(),
      rating: z.number(),
      comment: z.string().nullable(),
      userName: z.string(),
      createdAt: z.date(),
    })
  ),
});

export type GetListingReviewSummaryInputType = z.infer<typeof GetListingReviewSummaryInputSchema>;
export type GetListingReviewSummaryOutputType = z.infer<typeof GetListingReviewSummaryOutputSchema>;

// ============ LIST USER'S REVIEWS ============

export const ListUserReviewsInputSchema = PaginationInputSchema.extend({
  // Optional - if not provided, returns current user's reviews
  userId: z.uuid().optional(),
});

export const ListUserReviewsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    rating: z.number(),
    comment: z.string().nullable(),

    // Listing with vehicle info from relation
    listing: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      primaryImage: z.string().nullable(),
      vehicle: z
        .object({
          year: z.number(),
          model: z.object({
            name: z.string(),
            brand: z.object({
              name: z.string(),
            }),
          }),
        })
        .nullable(),
    }),

    // Booking reference
    booking: z.object({
      id: z.string(),
      referenceCode: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }),
  })
);

export type ListUserReviewsInputType = z.infer<typeof ListUserReviewsInputSchema>;
export type ListUserReviewsOutputType = z.infer<typeof ListUserReviewsOutputSchema>;

// ============ LIST PARTNER'S REVIEWS (Reviews for their listings) ============

export const ListPartnerReviewsInputSchema = PaginationInputSchema.extend({
  listingSlug: z.string().optional(), // Filter by specific listing
  rating: z.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export const ListPartnerReviewsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    rating: z.number(),
    comment: z.string().nullable(),

    // Tags summary
    tags: z.object({
      wasClean: z.boolean().nullable(),
      wasAsDescribed: z.boolean().nullable(),
      wasReliable: z.boolean().nullable(),
      wasPickupSmooth: z.boolean().nullable(),
      wasDropoffSmooth: z.boolean().nullable(),
      wasHostResponsive: z.boolean().nullable(),
      wasGoodValue: z.boolean().nullable(),
      wouldRentAgain: z.boolean().nullable(),
      wouldRecommend: z.boolean().nullable(),
    }),

    user: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    }),

    listing: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
    }),

    booking: z.object({
      id: z.string(),
      referenceCode: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      totalPrice: z.number(),
      currency: z.string(),
    }),
  })
);

export type ListPartnerReviewsInputType = z.infer<typeof ListPartnerReviewsInputSchema>;
export type ListPartnerReviewsOutputType = z.infer<typeof ListPartnerReviewsOutputSchema>;

// ============ LIST ALL REVIEWS (Admin) ============

export const ListAllReviewsInputSchema = PaginationInputSchema.extend({
  q: z.string().optional(), // Search in comments
  listingSlug: z.string().optional(),
  userId: z.uuid().optional(),
  organizationSlug: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
});

export const ListAllReviewsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    createdAt: z.date(),
    rating: z.number(),
    comment: z.string().nullable(),

    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),

    listing: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
    }),

    organization: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),

    booking: z.object({
      id: z.string(),
      referenceCode: z.string(),
    }),
  })
);

export type ListAllReviewsInputType = z.infer<typeof ListAllReviewsInputSchema>;
export type ListAllReviewsOutputType = z.infer<typeof ListAllReviewsOutputSchema>;

// ============ GET PARTNER REVIEW STATS ============

export const GetPartnerReviewStatsOutputSchema = z.object({
  totalReviews: z.number(),
  averageRating: z.number().nullable(),

  // Rating distribution
  ratingDistribution: z.object({
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
  }),

  // Overall tag performance (percentage of positive responses)
  tagPerformance: z.object({
    wasClean: z.number().nullable(), // percentage
    wasAsDescribed: z.number().nullable(),
    wasReliable: z.number().nullable(),
    wasEasyToDrive: z.number().nullable(),
    wasComfortable: z.number().nullable(),
    wasFuelEfficient: z.number().nullable(),
    hadGoodAC: z.number().nullable(),
    wasSpacious: z.number().nullable(),
    wasPickupSmooth: z.number().nullable(),
    wasDropoffSmooth: z.number().nullable(),
    wasHostResponsive: z.number().nullable(),
    wasGoodValue: z.number().nullable(),
    wouldRentAgain: z.number().nullable(),
    wouldRecommend: z.number().nullable(),
  }),

  // Reviews this month
  reviewsThisMonth: z.number(),
  averageRatingThisMonth: z.number().nullable(),

  // Recent reviews needing attention (low ratings)
  recentLowRatings: z.array(
    z.object({
      id: z.string(),
      rating: z.number(),
      comment: z.string().nullable(),
      userName: z.string(),
      listingTitle: z.string(),
      createdAt: z.date(),
    })
  ),
});

export type GetPartnerReviewStatsOutputType = z.infer<typeof GetPartnerReviewStatsOutputSchema>;

// ============ CHECK IF USER CAN REVIEW BOOKING ============

export const CanReviewBookingInputSchema = z.object({
  bookingId: z.uuid(),
});

export const CanReviewBookingOutputSchema = z.object({
  canReview: z.boolean(),
  reason: z.string().optional(), // If can't review, why not
  existingReviewId: z.string().optional(), // If already reviewed
});

export type CanReviewBookingInputType = z.infer<typeof CanReviewBookingInputSchema>;
export type CanReviewBookingOutputType = z.infer<typeof CanReviewBookingOutputSchema>;

// ============ GET PENDING REVIEWS (Bookings user can review) ============

export const GetPendingReviewsOutputSchema = z.object({
  pendingReviews: z.array(
    z.object({
      booking: z.object({
        id: z.string(),
        referenceCode: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
      listing: z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        primaryImage: z.string().nullable(),
      }),
      vehicle: z.object({
        make: z.string(),
        model: z.string(),
        year: z.number(),
      }),
    })
  ),
});

export type GetPendingReviewsOutputType = z.infer<typeof GetPendingReviewsOutputSchema>;
