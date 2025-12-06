import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles successful payment intent
 * Backup handler for booking payments
 */
export async function handlePaymentIntentSucceeded(event: Stripe.PaymentIntentSucceededEvent) {
  const paymentIntent = event.data.object;

  console.log('💰 handlePaymentIntentSucceeded triggered');
  console.log('📋 Payment Intent ID:', paymentIntent.id);
  console.log('💵 Amount:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());

  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) {
    console.log('ℹ️ Payment intent not related to a booking');
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        include: { bookingDetails: true },
      },
    },
  });

  if (!booking) {
    console.error('❌ Booking not found:', bookingId);
    return;
  }

  // Only update if not already paid
  if (booking.paymentStatus !== 'PAID') {
    const hasInstantBooking = booking.listing.bookingDetails?.hasInstantBooking ?? false;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: hasInstantBooking ? 'APPROVED' : 'PENDING_APPROVAL',
        paymentStatus: 'PAID',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    console.log(`✅ Booking ${bookingId} payment confirmed`);
  }
}

/**
 * Handles failed payment intent
 */
export async function handlePaymentIntentFailed(event: Stripe.PaymentIntentPaymentFailedEvent) {
  const paymentIntent = event.data.object;

  console.log('❌ handlePaymentIntentFailed triggered');
  console.log('📋 Payment Intent ID:', paymentIntent.id);
  console.log('❗ Error:', paymentIntent.last_payment_error?.message);

  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) {
    console.log('ℹ️ Payment intent not related to a booking');
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!booking) {
    console.error('❌ Booking not found:', bookingId);
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'FAILED' },
  });

  console.log(`⚠️ Payment failed for booking ${bookingId}`);

  if (booking.user) {
    console.log(`📧 Should notify ${booking.user.email} about failed payment`);
    // TODO: Send payment failed email
  }
}

/**
 * Handles charge succeeded - stores charge ID for refunds
 */
export async function handleChargeSucceeded(event: Stripe.ChargeSucceededEvent) {
  const charge = event.data.object;

  console.log('💰 handleChargeSucceeded triggered');
  console.log('📋 Charge ID:', charge.id);

  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

  if (paymentIntentId) {
    await prisma.booking.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { stripeChargeId: charge.id },
    });
    console.log('✅ Charge ID stored for payment intent:', paymentIntentId);
  }
}

/**
 * Handles refund created
 */
export async function handleRefundCreated(event: Stripe.RefundCreatedEvent) {
  const refund = event.data.object;

  console.log('↩️ handleRefundCreated triggered');
  console.log('📋 Refund ID:', refund.id);
  console.log('💵 Amount:', refund.amount / 100, refund.currency.toUpperCase());
  console.log('📊 Status:', refund.status);

  const chargeId = typeof refund.charge === 'string' ? refund.charge : refund.charge?.id;
  if (!chargeId) {
    console.log('ℹ️ No charge ID in refund');
    return;
  }

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!booking) {
    console.log('ℹ️ No booking found for charge:', chargeId);
    return;
  }

  // Determine if full or partial refund
  const isFullRefund = refund.amount >= (booking.totalPrice || 0) * 100;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      stripeRefundId: refund.id,
      refundedAmount: refund.amount / 100,
      status: isFullRefund ? 'CANCELLED_BY_HOST' : booking.status,
    },
  });

  console.log(`💵 ${isFullRefund ? 'Full' : 'Partial'} refund processed for booking ${booking.id}`);

  if (booking.user) {
    console.log(`📧 Should notify ${booking.user.email} about refund`);
    // TODO: Send refund notification email
  }
}

