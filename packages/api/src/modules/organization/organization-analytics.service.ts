import prisma from '@yayago-app/db';
import type { GetOrganizationAnalyticsInputType, GetOrganizationAnalyticsOutputType } from '@yayago-app/validators';
import { startOfDay, endOfDay, subDays, format, startOfWeek, startOfMonth, differenceInDays, getDay } from 'date-fns';

// Helper to group dates
function groupDate(date: Date, granularity: 'day' | 'week' | 'month'): string {
  switch (granularity) {
    case 'day':
      return format(date, 'yyyy-MM-dd');
    case 'week':
      return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    case 'month':
      return format(startOfMonth(date), 'yyyy-MM');
    default:
      return format(date, 'yyyy-MM-dd');
  }
}

// Helper to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Helper to calculate distribution with percentages
function calculateDistribution(
  items: { status: string; count: number }[],
  total: number
): { status: string; count: number; percentage: number }[] {
  return items.map((item) => ({
    status: item.status,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}

// Day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class OrganizationAnalyticsService {
  static async getAnalytics(
    input: GetOrganizationAnalyticsInputType,
    organizationId: string
  ): Promise<GetOrganizationAnalyticsOutputType> {
    const now = new Date();
    const granularity = input.granularity || 'day';

    // Determine date range
    const endDate = input.endDate ? endOfDay(input.endDate) : endOfDay(now);
    const startDate = input.startDate ? startOfDay(input.startDate) : startOfDay(subDays(now, 30));

    // Calculate previous period for growth comparison
    const periodDays = differenceInDays(endDate, startDate);
    const prevEndDate = startOfDay(startDate);
    const prevStartDate = subDays(prevEndDate, periodDays);

    // Get organization's listing IDs for filtering
    const orgListings = await prisma.listing.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    const listingIds = orgListings.map((l) => l.id);

    // ============ FETCH ALL DATA IN PARALLEL ============
    const [
      // Current period revenue
      revenueInPeriod,
      // Previous period revenue
      revenuePrevPeriod,
      // All time stats
      allTimeRevenue,
      pendingRevenue,
      // Booking counts
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledByUserBookings,
      cancelledByHostBookings,
      // Listing stats
      listingStats,
      // Customer stats
      customerStats,
      repeatCustomerStats,
      // Views
      totalViews,
      // Reviews
      reviewStats,
      ratingDistribution,
      recentReviews,
      tagStats,
      // Bookings in period
      bookingsInPeriod,
      bookingsPrevPeriod,
      customersInPeriod,
      customersPrevPeriod,
      // Time series data
      bookingsTimeSeries,
      // Booking status distribution
      bookingStatusDist,
      paymentStatusDist,
      // Booking analytics
      bookingDurations,
      instantBookingListings,
      // Listing performance
      listingsWithStats,
      // Top customers
      topCustomers,
      // Recent bookings
      recentBookings,
      // Vehicle distributions
      vehicleStats,
      // Pricing stats
      pricingStats,
    ] = await Promise.all([
      // Current period revenue (completed bookings)
      prisma.booking.aggregate({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'PAID',
        },
        _sum: { totalPrice: true },
        _count: true,
      }),

      // Previous period revenue
      prisma.booking.aggregate({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          paymentStatus: 'PAID',
        },
        _sum: { totalPrice: true },
      }),

      // All time revenue
      prisma.booking.aggregate({
        where: {
          listingId: { in: listingIds },
          paymentStatus: 'PAID',
        },
        _sum: { totalPrice: true },
        _count: true,
        _avg: { totalPrice: true },
      }),

      // Pending revenue (active bookings)
      prisma.booking.aggregate({
        where: {
          listingId: { in: listingIds },
          status: { in: ['APPROVED', 'ACTIVE'] },
          paymentStatus: { in: ['NOT_PAID', 'AUTHORIZED'] },
        },
        _sum: { totalPrice: true },
      }),

      // Total bookings count
      prisma.booking.count({
        where: { listingId: { in: listingIds } },
      }),

      // Active bookings count
      prisma.booking.count({
        where: { listingId: { in: listingIds }, status: 'ACTIVE' },
      }),

      // Completed bookings count
      prisma.booking.count({
        where: { listingId: { in: listingIds }, status: 'COMPLETED' },
      }),

      // Cancelled by user count
      prisma.booking.count({
        where: { listingId: { in: listingIds }, status: 'CANCELLED_BY_USER' },
      }),

      // Cancelled by host count
      prisma.booking.count({
        where: { listingId: { in: listingIds }, status: 'CANCELLED_BY_HOST' },
      }),

      // Listing stats
      prisma.listing.aggregate({
        where: { organizationId, deletedAt: null },
        _count: true,
      }),

      // Customer stats
      prisma.booking.findMany({
        where: { listingId: { in: listingIds } },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Repeat customers
      prisma.booking.groupBy({
        by: ['userId'],
        where: { listingId: { in: listingIds } },
        _count: true,
        having: { userId: { _count: { gt: 1 } } },
      }),

      // Total views across all listings
      prisma.listing.aggregate({
        where: { organizationId, deletedAt: null },
        _sum: { viewCount: true },
      }),

      // Review stats
      prisma.review.aggregate({
        where: { listingId: { in: listingIds }, deletedAt: null },
        _count: true,
        _avg: { rating: true },
      }),

      // Rating distribution
      prisma.review.groupBy({
        by: ['rating'],
        where: { listingId: { in: listingIds }, deletedAt: null },
        _count: true,
        orderBy: { rating: 'desc' },
      }),

      // Recent reviews
      prisma.review.findMany({
        where: { listingId: { in: listingIds }, deletedAt: null },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
          listing: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Tag stats
      prisma.review.aggregate({
        where: { listingId: { in: listingIds }, deletedAt: null },
        _count: {
          wasClean: true,
          wasAsDescribed: true,
          wasReliable: true,
          wasEasyToDrive: true,
          wasComfortable: true,
          wasFuelEfficient: true,
          hadGoodAC: true,
          wasSpacious: true,
          wasPickupSmooth: true,
          wasDropoffSmooth: true,
          wasHostResponsive: true,
          wasGoodValue: true,
          wouldRentAgain: true,
          wouldRecommend: true,
        },
      }),

      // Bookings in period
      prisma.booking.count({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Bookings previous period
      prisma.booking.count({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
      }),

      // Customers in period
      prisma.booking.findMany({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Customers previous period
      prisma.booking.findMany({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
        select: { userId: true },
        distinct: ['userId'],
      }),

      // Bookings time series
      prisma.booking.findMany({
        where: {
          listingId: { in: listingIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { createdAt: true, totalPrice: true, paymentStatus: true },
      }),

      // Booking status distribution
      prisma.booking.groupBy({
        by: ['status'],
        where: { listingId: { in: listingIds } },
        _count: { _all: true },
      }),

      // Payment status distribution
      prisma.booking.groupBy({
        by: ['paymentStatus'],
        where: { listingId: { in: listingIds } },
        _count: { _all: true },
      }),

      // Booking durations
      prisma.booking.findMany({
        where: { listingId: { in: listingIds }, status: 'COMPLETED' },
        select: { startDate: true, endDate: true },
      }),

      // Count listings with instant booking enabled
      prisma.listingBookingDetails.count({
        where: {
          listing: { organizationId, deletedAt: null },
          hasInstantBooking: true,
        },
      }),

      // Listings with stats
      prisma.listing.findMany({
        where: { organizationId, deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          averageRating: true,
          reviewCount: true,
          status: true,
          verificationStatus: true,
          _count: { select: { bookings: true } },
          bookings: {
            where: { paymentStatus: 'PAID' },
            select: { totalPrice: true },
          },
          pricing: {
            select: { pricePerDay: true },
          },
        },
        orderBy: { viewCount: 'desc' },
      }),

      // Top customers
      prisma.booking.groupBy({
        by: ['userId'],
        where: { listingId: { in: listingIds }, paymentStatus: 'PAID' },
        _count: { _all: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: { listingId: { in: listingIds } },
        select: {
          id: true,
          referenceCode: true,
          status: true,
          paymentStatus: true,
          totalPrice: true,
          currency: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          user: { select: { name: true } },
          listing: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Vehicle stats (via ListingVehicle)
      prisma.listingVehicle.findMany({
        where: {
          listing: { organizationId, deletedAt: null },
        },
        select: {
          bodyType: true,
          class: true,
          fuelType: true,
        },
      }),

      // Pricing stats
      prisma.listingPricing.aggregate({
        where: {
          listing: { organizationId, deletedAt: null },
        },
        _avg: { pricePerDay: true },
        _min: { pricePerDay: true },
        _max: { pricePerDay: true },
      }),
    ]);

    // ============ PROCESS DATA ============

    // Calculate total cancelled bookings
    const cancelledBookings = cancelledByUserBookings + cancelledByHostBookings;

    // Calculate average rental days
    let totalDays = 0;
    for (const booking of bookingDurations) {
      const days = differenceInDays(booking.endDate, booking.startDate);
      totalDays += days;
    }
    const avgRentalDays = bookingDurations.length > 0 ? Math.round(totalDays / bookingDurations.length) : 0;

    // Calculate bookings by day of week
    const dayOfWeekCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const booking of bookingsTimeSeries) {
      const day = getDay(booking.createdAt);
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    }

    // Group time series by granularity
    const revenueByDate: Record<string, { revenue: number; bookings: number }> = {};
    const bookingsByDate: Record<string, number> = {};

    for (const booking of bookingsTimeSeries) {
      const dateKey = groupDate(booking.createdAt, granularity);
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { revenue: 0, bookings: 0 };
      }
      if (booking.paymentStatus === 'PAID') {
        revenueByDate[dateKey].revenue += booking.totalPrice;
      }
      revenueByDate[dateKey].bookings += 1;
      bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
    }

    // Convert to arrays
    const revenueTimeSeries = Object.entries(revenueByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
        avgBookingValue: data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
      }));

    const bookingsTimeSeriesData = Object.entries(bookingsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Listing performance
    const listingPerformance = listingsWithStats.map((listing) => {
      const revenue = listing.bookings.reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0);
      const conversionRate =
        listing.viewCount > 0 ? Math.round((listing._count.bookings / listing.viewCount) * 100) : 0;

      return {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        pricePerDay: listing.pricing?.pricePerDay || 0,
        viewCount: listing.viewCount,
        bookingsCount: listing._count.bookings,
        revenue,
        avgRating: listing.averageRating,
        reviewCount: listing.reviewCount,
        status: listing.status,
        verificationStatus: listing.verificationStatus,
        conversionRate,
      };
    });

    // Top listings by bookings
    const listingsByBookings = [...listingPerformance]
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        bookingsCount: l.bookingsCount,
        revenue: l.revenue,
      }));

    // Top listings by revenue
    const listingsByRevenue = [...listingPerformance]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        revenue: l.revenue,
        bookingsCount: l.bookingsCount,
      }));

    // Get customer details for top customers
    const topCustomerIds = topCustomers.map((c) => c.userId);
    const customerDetails = await prisma.user.findMany({
      where: { id: { in: topCustomerIds } },
      select: { id: true, name: true, email: true },
    });
    const customerMap = new Map(customerDetails.map((c) => [c.id, c]));

    // Get last booking for each top customer
    const lastBookings = await prisma.booking.findMany({
      where: { userId: { in: topCustomerIds }, listingId: { in: listingIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
      select: { userId: true, createdAt: true },
    });
    const lastBookingMap = new Map(lastBookings.map((b) => [b.userId, b.createdAt]));

    const topCustomersData = topCustomers.map((c) => {
      const details = customerMap.get(c.userId);
      return {
        id: c.userId,
        name: details?.name || 'Unknown',
        email: details?.email || '',
        bookingsCount: c._count._all,
        totalSpent: c._sum.totalPrice || 0,
        lastBookingAt: lastBookingMap.get(c.userId) || null,
      };
    });

    // Active listings count
    const activeListingsCount = listingsWithStats.filter((l) => l.status === 'AVAILABLE').length;
    const featuredListingsCount = 0; // Can add featured flag if needed

    // Calculate tag stats as percentages (how many reviews have each tag true)
    const totalReviewCount = reviewStats._count || 0;
    const getTagPercentage = (count: number) =>
      totalReviewCount > 0 ? Math.round((count / totalReviewCount) * 100) : 0;

    // Process vehicle stats into distributions
    const bodyTypeCounts: Record<string, number> = {};
    const classCounts: Record<string, number> = {};
    const fuelTypeCounts: Record<string, number> = {};

    for (const vehicle of vehicleStats) {
      bodyTypeCounts[vehicle.bodyType] = (bodyTypeCounts[vehicle.bodyType] || 0) + 1;
      classCounts[vehicle.class] = (classCounts[vehicle.class] || 0) + 1;
      fuelTypeCounts[vehicle.fuelType] = (fuelTypeCounts[vehicle.fuelType] || 0) + 1;
    }

    const bodyTypeDistribution = Object.entries(bodyTypeCounts).map(([status, count]) => ({ status, count }));
    const classDistribution = Object.entries(classCounts).map(([status, count]) => ({ status, count }));
    const fuelTypeDistribution = Object.entries(fuelTypeCounts).map(([status, count]) => ({ status, count }));

    // Process booking status distribution
    const bookingStatusDistribution = bookingStatusDist.map((d) => ({
      status: d.status,
      count: d._count._all,
    }));

    const paymentStatusDistribution = paymentStatusDist.map((d) => ({
      status: d.paymentStatus,
      count: d._count._all,
    }));

    // Calculate instant booking rate (bookings from instant booking listings / total)
    const instantBookingRate =
      listingStats._count > 0 ? Math.round((instantBookingListings / listingStats._count) * 100) : 0;

    return {
      dateRange: {
        startDate,
        endDate,
        granularity,
      },

      summary: {
        totalRevenue: allTimeRevenue._sum.totalPrice || 0,
        pendingRevenue: pendingRevenue._sum?.totalPrice || 0,
        avgBookingValue: Math.round(allTimeRevenue._avg.totalPrice || 0),
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        totalListings: listingStats._count,
        activeListings: activeListingsCount,
        featuredListings: featuredListingsCount,
        totalViews: totalViews._sum.viewCount || 0,
        totalReviews: reviewStats._count || 0,
        avgRating: Math.round((reviewStats._avg.rating || 0) * 10) / 10,
        uniqueCustomers: customerStats.length,
        repeatCustomers: repeatCustomerStats.length,
      },

      growth: {
        revenueGrowth: calculateGrowth(revenueInPeriod._sum.totalPrice || 0, revenuePrevPeriod._sum.totalPrice || 0),
        bookingsGrowth: calculateGrowth(bookingsInPeriod, bookingsPrevPeriod),
        viewsGrowth: 0, // Views don't have timestamps, so we can't calculate growth
        customersGrowth: calculateGrowth(customersInPeriod.length, customersPrevPeriod.length),
      },

      timeSeries: {
        revenue: revenueTimeSeries,
        bookings: bookingsTimeSeriesData,
        views: [], // Views don't have timestamps
      },

      bookingAnalytics: {
        statusDistribution: calculateDistribution(bookingStatusDistribution, totalBookings),
        paymentStatusDistribution: calculateDistribution(paymentStatusDistribution, totalBookings),
        bookingsByDayOfWeek: dayNames.map((name, i) => ({
          name,
          count: dayOfWeekCounts[i] || 0,
          percentage: bookingsInPeriod > 0 ? Math.round(((dayOfWeekCounts[i] || 0) / bookingsInPeriod) * 100) : 0,
        })),
        avgRentalDays,
        instantBookingRate,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
        avgLeadTimeDays: 0, // Would need booking request date to calculate
      },

      listingPerformance,

      topPerformers: {
        listingsByBookings,
        listingsByRevenue,
        topCustomers: topCustomersData,
      },

      reviewsAnalytics: {
        totalReviews: reviewStats._count || 0,
        avgRating: Math.round((reviewStats._avg.rating || 0) * 10) / 10,
        ratingDistribution: [5, 4, 3, 2, 1].map((rating) => {
          const found = ratingDistribution.find((r) => r.rating === rating);
          const count = found?._count || 0;
          return {
            rating,
            count,
            percentage: totalReviewCount > 0 ? Math.round((count / totalReviewCount) * 100) : 0,
          };
        }),
        recentReviews: recentReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          userName: r.user.name || 'Anonymous',
          listingTitle: r.listing.title,
        })),
        tagStats: {
          wasClean: getTagPercentage(tagStats._count.wasClean || 0),
          wasAsDescribed: getTagPercentage(tagStats._count.wasAsDescribed || 0),
          wasReliable: getTagPercentage(tagStats._count.wasReliable || 0),
          wasEasyToDrive: getTagPercentage(tagStats._count.wasEasyToDrive || 0),
          wasComfortable: getTagPercentage(tagStats._count.wasComfortable || 0),
          wasFuelEfficient: getTagPercentage(tagStats._count.wasFuelEfficient || 0),
          hadGoodAC: getTagPercentage(tagStats._count.hadGoodAC || 0),
          wasSpacious: getTagPercentage(tagStats._count.wasSpacious || 0),
          wasPickupSmooth: getTagPercentage(tagStats._count.wasPickupSmooth || 0),
          wasDropoffSmooth: getTagPercentage(tagStats._count.wasDropoffSmooth || 0),
          wasHostResponsive: getTagPercentage(tagStats._count.wasHostResponsive || 0),
          wasGoodValue: getTagPercentage(tagStats._count.wasGoodValue || 0),
          wouldRentAgain: getTagPercentage(tagStats._count.wouldRentAgain || 0),
          wouldRecommend: getTagPercentage(tagStats._count.wouldRecommend || 0),
        },
      },

      vehicleAnalytics: {
        bodyTypeDistribution: calculateDistribution(bodyTypeDistribution, vehicleStats.length),
        classDistribution: calculateDistribution(classDistribution, vehicleStats.length),
        fuelTypeDistribution: calculateDistribution(fuelTypeDistribution, vehicleStats.length),
        avgPricePerDay: Math.round(pricingStats._avg?.pricePerDay || 0),
        minPricePerDay: pricingStats._min?.pricePerDay || 0,
        maxPricePerDay: pricingStats._max?.pricePerDay || 0,
      },

      recentActivity: {
        recentBookings: recentBookings.map((b) => ({
          id: b.id,
          referenceCode: b.referenceCode,
          status: b.status,
          paymentStatus: b.paymentStatus,
          totalPrice: b.totalPrice,
          currency: b.currency,
          userName: b.user.name || 'Unknown',
          listingTitle: b.listing.title,
          startDate: b.startDate,
          endDate: b.endDate,
          createdAt: b.createdAt,
        })),
      },
    };
  }
}
