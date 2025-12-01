import prisma from '@yayago-app/db';
import stripe from '@yayago-app/stripe';
import type {
  GetFinanceOverviewInputType,
  GetFinanceOverviewOutputType,
  ListTransactionsInputType,
  ListTransactionsOutputType,
  GetTransactionInputType,
  GetTransactionOutputType,
  ListCustomersInputType,
  ListCustomersOutputType,
  GetCustomerInputType,
  GetCustomerOutputType,
  ListFinanceSubscriptionsInputType,
  ListFinanceSubscriptionsOutputType,
  GetFinanceSubscriptionInputType,
  GetFinanceSubscriptionOutputType,
  GetPlansPerformanceInputType,
  GetPlansPerformanceOutputType,
  ListInvoicesInputType,
  ListInvoicesOutputType,
  ListRefundsInputType,
  ListRefundsOutputType,
  ListPayoutsInputType,
  ListPayoutsOutputType,
  GetBalanceOutputType,
  CreateRefundInputType,
  CreateRefundOutputType,
} from '@yayago-app/validators';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  subDays,
} from 'date-fns';

// Helper to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export class FinanceService {
  // ============ OVERVIEW ============
  static async getOverview(_input: GetFinanceOverviewInputType): Promise<GetFinanceOverviewOutputType> {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Fetch data in parallel
    const [
      // Booking revenue
      bookingRevenueTotal,
      bookingRevenueThisMonth,
      bookingRevenueLastMonth,

      // Subscriptions
      activeSubscriptions,
      subscriptionPlansWithPrices,

      // Recent bookings for transactions
      recentBookings,

      // Transaction counts (from bookings)
      totalBookingTransactions,
      successfulBookingTransactions,
      failedBookingTransactions,
      refundedBookingTransactions,

      // Time series for chart
      chartData,
    ] = await Promise.all([
      // Total booking revenue
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
        _count: true,
      }),

      // This month booking revenue
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
        },
        _sum: { totalPrice: true },
      }),

      // Last month booking revenue
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { totalPrice: true },
      }),

      // Active subscriptions for MRR
      prisma.subscription.findMany({
        where: { status: { in: ['active', 'trialing'] } },
        select: { plan: true },
      }),

      // Plans with prices for MRR calculation
      prisma.subscriptionPlan.findMany({
        include: {
          prices: { where: { interval: 'month', isActive: true }, take: 1 },
        },
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),

      // Transaction counts
      prisma.booking.count(),
      prisma.booking.count({ where: { paymentStatus: 'PAID' } }),
      prisma.booking.count({ where: { paymentStatus: 'FAILED' } }),
      prisma.booking.count({ where: { paymentStatus: { in: ['REFUNDED', 'PARTIALLY_REFUNDED'] } } }),

      // Chart data - last 30 days of bookings
      prisma.booking.findMany({
        where: {
          createdAt: { gte: subDays(now, 30) },
          paymentStatus: 'PAID',
        },
        select: { createdAt: true, totalPrice: true },
      }),
    ]);

    // Calculate MRR from active subscriptions
    const planPriceMap = new Map(
      subscriptionPlansWithPrices.map((p) => [p.slug, p.prices[0]?.amount || 0])
    );

    let mrr = 0;
    for (const sub of activeSubscriptions) {
      const price = planPriceMap.get(sub.plan) || 0;
      mrr += price;
    }
    mrr = mrr / 100; // Convert from cents

    const arr = mrr * 12;

    // Calculate totals
    const bookingTotal = bookingRevenueTotal._sum.totalPrice || 0;
    const bookingThisMonth = bookingRevenueThisMonth._sum.totalPrice || 0;
    const bookingLastMonth = bookingRevenueLastMonth._sum.totalPrice || 0;

    // Platform commission (5%)
    const commissionTotal = Math.round(bookingTotal * 0.05);
    const commissionThisMonth = Math.round(bookingThisMonth * 0.05);
    const commissionLastMonth = Math.round(bookingLastMonth * 0.05);

    // Total revenue (subscriptions + commission)
    const totalRevenue = mrr + commissionTotal;
    const revenueThisMonth = mrr + commissionThisMonth;
    const revenueLastMonth = (mrr * 0.95) + commissionLastMonth; // Estimate last month MRR

    // Process chart data
    const chartMap = new Map<string, { subscriptions: number; bookings: number }>();
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      chartMap.set(date, { subscriptions: mrr / 30, bookings: 0 });
    }

    for (const booking of chartData) {
      const date = format(booking.createdAt, 'yyyy-MM-dd');
      const existing = chartMap.get(date);
      if (existing) {
        existing.bookings += booking.totalPrice;
      }
    }

    const revenueChart = Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      subscriptions: Math.round(data.subscriptions),
      bookings: Math.round(data.bookings * 0.05), // Commission
      total: Math.round(data.subscriptions + data.bookings * 0.05),
    }));

    // Format recent transactions
    const recentTransactions = recentBookings.map((booking) => ({
      id: booking.id,
      type: 'booking' as const,
      amount: booking.totalPrice,
      currency: booking.currency,
      status: booking.paymentStatus,
      description: `Booking ${booking.referenceCode}`,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      createdAt: booking.createdAt,
    }));

    const successRate =
      totalBookingTransactions > 0
        ? Math.round((successfulBookingTransactions / totalBookingTransactions) * 100)
        : 0;

    const avgTransactionValue =
      successfulBookingTransactions > 0
        ? Math.round(bookingTotal / successfulBookingTransactions)
        : 0;

    return {
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        growth: calculateGrowth(revenueThisMonth, revenueLastMonth),
        currency: 'AED',
      },
      grossVolume: {
        total: bookingTotal,
        thisMonth: bookingThisMonth,
        growth: calculateGrowth(bookingThisMonth, bookingLastMonth),
      },
      netRevenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        growth: calculateGrowth(revenueThisMonth, revenueLastMonth),
      },
      commission: {
        total: commissionTotal,
        thisMonth: commissionThisMonth,
        growth: calculateGrowth(commissionThisMonth, commissionLastMonth),
      },
      subscriptionRevenue: {
        mrr,
        arr,
        growth: 0, // Would need historical data
      },
      bookingRevenue: {
        total: bookingTotal,
        thisMonth: bookingThisMonth,
        growth: calculateGrowth(bookingThisMonth, bookingLastMonth),
      },
      metrics: {
        totalTransactions: totalBookingTransactions,
        successfulTransactions: successfulBookingTransactions,
        failedTransactions: failedBookingTransactions,
        refundedTransactions: refundedBookingTransactions,
        successRate,
        avgTransactionValue,
      },
      revenueChart,
      recentTransactions,
    };
  }

  // ============ TRANSACTIONS ============
  static async listTransactions(
    input: ListTransactionsInputType
  ): Promise<ListTransactionsOutputType> {
    const { page, limit, type, status, startDate, endDate, customerId, search } = input;
    const skip = (page - 1) * limit;

    // Build where clause for bookings
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic filters
    const where: any = {};

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: startOfDay(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endOfDay(endDate) };
    }

    if (status && status !== 'all') {
      const statusMap: Record<string, string[]> = {
        succeeded: ['PAID'],
        pending: ['NOT_PAID', 'AUTHORIZED'],
        failed: ['FAILED'],
      };
      where.paymentStatus = { in: statusMap[status] || [] };
    }

    if (customerId) {
      where.userId = customerId;
    }

    if (search) {
      where.OR = [
        { referenceCode: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Only show booking type for now
    if (type && type !== 'all' && type !== 'booking') {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
        summary: { totalAmount: 0, totalFees: 0, totalNet: 0, count: 0 },
      };
    }

    const [bookings, total, summary] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          listing: { select: { organizationId: true } },
        },
      }),
      prisma.booking.count({ where }),
      prisma.booking.aggregate({
        where,
        _sum: { totalPrice: true },
        _count: true,
      }),
    ]);

    const items = bookings.map((booking) => ({
      id: booking.id,
      stripeId: null,
      type: 'booking' as const,
      amount: booking.totalPrice,
      fee: Math.round(booking.totalPrice * 0.05),
      net: Math.round(booking.totalPrice * 0.95),
      currency: booking.currency,
      status: booking.paymentStatus,
      description: `Car rental booking ${booking.referenceCode}`,
      customerId: booking.userId,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      subscriptionId: null,
      bookingId: booking.id,
      bookingReference: booking.referenceCode,
      paymentMethod: 'card',
      paymentMethodLast4: null,
      receiptUrl: null,
      invoiceUrl: null,
      createdAt: booking.createdAt,
    }));

    const totalAmount = summary._sum.totalPrice || 0;
    const totalFees = Math.round(totalAmount * 0.05);
    const totalNet = totalAmount - totalFees;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      summary: {
        totalAmount,
        totalFees,
        totalNet,
        count: summary._count || 0,
      },
    };
  }

  static async getTransaction(input: GetTransactionInputType): Promise<GetTransactionOutputType> {
    const booking = await prisma.booking.findUnique({
      where: { id: input.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new Error('Transaction not found');
    }

    return {
      id: booking.id,
      stripeId: null,
      type: 'booking',
      amount: booking.totalPrice,
      fee: Math.round(booking.totalPrice * 0.05),
      net: Math.round(booking.totalPrice * 0.95),
      currency: booking.currency,
      status: booking.paymentStatus,
      description: `Car rental booking ${booking.referenceCode}`,
      customerId: booking.userId,
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      subscriptionId: null,
      bookingId: booking.id,
      bookingReference: booking.referenceCode,
      paymentMethod: 'card',
      paymentMethodLast4: null,
      receiptUrl: null,
      invoiceUrl: null,
      createdAt: booking.createdAt,
      refunds: [],
      timeline: [
        { event: 'Booking created', timestamp: booking.createdAt, details: null },
        ...(booking.paymentStatus === 'PAID'
          ? [{ event: 'Payment succeeded', timestamp: booking.updatedAt, details: null }]
          : []),
      ],
    };
  }

  // ============ CUSTOMERS ============
  static async listCustomers(input: ListCustomersInputType): Promise<ListCustomersOutputType> {
    const { page, limit, search, hasSubscription, hasBookings } = input;
    const skip = (page - 1) * limit;

    // biome-ignore lint/suspicious/noExplicitAny: Dynamic filters
    const where: any = { role: 'user' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (hasBookings === true) {
      where.bookings = { some: {} };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          bookings: {
            where: { paymentStatus: 'PAID' },
            select: { totalPrice: true },
          },
          members: {
            include: {
              organization: {
                include: {
                  subscriptions: {
                    take: 1,
                    orderBy: { id: 'desc' },
                    select: { status: true, plan: true, stripeCustomerId: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const items = users.map((user) => {
      const totalSpent = user.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const org = user.members[0]?.organization;
      const sub = org?.subscriptions?.[0];

      return {
        id: user.id,
        stripeCustomerId: sub?.stripeCustomerId || null,
        name: user.name || 'Unknown',
        email: user.email,
        hasActiveSubscription: sub?.status === 'active' || sub?.status === 'trialing',
        subscriptionPlan: sub?.plan || null,
        subscriptionStatus: sub?.status || null,
        totalSpent,
        bookingsCount: user.bookings.length,
        transactionsCount: user.bookings.length,
        organizationId: org?.id || null,
        organizationName: org?.name || null,
        createdAt: user.createdAt,
      };
    });

    // Filter by subscription if needed
    const filteredItems = hasSubscription !== undefined
      ? items.filter((i) => i.hasActiveSubscription === hasSubscription)
      : items;

    const totalLifetimeValue = filteredItems.reduce((sum, c) => sum + c.totalSpent, 0);
    const customersWithSub = filteredItems.filter((c) => c.hasActiveSubscription).length;

    return {
      items: filteredItems,
      pagination: {
        page,
        limit,
        total: hasSubscription !== undefined ? filteredItems.length : total,
        totalPages: Math.ceil((hasSubscription !== undefined ? filteredItems.length : total) / limit),
      },
      summary: {
        totalCustomers: total,
        customersWithSubscription: customersWithSub,
        totalLifetimeValue,
      },
    };
  }

  static async getCustomer(input: GetCustomerInputType): Promise<GetCustomerOutputType> {
    const user = await prisma.user.findUnique({
      where: { id: input.id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            totalPrice: true,
            currency: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        members: {
          include: {
            organization: {
              include: {
                subscriptions: {
                  take: 1,
                  orderBy: { id: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Customer not found');
    }

    const allBookings = await prisma.booking.findMany({
      where: { userId: user.id, paymentStatus: 'PAID' },
      select: { totalPrice: true },
    });

    const totalSpent = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const org = user.members[0]?.organization;
    const sub = org?.subscriptions?.[0];

    // Get Stripe data if available
    let paymentMethods: GetCustomerOutputType['paymentMethods'] = [];
    let invoices: GetCustomerOutputType['invoices'] = [];

    if (sub?.stripeCustomerId) {
      try {
        const stripePMs = await stripe.paymentMethods.list({
          customer: sub.stripeCustomerId,
          type: 'card',
        });

        paymentMethods = stripePMs.data.map((pm) => ({
          id: pm.id,
          type: pm.type,
          last4: pm.card?.last4 || null,
          brand: pm.card?.brand || null,
          expMonth: pm.card?.exp_month || null,
          expYear: pm.card?.exp_year || null,
          isDefault: false,
        }));

        const stripeInvoices = await stripe.invoices.list({
          customer: sub.stripeCustomerId,
          limit: 10,
        });

        invoices = stripeInvoices.data.map((inv) => ({
          id: inv.id,
          number: inv.number,
          amount: inv.total,
          currency: inv.currency.toUpperCase(),
          status: inv.status || 'unknown',
          pdfUrl: inv.invoice_pdf ?? null,
          hostedUrl: inv.hosted_invoice_url ?? null,
          createdAt: new Date(inv.created * 1000),
        }));
      } catch (e) {
        // Stripe customer might not exist
      }
    }

    return {
      id: user.id,
      stripeCustomerId: sub?.stripeCustomerId || null,
      name: user.name || 'Unknown',
      email: user.email,
      hasActiveSubscription: sub?.status === 'active' || sub?.status === 'trialing',
      subscriptionPlan: sub?.plan || null,
      subscriptionStatus: sub?.status || null,
      totalSpent,
      bookingsCount: allBookings.length,
      transactionsCount: allBookings.length,
      organizationId: org?.id || null,
      organizationName: org?.name || null,
      createdAt: user.createdAt,
      paymentMethods,
      recentTransactions: user.bookings.map((b) => ({
        id: b.id,
        type: 'booking',
        amount: b.totalPrice,
        currency: b.currency,
        status: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      invoices,
      subscription: sub
        ? {
            id: sub.id,
            plan: sub.plan,
            status: sub.status,
            currentPeriodStart: sub.periodStart,
            currentPeriodEnd: sub.periodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
            amount: 0, // Would need to look up price
            currency: 'AED',
            interval: 'month',
          }
        : null,
    };
  }

  // ============ SUBSCRIPTIONS ============
  static async listSubscriptions(
    input: ListFinanceSubscriptionsInputType
  ): Promise<ListFinanceSubscriptionsOutputType> {
    const { page, limit, status, planSlug, search } = input;
    const skip = (page - 1) * limit;

    // biome-ignore lint/suspicious/noExplicitAny: Dynamic filters
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (planSlug) {
      where.plan = planSlug;
    }

    if (search) {
      where.organization = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [subscriptions, total, planCounts] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          organization: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Get plan details
    const planSlugs = [...new Set(subscriptions.map((s) => s.plan))];
    const plans = await prisma.subscriptionPlan.findMany({
      where: { slug: { in: planSlugs } },
      include: {
        prices: { where: { interval: 'month', isActive: true }, take: 1 },
      },
    });
    const planMap = new Map(
      plans.map((p) => [
        p.slug,
        {
          name: (p.name as { en?: string })?.en || p.slug,
          price: p.prices[0]?.amount || 0,
          currency: p.prices[0]?.currency || 'aed',
        },
      ])
    );

    // Get customer info (owner of org)
    const orgIds = subscriptions.map((s) => s.organizationId).filter(Boolean) as string[];
    const members = await prisma.member.findMany({
      where: { organizationId: { in: orgIds }, role: 'owner' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    const memberMap = new Map(members.map((m) => [m.organizationId, m.user]));

    const items = subscriptions.map((sub) => {
      const planInfo = planMap.get(sub.plan);
      const owner = sub.organizationId ? memberMap.get(sub.organizationId) : null;

      return {
        id: sub.id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        stripeCustomerId: sub.stripeCustomerId,
        planSlug: sub.plan,
        planName: planInfo?.name || sub.plan,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
        amount: planInfo?.price || 0,
        currency: (planInfo?.currency || 'aed').toUpperCase(),
        interval: 'month',
        currentPeriodStart: sub.periodStart,
        currentPeriodEnd: sub.periodEnd,
        customerId: owner?.id || null,
        customerName: owner?.name || null,
        customerEmail: owner?.email || null,
        organizationId: sub.organizationId,
        organizationName: sub.organization?.name || null,
        createdAt: sub.periodStart || new Date(),
      };
    });

    // Summary stats
    const activeCount = planCounts.find((p) => p.status === 'active')?._count || 0;
    const trialingCount = planCounts.find((p) => p.status === 'trialing')?._count || 0;
    const canceledCount = planCounts.find((p) => p.status === 'canceled')?._count || 0;

    let mrr = 0;
    for (const sub of subscriptions) {
      if (sub.status === 'active' || sub.status === 'trialing') {
        const planInfo = planMap.get(sub.plan);
        mrr += (planInfo?.price || 0) / 100;
      }
    }

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalActive: activeCount,
        totalTrialing: trialingCount,
        totalCanceled: canceledCount,
        mrr,
      },
    };
  }

  static async getSubscription(
    input: GetFinanceSubscriptionInputType
  ): Promise<GetFinanceSubscriptionOutputType> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: input.id },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get plan info
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: subscription.plan },
      include: {
        prices: { where: { interval: 'month', isActive: true }, take: 1 },
      },
    });

    // Get owner
    let owner: { id: string; name: string | null; email: string } | null = null;
    if (subscription.organizationId) {
      const member = await prisma.member.findFirst({
        where: { organizationId: subscription.organizationId, role: 'owner' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      owner = member?.user || null;
    }

    // Get invoices from Stripe
    let invoices: GetFinanceSubscriptionOutputType['invoices'] = [];
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeInvoices = await stripe.invoices.list({
          subscription: subscription.stripeSubscriptionId,
          limit: 10,
        });

        invoices = stripeInvoices.data.map((inv) => ({
          id: inv.id,
          number: inv.number,
          amount: inv.total,
          currency: inv.currency.toUpperCase(),
          status: inv.status || 'unknown',
          pdfUrl: inv.invoice_pdf ?? null,
          hostedUrl: inv.hosted_invoice_url ?? null,
          createdAt: new Date(inv.created * 1000),
        }));
      } catch (e) {
        // Stripe subscription might not exist
      }
    }

    return {
      id: subscription.id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeCustomerId: subscription.stripeCustomerId,
      planSlug: subscription.plan,
      planName: (plan?.name as { en?: string })?.en || subscription.plan,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      amount: plan?.prices[0]?.amount || 0,
      currency: (plan?.prices[0]?.currency || 'aed').toUpperCase(),
      interval: 'month',
      currentPeriodStart: subscription.periodStart,
      currentPeriodEnd: subscription.periodEnd,
      customerId: owner?.id || null,
      customerName: owner?.name || null,
      customerEmail: owner?.email || null,
      organizationId: subscription.organizationId,
      organizationName: subscription.organization?.name || null,
      createdAt: subscription.periodStart || new Date(),
      usage: {
        listings: {
          current: subscription.currentListings,
          max: subscription.maxListings || 0,
        },
        featuredListings: {
          current: subscription.currentFeaturedListings,
          max: subscription.maxFeaturedListings || 0,
        },
        members: {
          current: subscription.currentMembers,
          max: subscription.maxMembers || 0,
        },
      },
      invoices,
      timeline: [
        {
          event: 'Subscription created',
          timestamp: subscription.periodStart || new Date(),
          details: `Plan: ${subscription.plan}`,
        },
      ],
    };
  }

  // ============ PLANS PERFORMANCE ============
  static async getPlansPerformance(
    _input: GetPlansPerformanceInputType
  ): Promise<GetPlansPerformanceOutputType> {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        prices: { where: { isActive: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const subscriptions = await prisma.subscription.groupBy({
      by: ['plan', 'status'],
      _count: true,
    });

    const subsByPlan = new Map<string, Map<string, number>>();
    for (const sub of subscriptions) {
      if (!subsByPlan.has(sub.plan)) {
        subsByPlan.set(sub.plan, new Map());
      }
      subsByPlan.get(sub.plan)!.set(sub.status, sub._count);
    }

    let totalMRR = 0;
    let totalSubscribers = 0;

    const planData = plans.map((plan) => {
      const statusCounts = subsByPlan.get(plan.slug) || new Map();
      const activeCount = statusCounts.get('active') || 0;
      const trialingCount = statusCounts.get('trialing') || 0;
      const totalCount = Array.from(statusCounts.values()).reduce((a, b) => a + b, 0);

      const monthlyPrice = plan.prices.find((p) => p.interval === 'month')?.amount || 0;
      const yearlyPrice = plan.prices.find((p) => p.interval === 'year')?.amount || null;
      const currency = plan.prices[0]?.currency || 'aed';

      const mrr = ((activeCount + trialingCount) * monthlyPrice) / 100;
      totalMRR += mrr;
      totalSubscribers += totalCount;

      return {
        id: plan.id,
        slug: plan.slug,
        name: (plan.name as { en?: string })?.en || plan.slug,
        activeSubscribers: activeCount,
        trialingSubscribers: trialingCount,
        totalSubscribers: totalCount,
        mrr,
        totalRevenue: mrr, // Simplified
        churnedThisMonth: 0, // Would need historical data
        churnRate: 0,
        monthlyPrice: monthlyPrice / 100,
        yearlyPrice: yearlyPrice ? yearlyPrice / 100 : null,
        currency: currency.toUpperCase(),
      };
    });

    return {
      plans: planData,
      totals: {
        totalMRR,
        totalARR: totalMRR * 12,
        totalSubscribers,
        avgRevenuePerUser: totalSubscribers > 0 ? Math.round(totalMRR / totalSubscribers) : 0,
      },
    };
  }

  // ============ INVOICES ============
  static async listInvoices(input: ListInvoicesInputType): Promise<ListInvoicesOutputType> {
    const { page, limit, status, customerId, subscriptionId, startDate, endDate } = input;

    try {
      const params: any = {
        limit,
        expand: ['data.customer'],
      };

      if (status && status !== 'all') {
        params.status = status;
      }
      if (customerId) {
        params.customer = customerId;
      }
      if (subscriptionId) {
        params.subscription = subscriptionId;
      }
      if (startDate) {
        params.created = { ...params.created, gte: Math.floor(startDate.getTime() / 1000) };
      }
      if (endDate) {
        params.created = { ...params.created, lte: Math.floor(endDate.getTime() / 1000) };
      }

      const invoices = await stripe.invoices.list(params);

      const items = invoices.data.map((inv) => {
        const customer = inv.customer as any;
        return {
          id: inv.id,
          number: inv.number,
          status: inv.status || 'unknown',
          amount: inv.total,
          amountPaid: inv.amount_paid,
          amountDue: inv.amount_due,
          currency: inv.currency.toUpperCase(),
          customerId: typeof inv.customer === 'string' ? inv.customer : inv.customer?.id || null,
          customerName: customer?.name || customer?.email || null,
          customerEmail: customer?.email || null,
          subscriptionId: typeof (inv as { subscription?: string | null }).subscription === 'string' ? (inv as { subscription?: string | null }).subscription! : null,
          pdfUrl: inv.invoice_pdf ?? null,
          hostedUrl: inv.hosted_invoice_url ?? null,
          periodStart: inv.period_start ? new Date(inv.period_start * 1000) : null,
          periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
          dueDate: inv.due_date ? new Date(inv.due_date * 1000) : null,
          paidAt: inv.status_transitions?.paid_at
            ? new Date(inv.status_transitions.paid_at * 1000)
            : null,
          createdAt: new Date(inv.created * 1000),
        };
      });

      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      const totalPaid = items.reduce((sum, i) => sum + i.amountPaid, 0);
      const totalDue = items.reduce((sum, i) => sum + i.amountDue, 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: 1,
        },
        summary: {
          totalAmount,
          totalPaid,
          totalDue,
          count: items.length,
        },
      };
    } catch (e) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: { totalAmount: 0, totalPaid: 0, totalDue: 0, count: 0 },
      };
    }
  }

  // ============ REFUNDS ============
  static async listRefunds(input: ListRefundsInputType): Promise<ListRefundsOutputType> {
    const { page, limit, status, startDate, endDate } = input;

    try {
      const params: any = {
        limit,
        expand: ['data.charge'],
      };

      if (startDate) {
        params.created = { ...params.created, gte: Math.floor(startDate.getTime() / 1000) };
      }
      if (endDate) {
        params.created = { ...params.created, lte: Math.floor(endDate.getTime() / 1000) };
      }

      const refunds = await stripe.refunds.list(params);

      let items = refunds.data.map((refund) => {
        const charge = refund.charge as any;
        return {
          id: refund.id,
          chargeId: typeof refund.charge === 'string' ? refund.charge : refund.charge?.id || '',
          amount: refund.amount,
          currency: refund.currency.toUpperCase(),
          status: refund.status || 'unknown',
          reason: refund.reason,
          bookingId: charge?.metadata?.bookingId || null,
          bookingReference: charge?.metadata?.bookingReference || null,
          customerName: null,
          customerEmail: charge?.billing_details?.email || null,
          createdAt: new Date(refund.created * 1000),
        };
      });

      if (status && status !== 'all') {
        items = items.filter((r) => r.status === status);
      }

      const totalRefunded = items.reduce((sum, r) => sum + r.amount, 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: 1,
        },
        summary: {
          totalRefunded,
          count: items.length,
          refundRate: 0,
        },
      };
    } catch (e) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: { totalRefunded: 0, count: 0, refundRate: 0 },
      };
    }
  }

  // ============ PAYOUTS ============
  static async listPayouts(input: ListPayoutsInputType): Promise<ListPayoutsOutputType> {
    const { page, limit, status, startDate, endDate } = input;

    try {
      const params: any = {
        limit,
      };

      if (status && status !== 'all') {
        params.status = status;
      }
      if (startDate) {
        params.created = { ...params.created, gte: Math.floor(startDate.getTime() / 1000) };
      }
      if (endDate) {
        params.created = { ...params.created, lte: Math.floor(endDate.getTime() / 1000) };
      }

      const payouts = await stripe.payouts.list(params);

      const items = payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency.toUpperCase(),
        status: payout.status,
        method: payout.method,
        type: payout.type,
        bankName: null,
        last4: null,
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null,
        createdAt: new Date(payout.created * 1000),
      }));

      const totalPaidOut = items
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = items
        .filter((p) => p.status === 'pending' || p.status === 'in_transit')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        items,
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: 1,
        },
        summary: {
          totalPaidOut,
          pendingAmount,
          count: items.length,
        },
      };
    } catch (e) {
      return {
        items: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: { totalPaidOut: 0, pendingAmount: 0, count: 0 },
      };
    }
  }

  // ============ BALANCE ============
  static async getBalance(): Promise<GetBalanceOutputType> {
    try {
      const balance = await stripe.balance.retrieve();

      return {
        available: balance.available.map((b) => ({
          amount: b.amount,
          currency: b.currency.toUpperCase(),
        })),
        pending: balance.pending.map((b) => ({
          amount: b.amount,
          currency: b.currency.toUpperCase(),
        })),
        connectReserved: balance.connect_reserved?.map((b) => ({
          amount: b.amount,
          currency: b.currency.toUpperCase(),
        })),
      };
    } catch (e) {
      return {
        available: [],
        pending: [],
      };
    }
  }

  // ============ CREATE REFUND ============
  static async createRefund(input: CreateRefundInputType): Promise<CreateRefundOutputType> {
    const params: any = {
      charge: input.chargeId,
    };

    if (input.amount) {
      params.amount = input.amount;
    }
    if (input.reason) {
      params.reason = input.reason;
    }

    const refund = await stripe.refunds.create(params);

    return {
      id: refund.id,
      chargeId: typeof refund.charge === 'string' ? refund.charge : refund.charge?.id || '',
      amount: refund.amount,
      currency: refund.currency.toUpperCase(),
      status: refund.status || 'unknown',
      reason: refund.reason,
      bookingId: null,
      bookingReference: null,
      customerName: null,
      customerEmail: null,
      createdAt: new Date(refund.created * 1000),
    };
  }
}

