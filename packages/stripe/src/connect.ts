import { stripe } from './client';
import type Stripe from 'stripe';

// ============================================================
// STRIPE CONNECT SERVICE
// Handles Express accounts for organization payouts
// ============================================================

/**
 * Creates a Stripe Connect Express account for an organization
 */
export async function createConnectAccount(params: {
  organizationId: string;
  email?: string;
  businessName?: string;
  country?: string;
}): Promise<Stripe.Account> {
  // For Express accounts, don't request explicit capabilities
  // Stripe will automatically enable the appropriate capabilities based on the country
  // - Some countries (like UAE) don't support card_payments
  // - Requesting transfers explicitly requires platform approval
  // By omitting capabilities, Stripe determines what's available automatically
  const account = await stripe.accounts.create({
    type: 'express',
    email: params.email,
    business_type: 'company',
    company: {
      name: params.businessName,
    },
    country: params.country || 'AE', // Default to UAE
    metadata: {
      source: 'yayago-app',
      organizationId: params.organizationId,
    },
  });

  console.log(`✅ Created Stripe Connect account: ${account.id}`);
  return account;
}

/**
 * Creates an account link for Stripe Connect onboarding
 */
export async function createAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<Stripe.AccountLink> {
  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });

  console.log(`✅ Created account link for: ${params.accountId}`);
  return accountLink;
}

/**
 * Gets the current status of a Connect account
 */
export async function getConnectAccount(accountId: string): Promise<Stripe.Account | null> {
  try {
    return await stripe.accounts.retrieve(accountId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

/**
 * Gets the status details of a Connect account
 */
export async function getConnectAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: 'pending' | 'enabled' | 'restricted' | 'disabled';
}> {
  const account = await stripe.accounts.retrieve(accountId);

  let status: 'pending' | 'enabled' | 'restricted' | 'disabled' = 'pending';

  if (account.charges_enabled && account.payouts_enabled) {
    status = 'enabled';
  } else if (account.details_submitted && (!account.charges_enabled || !account.payouts_enabled)) {
    status = 'restricted';
  } else if (account.requirements?.disabled_reason) {
    status = 'disabled';
  }

  return {
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
    status,
  };
}

/**
 * Creates a login link for an existing Connect account dashboard
 */
export async function createDashboardLink(accountId: string): Promise<Stripe.LoginLink> {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  console.log(`✅ Created dashboard link for: ${accountId}`);
  return loginLink;
}

/**
 * Creates an Account Session for embedded Connect components
 * This allows embedding onboarding and management UI directly in your app
 */
export async function createAccountSession(params: {
  accountId: string;
  components: {
    accountOnboarding?: boolean;
    accountManagement?: boolean;
    payouts?: boolean;
    payoutsList?: boolean;
    paymentDetails?: boolean;
    balances?: boolean;
    notificationBanner?: boolean;
    documents?: boolean;
  };
}): Promise<Stripe.AccountSession> {
  const componentConfig: Stripe.AccountSessionCreateParams.Components = {};

  if (params.components.accountOnboarding) {
    componentConfig.account_onboarding = { enabled: true };
  }
  if (params.components.accountManagement) {
    componentConfig.account_management = { enabled: true };
  }
  if (params.components.payouts) {
    componentConfig.payouts = { enabled: true };
  }
  if (params.components.payoutsList) {
    componentConfig.payouts_list = { enabled: true };
  }
  if (params.components.paymentDetails) {
    componentConfig.payment_details = { enabled: true };
  }
  if (params.components.balances) {
    componentConfig.balances = { enabled: true };
  }
  if (params.components.notificationBanner) {
    componentConfig.notification_banner = { enabled: true };
  }
  if (params.components.documents) {
    componentConfig.documents = { enabled: true };
  }

  const accountSession = await stripe.accountSessions.create({
    account: params.accountId,
    components: componentConfig,
  });

  console.log(`✅ Created account session for: ${params.accountId}`);
  return accountSession;
}

// ============================================================
// TRANSFERS (Platform -> Connected Account)
// ============================================================

/**
 * Creates a transfer to a connected account (payout to organization)
 */
export async function createTransfer(params: {
  amount: number; // in cents
  currency: string;
  destinationAccountId: string;
  bookingId: string;
  description?: string;
}): Promise<Stripe.Transfer> {
  const transfer = await stripe.transfers.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    destination: params.destinationAccountId,
    description: params.description || `Payout for booking ${params.bookingId}`,
    metadata: {
      source: 'yayago-app',
      bookingId: params.bookingId,
    },
  });

  console.log(`✅ Created transfer: ${transfer.id} to ${params.destinationAccountId}`);
  return transfer;
}

/**
 * Gets a transfer by ID
 */
export async function getTransfer(transferId: string): Promise<Stripe.Transfer | null> {
  try {
    return await stripe.transfers.retrieve(transferId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

/**
 * Reverses a transfer (for dispute resolution)
 */
export async function reverseTransfer(
  transferId: string,
  params?: { amount?: number }
): Promise<Stripe.TransferReversal> {
  const reversal = await stripe.transfers.createReversal(transferId, {
    amount: params?.amount, // If not provided, reverses full amount
  });

  console.log(`✅ Reversed transfer: ${transferId}`);
  return reversal;
}

// ============================================================
// REFUNDS (Return deposit to customer)
// ============================================================

/**
 * Creates a refund for a deposit
 */
export async function createRefund(params: {
  paymentIntentId?: string;
  chargeId?: string;
  amount?: number; // in cents - if not provided, refunds full amount
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.create({
    ...(params.paymentIntentId && { payment_intent: params.paymentIntentId }),
    ...(params.chargeId && { charge: params.chargeId }),
    amount: params.amount,
    reason: params.reason || 'requested_by_customer',
    metadata: {
      source: 'yayago-app',
      ...params.metadata,
    },
  });

  console.log(`✅ Created refund: ${refund.id}`);
  return refund;
}

/**
 * Gets a refund by ID
 */
export async function getRefund(refundId: string): Promise<Stripe.Refund | null> {
  try {
    return await stripe.refunds.retrieve(refundId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

// ============================================================
// BALANCE UTILITIES
// ============================================================

/**
 * Gets the platform's balance
 */
export async function getPlatformBalance(): Promise<Stripe.Balance> {
  return await stripe.balance.retrieve();
}

/**
 * Gets a connected account's balance
 */
export async function getConnectedAccountBalance(accountId: string): Promise<Stripe.Balance> {
  return await stripe.balance.retrieve({
    stripeAccount: accountId,
  });
}

// ============================================================
// PAYMENT INTENT UTILITIES (For extracting charge ID)
// ============================================================

/**
 * Gets a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

/**
 * Extracts the charge ID from a payment intent
 */
export async function getChargeIdFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const paymentIntent = await getPaymentIntent(paymentIntentId);
  if (!paymentIntent) return null;

  const latestCharge = paymentIntent.latest_charge;
  if (typeof latestCharge === 'string') {
    return latestCharge;
  } else if (latestCharge && typeof latestCharge === 'object') {
    return latestCharge.id;
  }

  return null;
}
