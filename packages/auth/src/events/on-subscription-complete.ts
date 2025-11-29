import type { StripePlan, Subscription } from '@better-auth/stripe';
import prisma from '@yayago-app/db';
import type Stripe from 'stripe';

type Props = {
  event: Stripe.Event;
  stripeSubscription: Stripe.Subscription;
  subscription: Subscription;
  plan: StripePlan;
};

export async function onSubscriptionComplete(data: Props) {
  const { stripeSubscription, subscription, plan } = data;

  console.log('🎯 onSubscriptionComplete triggered');
  console.log('📦 Plan:', plan.name);
  console.log('📋 Subscription ID:', subscription.id);

  const customerId =
    typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : stripeSubscription.customer.id;

  // Find the user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: {
      stripeCustomerId: customerId,
      deletedAt: null,
    },
  });

  if (!user) {
    console.error('❌ User not found for customer:', customerId);
    throw new Error('User not found');
  }

  console.log('👤 User found:', user.id);

  // Get the subscription plan from our database
  const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
    where: { slug: plan.name },
  });

  if (!subscriptionPlan) {
    console.error('❌ Subscription plan not found:', plan.name);
    throw new Error(`Subscription plan not found: ${plan.name}`);
  }

  console.log('📋 Plan details:', {
    maxListings: subscriptionPlan.maxListings,
    maxMembers: subscriptionPlan.maxMembers,
    hasAnalytics: subscriptionPlan.hasAnalytics,
  });

  // Check if user already has an organization
  const existingOrg = await prisma.organization.findFirst({
    where: { members: { some: { userId: user.id, role: 'owner' } } },
  });

  if (existingOrg) {
    console.log('🏢 User already has organization, updating subscription only');

    // Update the subscription with plan limits snapshot and organization link
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        referenceId: existingOrg.id,
        organizationId: existingOrg.id,
        // Snapshot plan limits
        maxListings: subscriptionPlan.maxListings,
        maxFeaturedListings: subscriptionPlan.maxFeaturedListings,
        maxMembers: subscriptionPlan.maxMembers,
        maxImagesPerListing: subscriptionPlan.maxImagesPerListing,
        maxVideosPerListing: subscriptionPlan.maxVideosPerListing,
        hasAnalytics: subscriptionPlan.hasAnalytics,
        // Snapshot overage costs
        extraListingCost: subscriptionPlan.extraListingCost,
        extraFeaturedListingCost: subscriptionPlan.extraFeaturedListingCost,
        extraMemberCost: subscriptionPlan.extraMemberCost,
        extraImageCost: subscriptionPlan.extraImageCost,
        extraVideoCost: subscriptionPlan.extraVideoCost,
        extraAnalyticsCost: subscriptionPlan.extraAnalyticsCost,
        // Initialize usage counters
        currentListings: 0,
        currentFeaturedListings: 0,
        currentMembers: 1, // Owner is first member
        currentTotalImages: 0,
        currentTotalVideos: 0,
      },
    });

    console.log('✅ Subscription updated with plan limits');
    return;
  }

  // Create organization and link subscription
  console.log('🏢 Creating new organization for user');

  await prisma.$transaction(async (tx) => {
    // Create organization
    const org = await tx.organization.create({
      data: {
        name: `${user.name}'s Organization`,
        slug: `${user.username}_organization`,
        status: 'IDLE', // Start in IDLE, user will complete onboarding
      },
    });

    console.log('✅ Organization created:', org.id);

    // Create owner member
    await tx.member.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'owner',
      },
    });

    console.log('✅ Owner member created');

    // Update subscription with organization link and plan limits snapshot
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        referenceId: org.id,
        organizationId: org.id,
        // Snapshot plan limits at subscription time
        maxListings: subscriptionPlan.maxListings,
        maxFeaturedListings: subscriptionPlan.maxFeaturedListings,
        maxMembers: subscriptionPlan.maxMembers,
        maxImagesPerListing: subscriptionPlan.maxImagesPerListing,
        maxVideosPerListing: subscriptionPlan.maxVideosPerListing,
        hasAnalytics: subscriptionPlan.hasAnalytics,
        // Snapshot overage costs
        extraListingCost: subscriptionPlan.extraListingCost,
        extraFeaturedListingCost: subscriptionPlan.extraFeaturedListingCost,
        extraMemberCost: subscriptionPlan.extraMemberCost,
        extraImageCost: subscriptionPlan.extraImageCost,
        extraVideoCost: subscriptionPlan.extraVideoCost,
        extraAnalyticsCost: subscriptionPlan.extraAnalyticsCost,
        // Initialize usage counters
        currentListings: 0,
        currentFeaturedListings: 0,
        currentMembers: 1, // Owner is first member
        currentTotalImages: 0,
        currentTotalVideos: 0,
      },
    });

    console.log('✅ Subscription linked to organization');
  });

  console.log('🎉 onSubscriptionComplete finished successfully');
}
