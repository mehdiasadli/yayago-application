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

export type { PriceInterval } from './sync';
