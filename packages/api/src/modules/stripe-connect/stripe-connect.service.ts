import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import {
  createConnectAccount,
  createAccountLink,
  getConnectAccountStatus,
  createDashboardLink,
  createAccountSession,
  createTransfer,
  createRefund,
  getChargeIdFromPaymentIntent,
} from '@yayago-app/stripe';
import type {
  CreateOnboardingLinkInputType,
  CreateOnboardingLinkOutputType,
  GetConnectAccountStatusOutputType,
  ProcessTripPayoutInputType,
  ProcessTripPayoutOutputType,
} from '@yayago-app/validators';

// Countries where Stripe Connect Express with transfers is NOT properly supported
// These require Custom accounts or special platform approval
const UNSUPPORTED_CONNECT_COUNTRIES = ['AE', 'AZ'];

export class StripeConnectService {
  /**
   * Helper to create a new Connect account and update organization
   */
  private static async createNewConnectAccount(
    organizationId: string,
    email: string | null,
    businessName: string,
    countryCode: string
  ): Promise<string> {
    const account = await createConnectAccount({
      organizationId,
      email: email || undefined,
      businessName,
      country: countryCode,
    });

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'pending',
      } as any,
    });

    return account.id;
  }

  /**
   * Helper to clear a broken Connect account reference
   */
  private static async clearConnectAccount(organizationId: string): Promise<void> {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeAccountId: null,
        stripeAccountStatus: null,
        chargesEnabled: false,
        payoutsEnabled: false,
      } as any,
    });
  }

  /**
   * Creates or retrieves a Stripe Connect account for an organization
   * and returns an onboarding link
   */
  static async createOnboardingLink(
    input: CreateOnboardingLinkInputType,
    userId: string
  ): Promise<CreateOnboardingLinkOutputType> {
    // Get the organization and verify the user is a member
    const organization = await prisma.organization.findUnique({
      where: { id: input.organizationId },
      include: {
        members: {
          where: { userId },
        },
        city: {
          include: {
            country: true,
          },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Check if user is an owner or admin of the organization
    const member = organization.members[0];
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You do not have permission to manage payouts for this organization',
      });
    }

    // Cast to any to access new fields that TypeScript doesn't know about yet
    const org = organization as any;
    let stripeAccountId = org.stripeAccountId as string | null;

    // Get country code from organization's city (default to UAE)
    const countryCode = organization.city?.country?.code || 'AE';

    // Check if country is supported for Stripe Connect Express
    if (UNSUPPORTED_CONNECT_COUNTRIES.includes(countryCode)) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Stripe Connect payouts are not yet available in your region (${countryCode}). We're working to expand our coverage. Please contact support for alternative payout arrangements.`,
      });
    }

    // Create a new Stripe Connect account if one doesn't exist
    if (!stripeAccountId) {
      try {
        stripeAccountId = await this.createNewConnectAccount(
          organization.id,
          organization.email,
          organization.legalName || organization.name,
          countryCode
        );
      } catch (error: any) {
        // Handle Stripe geographic restrictions
        if (error.type === 'StripeInvalidRequestError') {
          throw new ORPCError('BAD_REQUEST', {
            message: `Stripe Connect is not available for organizations in ${countryCode}. Please contact support for alternative payout arrangements.`,
          });
        }
        throw error;
      }
    }

    // Create the onboarding link
    const accountLink = await createAccountLink({
      accountId: stripeAccountId,
      refreshUrl: input.refreshUrl,
      returnUrl: input.returnUrl,
    });

    return {
      url: accountLink.url,
      expiresAt: new Date(accountLink.expires_at * 1000),
    };
  }

  /**
   * Gets the current Stripe Connect account status for an organization
   */
  static async getAccountStatus(organizationId: string, userId: string): Promise<GetConnectAccountStatusOutputType> {
    // Get the organization and verify the user is a member
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Check if user is a member of the organization
    const member = organization.members[0];
    if (!member) {
      throw new ORPCError('FORBIDDEN', { message: 'You are not a member of this organization' });
    }

    // Cast to any to access new fields
    const org = organization as any;
    const stripeAccountId = org.stripeAccountId as string | null;

    if (!stripeAccountId) {
      return {
        hasAccount: false,
        status: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    // Get the account status from Stripe
    const status = await getConnectAccountStatus(stripeAccountId);

    // Update our database with the latest status
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeAccountStatus: status.status,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        ...(status.status === 'enabled' &&
          !org.stripeOnboardingCompletedAt && {
            stripeOnboardingCompletedAt: new Date(),
          }),
      } as any,
    });

    return {
      hasAccount: true,
      status: status.status,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
    };
  }

  /**
   * Creates an Account Session for embedded Connect components
   * Returns a client secret that can be used with the Stripe Connect JS library
   */
  static async createAccountSession(
    organizationId: string,
    userId: string
  ): Promise<{ clientSecret: string; accountId: string }> {
    // Get the organization and verify the user is a member
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId },
        },
        city: {
          select: {
            country: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Check if user is an owner or admin
    const member = organization.members[0];
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'You do not have permission to manage payouts for this organization',
      });
    }

    // Cast to any to access new fields
    const org = organization as any;
    let stripeAccountId = org.stripeAccountId as string | null;

    // Get country code from organization's city
    const countryCode = organization.city?.country?.code || 'AE'; // Default to UAE if not set

    // Check if country is supported for Stripe Connect Express
    if (UNSUPPORTED_CONNECT_COUNTRIES.includes(countryCode)) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Stripe Connect payouts are not yet available in your region (${countryCode}). We're working to expand our coverage. Please contact support for alternative payout arrangements.`,
      });
    }

    // Create a new Stripe Connect account if one doesn't exist
    if (!stripeAccountId) {
      try {
        stripeAccountId = await this.createNewConnectAccount(
          organization.id,
          organization.email,
          organization.legalName || organization.name,
          countryCode
        );
      } catch (error: any) {
        // Handle Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
          throw new ORPCError('BAD_REQUEST', {
            message: `Stripe Connect is not available in your region. Please contact support for alternative payout arrangements.`,
          });
        }
        throw error;
      }
    }

    // Try to create the account session
    try {
      const accountSession = await createAccountSession({
        accountId: stripeAccountId,
        components: {
          accountOnboarding: true,
          payouts: true,
          payoutsList: true,
          balances: true,
          notificationBanner: true,
          documents: true,
        },
      });

      return {
        clientSecret: accountSession.client_secret,
        accountId: stripeAccountId,
      };
    } catch (error: any) {
      // If we get a capability or account configuration error, 
      // the account was created with wrong settings. Clear it and create a new one.
      if (error.type === 'StripeInvalidRequestError') {
        const errorMessage = error.message || '';
        
        // Check if this is a capability-related error
        if (
          errorMessage.includes('capability') ||
          errorMessage.includes('transfers') ||
          errorMessage.includes('card_payments') ||
          errorMessage.includes('requested_capabilities')
        ) {
          console.log(`⚠️ Stripe account ${stripeAccountId} has capability issues. Recreating...`);
          
          // Clear the old broken account reference
          await this.clearConnectAccount(organization.id);

          // Create a new account with correct capabilities
          try {
            stripeAccountId = await this.createNewConnectAccount(
              organization.id,
              organization.email,
              organization.legalName || organization.name,
              countryCode
            );

            // Now create the session with the new account
            const accountSession = await createAccountSession({
              accountId: stripeAccountId,
              components: {
                accountOnboarding: true,
                payouts: true,
                payoutsList: true,
                balances: true,
                notificationBanner: true,
                documents: true,
              },
            });

            return {
              clientSecret: accountSession.client_secret,
              accountId: stripeAccountId,
            };
          } catch (retryError: any) {
            // Surface the error properly
            if (retryError.type === 'StripeInvalidRequestError') {
              throw new ORPCError('BAD_REQUEST', {
                message: retryError.message || 'Failed to create Stripe account. Please contact support.',
              });
            }
            throw retryError;
          }
        }

        // For other Stripe errors, surface them
        throw new ORPCError('BAD_REQUEST', {
          message: errorMessage || 'Stripe account error. Please contact support.',
        });
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Creates a dashboard login link for an organization's Stripe account
   */
  static async createDashboardLink(organizationId: string, userId: string): Promise<{ url: string }> {
    // Get the organization and verify the user is a member
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!organization) {
      throw new ORPCError('NOT_FOUND', { message: 'Organization not found' });
    }

    // Check if user is an owner or admin
    const member = organization.members[0];
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ORPCError('FORBIDDEN', { message: 'You do not have permission to access the payout dashboard' });
    }

    // Cast to any to access new fields
    const org = organization as any;
    const stripeAccountId = org.stripeAccountId as string | null;

    if (!stripeAccountId) {
      throw new ORPCError('BAD_REQUEST', { message: 'Organization has not set up payouts yet' });
    }

    const loginLink = await createDashboardLink(stripeAccountId);
    return { url: loginLink.url };
  }

  /**
   * Processes the payout for a completed trip
   * - Refunds the security deposit to the user
   * - Transfers the partner payout (minus commission) to the organization
   */
  static async processTripPayout(input: ProcessTripPayoutInputType): Promise<ProcessTripPayoutOutputType> {
    // Get the booking with all necessary relations
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        listing: {
          include: {
            organization: {
              include: {
                city: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' });
    }

    // Check if the booking is in a state where payout can be processed
    if (booking.status !== 'COMPLETED') {
      throw new ORPCError('BAD_REQUEST', { message: 'Booking must be completed before processing payout' });
    }

    // Cast to any to access new fields
    const bookingData = booking as any;

    // Check if payout has already been processed
    if (bookingData.partnerPayoutStatus === 'paid') {
      throw new ORPCError('BAD_REQUEST', { message: 'Payout has already been processed for this booking' });
    }

    const organization = booking.listing.organization as any;

    // Check if organization has payouts enabled
    if (!organization.stripeAccountId || !organization.payoutsEnabled) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Organization has not completed payout setup',
      });
    }

    // Get the country's commission rate
    const country = organization.city?.country as any;
    const commissionRate = country?.platformCommissionRate || 0.05;

    // Calculate amounts (all in cents)
    const basePriceCents = Math.round(booking.basePrice * 100);
    const addonsTotalCents = Math.round(booking.addonsTotal * 100);
    const deliveryFeeCents = Math.round(booking.deliveryFee * 100);
    const taxAmountCents = Math.round(booking.taxAmount * 100);
    const depositHeldCents = Math.round(booking.depositHeld * 100);

    // Commission is applied to (basePrice + addons + delivery + tax)
    const revenueAmount = basePriceCents + addonsTotalCents + deliveryFeeCents + taxAmountCents;
    const platformCommissionCents = Math.round(revenueAmount * commissionRate);
    const partnerPayoutCents = revenueAmount - platformCommissionCents;

    let depositRefundId: string | null = null;
    let partnerPayoutId: string | null = null;

    try {
      // Step 1: Refund the security deposit to the user
      if (depositHeldCents > 0 && bookingData.stripePaymentIntentId) {
        const chargeId =
          bookingData.stripeChargeId || (await getChargeIdFromPaymentIntent(bookingData.stripePaymentIntentId));

        if (chargeId) {
          const refund = await createRefund({
            chargeId,
            amount: depositHeldCents,
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking.id,
              type: 'security_deposit_refund',
            },
          });
          depositRefundId = refund.id;
        }
      }

      // Step 2: Transfer partner payout to the organization
      if (partnerPayoutCents > 0) {
        const transfer = await createTransfer({
          amount: partnerPayoutCents,
          currency: booking.currency,
          destinationAccountId: organization.stripeAccountId,
          bookingId: booking.id,
          description: `Payout for booking ${booking.referenceCode}`,
        });
        partnerPayoutId = transfer.id;
      }

      // Step 3: Update the booking with payout details
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          platformCommission: platformCommissionCents / 100,
          partnerPayoutAmount: partnerPayoutCents / 100,
          partnerPayoutStatus: 'paid',
          partnerPayoutId,
          partnerPaidAt: new Date(),
          depositRefundStatus: depositHeldCents > 0 ? 'refunded' : null,
          depositRefundId,
          depositRefundedAt: depositHeldCents > 0 ? new Date() : null,
        } as any,
      });

      return {
        success: true,
        partnerPayoutAmount: partnerPayoutCents / 100,
        platformCommission: platformCommissionCents / 100,
        depositRefunded: depositHeldCents / 100,
        partnerPayoutId,
        depositRefundId,
      };
    } catch (error) {
      // Update booking with failed status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          partnerPayoutStatus: 'failed',
          depositRefundStatus: depositHeldCents > 0 ? 'failed' : null,
        } as any,
      });

      console.error('Failed to process trip payout:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to process payout' });
    }
  }

  /**
   * Called by webhook when account status changes
   */
  static async handleAccountUpdate(stripeAccountId: string): Promise<void> {
    const status = await getConnectAccountStatus(stripeAccountId);

    await prisma.organization.updateMany({
      where: { stripeAccountId } as any,
      data: {
        stripeAccountStatus: status.status,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        ...(status.status === 'enabled' && {
          stripeOnboardingCompletedAt: new Date(),
        }),
      } as any,
    });
  }
}
