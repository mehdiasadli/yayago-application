import {
  SubscriptionPlanSchema,
  SubscriptionPlanPriceSchema,
  SubscriptionPlanFeatureSchema,
} from '@yayago-app/db/models';
import { PlanIntervalSchema } from '@yayago-app/db/enums';
import { zLocalized } from '@yayago-app/i18n';
import z from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

// ==========================================
// SUBSCRIPTION PLAN
// ==========================================

export const CreateSubscriptionPlanInputSchema = SubscriptionPlanSchema.pick({
  slug: true,
  maxListings: true,
  maxFeaturedListings: true,
  maxMembers: true,
  maxImagesPerListing: true,
  maxVideosPerListing: true,
  hasAnalytics: true,
  extraListingCost: true,
  extraFeaturedListingCost: true,
  extraMemberCost: true,
  extraImageCost: true,
  extraVideoCost: true,
  trialEnabled: true,
  trialDays: true,
  sortOrder: true,
}).extend({
  name: zLocalized(),
  description: zLocalized().optional(),
});

export const CreateSubscriptionPlanOutputSchema = SubscriptionPlanSchema.pick({
  id: true,
  slug: true,
}).extend({
  name: z.string(),
});

export type CreateSubscriptionPlanInputType = z.infer<typeof CreateSubscriptionPlanInputSchema>;
export type CreateSubscriptionPlanOutputType = z.infer<typeof CreateSubscriptionPlanOutputSchema>;

