import { z } from 'zod';

// ============ FINANCE OVERVIEW ============

export const GetFinanceOverviewInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type GetFinanceOverviewInputType = z.infer<typeof GetFinanceOverviewInputSchema>;

export const GetFinanceOverviewOutputSchema = z.object({
  // Revenue Metrics
  revenue: z.object({
    total: z.number(),
    thisMonth: z.number(),
    lastMonth: z.number(),
    growth: z.number(),
    currency: z.string(),
  }),

  // Gross Volume (total processed)
  grossVolume: z.object({
    total: z.number(),
    thisMonth: z.number(),
    growth: z.number(),
  }),

  // Net Revenue (after fees)
  netRevenue: z.object({
    total: z.number(),
    thisMonth: z.number(),
    growth: z.number(),
  }),

  // Platform Commission (5% of bookings)
  commission: z.object({
    total: z.number(),
    thisMonth: z.number(),
    growth: z.number(),
  }),

  // Subscription Revenue (MRR)
  subscriptionRevenue: z.object({
    mrr: z.number(),
    arr: z.number(),
    growth: z.number(),
  }),

  // Booking Revenue
  bookingRevenue: z.object({
    total: z.number(),
    thisMonth: z.number(),
    growth: z.number(),
  }),

  // Key Metrics
  metrics: z.object({
    totalTransactions: z.number(),
    successfulTransactions: z.number(),
    failedTransactions: z.number(),
    refundedTransactions: z.number(),
    successRate: z.number(),
    avgTransactionValue: z.number(),
  }),

  // Charts Data
  revenueChart: z.array(
    z.object({
      date: z.string(),
      subscriptions: z.number(),
      bookings: z.number(),
      total: z.number(),
    })
  ),

  // Recent Transactions
  recentTransactions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['subscription', 'booking', 'refund']),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      description: z.string(),
      customerName: z.string().nullable(),
      customerEmail: z.string().nullable(),
      createdAt: z.date(),
    })
  ),
});

export type GetFinanceOverviewOutputType = z.infer<typeof GetFinanceOverviewOutputSchema>;

// ============ TRANSACTIONS ============

export const ListTransactionsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.enum(['all', 'subscription', 'booking', 'refund', 'payout']).optional(),
  status: z.enum(['all', 'succeeded', 'pending', 'failed']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
});

export type ListTransactionsInputType = z.infer<typeof ListTransactionsInputSchema>;

const TransactionSchema = z.object({
  id: z.string(),
  stripeId: z.string().nullable(),
  type: z.enum(['subscription', 'booking', 'refund', 'payout', 'charge']),
  amount: z.number(),
  fee: z.number(),
  net: z.number(),
  currency: z.string(),
  status: z.string(),
  description: z.string(),
  // Customer info
  customerId: z.string().nullable(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  // Related entities
  subscriptionId: z.string().nullable(),
  bookingId: z.string().nullable(),
  bookingReference: z.string().nullable(),
  // Metadata
  paymentMethod: z.string().nullable(),
  paymentMethodLast4: z.string().nullable(),
  receiptUrl: z.string().nullable(),
  invoiceUrl: z.string().nullable(),
  createdAt: z.date(),
});

export const ListTransactionsOutputSchema = z.object({
  items: z.array(TransactionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
  summary: z.object({
    totalAmount: z.number(),
    totalFees: z.number(),
    totalNet: z.number(),
    count: z.number(),
  }),
});

export type ListTransactionsOutputType = z.infer<typeof ListTransactionsOutputSchema>;

export const GetTransactionInputSchema = z.object({
  id: z.string(),
});

export const GetTransactionOutputSchema = TransactionSchema.extend({
  refunds: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      status: z.string(),
      reason: z.string().nullable(),
      createdAt: z.date(),
    })
  ),
  timeline: z.array(
    z.object({
      event: z.string(),
      timestamp: z.date(),
      details: z.string().nullable(),
    })
  ),
});

export type GetTransactionOutputType = z.infer<typeof GetTransactionOutputSchema>;

// ============ CUSTOMERS ============

export const ListCustomersInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  hasSubscription: z.boolean().optional(),
  hasBookings: z.boolean().optional(),
});

export type ListCustomersInputType = z.infer<typeof ListCustomersInputSchema>;

