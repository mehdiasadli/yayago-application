import type {
  CreateSubscriptionPlanInputType,
  CreateSubscriptionPlanOutputType,
  ListSubscriptionPlansInputType,
  ListSubscriptionPlansOutputType,
  FindOneSubscriptionPlanInputType,
  FindOneSubscriptionPlanOutputType,
  UpdateSubscriptionPlanInputType,
  UpdateSubscriptionPlanOutputType,
  DeleteSubscriptionPlanInputType,
  DeleteSubscriptionPlanOutputType,
  CreateSubscriptionPlanPriceInputType,
  CreateSubscriptionPlanPriceOutputType,
  UpdateSubscriptionPlanPriceInputType,
  UpdateSubscriptionPlanPriceOutputType,
  DeleteSubscriptionPlanPriceInputType,
  DeleteSubscriptionPlanPriceOutputType,
  CreateSubscriptionPlanFeatureInputType,
  CreateSubscriptionPlanFeatureOutputType,
  UpdateSubscriptionPlanFeatureInputType,
  UpdateSubscriptionPlanFeatureOutputType,
  DeleteSubscriptionPlanFeatureInputType,
  DeleteSubscriptionPlanFeatureOutputType,
  GetPublicSubscriptionPlansOutputType,
} from '@yayago-app/validators';
import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { getLocalizedValue, getPagination, paginate } from '../__shared__/utils';
import {
  createStripeProduct,
  updateStripeProduct,
  archiveStripeProduct,
  getStripeProduct,
  createStripePrice,
  archiveStripePrice,
  updateStripePrice,
  getStripePrice,
} from '@yayago-app/stripe';

// Helper to extract English name from localized JSON
function getEnglishName(nameJson: unknown): string {
  if (typeof nameJson === 'string') return nameJson;
  if (typeof nameJson === 'object' && nameJson !== null && 'en' in nameJson) {
    return (nameJson as Record<string, string>).en || 'Unnamed Plan';
  }
  return 'Unnamed Plan';
}

export class SubscriptionPlanService {
  // ==========================================
  // SUBSCRIPTION PLAN
  // ==========================================

