import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles successful invoice payment
 * This is crucial for tracking when payments go through
 */
export async function onInvoicePaymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent) {
  // Use 'any' as Stripe types can vary between versions
  const invoice = event.data.object as any;

  console.log('💰 onInvoicePaymentSucceeded triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount paid:', (invoice.amount_paid || 0) / 100, invoice.currency?.toUpperCase());

  // Get subscription from invoice
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    console.log('ℹ️ Invoice not related to a subscription');
    return;
  }

  // Find subscription in our database
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
    console.log('✅ Subscription status updated to active after successful payment');
  }

  console.log('✅ Invoice payment recorded for subscription:', subscription.id);
}

/**
 * Handles failed invoice payment
 * CRITICAL: This affects user access - subscription may become past_due
 */
export async function onInvoicePaymentFailed(event: Stripe.InvoicePaymentFailedEvent) {
  // Use 'any' as Stripe types can vary between versions
  const invoice = event.data.object as any;

  console.log('❌ onInvoicePaymentFailed triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());
  console.log('🔄 Attempt count:', invoice.attempt_count);

  // Get subscription from invoice
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    console.log('ℹ️ Invoice not related to a subscription');
    return;
  }

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    include: { organization: true },
  });

  if (!subscription) {
    console.error('❌ Subscription not found for invoice:', stripeSubscriptionId);
    return;
  }

  // Update subscription status to past_due
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' },
  });

  console.log('⚠️ Subscription marked as past_due for:', subscription.id);

  // TODO: Send notification email to organization owner
  // TODO: Implement grace period logic
}

/**
 * Handles upcoming invoice notification
 * Good for sending reminders to users
 */
export async function onInvoiceUpcoming(event: Stripe.InvoiceUpcomingEvent) {
  // Use 'any' as Stripe types can vary between versions
  const invoice = event.data.object as any;

  console.log('📅 onInvoiceUpcoming triggered');
  console.log('📋 Invoice for subscription:', invoice.subscription);
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());

  // Get subscription from invoice
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    return;
  }

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    include: { organization: true },
  });

  if (!subscription) {
    return;
  }

  console.log('📧 Should send upcoming invoice notification for:', subscription.organizationId);
  // TODO: Send notification email about upcoming charge
}

/**
 * Handles invoice finalized
 * Invoice is ready to be paid
 */
export async function onInvoiceFinalized(event: Stripe.InvoiceFinalizedEvent) {
  // Use 'any' as Stripe types can vary between versions
  const invoice = event.data.object as any;

  console.log('📄 onInvoiceFinalized triggered');
  console.log('📋 Invoice ID:', invoice.id);
  console.log('💵 Amount due:', (invoice.amount_due || 0) / 100, invoice.currency?.toUpperCase());
}