const CustomerSchema = z.object({
  id: z.string(),
  stripeCustomerId: z.string().nullable(),
  name: z.string(),
  email: z.string(),
  // Subscription info
  hasActiveSubscription: z.boolean(),
  subscriptionPlan: z.string().nullable(),
  subscriptionStatus: z.string().nullable(),
  // Stats
  totalSpent: z.number(),
  bookingsCount: z.number(),
  transactionsCount: z.number(),
  // Organization
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  createdAt: z.date(),
});

export const ListCustomersOutputSchema = z.object({
  items: z.array(CustomerSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalCustomers: z.number(),
    customersWithSubscription: z.number(),
    totalLifetimeValue: z.number(),
  }),
});

export type ListCustomersOutputType = z.infer<typeof ListCustomersOutputSchema>;

export const GetCustomerInputSchema = z.object({
  id: z.string(),
});

export const GetCustomerOutputSchema = CustomerSchema.extend({
  // Payment methods
  paymentMethods: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      last4: z.string().nullable(),
      brand: z.string().nullable(),
      expMonth: z.number().nullable(),
      expYear: z.number().nullable(),
      isDefault: z.boolean(),
    })
  ),
  // Recent transactions
  recentTransactions: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      createdAt: z.date(),
    })
  ),
  // Invoices
  invoices: z.array(
    z.object({
      id: z.string(),
      number: z.string().nullable(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      pdfUrl: z.string().nullable(),
      hostedUrl: z.string().nullable(),
      createdAt: z.date(),
    })
  ),
  // Subscription details
  subscription: z
    .object({
      id: z.string(),
      plan: z.string(),
      status: z.string(),
      currentPeriodStart: z.date().nullable(),
      currentPeriodEnd: z.date().nullable(),
      cancelAtPeriodEnd: z.boolean(),
      amount: z.number(),
      currency: z.string(),
      interval: z.string(),
    })
    .nullable(),
});

export type GetCustomerOutputType = z.infer<typeof GetCustomerOutputSchema>;

// ============ SUBSCRIPTIONS LIST ============

export const ListFinanceSubscriptionsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['all', 'active', 'trialing', 'past_due', 'canceled', 'unpaid']).optional(),
  planSlug: z.string().optional(),
  search: z.string().optional(),
});

export type ListFinanceSubscriptionsInputType = z.infer<typeof ListFinanceSubscriptionsInputSchema>;

const FinanceSubscriptionSchema = z.object({
  id: z.string(),
  stripeSubscriptionId: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
  // Plan
  planSlug: z.string(),
  planName: z.string(),
  // Status
  status: z.string(),
  cancelAtPeriodEnd: z.boolean(),
  // Billing
  amount: z.number(),
  currency: z.string(),
  interval: z.string(),
  // Period
  currentPeriodStart: z.date().nullable(),
  currentPeriodEnd: z.date().nullable(),
  // Customer
  customerId: z.string().nullable(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  // Organization
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  createdAt: z.date(),
});

export const ListFinanceSubscriptionsOutputSchema = z.object({
  items: z.array(FinanceSubscriptionSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalActive: z.number(),
    totalTrialing: z.number(),
    totalCanceled: z.number(),
    mrr: z.number(),
  }),
});

export type ListFinanceSubscriptionsOutputType = z.infer<typeof ListFinanceSubscriptionsOutputSchema>;

export const GetFinanceSubscriptionInputSchema = z.object({
  id: z.string(),
});

export const GetFinanceSubscriptionOutputSchema = FinanceSubscriptionSchema.extend({
  // Usage
  usage: z.object({
    listings: z.object({ current: z.number(), max: z.number() }),
    featuredListings: z.object({ current: z.number(), max: z.number() }),
    members: z.object({ current: z.number(), max: z.number() }),
  }),
  // Invoices from Stripe
  invoices: z.array(
    z.object({
      id: z.string(),
      number: z.string().nullable(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      pdfUrl: z.string().nullable(),
      hostedUrl: z.string().nullable(),
      createdAt: z.date(),
    })
  ),
  // History
  timeline: z.array(
    z.object({
      event: z.string(),
      timestamp: z.date(),
      details: z.string().nullable(),
    })
  ),
});

export type GetFinanceSubscriptionOutputType = z.infer<typeof GetFinanceSubscriptionOutputSchema>;

// ============ PLANS PERFORMANCE ============

export const GetPlansPerformanceInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type GetPlansPerformanceInputType = z.infer<typeof GetPlansPerformanceInputSchema>;

export const GetPlansPerformanceOutputSchema = z.object({
  plans: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      // Subscribers
      activeSubscribers: z.number(),
      trialingSubscribers: z.number(),
      totalSubscribers: z.number(),
      // Revenue
      mrr: z.number(),
      totalRevenue: z.number(),
      // Churn
      churnedThisMonth: z.number(),
      churnRate: z.number(),
      // Pricing
      monthlyPrice: z.number(),
      yearlyPrice: z.number().nullable(),
      currency: z.string(),
    })
  ),
  totals: z.object({
    totalMRR: z.number(),
    totalARR: z.number(),
    totalSubscribers: z.number(),
    avgRevenuePerUser: z.number(),
  }),
});

