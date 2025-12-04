import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, organization, phoneNumber, username, multiSession, customSession } from 'better-auth/plugins';
import prisma from '@yayago-app/db';
import { stripe } from '@better-auth/stripe';
import stripeClient from '@yayago-app/stripe';

// Event handlers
import { onCustomerSubscriptionDeleted } from './events/on-subscription-deleted';
import { onSubscriptionComplete } from './events/on-subscription-complete';
import { onSubscriptionUpdated } from './events/on-subscription-updated';
import { onTrialWillEnd } from './events/on-trial-will-end';
import {
  onInvoicePaymentSucceeded,
  onInvoicePaymentFailed,
  onInvoiceUpcoming,
  onInvoiceFinalized,
} from './events/on-invoice-events';

// Services
import { allowUserToCreateOrganization } from './services/organization/allow-user-to-create-organization';
import { sendPasswordResetEmail } from './emails/send-password-reset-email';
import { getPlans } from './utils/get-plans';
import { getCustomSession } from './services/sessions/get-custom-session';
import { getUsernameFromEmail } from './services/user/get-username-from-email';
import { uploadAvatarFromSocialProfile } from './services/user/upload-avatar-from-social-profile';
import { sendEmailVerificationEmail } from './emails/send-email-verification-email';

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set in the environment variables');
}