  private static async findBySlug(slug: string) {
    return await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });
  }

  static async create(
    input: CreateSubscriptionPlanInputType,
    locale: string
  ): Promise<CreateSubscriptionPlanOutputType> {
    const slug = input.slug.toLowerCase();

    const existing = await this.findBySlug(slug);

    if (existing) {
      throw new ORPCError('CONFLICT', { message: 'Subscription plan with this slug already exists' });
    }

    const product = await createStripeProduct({
      name: getEnglishName(input.name),
      description: input.description ? getEnglishName(input.description) : undefined,
      metadata: {
        slug,
        maxListings: String(input.maxListings),
        maxMembers: String(input.maxMembers),
        maxImagesPerListing: String(input.maxImagesPerListing),
        maxVideosPerListing: String(input.maxVideosPerListing),
        hasAnalytics: String(input.hasAnalytics),
        trialEnabled: String(input.trialEnabled),
        trialDays: String(input.trialDays),
      },
    });

    if (!product) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create Stripe product. Please try again.',
      });
    }

    if (await prisma.subscriptionPlan.findUnique({ where: { stripeProductId: product.id } })) {
      throw new ORPCError('CONFLICT', {
        message: 'Subscription plan with this Stripe product ID already exists',
      });
    }

    const result = await prisma.subscriptionPlan.create({
      data: {
        ...input,
        isActive: false,
        isPopular: false,
        slug,
        stripeProductId: product.id,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        stripeProductId: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async list(input: ListSubscriptionPlansInputType, locale: string): Promise<ListSubscriptionPlansOutputType> {
    const { page, take, q, isActive } = input;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(q && {
        OR: [
          { slug: { contains: q.toLowerCase() } },
          {
            name: {
              path: ['en'],
              string_contains: q,
            },
          },
        ],
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.subscriptionPlan.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
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
          prices: {
            select: {
              id: true,
              stripePriceId: true,
              amount: true,
              currency: true,
              interval: true,
              isActive: true,
            },
            orderBy: { interval: 'asc' },
          },
          features: {
            select: {
              id: true,
              name: true,
              description: true,
              isIncluded: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.subscriptionPlan.count({ where }),
    ]);

    const items = data.map((plan) => ({
      ...plan,
      name: getLocalizedValue(plan.name, locale),
      description: getLocalizedValue(plan.description, locale),
      features: plan.features.map((feature) => ({
        ...feature,
        name: getLocalizedValue(feature.name, locale),
        description: getLocalizedValue(feature.description, locale),
      })),
    }));

    return paginate(items, page, take, total);
  }

  static async findOne(
    input: FindOneSubscriptionPlanInputType,
    locale: string
  ): Promise<FindOneSubscriptionPlanOutputType> {
    const { slug } = input;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
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
        prices: {
          select: {
            id: true,
            stripePriceId: true,
            amount: true,
            currency: true,
            interval: true,
            isActive: true,
          },
          orderBy: { interval: 'asc' },
        },
        features: {
          select: {
            id: true,
            name: true,
            description: true,
            isIncluded: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new ORPCError('NOT_FOUND', { message: 'Subscription plan not found' });
    }

    return {
      ...plan,
      name: getLocalizedValue(plan.name, locale),
      description: getLocalizedValue(plan.description, locale),
      features: plan.features.map((feature) => ({
        ...feature,
        name: getLocalizedValue(feature.name, locale),
        description: getLocalizedValue(feature.description, locale),
      })),
    };
  }

  static async update(
    input: UpdateSubscriptionPlanInputType,
    locale: string
  ): Promise<UpdateSubscriptionPlanOutputType> {
    const { slug, data } = input;

    const plan = await this.findBySlug(slug);
    if (!plan) {
      throw new ORPCError('NOT_FOUND', { message: 'Subscription plan not found' });
    }

    // Sync name/description changes to Stripe
    if (data.name || data.description !== undefined || data.isActive !== undefined) {
      try {
        await updateStripeProduct(plan.stripeProductId, {
          ...(data.name && { name: getEnglishName(data.name) }),
          ...(data.description !== undefined && {
            description: data.description ? getEnglishName(data.description) : '',
          }),
          ...(data.isActive !== undefined && { active: data.isActive }),
        });
        console.log(`📦 Synced plan "${slug}" changes to Stripe`);
      } catch (error: any) {
        console.error('Failed to update Stripe product:', error);
        // Continue with DB update even if Stripe sync fails
        // This allows for retry later
      }
    }

    const result = await prisma.subscriptionPlan.update({
      where: { slug },
      data,
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async delete(input: DeleteSubscriptionPlanInputType): Promise<DeleteSubscriptionPlanOutputType> {
    const { slug } = input;

    const plan = await this.findBySlug(slug);
    if (!plan) {
      throw new ORPCError('NOT_FOUND', { message: 'Subscription plan not found' });
    }

    // Check if there are active subscriptions using this plan
    const activeSubscriptions = await prisma.subscription.count({
      where: { plan: slug, status: 'active' },
    });

    if (activeSubscriptions > 0) {
      throw new ORPCError('CONFLICT', {
        message: `Cannot delete plan. There are ${activeSubscriptions} active subscriptions using this plan.`,
      });
    }

    // Archive the Stripe product (don't delete - keep for historical subscriptions)
    try {
      await archiveStripeProduct(plan.stripeProductId);
      console.log(`📦 Archived Stripe product for plan "${slug}"`);
    } catch (error: any) {
      console.error('Failed to archive Stripe product:', error);
      // Continue with DB deletion even if Stripe archive fails
    }

    // Delete the plan (cascade will delete prices and features)
    await prisma.subscriptionPlan.delete({
      where: { slug },
    });

    return { success: true };
  }

  // ==========================================
  // SUBSCRIPTION PLAN PRICE
  // ==========================================

  static async createPrice(
    input: CreateSubscriptionPlanPriceInputType
  ): Promise<CreateSubscriptionPlanPriceOutputType> {
    const { planSlug, ...data } = input;

    const plan = await this.findBySlug(planSlug);
    if (!plan) {
      throw new ORPCError('NOT_FOUND', { message: 'Subscription plan not found' });
    }

    const price = await createStripePrice({
      productId: plan.stripeProductId,
      unitAmount: data.amount,
      currency: data.currency,
      interval: data.interval,
      metadata: {
        plan: planSlug,
      },
    });

    if (!price) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create Stripe price. Please try again.',
      });
    }

    if (await prisma.subscriptionPlanPrice.findUnique({ where: { stripePriceId: price.id } })) {
      throw new ORPCError('CONFLICT', { message: 'Price with this Stripe price ID already exists' });
    }

    const result = await prisma.subscriptionPlanPrice.create({
      data: {
        ...data,
        stripePriceId: price.id,
        planId: plan.id,
      },
      select: {
        id: true,
        stripePriceId: true,
        amount: true,
        currency: true,
        interval: true,
        isActive: true,
      },
    });

    return result;
  }

  static async updatePrice(
    input: UpdateSubscriptionPlanPriceInputType
  ): Promise<UpdateSubscriptionPlanPriceOutputType> {
    const { id, data } = input;

    const price = await prisma.subscriptionPlanPrice.findUnique({ where: { id } });
    if (!price) {
      throw new ORPCError('NOT_FOUND', { message: 'Price not found' });
    }

    // Sync active status to Stripe
    if (data.isActive !== undefined) {
      try {
        await updateStripePrice(price.stripePriceId, {
          active: data.isActive,
        });
        console.log(`💰 Synced price "${price.stripePriceId}" active status to Stripe`);
      } catch (error: any) {
        console.error('Failed to update Stripe price:', error);
        // Continue with DB update
      }
    }

    const result = await prisma.subscriptionPlanPrice.update({
      where: { id },
      data,
      select: {
        id: true,
        isActive: true,
      },
    });

    return result;
  }

  static async deletePrice(
    input: DeleteSubscriptionPlanPriceInputType
  ): Promise<DeleteSubscriptionPlanPriceOutputType> {
    const { id } = input;

    const price = await prisma.subscriptionPlanPrice.findUnique({ where: { id } });
    if (!price) {
      throw new ORPCError('NOT_FOUND', { message: 'Price not found' });
    }

    // Archive the Stripe price (don't delete - can't delete prices with subscriptions)
    try {
      await archiveStripePrice(price.stripePriceId);
      console.log(`💰 Archived Stripe price: ${price.stripePriceId}`);
    } catch (error: any) {
      console.error('Failed to archive Stripe price:', error);
      // Continue with DB deletion
    }

    await prisma.subscriptionPlanPrice.delete({ where: { id } });

    return { success: true };
  }

  // ==========================================
  // SUBSCRIPTION PLAN FEATURE
  // ==========================================

  static async createFeature(
    input: CreateSubscriptionPlanFeatureInputType,
    locale: string
  ): Promise<CreateSubscriptionPlanFeatureOutputType> {
    const { planSlug, ...data } = input;

    const plan = await this.findBySlug(planSlug);
    if (!plan) {
      throw new ORPCError('NOT_FOUND', { message: 'Subscription plan not found' });
    }

    const result = await prisma.subscriptionPlanFeature.create({
      data: {
        ...data,
        planId: plan.id,
      },
      select: {
        id: true,
        name: true,
        isIncluded: true,
        sortOrder: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async updateFeature(
    input: UpdateSubscriptionPlanFeatureInputType,
    locale: string
  ): Promise<UpdateSubscriptionPlanFeatureOutputType> {
    const { id, data } = input;

    const feature = await prisma.subscriptionPlanFeature.findUnique({ where: { id } });
    if (!feature) {
      throw new ORPCError('NOT_FOUND', { message: 'Feature not found' });
    }

    const result = await prisma.subscriptionPlanFeature.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        isIncluded: true,
        sortOrder: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async deleteFeature(
    input: DeleteSubscriptionPlanFeatureInputType
  ): Promise<DeleteSubscriptionPlanFeatureOutputType> {
    const { id } = input;

    const feature = await prisma.subscriptionPlanFeature.findUnique({ where: { id } });
    if (!feature) {
      throw new ORPCError('NOT_FOUND', { message: 'Feature not found' });
    }

    await prisma.subscriptionPlanFeature.delete({ where: { id } });

    return { success: true };
  }

  // ==========================================
  // PUBLIC (for pricing page)
  // ==========================================

  static async getPublicPlans(locale: string): Promise<GetPublicSubscriptionPlansOutputType> {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        name: true,
        description: true,
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
        prices: {
          where: { isActive: true },
          select: {
            stripePriceId: true,
            amount: true,
            currency: true,
            interval: true,
          },
          orderBy: { interval: 'asc' },
        },
        features: {
          select: {
            name: true,
            description: true,
            isIncluded: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return plans.map((plan) => ({
      ...plan,
      name: getLocalizedValue(plan.name, locale),
      description: getLocalizedValue(plan.description, locale),
      features: plan.features.map((feature) => ({
        name: getLocalizedValue(feature.name, locale),
        description: getLocalizedValue(feature.description, locale),
        isIncluded: feature.isIncluded,
      })),
    }));
  }
}
