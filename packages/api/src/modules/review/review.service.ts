import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/server';
import type {
  CreateReviewInputType,
  CreateReviewOutputType,
  UpdateReviewInputType,
  UpdateReviewOutputType,
  DeleteReviewInputType,
  DeleteReviewOutputType,
  GetReviewInputType,
  ReviewOutputType,
  ListListingReviewsInputType,
  ListListingReviewsOutputType,
  GetListingReviewSummaryInputType,
  GetListingReviewSummaryOutputType,
  ListUserReviewsInputType,
  ListUserReviewsOutputType,
  ListPartnerReviewsInputType,
  ListPartnerReviewsOutputType,
  ListAllReviewsInputType,
  ListAllReviewsOutputType,
  GetPartnerReviewStatsOutputType,
  CanReviewBookingInputType,
  CanReviewBookingOutputType,
  GetPendingReviewsOutputType,
} from '@yayago-app/validators';
import { getLocalizedValue } from '../__shared__/utils';

// ============ HELPER: Get user's organization for partner operations ============
async function getPartnerOrganizationId(userId: string): Promise<string> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organization: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    },
    select: { organizationId: true },
  });

  if (!member) {
    throw new ORPCError('FORBIDDEN', {
      message: 'No active organization membership found',
    });
  }

  return member.organizationId;
}