export type GetPlansPerformanceOutputType = z.infer<typeof GetPlansPerformanceOutputSchema>;

// ============ INVOICES ============

export const ListInvoicesInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['all', 'draft', 'open', 'paid', 'void', 'uncollectible']).optional(),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ListInvoicesInputType = z.infer<typeof ListInvoicesInputSchema>;

const InvoiceSchema = z.object({
  id: z.string(),
  number: z.string().nullable(),
  status: z.string(),
  amount: z.number(),
  amountPaid: z.number(),
  amountDue: z.number(),
  currency: z.string(),
  // Customer
  customerId: z.string().nullable(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  // Subscription
  subscriptionId: z.string().nullable(),
  // URLs
  pdfUrl: z.string().nullable(),
  hostedUrl: z.string().nullable(),
  // Dates
  periodStart: z.date().nullable(),
  periodEnd: z.date().nullable(),
  dueDate: z.date().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});

export const ListInvoicesOutputSchema = z.object({
  items: z.array(InvoiceSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalAmount: z.number(),
    totalPaid: z.number(),
    totalDue: z.number(),
    count: z.number(),
  }),
});

export type ListInvoicesOutputType = z.infer<typeof ListInvoicesOutputSchema>;

// ============ REFUNDS ============

export const ListRefundsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['all', 'pending', 'succeeded', 'failed', 'canceled']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ListRefundsInputType = z.infer<typeof ListRefundsInputSchema>;

const RefundSchema = z.object({
  id: z.string(),
  chargeId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  reason: z.string().nullable(),
  // Related
  bookingId: z.string().nullable(),
  bookingReference: z.string().nullable(),
  // Customer
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  createdAt: z.date(),
});

export const ListRefundsOutputSchema = z.object({
  items: z.array(RefundSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalRefunded: z.number(),
    count: z.number(),
    refundRate: z.number(),
  }),
});

export type ListRefundsOutputType = z.infer<typeof ListRefundsOutputSchema>;

// ============ PAYOUTS ============

export const ListPayoutsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['all', 'pending', 'in_transit', 'paid', 'failed', 'canceled']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type ListPayoutsInputType = z.infer<typeof ListPayoutsInputSchema>;

const PayoutSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  method: z.string(),
  type: z.string(),
  // Bank account
  bankName: z.string().nullable(),
  last4: z.string().nullable(),
  // Dates
  arrivalDate: z.date().nullable(),
  createdAt: z.date(),
});

export const ListPayoutsOutputSchema = z.object({
  items: z.array(PayoutSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalPaidOut: z.number(),
    pendingAmount: z.number(),
    count: z.number(),
  }),
});

export type ListPayoutsOutputType = z.infer<typeof ListPayoutsOutputSchema>;

// ============ BALANCE ============

export const GetBalanceOutputSchema = z.object({
  available: z.array(
    z.object({
      amount: z.number(),
      currency: z.string(),
    })
  ),
  pending: z.array(
    z.object({
      amount: z.number(),
      currency: z.string(),
    })
  ),
  connectReserved: z
    .array(
      z.object({
        amount: z.number(),
        currency: z.string(),
      })
    )
    .optional(),
});

export type GetBalanceOutputType = z.infer<typeof GetBalanceOutputSchema>;

// ============ CREATE REFUND ============

export const CreateRefundInputSchema = z.object({
  chargeId: z.string(),
  amount: z.number().optional(), // If not provided, full refund
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
});

export type CreateRefundInputType = z.infer<typeof CreateRefundInputSchema>;

export const CreateRefundOutputSchema = RefundSchema;
export type CreateRefundOutputType = z.infer<typeof CreateRefundOutputSchema>;