export const auth = betterAuth({
  appName: 'YayaGO',
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  trustedOrigins: [
    process.env.WEB_URL || '',
    process.env.ADMIN_URL || '',
    process.env.PARTNER_URL || '',
    process.env.DOCS_URL || '',

    process.env.NATIVE_URL || '',
    process.env.NATIVE_PARTNER_URL || '',
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,

    async sendResetPassword({ user, url }) {
      await sendPasswordResetEmail(user.email, user.name, url);
    },
  },

  databaseHooks: {
    user: {
      create: {
        async after(user) {
          const avatarUrl = await uploadAvatarFromSocialProfile(user.id, user.image);

          if (avatarUrl && avatarUrl !== user.image) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                image: avatarUrl,
              },
            });
          }
        },
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      async mapProfileToUser(profile) {
        const username = await getUsernameFromEmail(profile.email);

        return {
          username,
          displayUsername: username,
          name: `${profile.given_name} ${profile.family_name}`,
          image: profile.picture,
          emailVerified: profile.email_verified,
        };
      },
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    async sendVerificationEmail(data) {
      await sendEmailVerificationEmail(data.user.email, data.user.name, data.url);
    },
  },

  advanced: {
    cookiePrefix: 'yayago-app',
    useSecureCookies: true,

    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV !== 'development',
      domain: process.env.COOKIE_DOMAIN || '',
    },

    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },

    database: {
      generateId: () => crypto.randomUUID(),
    },
  },

  plugins: [
    expo(),
    username(),
    admin(),
    multiSession(),
    customSession(async ({ user, session }) => {
      return await getCustomSession(user, session);
    }),
    organization({
      cancelPendingInvitationsOnReInvite: true,
      disableOrganizationDeletion: true,
      organizationLimit: 1,
      allowUserToCreateOrganization,
    }),
    phoneNumber({
      sendOTP(data) {
        console.log(`OTP: ${data.code} sent to ${data.phoneNumber}`);
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      async getCustomerCreateParams(user) {
        return {
          metadata: {
            userId: user.id,
          },
        };
      },
      /**
       * CRITICAL: Stripe Webhook Event Handler
       *
       * This handles ALL subscription lifecycle events.
       * Security and access control depend on this working correctly.
       *
       * Events handled:
       * - Subscription: created, updated, deleted, paused, resumed, trial_will_end
       * - Invoice: payment_succeeded, payment_failed, upcoming, finalized
       * - Checkout: session.completed, session.expired
       */
      async onEvent(event) {
        const eventType = event.type;
        console.log('📩 Stripe webhook event:', eventType);

        try {
          switch (eventType) {
            // ============================================
            // SUBSCRIPTION EVENTS
            // ============================================

            case 'customer.subscription.created':
              // Handled by onSubscriptionComplete callback
              console.log('✅ Subscription created - handled by onSubscriptionComplete');
              break;

            case 'customer.subscription.updated':
              // Status changes, plan changes, cancellation scheduling
              await onSubscriptionUpdated(event as any);
              break;

            case 'customer.subscription.deleted':
              // Subscription fully deleted/canceled
              await onCustomerSubscriptionDeleted(event as any);
              break;

            case 'customer.subscription.paused':
              // Subscription paused (if enabled in Stripe)
              console.log('⏸️ Subscription paused');
              await onSubscriptionUpdated(event as any);
              break;

            case 'customer.subscription.resumed':
              // Subscription resumed from pause
              console.log('▶️ Subscription resumed');
              await onSubscriptionUpdated(event as any);
              break;

            case 'customer.subscription.trial_will_end':
              // Trial ending in 3 days (configurable in Stripe)
              await onTrialWillEnd(event as any);
              break;

            // ============================================
            // INVOICE EVENTS (Payment tracking)
            // ============================================

            case 'invoice.payment_succeeded':
              // Successful payment - subscription stays active
              await onInvoicePaymentSucceeded(event as any);
              break;

            case 'invoice.payment_failed':
              // Failed payment - may affect subscription status
              await onInvoicePaymentFailed(event as any);
              break;

            case 'invoice.upcoming':
              // Invoice coming up - good for notifications
              await onInvoiceUpcoming(event as any);
              break;

            case 'invoice.finalized':
              // Invoice is ready to be paid
              await onInvoiceFinalized(event as any);
              break;

            // ============================================
            // CHECKOUT EVENTS
            // ============================================

            case 'checkout.session.completed': {
              // Checkout completed - could be subscription or booking
              console.log('✅ Checkout session completed');

              // Check if this is a booking checkout
              const checkoutSession = event.data.object as any;
              if (checkoutSession.metadata?.type === 'booking') {
                console.log('🚗 Processing booking checkout');
                const bookingId = checkoutSession.metadata.bookingId;
                const hasInstantBooking = checkoutSession.metadata.hasInstantBooking === 'true';
                const paymentIntentId = checkoutSession.payment_intent;

                // Update booking directly here to avoid circular dependencies
                await prisma.booking.update({
                  where: { id: bookingId },
                  data: {
                    status: hasInstantBooking ? 'APPROVED' : 'PENDING_APPROVAL',
                    paymentStatus: 'PAID',
                    // Store payment intent for later refund processing
                    stripePaymentIntentId: paymentIntentId,
                  } as any,
                });
                console.log(
                  `✅ Booking ${bookingId} payment completed, status: ${hasInstantBooking ? 'APPROVED' : 'PENDING_APPROVAL'}`
                );

                // TODO: Send email notifications
                // - To user: Booking confirmed / pending approval
                // - To partner: New booking received
              }
              break;
            }

            case 'checkout.session.expired':
              // User didn't complete checkout
              console.log('⏰ Checkout session expired');
              break;

            // ============================================
            // CUSTOMER EVENTS
            // ============================================

            case 'customer.created':
              console.log('👤 Customer created in Stripe');
              break;

            case 'customer.updated':
              console.log('👤 Customer updated in Stripe');
              break;

            case 'customer.deleted':
              console.log('👤 Customer deleted in Stripe');
              break;

            // ============================================
            // PAYMENT METHOD EVENTS
            // ============================================

            case 'payment_method.attached':
              console.log('💳 Payment method attached');
              break;

            case 'payment_method.detached':
              console.log('💳 Payment method detached');
              break;

            // ============================================
            // CHARGE EVENTS
            // ============================================

            case 'charge.succeeded': {
              console.log('💰 Charge succeeded');
              // Store the charge ID in the booking for later refund processing
              const charge = event.data.object as any;
              const paymentIntent = charge.payment_intent;

              if (paymentIntent) {
                // Find booking with this payment intent and update with charge ID
                await prisma.booking.updateMany({
                  where: { stripePaymentIntentId: paymentIntent } as any,
                  data: { stripeChargeId: charge.id } as any,
                });
              }
              break;
            }

            case 'charge.failed':
              console.log('❌ Charge failed');
              break;

            case 'charge.refunded':
              console.log('↩️ Charge refunded');
              // TODO: Handle refunds if needed
              break;

            case 'charge.dispute.created':
              console.log('⚠️ Charge dispute created');
              // TODO: Handle disputes
              break;

            // ============================================
            // STRIPE CONNECT EVENTS (Partner Payouts)
            // ============================================

            case 'account.updated': {
              // Connected account status changed
              console.log('🏦 Connect account updated');
              const account = event.data.object as any;
              const accountId = account.id;

              // Update organization's payout status
              let status = 'pending';
              if (account.charges_enabled && account.payouts_enabled) {
                status = 'enabled';
              } else if (account.details_submitted && (!account.charges_enabled || !account.payouts_enabled)) {
                status = 'restricted';
              } else if (account.requirements?.disabled_reason) {
                status = 'disabled';
              }

              await prisma.organization.updateMany({
                where: { stripeAccountId: accountId } as any,
                data: {
                  stripeAccountStatus: status,
                  chargesEnabled: account.charges_enabled || false,
                  payoutsEnabled: account.payouts_enabled || false,
                  ...(status === 'enabled' && {
                    stripeOnboardingCompletedAt: new Date(),
                  }),
                } as any,
              });
              console.log(`✅ Updated organization payout status: ${status}`);
              break;
            }

            case 'transfer.created': {
              // Transfer to connected account created
              console.log('💸 Transfer created');
              const transfer = event.data.object as any;
              const bookingId = transfer.metadata?.bookingId;

              if (bookingId) {
                await prisma.booking.update({
                  where: { id: bookingId },
                  data: {
                    partnerPayoutId: transfer.id,
                    partnerPayoutStatus: 'paid',
                    partnerPaidAt: new Date(),
                  } as any,
                });
                console.log(`✅ Updated booking ${bookingId} payout status: paid`);
              }
              break;
            }

            case 'transfer.reversed': {
              // Transfer was reversed (e.g., due to refund or dispute)
              console.log('↩️ Transfer reversed');
              const transfer = event.data.object as any;
              const bookingId = transfer.metadata?.bookingId;

              if (bookingId) {
                await prisma.booking.update({
                  where: { id: bookingId },
                  data: {
                    partnerPayoutStatus: 'reversed',
                  } as any,
                });
                console.log(`↩️ Updated booking ${bookingId} payout status: reversed`);
              }
              break;
            }

            // ============================================
            // UNHANDLED EVENTS
            // ============================================

            default:
              console.log('ℹ️ Unhandled event type:', eventType);
          }
        } catch (error) {
          console.error(`❌ Error handling ${eventType}:`, error);
          // Don't throw - we don't want to retry most webhooks
          // Stripe will retry on 5xx errors
        }
      },
      subscription: {
        enabled: true,
        organization: {
          enabled: true,
        },
        /**
         * Called when a new subscription is completed (after checkout)
         * This is where we:
         * 1. Create organization if needed
         * 2. Snapshot plan limits to subscription
         * 3. Initialize usage counters
         */
        onSubscriptionComplete: async (data) => {
          console.log('🎯 onSubscriptionComplete triggered!');
          await onSubscriptionComplete(data);
        },
        /**
         * Authorization check for subscription actions
         * - New users (no referenceId) can subscribe/upgrade
         * - Existing organization owners can modify their subscriptions
         */
        async authorizeReference({ user, referenceId, action }) {
          console.log(`🔐 Authorizing ${action} for user ${user.id} on reference ${referenceId}`);

          // For upgrade action without a referenceId (new user subscribing)
          // Allow the action - organization will be created in onSubscriptionComplete
          if (action === 'upgrade-subscription' && !referenceId) {
            console.log('🔐 New user subscribing - allowed');
            return true;
          }

          if (
            action === 'upgrade-subscription' ||
            action === 'cancel-subscription' ||
            action === 'restore-subscription'
          ) {
            // For existing subscriptions, check if user is organization owner
            if (referenceId) {
              const member = await prisma.member.findFirst({
                where: {
                  organizationId: referenceId,
                  userId: user.id,
                },
              });

              const isOwner = member?.role === 'owner';
              console.log(`🔐 User is owner: ${isOwner}`);
              return isOwner;
            }

            // No referenceId means new subscription
            return true;
          }

          return true;
        },
        plans: await getPlans(),
      },
    }),
  ],
});
