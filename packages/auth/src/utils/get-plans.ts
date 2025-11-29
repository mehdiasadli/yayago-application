import prisma from '@yayago-app/db';

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

    return {
      name: plan.slug,
      priceId: monthlyPrice.stripePriceId,
      annualDiscountPriceId: yearlyPrice?.stripePriceId,
      ...(plan.trialEnabled ? { freeTrial: { days: plan.trialDays } } : {}),
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
