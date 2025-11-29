import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles subscription deletion events from Stripe
 * When a subscription is deleted (not just canceled), we need to clean up
 */
export async function onCustomerSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const stripeSubscription = event.data.object;

  console.log('🗑️ onCustomerSubscriptionDeleted triggered');
  console.log('📋 Stripe Subscription ID:', stripeSubscription.id);

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: stripeSubscription.id,
    },
    include: {
      organization: true,
    },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for:', stripeSubscription.id);
    return;
  }

  console.log('📋 Internal Subscription ID:', subscription.id);
  console.log('🏢 Organization ID:', subscription.organizationId);

  // Update the subscription status to canceled instead of deleting
  // This preserves historical data
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'canceled',
      periodEnd: new Date(), // Mark as ended now
    },
  });

  console.log('✅ Subscription marked as canceled');

  // If the organization exists and has no other active subscriptions,
  // we might want to update its status or take some action
  if (subscription.organization) {
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        organizationId: subscription.organizationId,
        status: { in: ['active', 'trialing'] },
        id: { not: subscription.id }, // Exclude the one we just canceled
      },
    });

    if (activeSubscriptions === 0) {
      console.log('⚠️ Organization has no active subscriptions');
      // Don't automatically change organization status - let admins handle this
      // or the organization can resubscribe
    }
  }

  console.log('🎉 onCustomerSubscriptionDeleted finished');
}
