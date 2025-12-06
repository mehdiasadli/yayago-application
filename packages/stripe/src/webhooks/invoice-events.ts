import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles successful invoice payment
 */
export async function handleInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
  const invoice = event.data.object;

  console.log('💰 handleInvoicePaymentSucceeded triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount paid:', (invoice.amount_paid || 0) / 100, invoice.currency?.toUpperCase());

  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    console.log('ℹ️ Invoice not related to a subscription');
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for invoice:', stripeSubscriptionId);
    return;
  }

  // Update subscription to active if it was past_due or incomplete
  if (subscription.status === 'past_due' || subscription.status === 'incomplete') {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'active' },
    });
    console.log('✅ Subscription status updated to active');
  }
}

/**
 * Handles failed invoice payment
 * CRITICAL: May affect user access
 */
export async function handleInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  const invoice = event.data.object;

  console.log('❌ handleInvoicePaymentFailed triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());
  console.log('🔄 Attempt count:', invoice.attempt_count);

  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    console.log('ℹ️ Invoice not related to a subscription');
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
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
    console.error('❌ Subscription not found for invoice:', stripeSubscriptionId);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' },
  });

  console.log('⚠️ Subscription marked as past_due:', subscription.id);

  const owner = subscription.organization?.members[0]?.user;
  if (owner) {
    console.log(`📧 Should notify ${owner.email} about failed payment`);
    // TODO: Send payment failed email
  }
}

/**
 * Handles upcoming invoice notification
 */
export async function handleInvoiceUpcoming(event: Stripe.InvoiceUpcomingEvent) {
  const invoice = event.data.object;

  console.log('📅 handleInvoiceUpcoming triggered');
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());

  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
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

  if (!subscription) return;

  const owner = subscription.organization?.members[0]?.user;
  if (owner) {
    console.log(`📧 Should send upcoming invoice notification to ${owner.email}`);
    // TODO: Send upcoming invoice email
  }
}

/**
 * Handles invoice finalized
 */
export async function handleInvoiceFinalized(event: Stripe.InvoiceFinalizedEvent) {
  const invoice = event.data.object;

  console.log('📄 handleInvoiceFinalized triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());
}

