import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles Connect account updated
 * Updates organization payout status based on account capabilities
 */
export async function handleAccountUpdated(event: Stripe.AccountUpdatedEvent) {
  const account = event.data.object;

  console.log('🏦 handleAccountUpdated triggered');
  console.log('📋 Account ID:', account.id);
  console.log('✅ Charges enabled:', account.charges_enabled);
  console.log('✅ Payouts enabled:', account.payouts_enabled);

  // Determine account status
  let status = 'pending';
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'enabled';
  } else if (account.details_submitted && (!account.charges_enabled || !account.payouts_enabled)) {
    status = 'restricted';
  } else if (account.requirements?.disabled_reason) {
    status = 'disabled';
  }

  await prisma.organization.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      stripeAccountStatus: status,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      ...(status === 'enabled' && {
        stripeOnboardingCompletedAt: new Date(),
      }),
    },
  });

  console.log(`✅ Updated organization payout status: ${status}`);
}

/**
 * Handles Connect account deauthorization
 * CRITICAL: Partner disconnected their Stripe account
 */
export async function handleAccountDeauthorized(event: Stripe.AccountApplicationDeauthorizedEvent) {
  const accountId = event.account;

  console.log('🔌 handleAccountDeauthorized triggered');
  console.log('📋 Account ID:', accountId);

  if (!accountId) {
    console.log('ℹ️ No account ID in deauthorization event');
    return;
  }

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
        stripeAccountId: null,
        stripeAccountStatus: 'disconnected',
        chargesEnabled: false,
        payoutsEnabled: false,
        stripeOnboardingCompletedAt: null,
      },
    });

    console.log(`⚠️ Stripe account disconnected for: ${organization.name}`);

    const owner = organization.members[0]?.user;
    if (owner) {
      console.log(`📧 Should notify ${owner.email} about disconnected Stripe account`);
      // TODO: Send reconnect notification
    }
  }
}

/**
 * Handles capability updates for Connect accounts
 */
export async function handleCapabilityUpdated(event: Stripe.CapabilityUpdatedEvent) {
  const capability = event.data.object;
  const accountId = event.account;

  console.log('🔧 handleCapabilityUpdated triggered');
  console.log('📋 Account ID:', accountId);
  console.log('🔧 Capability:', capability.id);
  console.log('📊 Status:', capability.status);

  if (!accountId) return;

  const organization = await prisma.organization.findFirst({
    where: { stripeAccountId: accountId },
  });

  if (organization && capability.status !== 'active') {
    const updateData: Record<string, boolean> = {};

    if (capability.id === 'card_payments') {
      updateData.chargesEnabled = false;
      console.log('⚠️ Card payments disabled');
    } else if (capability.id === 'transfers') {
      updateData.payoutsEnabled = false;
      console.log('⚠️ Transfers disabled');
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.organization.update({
        where: { id: organization.id },
        data: updateData,
      });
    }
  }
}

/**
 * Handles transfer created (payout to partner)
 */
export async function handleTransferCreated(event: Stripe.TransferCreatedEvent) {
  const transfer = event.data.object;

  console.log('💸 handleTransferCreated triggered');
  console.log('📋 Transfer ID:', transfer.id);
  console.log('💵 Amount:', transfer.amount / 100, transfer.currency.toUpperCase());

  const bookingId = transfer.metadata?.bookingId;
  if (bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        partnerPayoutId: transfer.id,
        partnerPayoutStatus: 'paid',
        partnerPaidAt: new Date(),
      },
    });
    console.log(`✅ Booking ${bookingId} payout recorded`);
  }
}

/**
 * Handles transfer reversed
 */
export async function handleTransferReversed(event: Stripe.TransferReversedEvent) {
  const transfer = event.data.object;

  console.log('↩️ handleTransferReversed triggered');
  console.log('📋 Transfer ID:', transfer.id);

  const bookingId = transfer.metadata?.bookingId;
  if (bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { partnerPayoutStatus: 'reversed' },
    });
    console.log(`↩️ Booking ${bookingId} payout reversed`);
  }
}
