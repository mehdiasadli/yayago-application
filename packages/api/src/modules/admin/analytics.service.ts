import prisma from '@yayago-app/db';
import type { GetAnalyticsInputType, GetAnalyticsOutputType } from '@yayago-app/validators';
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
  items: { status: string; _count: number }[],
  total: number
): { status: string; count: number; percentage: number }[] {
  return items.map((item) => ({
    status: item.status,
    count: item._count,
    percentage: total > 0 ? Math.round((item._count / total) * 100) : 0,
  }));
}

// Day names
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class AnalyticsService {
  static async getAnalytics(input: GetAnalyticsInputType): Promise<GetAnalyticsOutputType> {
    const now = new Date();
    const granularity = input.granularity || 'day';

    // Determine date range
    const endDate = input.endDate ? endOfDay(input.endDate) : endOfDay(now);
    const startDate = input.startDate ? startOfDay(input.startDate) : startOfDay(subDays(now, 30));

    // Calculate previous period for growth comparison
    const periodDays = differenceInDays(endDate, startDate);
    const prevEndDate = startOfDay(startDate);
    const prevStartDate = subDays(prevEndDate, periodDays);

    // ============ FETCH ALL DATA IN PARALLEL ============
    const [
      // Current period counts
      usersInPeriod,
      orgsInPeriod,
      listingsInPeriod,
      bookingsInPeriod,
      revenueInPeriod,

      // Previous period counts (for growth)
      usersPrevPeriod,
      orgsPrevPeriod,
      listingsPrevPeriod,
      bookingsPrevPeriod,
      revenuePrevPeriod,

      // Total counts (all time)
      totalUsers,
      totalOrgs,
      totalListings,
      totalBookings,
      activeListings,
      activeBookings,
      totalCountries,
      totalCities,
      totalBrands,
      totalModels,

      // Time series data
      usersTimeSeries,
      orgsTimeSeries,
      listingsTimeSeries,
      bookingsTimeSeries,

      // Distributions
      orgStatusDist,
      listingVerificationDist,
      listingStatusDist,
      bookingStatusDist,
      paymentStatusDist,
      userRolesDist,

      // Top performers - organizations
      allOrgsWithBookings,

      // Top performers - listings
      allListingsWithBookings,

      // Top performers - users
      allUsersWithBookings,

      // Subscriptions
      subscriptionStats,
      subscriptionPlanDist,

      // Vehicle analytics
      topBrands,
      topModels,
      bodyTypeDist,
      fuelTypeDist,
      transmissionDist,
      classDist,
      vehicleYears,
      vehiclePrices,

      // Geographic
      orgsByCountry,
      orgsByCity,

      // Pricing
      pricingStats,
      avgPriceByClass,
      avgPriceByBodyType,

      // User analytics
      verifiedUsers,
      usersWithBookingsCount,
      usersWithMultipleBookingsCount,

      // Recent activity
      recentOrganizations,
      recentListings,
      recentBookings,
      recentUsers,

      // Booking analytics
      bookingDurations,
      instantBookings,
      cancelledBookings,
      completedBookings,
    ] = await Promise.all([
      // ============ CURRENT PERIOD COUNTS ============
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate }, role: 'user' },
      }),
      prisma.organization.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: startDate, lte: endDate }, deletedAt: null },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
        _count: true,
      }),

      // ============ PREVIOUS PERIOD COUNTS ============
      prisma.user.count({
        where: { createdAt: { gte: prevStartDate, lte: prevEndDate }, role: 'user' },
      }),
      prisma.organization.count({
        where: { createdAt: { gte: prevStartDate, lte: prevEndDate } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: prevStartDate, lte: prevEndDate }, deletedAt: null },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: prevStartDate, lte: prevEndDate } },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: prevStartDate, lte: prevEndDate }, paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),

      // ============ TOTAL COUNTS ============
      prisma.user.count({ where: { role: 'user' } }),
      prisma.organization.count(),
      prisma.listing.count({ where: { deletedAt: null } }),
      prisma.booking.count(),
      prisma.listing.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.country.count({ where: { deletedAt: null } }),
      prisma.city.count({ where: { deletedAt: null } }),
      prisma.vehicleBrand.count({ where: { deletedAt: null } }),
      prisma.vehicleModel.count({ where: { deletedAt: null } }),

      // ============ TIME SERIES DATA ============
      prisma.user.findMany({
        where: { createdAt: { gte: startDate, lte: endDate }, role: 'user' },
        select: { createdAt: true },
      }),
      prisma.organization.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true },
      }),
      prisma.listing.findMany({
        where: { createdAt: { gte: startDate, lte: endDate }, deletedAt: null },
        select: { createdAt: true },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, totalPrice: true, paymentStatus: true, startDate: true, endDate: true },
      }),

      // ============ DISTRIBUTIONS ============
      prisma.organization.groupBy({ by: ['status'], _count: true }),
      prisma.listing.groupBy({ by: ['verificationStatus'], where: { deletedAt: null }, _count: true }),
      prisma.listing.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      prisma.booking.groupBy({ by: ['status'], _count: true }),
      prisma.booking.groupBy({ by: ['paymentStatus'], _count: true }),
      prisma.user.groupBy({ by: ['role'], _count: true }),

      // ============ TOP PERFORMERS - ORGANIZATIONS ============
      prisma.organization.findMany({
        include: {
          listings: {
            include: {
              bookings: {
                where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
                select: { totalPrice: true },
              },
            },
          },
        },
      }),

      // ============ TOP PERFORMERS - LISTINGS ============
      prisma.listing.findMany({
        where: { deletedAt: null },
        include: {
          organization: { select: { name: true } },
          bookings: {
            where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
            select: { totalPrice: true },
          },
        },
      }),

      // ============ TOP PERFORMERS - USERS ============
      prisma.user.findMany({
        where: { role: 'user' },
        include: {
          bookings: {
            where: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
            select: { totalPrice: true },
          },
        },
      }),

      // ============ SUBSCRIPTIONS ============
      prisma.subscription.groupBy({ by: ['status'], _count: true }),
      prisma.subscription.groupBy({
        by: ['plan'],
        where: { status: { in: ['active', 'trialing'] } },
        _count: true,
      }),

      // ============ VEHICLE ANALYTICS ============
      prisma.vehicleBrand.findMany({
        take: 15,
        include: {
          models: { include: { _count: { select: { listings: true } } } },
        },
      }),
      prisma.vehicleModel.findMany({
        take: 15,
        include: {
          brand: { select: { name: true } },
          _count: { select: { listings: true } },
        },
      }),
      prisma.listingVehicle.groupBy({ by: ['bodyType'], _count: true }),
      prisma.listingVehicle.groupBy({ by: ['fuelType'], _count: true }),
      prisma.listingVehicle.groupBy({ by: ['transmissionType'], _count: true }),
      prisma.listingVehicle.groupBy({ by: ['class'], _count: true }),
      prisma.listingVehicle.groupBy({ by: ['year'], _count: true, orderBy: { year: 'desc' }, take: 15 }),
      prisma.listingPricing.findMany({ select: { pricePerDay: true } }),

      // ============ GEOGRAPHIC ============
      prisma.country.findMany({
        where: { deletedAt: null },
        include: {
          cities: {
            where: { deletedAt: null },
            include: { organizations: { select: { id: true } } },
          },
        },
      }),
      prisma.city.findMany({
        where: { deletedAt: null },
        include: {
          country: { select: { name: true } },
          organizations: { select: { id: true, listings: { select: { id: true } } } },
        },
        take: 15,
      }),

      // ============ PRICING ============
      prisma.listingPricing.aggregate({
        _avg: { pricePerDay: true },
        _min: { pricePerDay: true },
        _max: { pricePerDay: true },
      }),
      prisma.listingVehicle.findMany({
        include: {
          listing: { include: { pricing: { select: { pricePerDay: true } } } },
        },
      }),
      prisma.listingVehicle.findMany({
        include: {
          listing: { include: { pricing: { select: { pricePerDay: true } } } },
        },
      }),

      // ============ USER ANALYTICS ============
      prisma.user.count({ where: { role: 'user', emailVerified: true } }),
      prisma.user.count({
        where: { role: 'user', bookings: { some: {} } },
      }),
      prisma.user.count({
        where: { role: 'user', bookings: { some: { id: { not: undefined } } } },
      }),

      // ============ RECENT ACTIVITY ============
      prisma.organization.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, status: true, createdAt: true },
      }),
      prisma.listing.findMany({
        where: { deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          verificationStatus: true,
          createdAt: true,
          organization: { select: { name: true } },
        },
      }),
      prisma.booking.findMany({
        take: 10,
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
      prisma.user.findMany({
        where: { role: 'user' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true },
      }),

      // ============ BOOKING ANALYTICS ============
      prisma.booking.findMany({
        select: { startDate: true, endDate: true, createdAt: true },
      }),
      prisma.booking.count({
        where: { listing: { bookingDetails: { hasInstantBooking: true } } },
      }),
      prisma.booking.count({
        where: { status: { in: ['CANCELLED_BY_USER', 'CANCELLED_BY_HOST'] } },
      }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
    ]);

    // ============ PROCESS TIME SERIES DATA ============
    const processTimeSeries = (items: { createdAt: Date }[]) => {
      const grouped = new Map<string, number>();
      for (const item of items) {
        const key = groupDate(item.createdAt, granularity);
        grouped.set(key, (grouped.get(key) || 0) + 1);
      }
      return Array.from(grouped.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    const processRevenueTimeSeries = (items: { createdAt: Date; totalPrice: number; paymentStatus: string }[]) => {
      const grouped = new Map<string, { revenue: number; bookings: number }>();
      for (const item of items) {
        const key = groupDate(item.createdAt, granularity);
        const existing = grouped.get(key) || { revenue: 0, bookings: 0 };
        existing.bookings += 1;
        if (item.paymentStatus === 'PAID') {
          existing.revenue += item.totalPrice;
        }
        grouped.set(key, existing);
      }
      return Array.from(grouped.entries())
        .map(([date, data]) => ({
          date,
          ...data,
          avgBookingValue: data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    // ============ PROCESS TOP PERFORMERS ============
    const processedOrgsByBookings = allOrgsWithBookings
      .map((org) => {
        const bookingsCount = org.listings.reduce((acc, l) => acc + l.bookings.length, 0);
        const revenue = org.listings.reduce((acc, l) => acc + l.bookings.reduce((sum, b) => sum + b.totalPrice, 0), 0);
        return { id: org.id, name: org.name, slug: org.slug, bookingsCount, revenue };
      })
      .filter((org) => org.bookingsCount > 0)
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 10);

    const processedOrgsByRevenue = [...processedOrgsByBookings].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const processedListingsByBookings = allListingsWithBookings
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        organizationName: listing.organization.name,
        bookingsCount: listing.bookings.length,
        revenue: listing.bookings.reduce((sum, b) => sum + b.totalPrice, 0),
      }))
      .filter((l) => l.bookingsCount > 0)
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 10);

    const processedListingsByRevenue = [...processedListingsByBookings]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const processedUsersByBookings = allUsersWithBookings
      .map((user) => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        bookingsCount: user.bookings.length,
        totalSpent: user.bookings.reduce((sum, b) => sum + b.totalPrice, 0),
      }))
      .filter((u) => u.bookingsCount > 0)
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 10);

    // ============ PROCESS VEHICLE ANALYTICS ============
    const processedTopBrands = topBrands
      .map((brand) => ({
        id: brand.id,
        name: ((brand.name as any)?.en || brand.slug) as string,
        listingsCount: brand.models.reduce((acc: number, m: any) => acc + (m._count?.listings || 0), 0),
      }))
      .filter((b) => b.listingsCount > 0)
      .sort((a, b) => b.listingsCount - a.listingsCount)
      .slice(0, 10);

    const processedTopModels = topModels
      .map((model) => ({
        id: model.id,
        name: ((model.name as any)?.en || 'Unknown') as string,
        brandName: ((model.brand.name as any)?.en || 'Unknown') as string,
        listingsCount: model._count?.listings || 0,
      }))
      .filter((m) => m.listingsCount > 0)
      .sort((a, b) => b.listingsCount - a.listingsCount)
      .slice(0, 10);

    // Price ranges
    const prices = vehiclePrices.map((p) => p.pricePerDay).filter((p) => p > 0);
    const priceRanges = [
      { range: '0-100', min: 0, max: 100, count: prices.filter((p) => p <= 100).length },
      { range: '101-200', min: 101, max: 200, count: prices.filter((p) => p > 100 && p <= 200).length },
      { range: '201-300', min: 201, max: 300, count: prices.filter((p) => p > 200 && p <= 300).length },
      { range: '301-500', min: 301, max: 500, count: prices.filter((p) => p > 300 && p <= 500).length },
      { range: '501-1000', min: 501, max: 1000, count: prices.filter((p) => p > 500 && p <= 1000).length },
      { range: '1000+', min: 1001, max: 99999, count: prices.filter((p) => p > 1000).length },
    ];

    // Year distribution
    const yearDistribution = vehicleYears
      .map((y) => ({ year: y.year, count: y._count }))
      .sort((a, b) => b.year - a.year);

    // ============ PROCESS SUBSCRIPTION STATS ============
    const activeSubCount = subscriptionStats.find((s) => s.status === 'active')?._count || 0;
    const trialingSubCount = subscriptionStats.find((s) => s.status === 'trialing')?._count || 0;
    const cancelledSubCount = subscriptionStats.find((s) => s.status === 'canceled')?._count || 0;
    const totalSubsAllTime = subscriptionStats.reduce((acc, s) => acc + s._count, 0);
    const churnRate = totalSubsAllTime > 0 ? Math.round((cancelledSubCount / totalSubsAllTime) * 100) : 0;

    // Get plan names and prices
    const planSlugs = subscriptionPlanDist.map((p) => p.plan);
    const plans = await prisma.subscriptionPlan.findMany({
      where: { slug: { in: planSlugs } },
      select: { slug: true, name: true, prices: { where: { interval: 'month', isActive: true }, take: 1 } },
    });
    const planMap = new Map(
      plans.map((p) => [p.slug, { name: (p.name as any)?.en || p.slug, price: p.prices[0]?.amount || 0 }])
    );

    const totalSubsForDist = subscriptionPlanDist.reduce((acc, p) => acc + p._count, 0);
    const processedPlanDist = subscriptionPlanDist.map((p) => {
      const planInfo = planMap.get(p.plan);
      return {
        planSlug: p.plan,
        planName: planInfo?.name || p.plan,
        count: p._count,
        percentage: totalSubsForDist > 0 ? Math.round((p._count / totalSubsForDist) * 100) : 0,
        revenue: ((planInfo?.price || 0) * p._count) / 100,
      };
    });

    // MRR
    const mrr = processedPlanDist.reduce((acc, p) => acc + p.revenue, 0);

    // ============ GEOGRAPHIC PROCESSING ============
    const countriesByOrgs = orgsByCountry
      .map((country) => {
        const orgsCount = country.cities.reduce((acc, c) => acc + c.organizations.length, 0);
        return {
          code: country.code,
          name: ((country.name as any)?.en || country.code) as string,
          organizationsCount: orgsCount,
          listingsCount: 0, // Would need to aggregate
        };
      })
      .filter((c) => c.organizationsCount > 0)
      .sort((a, b) => b.organizationsCount - a.organizationsCount)
      .slice(0, 10);

    const citiesByOrgs = orgsByCity
      .map((city) => ({
        id: city.id,
        name: ((city.name as any)?.en || city.code) as string,
        countryName: ((city.country.name as any)?.en || '') as string,
        organizationsCount: city.organizations.length,
        listingsCount: city.organizations.reduce((acc, o) => acc + o.listings.length, 0),
      }))
      .filter((c) => c.organizationsCount > 0)
      .sort((a, b) => b.organizationsCount - a.organizationsCount)
      .slice(0, 10);

    // Cities by listings (from allListingsWithBookings)
    const citiesByListings = citiesByOrgs.sort((a, b) => b.listingsCount - a.listingsCount).slice(0, 10);

    // ============ PRICING PROCESSING ============
    const avgPriceByClassData = new Map<string, { total: number; count: number }>();
    for (const v of avgPriceByClass) {
      const price = v.listing?.pricing?.pricePerDay || 0;
      if (price > 0) {
        const existing = avgPriceByClassData.get(v.class) || { total: 0, count: 0 };
        existing.total += price;
        existing.count += 1;
        avgPriceByClassData.set(v.class, existing);
      }
    }
    const processedAvgPriceByClass = Array.from(avgPriceByClassData.entries()).map(([cls, data]) => ({
      class: cls,
      avgPrice: Math.round(data.total / data.count),
      count: data.count,
    }));

    const avgPriceByBodyData = new Map<string, { total: number; count: number }>();
    for (const v of avgPriceByBodyType) {
      const price = v.listing?.pricing?.pricePerDay || 0;
      if (price > 0) {
        const existing = avgPriceByBodyData.get(v.bodyType) || { total: 0, count: 0 };
        existing.total += price;
        existing.count += 1;
        avgPriceByBodyData.set(v.bodyType, existing);
      }
    }
    const processedAvgPriceByBody = Array.from(avgPriceByBodyData.entries()).map(([bodyType, data]) => ({
      bodyType,
      avgPrice: Math.round(data.total / data.count),
      count: data.count,
    }));

    // Median price
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices.length > 0 ? (sortedPrices[Math.floor(sortedPrices.length / 2)] ?? 0) : 0;

    // ============ BOOKING ANALYTICS PROCESSING ============
    const bookingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    let totalRentalDays = 0;
    let totalLeadDays = 0;
    let bookingsWithDates = 0;

    for (const b of bookingDurations) {
      const dayOfWeek = getDay(b.createdAt);
      bookingsByDay[dayOfWeek] = (bookingsByDay[dayOfWeek] ?? 0) + 1;

      if (b.startDate && b.endDate) {
        const days = Math.max(1, differenceInDays(b.endDate, b.startDate));
        totalRentalDays += days;
        bookingsWithDates++;
      }

      if (b.startDate && b.createdAt) {
        const leadDays = Math.max(0, differenceInDays(b.startDate, b.createdAt));
        totalLeadDays += leadDays;
      }
    }

    const totalBookingsForRate = totalBookings || 1;
    const avgRentalDays = bookingsWithDates > 0 ? Math.round(totalRentalDays / bookingsWithDates) : 0;
    const avgLeadDays = bookingDurations.length > 0 ? Math.round(totalLeadDays / bookingDurations.length) : 0;
    const instantRate = Math.round((instantBookings / totalBookingsForRate) * 100);
    const cancelRate = Math.round((cancelledBookings / totalBookingsForRate) * 100);
    const completeRate = Math.round((completedBookings / totalBookingsForRate) * 100);

    const bookingsByDayOfWeek = dayNames.map((name, i) => ({
      name,
      count: bookingsByDay[i] ?? 0,
      percentage: totalBookings > 0 ? Math.round(((bookingsByDay[i] ?? 0) / totalBookings) * 100) : 0,
    }));

    // ============ CALCULATE DISTRIBUTIONS ============
    const totalOrgsForDist = orgStatusDist.reduce((acc, o) => acc + o._count, 0);
    const totalListingsVerification = listingVerificationDist.reduce((acc, l) => acc + l._count, 0);
    const totalListingsStatus = listingStatusDist.reduce((acc, l) => acc + l._count, 0);
    const totalBookingStatus = bookingStatusDist.reduce((acc, b) => acc + b._count, 0);
    const totalPaymentStatus = paymentStatusDist.reduce((acc, p) => acc + p._count, 0);
    const totalUserRoles = userRolesDist.reduce((acc, u) => acc + u._count, 0);
    const totalBodyType = bodyTypeDist.reduce((acc, b) => acc + b._count, 0);
    const totalFuelType = fuelTypeDist.reduce((acc, f) => acc + f._count, 0);
    const totalTransmission = transmissionDist.reduce((acc, t) => acc + t._count, 0);
    const totalClass = classDist.reduce((acc, c) => acc + c._count, 0);

    // ============ RETURN RESULT ============
    const currentRevenue = revenueInPeriod._sum.totalPrice || 0;
    const prevRevenue = revenuePrevPeriod._sum.totalPrice || 0;
    const avgBookingValue = revenueInPeriod._count > 0 ? Math.round(currentRevenue / revenueInPeriod._count) : 0;
    const commission = Math.round(currentRevenue * 0.05); // 5% commission

    // User analytics
    const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
    const avgBookingsPerUser =
      usersWithBookingsCount > 0 ? Math.round((totalBookings / usersWithBookingsCount) * 10) / 10 : 0;

    return {
      dateRange: { startDate, endDate, granularity },

      summary: {
        totalUsers,
        totalOrganizations: totalOrgs,
        totalListings,
        totalBookings,
        totalRevenue: currentRevenue,
        avgBookingValue,
        totalCommission: commission,
        activeListings,
        activeBookings,
        totalCountries,
        totalCities,
        totalBrands,
        totalModels,
      },

      growth: {
        usersGrowth: calculateGrowth(usersInPeriod, usersPrevPeriod),
        organizationsGrowth: calculateGrowth(orgsInPeriod, orgsPrevPeriod),
        listingsGrowth: calculateGrowth(listingsInPeriod, listingsPrevPeriod),
        bookingsGrowth: calculateGrowth(bookingsInPeriod, bookingsPrevPeriod),
        revenueGrowth: calculateGrowth(currentRevenue, prevRevenue),
      },

      timeSeries: {
        users: processTimeSeries(usersTimeSeries),
        organizations: processTimeSeries(orgsTimeSeries),
        listings: processTimeSeries(listingsTimeSeries),
        bookings: processTimeSeries(bookingsTimeSeries.map((b) => ({ createdAt: b.createdAt }))),
        revenue: processRevenueTimeSeries(bookingsTimeSeries),
      },

      distributions: {
        organizationStatus: calculateDistribution(
          orgStatusDist.map((o) => ({ status: o.status, _count: o._count })),
          totalOrgsForDist
        ),
        listingVerification: calculateDistribution(
          listingVerificationDist.map((l) => ({ status: l.verificationStatus, _count: l._count })),
          totalListingsVerification
        ),
        listingStatus: calculateDistribution(
          listingStatusDist.map((l) => ({ status: l.status, _count: l._count })),
          totalListingsStatus
        ),
        bookingStatus: calculateDistribution(
          bookingStatusDist.map((b) => ({ status: b.status, _count: b._count })),
          totalBookingStatus
        ),
        paymentStatus: calculateDistribution(
          paymentStatusDist.map((p) => ({ status: p.paymentStatus, _count: p._count })),
          totalPaymentStatus
        ),
        userRoles: calculateDistribution(
          userRolesDist.map((u) => ({ status: u.role, _count: u._count })),
          totalUserRoles
        ),
      },

      topPerformers: {
        organizationsByBookings: processedOrgsByBookings,
        organizationsByRevenue: processedOrgsByRevenue,
        listingsByBookings: processedListingsByBookings,
        listingsByRevenue: processedListingsByRevenue,
        usersByBookings: processedUsersByBookings,
        citiesByListings,
        citiesByBookings: [], // Would need more processing
      },

      bookingAnalytics: {
        bookingsByDayOfWeek,
        avgRentalDays,
        instantBookingRate: instantRate,
        cancellationRate: cancelRate,
        completionRate: completeRate,
        avgLeadTimeDays: avgLeadDays,
      },

      subscriptions: {
        activeCount: activeSubCount,
        trialingCount: trialingSubCount,
        cancelledCount: cancelledSubCount,
        mrr,
        churnRate,
        planDistribution: processedPlanDist,
      },

      vehicles: {
        topBrands: processedTopBrands,
        topModels: processedTopModels,
        bodyTypeDistribution: calculateDistribution(
          bodyTypeDist.map((b) => ({ status: b.bodyType, _count: b._count })),
          totalBodyType
        ),
        fuelTypeDistribution: calculateDistribution(
          fuelTypeDist.map((f) => ({ status: f.fuelType, _count: f._count })),
          totalFuelType
        ),
        transmissionDistribution: calculateDistribution(
          transmissionDist.map((t) => ({ status: t.transmissionType, _count: t._count })),
          totalTransmission
        ),
        classDistribution: calculateDistribution(
          classDist.map((c) => ({ status: c.class, _count: c._count })),
          totalClass
        ),
        yearDistribution,
        priceRanges,
      },

      geographic: {
        countriesByOrganizations: countriesByOrgs,
        citiesByOrganizations: citiesByOrgs,
      },

      pricing: {
        avgPricePerDay: Math.round(pricingStats._avg.pricePerDay || 0),
        minPricePerDay: pricingStats._min.pricePerDay || 0,
        maxPricePerDay: pricingStats._max.pricePerDay || 0,
        medianPricePerDay: medianPrice,
        avgPriceByClass: processedAvgPriceByClass,
        avgPriceByBodyType: processedAvgPriceByBody,
      },

      userAnalytics: {
        verifiedUsersCount: verifiedUsers,
        unverifiedUsersCount: totalUsers - verifiedUsers,
        verificationRate,
        usersWithBookings: usersWithBookingsCount,
        usersWithMultipleBookings: usersWithMultipleBookingsCount,
        avgBookingsPerUser,
      },

      recentActivity: {
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
          userName: booking.user.name || 'Unknown',
          listingTitle: booking.listing.title,
          createdAt: booking.createdAt,
        })),
        recentUsers: recentUsers.map((user) => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email,
          createdAt: user.createdAt,
        })),
      },
    };
  }
}
