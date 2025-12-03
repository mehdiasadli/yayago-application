import { z } from 'zod';

// ============ ADMIN ANALYTICS ============

export const GetAnalyticsInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
});

export type GetAnalyticsInputType = z.infer<typeof GetAnalyticsInputSchema>;

// Time series data point
const TimeSeriesPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

// Revenue time series point
const RevenueTimeSeriesPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  bookings: z.number(),
  avgBookingValue: z.number(),
});

// Status distribution
const StatusDistributionSchema = z.object({
  status: z.string(),
  count: z.number(),
  percentage: z.number(),
});

// Named count item
const NamedCountSchema = z.object({
  name: z.string(),
  count: z.number(),
  percentage: z.number().optional(),
});

export const GetAnalyticsOutputSchema = z.object({
  // Date range info
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
    granularity: z.enum(['day', 'week', 'month']),
  }),

  // ============ SUMMARY STATS ============
  summary: z.object({
    // Core counts
    totalUsers: z.number(),
    totalOrganizations: z.number(),
    totalListings: z.number(),
    totalBookings: z.number(),
    // Financial
    totalRevenue: z.number(),
    avgBookingValue: z.number(),
    totalCommission: z.number(),
    // Active
    activeListings: z.number(),
    activeBookings: z.number(),
    // Regions
    totalCountries: z.number(),
    totalCities: z.number(),
    // Vehicles
    totalBrands: z.number(),
    totalModels: z.number(),
  }),

  // ============ GROWTH STATS ============
  growth: z.object({
    usersGrowth: z.number(),
    organizationsGrowth: z.number(),
    listingsGrowth: z.number(),
    bookingsGrowth: z.number(),
    revenueGrowth: z.number(),
  }),

  // ============ TIME SERIES DATA ============
  timeSeries: z.object({
    users: z.array(TimeSeriesPointSchema),
    organizations: z.array(TimeSeriesPointSchema),
    listings: z.array(TimeSeriesPointSchema),
    bookings: z.array(TimeSeriesPointSchema),
    revenue: z.array(RevenueTimeSeriesPointSchema),
  }),

  // ============ DISTRIBUTIONS ============
  distributions: z.object({
    // Organization
    organizationStatus: z.array(StatusDistributionSchema),
    // Listing
    listingVerification: z.array(StatusDistributionSchema),
    listingStatus: z.array(StatusDistributionSchema),
    // Booking
    bookingStatus: z.array(StatusDistributionSchema),
    paymentStatus: z.array(StatusDistributionSchema),
    // User
    userRoles: z.array(StatusDistributionSchema),
  }),

  // ============ TOP PERFORMERS ============
  topPerformers: z.object({
    // Organizations
    organizationsByBookings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        bookingsCount: z.number(),
        revenue: z.number(),
      })
    ),
    organizationsByRevenue: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        revenue: z.number(),
        bookingsCount: z.number(),
      })
    ),
    // Listings
    listingsByBookings: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        organizationName: z.string(),
        bookingsCount: z.number(),
        revenue: z.number(),
      })
    ),
    listingsByRevenue: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        organizationName: z.string(),
        revenue: z.number(),
        bookingsCount: z.number(),
      })
    ),
    // Users
    usersByBookings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        bookingsCount: z.number(),
        totalSpent: z.number(),
      })
    ),
    // Cities
    citiesByListings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        countryName: z.string(),
        listingsCount: z.number(),
      })
    ),
    citiesByBookings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        countryName: z.string(),
        bookingsCount: z.number(),
        revenue: z.number(),
      })
    ),
  }),

  // ============ BOOKING ANALYTICS ============
  bookingAnalytics: z.object({
    // By day of week
    bookingsByDayOfWeek: z.array(NamedCountSchema),
    // Average rental duration
    avgRentalDays: z.number(),
    // Instant vs pending bookings
    instantBookingRate: z.number(),
    // Cancellation rate
    cancellationRate: z.number(),
    // Completion rate
    completionRate: z.number(),
    // Average lead time (days before booking starts)
    avgLeadTimeDays: z.number(),
  }),

  // ============ SUBSCRIPTION ANALYTICS ============
  subscriptions: z.object({
    activeCount: z.number(),
    trialingCount: z.number(),
    cancelledCount: z.number(),
    mrr: z.number(),
    // Churn
    churnRate: z.number(),
    // Plan distribution
    planDistribution: z.array(
      z.object({
        planSlug: z.string(),
        planName: z.string(),
        count: z.number(),
        percentage: z.number(),
        revenue: z.number(),
      })
    ),
  }),

  // ============ VEHICLE ANALYTICS ============
  vehicles: z.object({
    topBrands: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        listingsCount: z.number(),
      })
    ),
    topModels: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        brandName: z.string(),
        listingsCount: z.number(),
      })
    ),
    bodyTypeDistribution: z.array(StatusDistributionSchema),
    fuelTypeDistribution: z.array(StatusDistributionSchema),
    transmissionDistribution: z.array(StatusDistributionSchema),
    classDistribution: z.array(StatusDistributionSchema),
    // Year distribution
    yearDistribution: z.array(
      z.object({
        year: z.number(),
        count: z.number(),
      })
    ),
    // Price ranges
    priceRanges: z.array(
      z.object({
        range: z.string(),
        min: z.number(),
        max: z.number(),
        count: z.number(),
      })
    ),
  }),

  // ============ GEOGRAPHIC ANALYTICS ============
  geographic: z.object({
    // Countries
    countriesByOrganizations: z.array(
      z.object({
        code: z.string(),
        name: z.string(),
        organizationsCount: z.number(),
        listingsCount: z.number(),
      })
    ),
    // Cities
    citiesByOrganizations: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        countryName: z.string(),
        organizationsCount: z.number(),
        listingsCount: z.number(),
      })
    ),
  }),

  // ============ PRICING ANALYTICS ============
  pricing: z.object({
    avgPricePerDay: z.number(),
    minPricePerDay: z.number(),
    maxPricePerDay: z.number(),
    medianPricePerDay: z.number(),
    // By vehicle class
    avgPriceByClass: z.array(
      z.object({
        class: z.string(),
        avgPrice: z.number(),
        count: z.number(),
      })
    ),
    // By body type
    avgPriceByBodyType: z.array(
      z.object({
        bodyType: z.string(),
        avgPrice: z.number(),
        count: z.number(),
      })
    ),
  }),

  // ============ USER ANALYTICS ============
  userAnalytics: z.object({
    // Verification
    verifiedUsersCount: z.number(),
    unverifiedUsersCount: z.number(),
    verificationRate: z.number(),
    // Activity
    usersWithBookings: z.number(),
    usersWithMultipleBookings: z.number(),
    // Average bookings per user
    avgBookingsPerUser: z.number(),
  }),

  // ============ RECENT ACTIVITY ============
  recentActivity: z.object({
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
    recentUsers: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        createdAt: z.date(),
      })
    ),
  }),
});

