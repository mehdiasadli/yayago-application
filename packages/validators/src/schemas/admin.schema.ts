import { z } from 'zod';

// ============ ADMIN DASHBOARD STATS ============

export const GetAdminDashboardStatsOutputSchema = z.object({
  // Platform Overview
  platform: z.object({
    totalUsers: z.number(),
    totalOrganizations: z.number(),
    totalListings: z.number(),
    totalBookings: z.number(),
    totalRevenue: z.number(),
    currency: z.string(),
  }),

  // This Month Stats
  thisMonth: z.object({
    newUsers: z.number(),
    newOrganizations: z.number(),
    newListings: z.number(),
    newBookings: z.number(),
    revenue: z.number(),
    completedBookings: z.number(),
  }),

  // Pending Actions (requires attention)
  pending: z.object({
    organizationsCount: z.number(),
    listingsCount: z.number(),
    bookingsCount: z.number(),
  }),

  // Users Breakdown
  users: z.object({
    total: z.number(),
    active: z.number(),
    banned: z.number(),
    admins: z.number(),
    moderators: z.number(),
  }),

  // Organizations Breakdown
  organizations: z.object({
    total: z.number(),
    active: z.number(),
    pending: z.number(),
    rejected: z.number(),
    suspended: z.number(),
    onboarding: z.number(),
  }),

  // Listings Breakdown
  listings: z.object({
    total: z.number(),
    approved: z.number(),
    pending: z.number(),
    rejected: z.number(),
    available: z.number(),
    unavailable: z.number(),
  }),

  // Bookings Breakdown
  bookings: z.object({
    total: z.number(),
    pendingApproval: z.number(),
    approved: z.number(),
    active: z.number(),
    completed: z.number(),
    cancelled: z.number(),
    disputed: z.number(),
  }),

  // Recent Items
  recentOrganizations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      status: z.string(),
      createdAt: z.date(),
    })
  ),

  recentListings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      verificationStatus: z.string(),
      organizationName: z.string(),
      createdAt: z.date(),
    })
  ),

  recentBookings: z.array(
    z.object({
      id: z.string(),
      referenceCode: z.string(),
      status: z.string(),
      totalPrice: z.number(),
      currency: z.string(),
      userName: z.string(),
      listingTitle: z.string(),
      createdAt: z.date(),
    })
  ),

  // Subscription Stats
  subscriptions: z.object({
    totalActive: z.number(),
    totalTrialing: z.number(),
    monthlyRecurringRevenue: z.number(),
  }),
});

export type GetAdminDashboardStatsOutputType = z.infer<typeof GetAdminDashboardStatsOutputSchema>;
