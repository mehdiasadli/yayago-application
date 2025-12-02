import { stripe } from './client';

export default stripe;
export { stripe };

// Re-export sync utilities
export {
  // Product operations
  createStripeProduct,
  updateStripeProduct,
  archiveStripeProduct,
  getStripeProduct,
  listStripeProducts,
  validateStripeProduct,
  // Price operations
  createStripePrice,
  updateStripePrice,
  archiveStripePrice,
  getStripePrice,
  listStripePricesForProduct,
  validateStripePrice,
  // Subscription operations
  getStripeSubscription,
  cancelStripeSubscriptionAtPeriodEnd,
  cancelStripeSubscriptionImmediately,
  restoreStripeSubscription,
  // Customer operations
  getStripeCustomer,
} from './sync';

// Re-export Connect utilities (for payouts)
export {
  // Account operations
  createConnectAccount,
  createAccountLink,
  getConnectAccount,
  getConnectAccountStatus,
  createDashboardLink,
  createAccountSession,
  // Transfer operations (Platform -> Connected Account)
  createTransfer,
  getTransfer,
  reverseTransfer,
  // Refund operations (Return deposit to customer)
  createRefund,
  getRefund,
  // Balance utilities
  getPlatformBalance,
  getConnectedAccountBalance,
  // Payment intent utilities
  getPaymentIntent,
  getChargeIdFromPaymentIntent,
} from './connect';

export type { PriceInterval } from './sync';
