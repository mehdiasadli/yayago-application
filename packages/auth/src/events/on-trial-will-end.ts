import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles trial ending notification
 * Stripe sends this 3 days before trial ends by default
 *
 * IMPORTANT: This is when we should notify users to add payment method
 */
export async function onTrialWillEnd(event: Stripe.CustomerSubscriptionTrialWillEndEvent) {
  const stripeSubscription = event.data.object as Stripe.Subscription;

  console.log('⏰ onTrialWillEnd triggered');
  console.log('📋 Subscription ID:', stripeSubscription.id);

  const trialEnd = stripeSubscription.trial_end
    ? new Date(
        typeof stripeSubscription.trial_end === 'number'
          ? stripeSubscription.trial_end * 1000
          : stripeSubscription.trial_end
      )
    : null;

  console.log('📅 Trial ends at:', trialEnd?.toISOString());

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
    include: {
      organization: {
        include: {
          members: {
            where: { role: 'owner' },
            include: { user: true },
          },
        },
      },
    },
  });

  if (!subscription) {
    console.error('❌ Subscription not found:', stripeSubscription.id);
    return;
  }

  // Get the organization owner's email
  const owner = subscription.organization?.members[0]?.user;

  if (owner) {
    console.log('📧 Should send trial ending email to:', owner.email);
    // TODO: Send trial ending notification email
    // Include:
    // - Trial end date
    // - What happens when trial ends
    // - Link to update payment method
    // - Benefits of continuing subscription
  }

  console.log('✅ Trial ending notification processed for subscription:', subscription.id);
}
