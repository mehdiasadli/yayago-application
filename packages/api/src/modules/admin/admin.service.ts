import prisma from '@yayago-app/db';
import type { GetAdminDashboardStatsOutputType } from '@yayago-app/validators';

export class AdminService {
  static async getDashboardStats(): Promise<GetAdminDashboardStatsOutputType> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel fetch all stats
    const [
      // Total counts
      totalUsers,
      totalOrganizations,
      totalListings,
      totalBookings,
      totalRevenueData,

      // This month stats
      newUsersThisMonth,
      newOrganizationsThisMonth,
      newListingsThisMonth,
      newBookingsThisMonth,
      revenueThisMonth,
      completedBookingsThisMonth,

      // Pending counts
      pendingOrganizations,
      pendingListings,
      pendingBookings,

      // Users breakdown
      activeUsers,
      bannedUsers,
      adminUsers,
      moderatorUsers,

      // Organizations breakdown
      activeOrganizations,
      pendingOrgsStatus,
      rejectedOrganizations,
      suspendedOrganizations,
      onboardingOrganizations,

      // Listings breakdown
      approvedListings,
      pendingListingsVerification,
      rejectedListings,
      availableListings,
      unavailableListings,

      // Bookings breakdown
      pendingApprovalBookings,
      approvedBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings,

      // Recent items
      recentOrganizations,
      recentListings,
      recentBookings,

      // Subscription stats
      activeSubscriptions,
      trialingSubscriptions,
      mrrData,
    ] = await Promise.all([
      // ============ TOTAL COUNTS ============
      prisma.user.count({ where: { role: 'user' } }),
      prisma.organization.count(),
      prisma.listing.count({ where: { deletedAt: null } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),

      // ============ THIS MONTH STATS ============
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth }, role: 'user' },
      }),
      prisma.organization.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.booking.count({
        where: {
          status: 'COMPLETED',
          actualReturnTime: { gte: startOfMonth },
        },
      }),

      // ============ PENDING COUNTS ============
      prisma.organization.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({
        where: { verificationStatus: 'PENDING', deletedAt: null },
      }),
      prisma.booking.count({ where: { status: 'PENDING_APPROVAL' } }),

      // ============ USERS BREAKDOWN ============
      prisma.user.count({ where: { banned: false } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'moderator' } }),

      // ============ ORGANIZATIONS BREAKDOWN ============
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.organization.count({ where: { status: 'PENDING' } }),
      prisma.organization.count({ where: { status: 'REJECTED' } }),
      prisma.organization.count({ where: { status: 'SUSPENDED' } }),
      prisma.organization.count({ where: { status: 'ONBOARDING' } }),

      // ============ LISTINGS BREAKDOWN ============
      prisma.listing.count({
        where: { verificationStatus: 'APPROVED', deletedAt: null },
      }),
      prisma.listing.count({
        where: { verificationStatus: 'PENDING', deletedAt: null },
      }),
      prisma.listing.count({
        where: { verificationStatus: 'REJECTED', deletedAt: null },
      }),
      prisma.listing.count({
        where: { status: 'AVAILABLE', deletedAt: null },
      }),
      prisma.listing.count({
        where: { status: 'UNAVAILABLE', deletedAt: null },
      }),

      // ============ BOOKINGS BREAKDOWN ============
      prisma.booking.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.booking.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({
        where: {
          status: { in: ['CANCELLED_BY_USER', 'CANCELLED_BY_HOST'] },
        },
      }),
      prisma.booking.count({ where: { status: 'DISPUTED' } }),

      // ============ RECENT ITEMS ============
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.listing.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          verificationStatus: true,
          createdAt: true,
          organization: {
            select: { name: true },
          },
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          referenceCode: true,
          status: true,
          totalPrice: true,
          currency: true,
          createdAt: true,
          user: { select: { name: true } },
          listing: { select: { title: true } },
        },
      }),

      // ============ SUBSCRIPTION STATS ============
      prisma.subscription.count({
        where: { status: 'active' },
      }),
      prisma.subscription.count({
        where: { status: 'trialing' },
      }),
      // MRR calculation - get active subscription plan slugs
      prisma.subscription.findMany({
        where: { status: { in: ['active', 'trialing'] } },
        select: { plan: true }, // plan is the slug string
      }),
    ]);

    // Get unique plan slugs and fetch their monthly prices
    const planSlugs = [...new Set(mrrData.map((s) => s.plan))];
    const planPrices = await prisma.subscriptionPlan.findMany({
      where: { slug: { in: planSlugs } },
      select: {
        slug: true,
        prices: {
          where: { interval: 'month', isActive: true },
          take: 1,
          select: { amount: true },
        },
      },
    });

    // Create a map of plan slug to monthly price
    const priceMap = new Map<string, number>();
    for (const plan of planPrices) {
      priceMap.set(plan.slug, plan.prices[0]?.amount || 0);
    }

    // Calculate MRR
    const monthlyRecurringRevenue = mrrData.reduce((acc, sub) => {
      const monthlyPrice = priceMap.get(sub.plan) || 0;
      return acc + monthlyPrice;
    }, 0);

    return {
      platform: {
        totalUsers,
        totalOrganizations,
        totalListings,
        totalBookings,
        totalRevenue: totalRevenueData._sum.totalPrice || 0,
        currency: 'AED',
      },

      thisMonth: {
        newUsers: newUsersThisMonth,
        newOrganizations: newOrganizationsThisMonth,
        newListings: newListingsThisMonth,
        newBookings: newBookingsThisMonth,
        revenue: revenueThisMonth._sum.totalPrice || 0,
        completedBookings: completedBookingsThisMonth,
      },

      pending: {
        organizationsCount: pendingOrganizations,
        listingsCount: pendingListings,
        bookingsCount: pendingBookings,
      },

      users: {
        total: totalUsers + adminUsers + moderatorUsers,
        active: activeUsers,
        banned: bannedUsers,
        admins: adminUsers,
        moderators: moderatorUsers,
      },

      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        pending: pendingOrgsStatus,
        rejected: rejectedOrganizations,
        suspended: suspendedOrganizations,
        onboarding: onboardingOrganizations,
      },

      listings: {
        total: totalListings,
        approved: approvedListings,
        pending: pendingListingsVerification,
        rejected: rejectedListings,
        available: availableListings,
        unavailable: unavailableListings,
      },

      bookings: {
        total: totalBookings,
        pendingApproval: pendingApprovalBookings,
        approved: approvedBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        disputed: disputedBookings,
      },

      recentOrganizations: recentOrganizations.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt,
      })),

      recentListings: recentListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        verificationStatus: listing.verificationStatus,
        organizationName: listing.organization.name,
        createdAt: listing.createdAt,
      })),

      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        referenceCode: booking.referenceCode,
        status: booking.status,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        userName: booking.user.name,
        listingTitle: booking.listing.title,
        createdAt: booking.createdAt,
      })),

      subscriptions: {
        totalActive: activeSubscriptions,
        totalTrialing: trialingSubscriptions,
        monthlyRecurringRevenue: monthlyRecurringRevenue / 100, // Convert from cents
      },
    };
  }
}
