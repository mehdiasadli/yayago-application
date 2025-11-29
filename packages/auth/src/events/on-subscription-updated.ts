import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles subscription update events from Stripe
 * This includes status changes, plan upgrades/downgrades, and cancellation scheduling
 *
 * IMPORTANT: This is a critical security event handler.
 * All subscription access control depends on this working correctly.
 */
export async function onSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  // Use 'any' for the subscription object as Stripe types can vary
  const stripeSubscription = event.data.object as any;
  const previousAttributes = event.data.previous_attributes;

  console.log('🔄 onSubscriptionUpdated triggered');
  console.log('📋 Stripe Subscription ID:', stripeSubscription.id);
  console.log('📊 Status:', stripeSubscription.status);
  console.log('🔍 Previous attributes:', previousAttributes);

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: stripeSubscription.id,
    },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for:', stripeSubscription.id);
    // This could happen if the subscription was created outside our flow
    // For security, we should NOT create it here - only through proper checkout flow
    return;
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    past_due: 'past_due',
    paused: 'paused',
    trialing: 'trialing',
    unpaid: 'unpaid',
  };

  const newStatus = statusMap[stripeSubscription.status] || stripeSubscription.status;
  const currentPlanSlug = subscription.plan;

  // Extract dates from Stripe subscription (timestamps are in seconds)
  const periodStart = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000)
    : null;

  const periodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;

  const trialStart = stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null;

  const trialEnd = stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null;

  // Check if plan changed (upgrade/downgrade)
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id;
  let newPlanSlug = currentPlanSlug;

  if (priceId) {
    // Find the plan that has this price
    const price = await prisma.subscriptionPlanPrice.findUnique({
      where: { stripePriceId: priceId },
      include: { plan: true },
    });

    if (price && price.plan.slug !== currentPlanSlug) {
      newPlanSlug = price.plan.slug;
      console.log(`📦 Plan changed from "${currentPlanSlug}" to "${newPlanSlug}"`);

      // Snapshot new plan limits - CRITICAL for access control
      const newPlan = price.plan;

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: newPlanSlug,
          status: newStatus as any,
          periodStart,
          periodEnd,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          trialStart,
          trialEnd,
          // Update plan limits snapshot - these control what user can do
          maxListings: newPlan.maxListings,
          maxFeaturedListings: newPlan.maxFeaturedListings,
          maxMembers: newPlan.maxMembers,
          maxImagesPerListing: newPlan.maxImagesPerListing,
          maxVideosPerListing: newPlan.maxVideosPerListing,
          hasAnalytics: newPlan.hasAnalytics,
          // Update overage costs
          extraListingCost: newPlan.extraListingCost,
          extraFeaturedListingCost: newPlan.extraFeaturedListingCost,
          extraMemberCost: newPlan.extraMemberCost,
          extraImageCost: newPlan.extraImageCost,
          extraVideoCost: newPlan.extraVideoCost,
          extraAnalyticsCost: newPlan.extraAnalyticsCost,
        },
      });

      console.log('✅ Subscription updated with new plan limits');
      return;
    }
  }

  // Log specific changes for debugging
  if (previousAttributes) {
    if ('status' in previousAttributes) {
      console.log(`📊 Status changed: ${previousAttributes.status} → ${newStatus}`);
    }
    if ('cancel_at_period_end' in previousAttributes) {
      console.log(
        `🚫 Cancel at period end: ${previousAttributes.cancel_at_period_end} → ${stripeSubscription.cancel_at_period_end}`
      );
    }
    if ('trial_end' in previousAttributes) {
      console.log(`⏰ Trial end changed`);
    }
  }

  // Update the status and dates (no plan change)
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: newStatus as any,
      periodStart,
      periodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart,
      trialEnd,
    },
  });

  console.log('✅ Subscription updated:', {
    status: newStatus,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    periodEnd: periodEnd?.toISOString(),
    trialEnd: trialEnd?.toISOString(),
  });
}