export const ListSubscriptionPlansInputSchema = z
  .object({
    q: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListSubscriptionPlansOutputSchema = PaginationOutputSchema(
  SubscriptionPlanSchema.pick({
    id: true,
    slug: true,
    stripeProductId: true,
    maxListings: true,
    maxFeaturedListings: true,
    maxMembers: true,
    maxImagesPerListing: true,
    maxVideosPerListing: true,
    hasAnalytics: true,
    trialEnabled: true,
    trialDays: true,
    isActive: true,
    isPopular: true,
    sortOrder: true,
    createdAt: true,
  }).extend({
    name: z.string(),
    description: z.string().optional(),
    prices: z.array(
      SubscriptionPlanPriceSchema.pick({
        id: true,
        stripePriceId: true,
        amount: true,
        currency: true,
        interval: true,
        isActive: true,
      })
    ),
    features: z.array(
      SubscriptionPlanFeatureSchema.pick({
        id: true,
        isIncluded: true,
        sortOrder: true,
      }).extend({
        name: z.string(),
        description: z.string().optional(),
      })
    ),
  })
);

export type ListSubscriptionPlansInputType = z.infer<typeof ListSubscriptionPlansInputSchema>;
export type ListSubscriptionPlansOutputType = z.infer<typeof ListSubscriptionPlansOutputSchema>;

export const FindOneSubscriptionPlanInputSchema = z.object({
  slug: SubscriptionPlanSchema.shape.slug,
});

export const FindOneSubscriptionPlanOutputSchema = SubscriptionPlanSchema.pick({
  id: true,
  slug: true,
  stripeProductId: true,
  maxListings: true,
  maxFeaturedListings: true,
  maxMembers: true,
  maxImagesPerListing: true,
  maxVideosPerListing: true,
  hasAnalytics: true,
  extraListingCost: true,
  extraFeaturedListingCost: true,
  extraMemberCost: true,
  extraImageCost: true,
  extraVideoCost: true,
  trialEnabled: true,
  trialDays: true,
  isActive: true,
  isPopular: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string(),
  description: z.string().optional(),
  prices: z.array(
    SubscriptionPlanPriceSchema.pick({
      id: true,
      stripePriceId: true,
      amount: true,
      currency: true,
      interval: true,
      isActive: true,
    })
  ),
  features: z.array(
    SubscriptionPlanFeatureSchema.pick({
      id: true,
      isIncluded: true,
      sortOrder: true,
    }).extend({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
});

export type FindOneSubscriptionPlanInputType = z.infer<typeof FindOneSubscriptionPlanInputSchema>;
export type FindOneSubscriptionPlanOutputType = z.infer<typeof FindOneSubscriptionPlanOutputSchema>;

export const UpdateSubscriptionPlanInputSchema = z.object({
  slug: SubscriptionPlanSchema.shape.slug,
  data: SubscriptionPlanSchema.pick({
    maxListings: true,
    maxFeaturedListings: true,
    maxMembers: true,
    maxImagesPerListing: true,
    maxVideosPerListing: true,
    hasAnalytics: true,
    extraListingCost: true,
    extraFeaturedListingCost: true,
    extraMemberCost: true,
    extraImageCost: true,
    extraVideoCost: true,
    trialEnabled: true,
    trialDays: true,
    isActive: true,
    isPopular: true,
    sortOrder: true,
  })
    .extend({
      name: zLocalized().optional(),
      description: zLocalized().optional(),
    })
    .partial(),
});

export const UpdateSubscriptionPlanOutputSchema = SubscriptionPlanSchema.pick({
  id: true,
  slug: true,
}).extend({
  name: z.string(),
});

export type UpdateSubscriptionPlanInputType = z.infer<typeof UpdateSubscriptionPlanInputSchema>;
export type UpdateSubscriptionPlanOutputType = z.infer<typeof UpdateSubscriptionPlanOutputSchema>;

export const DeleteSubscriptionPlanInputSchema = z.object({
  slug: SubscriptionPlanSchema.shape.slug,
});

export const DeleteSubscriptionPlanOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteSubscriptionPlanInputType = z.infer<typeof DeleteSubscriptionPlanInputSchema>;
export type DeleteSubscriptionPlanOutputType = z.infer<typeof DeleteSubscriptionPlanOutputSchema>;

// ==========================================
// SUBSCRIPTION PLAN PRICE
// ==========================================

export const CreateSubscriptionPlanPriceInputSchema = z.object({
  planSlug: SubscriptionPlanSchema.shape.slug,
  amount: SubscriptionPlanPriceSchema.shape.amount,
  currency: SubscriptionPlanPriceSchema.shape.currency.default('aed'),
  interval: PlanIntervalSchema.default('month'),
  isActive: SubscriptionPlanPriceSchema.shape.isActive.default(true),
});

export const CreateSubscriptionPlanPriceOutputSchema = SubscriptionPlanPriceSchema.pick({
  id: true,
  stripePriceId: true,
  amount: true,
  currency: true,
  interval: true,
  isActive: true,
});

export type CreateSubscriptionPlanPriceInputType = z.infer<typeof CreateSubscriptionPlanPriceInputSchema>;
export type CreateSubscriptionPlanPriceOutputType = z.infer<typeof CreateSubscriptionPlanPriceOutputSchema>;

export const UpdateSubscriptionPlanPriceInputSchema = z.object({
  id: SubscriptionPlanPriceSchema.shape.id,
  data: SubscriptionPlanPriceSchema.pick({
    amount: true,
    currency: true,
    isActive: true,
  }).partial(),
});

export const UpdateSubscriptionPlanPriceOutputSchema = SubscriptionPlanPriceSchema.pick({
  id: true,
  isActive: true,
});

export type UpdateSubscriptionPlanPriceInputType = z.infer<typeof UpdateSubscriptionPlanPriceInputSchema>;
export type UpdateSubscriptionPlanPriceOutputType = z.infer<typeof UpdateSubscriptionPlanPriceOutputSchema>;

export const DeleteSubscriptionPlanPriceInputSchema = z.object({
  id: SubscriptionPlanPriceSchema.shape.id,
});

export const DeleteSubscriptionPlanPriceOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteSubscriptionPlanPriceInputType = z.infer<typeof DeleteSubscriptionPlanPriceInputSchema>;
export type DeleteSubscriptionPlanPriceOutputType = z.infer<typeof DeleteSubscriptionPlanPriceOutputSchema>;

// ==========================================
// SUBSCRIPTION PLAN FEATURE
// ==========================================

export const CreateSubscriptionPlanFeatureInputSchema = z.object({
  planSlug: SubscriptionPlanSchema.shape.slug,
  name: zLocalized(),
  description: zLocalized().optional(),
  isIncluded: SubscriptionPlanFeatureSchema.shape.isIncluded.default(true),
  sortOrder: SubscriptionPlanFeatureSchema.shape.sortOrder.default(0),
});

export const CreateSubscriptionPlanFeatureOutputSchema = SubscriptionPlanFeatureSchema.pick({
  id: true,
  isIncluded: true,
  sortOrder: true,
}).extend({
  name: z.string(),
});

export type CreateSubscriptionPlanFeatureInputType = z.infer<typeof CreateSubscriptionPlanFeatureInputSchema>;
export type CreateSubscriptionPlanFeatureOutputType = z.infer<typeof CreateSubscriptionPlanFeatureOutputSchema>;

export const UpdateSubscriptionPlanFeatureInputSchema = z.object({
  id: SubscriptionPlanFeatureSchema.shape.id,
  data: z
    .object({
      name: zLocalized(),
      description: zLocalized(),
      isIncluded: SubscriptionPlanFeatureSchema.shape.isIncluded,
      sortOrder: SubscriptionPlanFeatureSchema.shape.sortOrder,
    })
    .partial(),
});

export const UpdateSubscriptionPlanFeatureOutputSchema = SubscriptionPlanFeatureSchema.pick({
  id: true,
  isIncluded: true,
  sortOrder: true,
}).extend({
  name: z.string(),
});

export type UpdateSubscriptionPlanFeatureInputType = z.infer<typeof UpdateSubscriptionPlanFeatureInputSchema>;
export type UpdateSubscriptionPlanFeatureOutputType = z.infer<typeof UpdateSubscriptionPlanFeatureOutputSchema>;

export const DeleteSubscriptionPlanFeatureInputSchema = z.object({
  id: SubscriptionPlanFeatureSchema.shape.id,
});

export const DeleteSubscriptionPlanFeatureOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteSubscriptionPlanFeatureInputType = z.infer<typeof DeleteSubscriptionPlanFeatureInputSchema>;
export type DeleteSubscriptionPlanFeatureOutputType = z.infer<typeof DeleteSubscriptionPlanFeatureOutputSchema>;

// ==========================================
// PUBLIC SCHEMAS (for pricing page, no auth required)
// ==========================================

export const GetPublicSubscriptionPlansOutputSchema = z.array(
  SubscriptionPlanSchema.pick({
    slug: true,
    maxListings: true,
    maxFeaturedListings: true,
    maxMembers: true,
    maxImagesPerListing: true,
    maxVideosPerListing: true,
    hasAnalytics: true,
    trialEnabled: true,
    trialDays: true,
    isPopular: true,
    sortOrder: true,
  }).extend({
    name: z.string(),
    description: z.string().optional(),
    prices: z.array(
      SubscriptionPlanPriceSchema.pick({
        stripePriceId: true,
        amount: true,
        currency: true,
        interval: true,
      })
    ),
    features: z.array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isIncluded: z.boolean(),
      })
    ),
  })
);

export type GetPublicSubscriptionPlansOutputType = z.infer<typeof GetPublicSubscriptionPlansOutputSchema>;