// Calculate days between two dates
function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export class ReviewService {
  // ============ CREATE REVIEW ============
  static async createReview(input: CreateReviewInputType, userId: string): Promise<CreateReviewOutputType> {
    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        userId,
        status: 'COMPLETED',
      },
      include: {
        listing: true,
        review: true,
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking not found or not completed',
      });
    }

    // Check if review already exists
    if (booking.review) {
      throw new ORPCError('CONFLICT', {
        message: 'A review already exists for this booking',
      });
    }

    // Extract tags from input
    const tags = input.tags || {};

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        listingId: booking.listingId,
        userId,
        rating: input.rating,
        comment: input.comment,
        // Tags
        wasClean: tags.wasClean,
        wasAsDescribed: tags.wasAsDescribed,
        wasReliable: tags.wasReliable,
        wasEasyToDrive: tags.wasEasyToDrive,
        wasComfortable: tags.wasComfortable,
        wasFuelEfficient: tags.wasFuelEfficient,
        hadGoodAC: tags.hadGoodAC,
        wasSpacious: tags.wasSpacious,
        wasPickupSmooth: tags.wasPickupSmooth,
        wasDropoffSmooth: tags.wasDropoffSmooth,
        wasHostResponsive: tags.wasHostResponsive,
        wasGoodValue: tags.wasGoodValue,
        wouldRentAgain: tags.wouldRentAgain,
        wouldRecommend: tags.wouldRecommend,
      },
    });

    // Update listing stats
    const [avgResult, reviewCount] = await Promise.all([
      prisma.review.aggregate({
        where: { listingId: booking.listingId, deletedAt: null },
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { listingId: booking.listingId, deletedAt: null },
      }),
    ]);

    await prisma.listing.update({
      where: { id: booking.listingId },
      data: {
        averageRating: avgResult._avg.rating,
        reviewCount,
      },
    });

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  // ============ UPDATE REVIEW ============
  static async updateReview(input: UpdateReviewInputType, userId: string): Promise<UpdateReviewOutputType> {
    const review = await prisma.review.findFirst({
      where: {
        id: input.reviewId,
        userId,
        deletedAt: null,
      },
    });

    if (!review) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Review not found',
      });
    }

    const tags = input.tags || {};

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.comment !== undefined && { comment: input.comment }),
        // Update tags if provided
        ...(tags.wasClean !== undefined && { wasClean: tags.wasClean }),
        ...(tags.wasAsDescribed !== undefined && { wasAsDescribed: tags.wasAsDescribed }),
        ...(tags.wasReliable !== undefined && { wasReliable: tags.wasReliable }),
        ...(tags.wasEasyToDrive !== undefined && { wasEasyToDrive: tags.wasEasyToDrive }),
        ...(tags.wasComfortable !== undefined && { wasComfortable: tags.wasComfortable }),
        ...(tags.wasFuelEfficient !== undefined && { wasFuelEfficient: tags.wasFuelEfficient }),
        ...(tags.hadGoodAC !== undefined && { hadGoodAC: tags.hadGoodAC }),
        ...(tags.wasSpacious !== undefined && { wasSpacious: tags.wasSpacious }),
        ...(tags.wasPickupSmooth !== undefined && { wasPickupSmooth: tags.wasPickupSmooth }),
        ...(tags.wasDropoffSmooth !== undefined && { wasDropoffSmooth: tags.wasDropoffSmooth }),
        ...(tags.wasHostResponsive !== undefined && { wasHostResponsive: tags.wasHostResponsive }),
        ...(tags.wasGoodValue !== undefined && { wasGoodValue: tags.wasGoodValue }),
        ...(tags.wouldRentAgain !== undefined && { wouldRentAgain: tags.wouldRentAgain }),
        ...(tags.wouldRecommend !== undefined && { wouldRecommend: tags.wouldRecommend }),
      },
    });

    // Update listing average if rating changed
    if (input.rating !== undefined) {
      const [avgResult] = await Promise.all([
        prisma.review.aggregate({
          where: { listingId: review.listingId, deletedAt: null },
          _avg: { rating: true },
        }),
      ]);

      await prisma.listing.update({
        where: { id: review.listingId },
        data: {
          averageRating: avgResult._avg.rating,
        },
      });
    }

    return {
      id: updated.id,
      rating: updated.rating,
      comment: updated.comment,
      updatedAt: updated.updatedAt,
    };
  }

  // ============ DELETE REVIEW ============
  static async deleteReview(input: DeleteReviewInputType, userId: string): Promise<DeleteReviewOutputType> {
    const review = await prisma.review.findFirst({
      where: {
        id: input.reviewId,
        userId,
        deletedAt: null,
      },
    });

    if (!review) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Review not found',
      });
    }

    // Soft delete
    await prisma.review.update({
      where: { id: review.id },
      data: { deletedAt: new Date() },
    });

    // Update listing stats
    const [avgResult, reviewCount] = await Promise.all([
      prisma.review.aggregate({
        where: { listingId: review.listingId, deletedAt: null },
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { listingId: review.listingId, deletedAt: null },
      }),
    ]);

    await prisma.listing.update({
      where: { id: review.listingId },
      data: {
        averageRating: reviewCount > 0 ? avgResult._avg.rating : null,
        reviewCount,
      },
    });

    return {
      id: review.id,
      deleted: true,
    };
  }

  // ============ GET REVIEW ============
  static async getReview(input: GetReviewInputType): Promise<ReviewOutputType> {
    const review = await prisma.review.findFirst({
      where: {
        id: input.reviewId,
        deletedAt: null,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        listing: {
          include: {
            vehicle: {
              include: {
                model: {
                  include: { brand: true },
                },
              },
            },
          },
        },
        booking: {
          select: { id: true, referenceCode: true },
        },
      },
    });

    if (!review) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Review not found',
      });
    }

    return {
      id: review.id,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      rating: review.rating,
      comment: review.comment,
      // Tags
      wasClean: review.wasClean,
      wasAsDescribed: review.wasAsDescribed,
      wasReliable: review.wasReliable,
      wasEasyToDrive: review.wasEasyToDrive,
      wasComfortable: review.wasComfortable,
      wasFuelEfficient: review.wasFuelEfficient,
      hadGoodAC: review.hadGoodAC,
      wasSpacious: review.wasSpacious,
      wasPickupSmooth: review.wasPickupSmooth,
      wasDropoffSmooth: review.wasDropoffSmooth,
      wasHostResponsive: review.wasHostResponsive,
      wasGoodValue: review.wasGoodValue,
      wouldRentAgain: review.wouldRentAgain,
      wouldRecommend: review.wouldRecommend,
      user: {
        id: review.user.id,
        name: review.user.name || 'Anonymous',
        image: review.user.image,
      },
      listing: {
        id: review.listing.id,
        slug: review.listing.slug,
        title: review.listing.title,
        vehicle: review.listing.vehicle
          ? {
              year: review.listing.vehicle.year,
              model: {
                name: getLocalizedValue(review.listing.vehicle.model.name, 'en'),
                brand: {
                  name: getLocalizedValue(review.listing.vehicle.model.brand.name, 'en'),
                },
              },
            }
          : null,
      },
      booking: {
        id: review.booking.id,
        referenceCode: review.booking.referenceCode,
      },
    };
  }

  // ============ LIST LISTING REVIEWS (Public) ============
  static async listListingReviews(input: ListListingReviewsInputType): Promise<ListListingReviewsOutputType> {
    const { listingSlug, rating, sortBy, page, take } = input;

    // Find listing by slug
    const listing = await prisma.listing.findFirst({
      where: { slug: listingSlug, deletedAt: null },
      select: { id: true },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Listing not found',
      });
    }

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      highest: { rating: 'desc' },
      lowest: { rating: 'asc' },
    }[sortBy];

    const where = {
      listingId: listing.id,
      deletedAt: null,
      ...(rating && { rating }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          booking: {
            select: { id: true, referenceCode: true, startDate: true, endDate: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        createdAt: review.createdAt,
        rating: review.rating,
        comment: review.comment,
        tags: {
          wasClean: review.wasClean,
          wasAsDescribed: review.wasAsDescribed,
          wasReliable: review.wasReliable,
          wasEasyToDrive: review.wasEasyToDrive,
          wasComfortable: review.wasComfortable,
          wasFuelEfficient: review.wasFuelEfficient,
          hadGoodAC: review.hadGoodAC,
          wasSpacious: review.wasSpacious,
          wasPickupSmooth: review.wasPickupSmooth,
          wasDropoffSmooth: review.wasDropoffSmooth,
          wasHostResponsive: review.wasHostResponsive,
          wasGoodValue: review.wasGoodValue,
          wouldRentAgain: review.wouldRentAgain,
          wouldRecommend: review.wouldRecommend,
        },
        user: {
          id: review.user.id,
          name: review.user.name || 'Anonymous',
          image: review.user.image,
        },
        booking: {
          id: review.booking.id,
          referenceCode: review.booking.referenceCode,
          startDate: review.booking.startDate,
          endDate: review.booking.endDate,
        },
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ GET LISTING REVIEW SUMMARY ============
  static async getListingReviewSummary(input: GetListingReviewSummaryInputType): Promise<GetListingReviewSummaryOutputType> {
    const { listingSlug } = input;

    const listing = await prisma.listing.findFirst({
      where: { slug: listingSlug, deletedAt: null },
      select: { id: true, averageRating: true, reviewCount: true },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Listing not found',
      });
    }

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { listingId: listing.id, deletedAt: null },
      _count: { rating: true },
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5] = r._count.rating;
    });

    // Get tag statistics
    const reviews = await prisma.review.findMany({
      where: { listingId: listing.id, deletedAt: null },
      select: {
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
    });

    const tagStats = {
      wasClean: { positive: 0, total: 0 },
      wasAsDescribed: { positive: 0, total: 0 },
      wasReliable: { positive: 0, total: 0 },
      wasEasyToDrive: { positive: 0, total: 0 },
      wasComfortable: { positive: 0, total: 0 },
      wasFuelEfficient: { positive: 0, total: 0 },
      hadGoodAC: { positive: 0, total: 0 },
      wasSpacious: { positive: 0, total: 0 },
      wasPickupSmooth: { positive: 0, total: 0 },
      wasDropoffSmooth: { positive: 0, total: 0 },
      wasHostResponsive: { positive: 0, total: 0 },
      wasGoodValue: { positive: 0, total: 0 },
      wouldRentAgain: { positive: 0, total: 0 },
      wouldRecommend: { positive: 0, total: 0 },
    };

    for (const review of reviews) {
      for (const [key, value] of Object.entries(review)) {
        if (value !== null && key in tagStats) {
          const k = key as keyof typeof tagStats;
          tagStats[k].total++;
          if (value === true) {
            tagStats[k].positive++;
          }
        }
      }
    }

    // Get recent highlights (high-rated reviews with comments)
    const recentHighlights = await prisma.review.findMany({
      where: {
        listingId: listing.id,
        deletedAt: null,
        rating: { gte: 4 },
        comment: { not: null },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return {
      totalReviews: listing.reviewCount,
      averageRating: listing.averageRating,
      ratingDistribution: distribution,
      tagStats,
      recentHighlights: recentHighlights.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user.name || 'Anonymous',
        createdAt: r.createdAt,
      })),
    };
  }

  // ============ LIST USER REVIEWS ============
  static async listUserReviews(input: ListUserReviewsInputType, userId: string): Promise<ListUserReviewsOutputType> {
    const { page, take } = input;
    const targetUserId = input.userId || userId;

    const where = {
      userId: targetUserId,
      deletedAt: null,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              media: { where: { isPrimary: true, deletedAt: null }, take: 1 },
              vehicle: {
                include: {
                  model: { include: { brand: true } },
                },
              },
            },
          },
          booking: {
            select: { id: true, referenceCode: true, startDate: true, endDate: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        createdAt: review.createdAt,
        rating: review.rating,
        comment: review.comment,
        listing: {
          id: review.listing.id,
          slug: review.listing.slug,
          title: review.listing.title,
          primaryImage: review.listing.media[0]?.url || null,
          vehicle: review.listing.vehicle
            ? {
                year: review.listing.vehicle.year,
                model: {
                  name: getLocalizedValue(review.listing.vehicle.model.name, 'en'),
                  brand: {
                    name: getLocalizedValue(review.listing.vehicle.model.brand.name, 'en'),
                  },
                },
              }
            : null,
        },
        booking: {
          id: review.booking.id,
          referenceCode: review.booking.referenceCode,
          startDate: review.booking.startDate,
          endDate: review.booking.endDate,
        },
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST PARTNER REVIEWS ============
  static async listPartnerReviews(input: ListPartnerReviewsInputType, userId: string): Promise<ListPartnerReviewsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);
    const { listingSlug, rating, sortBy, page, take } = input;

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      highest: { rating: 'desc' },
      lowest: { rating: 'asc' },
    }[sortBy];

    const where: any = {
      deletedAt: null,
      listing: {
        organizationId,
        ...(listingSlug && { slug: listingSlug }),
      },
      ...(rating && { rating }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          listing: {
            select: { id: true, slug: true, title: true },
          },
          booking: {
            select: {
              id: true,
              referenceCode: true,
              startDate: true,
              endDate: true,
              totalPrice: true,
              currency: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        createdAt: review.createdAt,
        rating: review.rating,
        comment: review.comment,
        tags: {
          wasClean: review.wasClean,
          wasAsDescribed: review.wasAsDescribed,
          wasReliable: review.wasReliable,
          wasPickupSmooth: review.wasPickupSmooth,
          wasDropoffSmooth: review.wasDropoffSmooth,
          wasHostResponsive: review.wasHostResponsive,
          wasGoodValue: review.wasGoodValue,
          wouldRentAgain: review.wouldRentAgain,
          wouldRecommend: review.wouldRecommend,
        },
        user: {
          id: review.user.id,
          name: review.user.name || 'Anonymous',
          image: review.user.image,
        },
        listing: {
          id: review.listing.id,
          slug: review.listing.slug,
          title: review.listing.title,
        },
        booking: {
          id: review.booking.id,
          referenceCode: review.booking.referenceCode,
          startDate: review.booking.startDate,
          endDate: review.booking.endDate,
          totalPrice: review.booking.totalPrice,
          currency: review.booking.currency,
        },
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST ALL REVIEWS (Admin) ============
  static async listAllReviews(input: ListAllReviewsInputType): Promise<ListAllReviewsOutputType> {
    const { q, listingSlug, userId, organizationSlug, rating, dateFrom, dateTo, sortBy, page, take } = input;

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      highest: { rating: 'desc' },
      lowest: { rating: 'asc' },
    }[sortBy];

    const where: any = {
      deletedAt: null,
      ...(q && { comment: { contains: q, mode: 'insensitive' } }),
      ...(listingSlug && { listing: { slug: listingSlug } }),
      ...(userId && { userId }),
      ...(organizationSlug && { listing: { organization: { slug: organizationSlug } } }),
      ...(rating && { rating }),
      ...(dateFrom && { createdAt: { gte: dateFrom } }),
      ...(dateTo && { createdAt: { lte: dateTo } }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          listing: {
            include: {
              organization: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          booking: {
            select: { id: true, referenceCode: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        createdAt: review.createdAt,
        rating: review.rating,
        comment: review.comment,
        user: {
          id: review.user.id,
          name: review.user.name || 'Anonymous',
          email: review.user.email || '',
        },
        listing: {
          id: review.listing.id,
          slug: review.listing.slug,
          title: review.listing.title,
        },
        organization: {
          id: review.listing.organization.id,
          name: review.listing.organization.name,
          slug: review.listing.organization.slug,
        },
        booking: {
          id: review.booking.id,
          referenceCode: review.booking.referenceCode,
        },
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ GET PARTNER REVIEW STATS ============
  static async getPartnerReviewStats(userId: string): Promise<GetPartnerReviewStatsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all reviews for the organization
    const reviews = await prisma.review.findMany({
      where: {
        deletedAt: null,
        listing: { organizationId },
      },
      include: {
        user: { select: { name: true } },
        listing: { select: { title: true } },
      },
    });

    const reviewsThisMonth = reviews.filter((r) => r.createdAt >= startOfMonth);

    // Calculate totals
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : null;
    const avgThisMonth =
      reviewsThisMonth.length > 0 ? reviewsThisMonth.reduce((sum, r) => sum + r.rating, 0) / reviewsThisMonth.length : null;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    // Tag performance (percentage)
    const tagCounts: Record<string, { positive: number; total: number }> = {
      wasClean: { positive: 0, total: 0 },
      wasAsDescribed: { positive: 0, total: 0 },
      wasReliable: { positive: 0, total: 0 },
      wasEasyToDrive: { positive: 0, total: 0 },
      wasComfortable: { positive: 0, total: 0 },
      wasFuelEfficient: { positive: 0, total: 0 },
      hadGoodAC: { positive: 0, total: 0 },
      wasSpacious: { positive: 0, total: 0 },
      wasPickupSmooth: { positive: 0, total: 0 },
      wasDropoffSmooth: { positive: 0, total: 0 },
      wasHostResponsive: { positive: 0, total: 0 },
      wasGoodValue: { positive: 0, total: 0 },
      wouldRentAgain: { positive: 0, total: 0 },
      wouldRecommend: { positive: 0, total: 0 },
    };

    for (const review of reviews) {
      for (const [key, value] of Object.entries(review)) {
        if (value !== null && key in tagCounts) {
          tagCounts[key].total++;
          if (value === true) {
            tagCounts[key].positive++;
          }
        }
      }
    }

    const tagPerformance: Record<string, number | null> = {};
    for (const [key, { positive, total }] of Object.entries(tagCounts)) {
      tagPerformance[key] = total > 0 ? Math.round((positive / total) * 100) : null;
    }

    // Recent low ratings (1-2 stars)
    const recentLowRatings = reviews
      .filter((r) => r.rating <= 2)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user.name || 'Anonymous',
        listingTitle: r.listing.title,
        createdAt: r.createdAt,
      }));

    return {
      totalReviews,
      averageRating,
      ratingDistribution: distribution,
      tagPerformance: tagPerformance as any,
      reviewsThisMonth: reviewsThisMonth.length,
      averageRatingThisMonth: avgThisMonth,
      recentLowRatings,
    };
  }

  // ============ CAN REVIEW BOOKING ============
  static async canReviewBooking(input: CanReviewBookingInputType, userId: string): Promise<CanReviewBookingOutputType> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        userId,
      },
      include: {
        review: true,
      },
    });

    if (!booking) {
      return {
        canReview: false,
        reason: 'Booking not found',
      };
    }

    if (booking.review) {
      return {
        canReview: false,
        reason: 'Review already exists for this booking',
        existingReviewId: booking.review.id,
      };
    }

    if (booking.status !== 'COMPLETED') {
      return {
        canReview: false,
        reason: 'Booking must be completed before leaving a review',
      };
    }

    return {
      canReview: true,
    };
  }

  // ============ GET PENDING REVIEWS ============
  static async getPendingReviews(userId: string): Promise<GetPendingReviewsOutputType> {
    // Get completed bookings without reviews
    const completedBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        review: null,
      },
      orderBy: { endDate: 'desc' },
      take: 10,
      include: {
        listing: {
          include: {
            media: { where: { isPrimary: true, deletedAt: null }, take: 1 },
            vehicle: {
              include: {
                model: { include: { brand: true } },
              },
            },
          },
        },
      },
    });

    return {
      pendingReviews: completedBookings.map((booking) => ({
        booking: {
          id: booking.id,
          referenceCode: booking.referenceCode,
          startDate: booking.startDate,
          endDate: booking.endDate,
        },
        listing: {
          id: booking.listing.id,
          slug: booking.listing.slug,
          title: booking.listing.title,
          primaryImage: booking.listing.media[0]?.url || null,
        },
        vehicle: {
          make: booking.listing.vehicle
            ? getLocalizedValue(booking.listing.vehicle.model.brand.name, 'en')
            : 'Unknown',
          model: booking.listing.vehicle ? getLocalizedValue(booking.listing.vehicle.model.name, 'en') : 'Unknown',
          year: booking.listing.vehicle?.year || 0,
        },
      })),
    };
  }
}

