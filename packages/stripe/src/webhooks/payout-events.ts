import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles payout created (Stripe sending money to Connect account's bank)
 */
export async function handlePayoutCreated(event: Stripe.PayoutCreatedEvent) {
  const payout = event.data.object;
  const accountId = event.account;

  console.log('💸 handlePayoutCreated triggered');
  console.log('📋 Payout ID:', payout.id);
  console.log('💵 Amount:', payout.amount / 100, payout.currency.toUpperCase());
  console.log('📅 Arrival:', payout.arrival_date ? new Date(payout.arrival_date * 1000) : 'N/A');

  if (!accountId) {
    console.log('ℹ️ Payout not from a Connect account');
    return;
  }

  const organization = await prisma.organization.findFirst({
    where: { stripeAccountId: accountId },
  });

  if (organization) {
    console.log(`✅ Payout scheduled for: ${organization.name}`);
    // TODO: Create payout record, send notification
  }
}

/**
 * Handles payout failed
 * CRITICAL: Partner won't receive their money
 */
export async function handlePayoutFailed(event: Stripe.PayoutFailedEvent) {
  const payout = event.data.object;
  const accountId = event.account;

  console.log('❌ handlePayoutFailed triggered');
  console.log('📋 Payout ID:', payout.id);
  console.log('💵 Amount:', payout.amount / 100, payout.currency.toUpperCase());
  console.log('❗ Failure code:', payout.failure_code);
  console.log('❗ Failure message:', payout.failure_message);

  if (!accountId) return;

  const organization = await prisma.organization.findFirst({
    where: { stripeAccountId: accountId },
    include: {
      members: {
        where: { role: 'owner' },
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });

  if (organization) {
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        payoutsEnabled: false,
        stripeAccountStatus: 'payout_failed',
      },
    });

    console.log(`⚠️ Payout failed for: ${organization.name}`);

    const owner = organization.members[0]?.user;
    if (owner) {
      console.log(`📧 Should notify ${owner.email} about failed payout`);
      // TODO: Send urgent payout failure notification
    }

    // Notify admins
    console.log('🚨 ADMIN ALERT: Partner payout failed');
  }
}

/**
 * Handles payout paid (money arrived in partner's bank)
 */
export async function handlePayoutPaid(event: Stripe.PayoutPaidEvent) {
  const payout = event.data.object;
  const accountId = event.account;

  console.log('✅ handlePayoutPaid triggered');
  console.log('📋 Payout ID:', payout.id);
  console.log('💵 Amount:', payout.amount / 100, payout.currency.toUpperCase());

  if (!accountId) return;

  const organization = await prisma.organization.findFirst({
    where: { stripeAccountId: accountId },
  });

  if (organization) {
    console.log(`💰 Payout completed for: ${organization.name}`);
    // TODO: Update payout record, send confirmation
  }
}

