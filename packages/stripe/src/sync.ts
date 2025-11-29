import { stripe } from './client';
import type Stripe from 'stripe';

// ============================================================
// STRIPE SYNC SERVICE
// Handles bidirectional sync between app database and Stripe
// ============================================================

/**
 * Creates a Stripe product for a subscription plan
 */
export async function createStripeProduct(params: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> {
  const product = await stripe.products.create({
    name: params.name,
    description: params.description,
    metadata: {
      source: 'yayago-app',
      ...params.metadata,
    },
  });

  console.log(`✅ Created Stripe product: ${product.id}`);
  return product;
}

/**
 * Updates a Stripe product
 */
export async function updateStripeProduct(
  productId: string,
  params: {
    name?: string;
    description?: string;
    active?: boolean;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Product> {
  const product = await stripe.products.update(productId, {
    ...(params.name && { name: params.name }),
    ...(params.description !== undefined && { description: params.description || '' }),
    ...(params.active !== undefined && { active: params.active }),
    ...(params.metadata && { metadata: params.metadata }),
  });

  console.log(`✅ Updated Stripe product: ${product.id}`);
  return product;
}

/**
 * Archives a Stripe product (sets active: false)
 * Note: Cannot delete products with associated prices
 */
export async function archiveStripeProduct(productId: string): Promise<Stripe.Product> {
  const product = await stripe.products.update(productId, {
    active: false,
  });

  console.log(`✅ Archived Stripe product: ${product.id}`);
  return product;
}

/**
 * Gets a Stripe product by ID
 */
export async function getStripeProduct(productId: string): Promise<Stripe.Product | null> {
  try {
    return await stripe.products.retrieve(productId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

// ============================================================
// STRIPE PRICE SYNC
// ============================================================

export type PriceInterval = 'month' | 'year';

/**
 * Creates a Stripe price for a product
 */
export async function createStripePrice(params: {
  productId: string;
  unitAmount: number; // in cents
  currency: string;
  interval: PriceInterval;
  metadata?: Record<string, string>;
}): Promise<Stripe.Price> {
  const price = await stripe.prices.create({
    product: params.productId,
    unit_amount: params.unitAmount,
    currency: params.currency.toLowerCase(),
    recurring: {
      interval: params.interval,
    },
    metadata: {
      source: 'yayago-app',
      ...params.metadata,
    },
  });

  console.log(`✅ Created Stripe price: ${price.id}`);
  return price;
}

/**
 * Archives a Stripe price (sets active: false)
 * Note: Cannot delete prices with associated subscriptions
 */
export async function archiveStripePrice(priceId: string): Promise<Stripe.Price> {
  const price = await stripe.prices.update(priceId, {
    active: false,
  });

  console.log(`✅ Archived Stripe price: ${price.id}`);
  return price;
}

/**
 * Updates a Stripe price's metadata or active status
 * Note: Amount and currency cannot be changed - must create a new price
 */
export async function updateStripePrice(
  priceId: string,
  params: {
    active?: boolean;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Price> {
  const price = await stripe.prices.update(priceId, params);

  console.log(`✅ Updated Stripe price: ${price.id}`);
  return price;
}

/**
 * Gets a Stripe price by ID
 */
export async function getStripePrice(priceId: string): Promise<Stripe.Price | null> {
  try {
    return await stripe.prices.retrieve(priceId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

// ============================================================
// STRIPE SUBSCRIPTION UTILITIES
// ============================================================

/**
 * Gets subscription details from Stripe
 */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

/**
 * Cancels a Stripe subscription at period end
 */
export async function cancelStripeSubscriptionAtPeriodEnd(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  console.log(`✅ Marked subscription for cancellation: ${subscription.id}`);
  return subscription;
}

/**
 * Cancels a Stripe subscription immediately
 */
export async function cancelStripeSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);

  console.log(`✅ Cancelled subscription immediately: ${subscription.id}`);
  return subscription;
}

/**
 * Restores a subscription that was marked for cancellation
 */
export async function restoreStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  console.log(`✅ Restored subscription: ${subscription.id}`);
  return subscription;
}

// ============================================================
// STRIPE CUSTOMER UTILITIES
// ============================================================

/**
 * Gets a Stripe customer by ID
 */
export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer | null> {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validates that a Stripe product exists and is active
 */
export async function validateStripeProduct(productId: string): Promise<boolean> {
  const product = await getStripeProduct(productId);
  return product !== null && product.active;
}

/**
 * Validates that a Stripe price exists and is active
 */
export async function validateStripePrice(priceId: string): Promise<boolean> {
  const price = await getStripePrice(priceId);
  return price !== null && price.active;
}

// ============================================================
// BULK OPERATIONS
// ============================================================

/**
 * Lists all products from Stripe with pagination
 */
export async function listStripeProducts(params?: { active?: boolean; limit?: number }): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.products.list({
      active: params?.active,
      limit: params?.limit || 100,
      starting_after: startingAfter,
    });

    products.push(...response.data);
    hasMore = response.has_more;

    const lastProduct = response.data[response.data.length - 1];
    if (lastProduct) {
      startingAfter = lastProduct.id;
    }
  }

  return products;
}

/**
 * Lists all prices for a product
 */
export async function listStripePricesForProduct(
  productId: string,
  params?: { active?: boolean }
): Promise<Stripe.Price[]> {
  const prices: Stripe.Price[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.prices.list({
      product: productId,
      active: params?.active,
      limit: 100,
      starting_after: startingAfter,
    });

    prices.push(...response.data);
    hasMore = response.has_more;

    const lastPrice = response.data[response.data.length - 1];
    if (lastPrice) {
      startingAfter = lastPrice.id;
    }
  }

  return prices;
}