export type GetAnalyticsOutputType = z.infer<typeof GetAnalyticsOutputSchema>;

// ============ ORGANIZATION ANALYTICS (FOR PARTNERS) ============

export const GetOrganizationAnalyticsInputSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
});

export type GetOrganizationAnalyticsInputType = z.infer<typeof GetOrganizationAnalyticsInputSchema>;

// Time series data point for organization
const OrgTimeSeriesPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

// Revenue time series point for organization
const OrgRevenueTimeSeriesPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  bookings: z.number(),
  avgBookingValue: z.number(),
});

// Distribution schema
const OrgStatusDistributionSchema = z.object({
  status: z.string(),
  count: z.number(),
  percentage: z.number(),
});

// Named count
const OrgNamedCountSchema = z.object({
  name: z.string(),
  count: z.number(),
  percentage: z.number().optional(),
});

export const GetOrganizationAnalyticsOutputSchema = z.object({
  // Date range info
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
    granularity: z.enum(['day', 'week', 'month']),
  }),

  // ============ SUMMARY STATS ============
  summary: z.object({
    // Revenue
    totalRevenue: z.number(),
    pendingRevenue: z.number(), // Revenue from active bookings not yet completed
    avgBookingValue: z.number(),
    // Bookings
    totalBookings: z.number(),
    activeBookings: z.number(),
    completedBookings: z.number(),
    cancelledBookings: z.number(),
    // Listings
    totalListings: z.number(),
    activeListings: z.number(),
    featuredListings: z.number(),
    // Engagement
    totalViews: z.number(),
    totalReviews: z.number(),
    avgRating: z.number(),
    // Customers
    uniqueCustomers: z.number(),
    repeatCustomers: z.number(),
  }),

  // ============ GROWTH STATS (compared to previous period) ============
  growth: z.object({
    revenueGrowth: z.number(),
    bookingsGrowth: z.number(),
    viewsGrowth: z.number(),
    customersGrowth: z.number(),
  }),

  // ============ TIME SERIES DATA ============
  timeSeries: z.object({
    revenue: z.array(OrgRevenueTimeSeriesPointSchema),
    bookings: z.array(OrgTimeSeriesPointSchema),
    views: z.array(OrgTimeSeriesPointSchema),
  }),

  // ============ BOOKING ANALYTICS ============
  bookingAnalytics: z.object({
    // Status distribution
    statusDistribution: z.array(OrgStatusDistributionSchema),
    paymentStatusDistribution: z.array(OrgStatusDistributionSchema),
    // By day of week
    bookingsByDayOfWeek: z.array(OrgNamedCountSchema),
    // Performance metrics
    avgRentalDays: z.number(),
    instantBookingRate: z.number(),
    completionRate: z.number(),
    cancellationRate: z.number(),
    avgLeadTimeDays: z.number(), // How far in advance people book
  }),

  // ============ LISTING PERFORMANCE ============
  listingPerformance: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      pricePerDay: z.number(),
      viewCount: z.number(),
      bookingsCount: z.number(),
      revenue: z.number(),
      avgRating: z.number().nullable(),
      reviewCount: z.number(),
      status: z.string(),
      verificationStatus: z.string(),
      conversionRate: z.number(), // bookings / views
    })
  ),

  // ============ TOP PERFORMERS ============
  topPerformers: z.object({
    // Top listings by bookings
    listingsByBookings: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        bookingsCount: z.number(),
        revenue: z.number(),
      })
    ),
    // Top listings by revenue
    listingsByRevenue: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        revenue: z.number(),
        bookingsCount: z.number(),
      })
    ),
    // Top customers
    topCustomers: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        bookingsCount: z.number(),
        totalSpent: z.number(),
        lastBookingAt: z.date().nullable(),
      })
    ),
  }),

  // ============ REVIEWS ANALYTICS ============
  reviewsAnalytics: z.object({
    totalReviews: z.number(),
    avgRating: z.number(),
    // Rating distribution
    ratingDistribution: z.array(
      z.object({
        rating: z.number(),
        count: z.number(),
        percentage: z.number(),
      })
    ),
    // Recent reviews
    recentReviews: z.array(
      z.object({
        id: z.string(),
        rating: z.number(),
        comment: z.string().nullable(),
        createdAt: z.date(),
        userName: z.string(),
        listingTitle: z.string(),
      })
    ),
    // Tag stats
    tagStats: z.object({
      wasClean: z.number(),
      wasAsDescribed: z.number(),
      wasReliable: z.number(),
      wasEasyToDrive: z.number(),
      wasComfortable: z.number(),
      wasFuelEfficient: z.number(),
      hadGoodAC: z.number(),
      wasSpacious: z.number(),
      wasPickupSmooth: z.number(),
      wasDropoffSmooth: z.number(),
      wasHostResponsive: z.number(),
      wasGoodValue: z.number(),
      wouldRentAgain: z.number(),
      wouldRecommend: z.number(),
    }),
  }),

  // ============ VEHICLE ANALYTICS ============
  vehicleAnalytics: z.object({
    // Body type distribution
    bodyTypeDistribution: z.array(OrgStatusDistributionSchema),
    // Class distribution
    classDistribution: z.array(OrgStatusDistributionSchema),
    // Fuel type distribution
    fuelTypeDistribution: z.array(OrgStatusDistributionSchema),
    // Price range
    avgPricePerDay: z.number(),
    minPricePerDay: z.number(),
    maxPricePerDay: z.number(),
  }),

  // ============ RECENT ACTIVITY ============
  recentActivity: z.object({
    // Recent bookings
    recentBookings: z.array(
      z.object({
        id: z.string(),
        referenceCode: z.string(),
        status: z.string(),
        paymentStatus: z.string(),
        totalPrice: z.number(),
        currency: z.string(),
        userName: z.string(),
        listingTitle: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        createdAt: z.date(),
      })
    ),
  }),
});

export type GetOrganizationAnalyticsOutputType = z.infer<typeof GetOrganizationAnalyticsOutputSchema>;
