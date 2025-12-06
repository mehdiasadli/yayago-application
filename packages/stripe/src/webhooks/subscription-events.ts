import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Maps Stripe subscription status to our internal status
 */
const STATUS_MAP: Record<Stripe.Subscription.Status, string> = {
  active: 'active',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
  past_due: 'past_due',
  paused: 'paused',
  trialing: 'trialing',
  unpaid: 'unpaid',
};

// Extended Stripe Subscription type with period fields
type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

/**
 * Handles subscription update events from Stripe
 * Includes status changes, plan upgrades/downgrades, and cancellation scheduling
 */
export async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const stripeSubscription = event.data.object as StripeSubscriptionWithPeriods;
  const previousAttributes = event.data.previous_attributes;

  console.log('🔄 handleSubscriptionUpdated triggered');
  console.log('📋 Stripe Subscription ID:', stripeSubscription.id);
  console.log('📊 Status:', stripeSubscription.status);
  console.log('🔍 Previous attributes:', previousAttributes);

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for:', stripeSubscription.id);
    return;
  }

  const newStatus = STATUS_MAP[stripeSubscription.status] || stripeSubscription.status;

  // Extract dates from Stripe subscription (timestamps are in seconds)
  const periodStart = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000)
    : null;

  const periodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;

  const trialEnd = stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null;

  // Build update data
  const updateData: Record<string, unknown> = {
    status: newStatus,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    periodStart,
    periodEnd,
    trialEnd,
  };

  // Check for plan change
  const newPlanId = stripeSubscription.items.data[0]?.price.id;
  if (newPlanId && previousAttributes?.items) {
    const price = await prisma.subscriptionPlanPrice.findFirst({
      where: { stripePriceId: newPlanId },
      include: { plan: true },
    });

    if (price?.plan) {
      updateData.plan = price.plan.slug;
      // Snapshot new plan limits
      updateData.maxListings = price.plan.maxListings;
      updateData.maxFeaturedListings = price.plan.maxFeaturedListings;
      updateData.maxMembers = price.plan.maxMembers;
      updateData.maxImagesPerListing = price.plan.maxImagesPerListing;
      updateData.maxVideosPerListing = price.plan.maxVideosPerListing;
      updateData.hasAnalytics = price.plan.hasAnalytics;
      console.log(`📝 Plan changed to: ${price.plan.slug}`);
    }
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData,
  });

  console.log('✅ Subscription updated:', subscription.id);
}

/**
 * Handles subscription deleted (fully canceled)
 */
export async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const stripeSubscription = event.data.object;

  console.log('🗑️ handleSubscriptionDeleted triggered');
  console.log('📋 Stripe Subscription ID:', stripeSubscription.id);

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for:', stripeSubscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'canceled' },
  });

  // Update organization trial status if needed
  if (subscription.organizationId) {
    await prisma.organization.update({
      where: { id: subscription.organizationId },
      data: {
        trialEndsAt: null,
        trialStartedAt: null,
      },
    });
  }

  console.log('✅ Subscription marked as canceled:', subscription.id);
}

/**
 * Handles trial ending notification (3 days before by default)
 */
export async function handleTrialWillEnd(event: Stripe.CustomerSubscriptionTrialWillEndEvent) {
  const stripeSubscription = event.data.object;

  console.log('⏰ handleTrialWillEnd triggered');
  console.log('📋 Stripe Subscription ID:', stripeSubscription.id);
  console.log('📅 Trial ends:', stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : 'N/A');

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
    include: {
      organization: {
        include: {
          members: {
            where: { role: 'owner' },
            include: { user: { select: { id: true, email: true, name: true } } },
          },
        },
      },
    },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for:', stripeSubscription.id);
    return;
  }

  const owner = subscription.organization?.members[0]?.user;
  if (owner) {
    console.log(`📧 Should notify ${owner.email} about trial ending`);
    // TODO: Send trial ending email notification
    // TODO: Create in-app notification
  }
}
