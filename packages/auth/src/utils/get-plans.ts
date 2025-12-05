import prisma from '@yayago-app/db';

// Default trial period for all plans (14 days)
const DEFAULT_TRIAL_DAYS = 14;

export async function getPlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    include: {
      prices: {
        where: {
          isActive: true,
        },
      },
      features: true,
    },
  });

  // Filter plans that have at least one active price (monthly required for Better Auth)
  const validPlans = plans.filter((plan) => {
    const monthlyPrice = plan.prices.find((price) => price.interval === 'month');
    return monthlyPrice !== undefined;
  });

  return validPlans.map((plan) => {
    const monthlyPrice = plan.prices.find((price) => price.interval === 'month')!;
    const yearlyPrice = plan.prices.find((price) => price.interval === 'year');

    // Determine trial days - use plan setting if enabled, otherwise default
    const trialDays = plan.trialEnabled ? plan.trialDays : DEFAULT_TRIAL_DAYS;

    return {
      name: plan.slug,
      priceId: monthlyPrice.stripePriceId,
      annualDiscountPriceId: yearlyPrice?.stripePriceId,
      // Always include free trial for new partners
      freeTrial: { days: trialDays },
      limits: {
        listings: plan.maxListings || 0,
        featuredListings: plan.maxFeaturedListings || 0,
        members: plan.maxMembers || 0,
        imagesPerListing: plan.maxImagesPerListing || 0,
        videosPerListing: plan.maxVideosPerListing || 0,
      },
    };
  });
}
