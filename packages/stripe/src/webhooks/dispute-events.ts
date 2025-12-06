import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

/**
 * Handles charge dispute created
 * CRITICAL: Requires immediate attention
 */
export async function handleDisputeCreated(event: Stripe.ChargeDisputeCreatedEvent) {
  const dispute = event.data.object;

  console.log('⚠️ handleDisputeCreated triggered');
  console.log('📋 Dispute ID:', dispute.id);
  console.log('💵 Amount:', dispute.amount / 100, dispute.currency.toUpperCase());
  console.log('❗ Reason:', dispute.reason);
  console.log('📅 Evidence due:', dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000) : 'N/A');

  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
  if (!chargeId) {
    console.log('ℹ️ No charge ID in dispute');
    return;
  }

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
    include: {
      listing: {
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
      },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (booking) {
    // Update booking with dispute status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'DISPUTED',
        stripeDisputeId: dispute.id,
        // Freeze partner payout if pending
        ...(booking.partnerPayoutStatus === 'pending' && {
          partnerPayoutStatus: 'on_hold',
        }),
      },
    });

    console.log(`⚠️ Dispute recorded for booking ${booking.id}`);

    const owner = booking.listing.organization.members[0]?.user;
    if (owner) {
      console.log(`📧 Should notify ${owner.email} about dispute`);
      // TODO: Send urgent dispute notification
    }
  }

  // Always notify admins
  console.log('🚨 ADMIN ALERT: New dispute requires attention');
  // TODO: Create admin notification
}

/**
 * Handles dispute updated
 */
export async function handleDisputeUpdated(event: Stripe.ChargeDisputeUpdatedEvent) {
  const dispute = event.data.object;

  console.log('🔄 handleDisputeUpdated triggered');
  console.log('📋 Dispute ID:', dispute.id);
  console.log('📊 Status:', dispute.status);

  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
  if (!chargeId) return;

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
  });

  if (booking) {
    console.log(`📝 Dispute update for booking ${booking.id}, status: ${dispute.status}`);
  }
}

/**
 * Handles dispute closed (won or lost)
 * CRITICAL: Determines final outcome
 */
export async function handleDisputeClosed(event: Stripe.ChargeDisputeClosedEvent) {
  const dispute = event.data.object;
  const disputeWon = dispute.status === 'won';

  console.log('✅ handleDisputeClosed triggered');
  console.log('📋 Dispute ID:', dispute.id);
  console.log('🏆 Won:', disputeWon);

  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
  if (!chargeId) return;

  const booking = await prisma.booking.findFirst({
    where: { stripeChargeId: chargeId },
    include: {
      listing: {
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
      },
    },
  });

  if (booking) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: disputeWon ? 'PAID' : 'REFUNDED',
        // Release payout hold if won
        ...(disputeWon &&
          booking.partnerPayoutStatus === 'on_hold' && {
            partnerPayoutStatus: 'pending',
          }),
      },
    });

    if (disputeWon) {
      console.log(`🎉 Dispute WON for booking ${booking.id}`);
    } else {
      console.log(`😔 Dispute LOST for booking ${booking.id}`);
    }

    const owner = booking.listing.organization.members[0]?.user;
    if (owner) {
      console.log(`📧 Should notify ${owner.email} about dispute outcome: ${disputeWon ? 'WON' : 'LOST'}`);
      // TODO: Send dispute outcome notification
    }
  }
}

