import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/server';
import {
  type UpdateProfileInputType,
  type UpdateProfileOutputType,
  type UpdatePersonalInfoInputType,
  type UpdatePersonalInfoOutputType,
  type SubmitDriverLicenseInputType,
  type SubmitDriverLicenseOutputType,
  type VerifyDriverLicenseInputType,
  type VerifyDriverLicenseOutputType,
  type UpdatePreferencesInputType,
  type UpdatePreferencesOutputType,
  type UpdateNotificationPreferencesInputType,
  type UpdateNotificationPreferencesOutputType,
  type AddFavoriteInputType,
  type AddFavoriteOutputType,
  type RemoveFavoriteInputType,
  type RemoveFavoriteOutputType,
  type ListFavoritesInputType,
  type ListFavoritesOutputType,
  type CheckFavoriteInputType,
  type CheckFavoriteOutputType,
  type ListMyReviewsInputType,
  type ListMyReviewsOutputType,
  type ListPendingReviewsOutputType,
  type GetAccountOverviewOutputType,
  type GetMyProfileOutputType,
  // Admin types
  type ListUsersInputType,
  type ListUsersOutputType,
  type FindOneUserInputType,
  type FindOneUserOutputType,
  type UpdateUserRoleInputType,
  type UpdateUserRoleOutputType,
  type BanUserInputType,
  type BanUserOutputType,
  type UnbanUserInputType,
  type UnbanUserOutputType,
} from '@yayago-app/validators';
import { getLocalizedValue, getPagination, paginate } from '../__shared__/utils';

export class UserService {
  // ============ GET MY PROFILE ============
  static async getMyProfile(userId: string): Promise<GetMyProfileOutputType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        members: {
          where: { organization: { deletedAt: null } },
          select: { organizationId: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    const isHost = user.members.length > 0;
    const organizationId = user.members[0]?.organizationId ?? null;

    // Calculate profile completion
    const requiredFields = ['name', 'phoneNumber', 'addressLine1', 'addressCity', 'addressCountry'];
    const optionalButRecommended = ['image', 'firstName', 'lastName', 'dateOfBirth'];
    const allFields = [...requiredFields, ...optionalButRecommended];
    const missingFields: string[] = [];

    let completedCount = 0;
    for (const field of allFields) {
      const value = (user as Record<string, unknown>)[field];
      if (value !== null && value !== undefined && value !== '') {
        completedCount++;
      } else if (requiredFields.includes(field)) {
        missingFields.push(field);
      }
    }

    const profileCompletionPercentage = Math.round((completedCount / allFields.length) * 100);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
      role: user.role,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
      createdAt: user.createdAt,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      firstName: user.firstName,
      lastName: user.lastName,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      addressCity: user.addressCity,
      addressState: user.addressState,
      addressCountry: user.addressCountry,
      addressZipCode: user.addressZipCode,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      driverLicenseNumber: user.driverLicenseNumber,
      driverLicenseCountry: user.driverLicenseCountry,
      driverLicenseExpiry: user.driverLicenseExpiry,
      driverLicenseVerificationStatus: user.driverLicenseVerificationStatus,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      preferredDistanceUnit: user.preferredDistanceUnit,
      notificationPreferences: user.notificationPreferences as GetMyProfileOutputType['notificationPreferences'],
      isHost,
      organizationId,
      profileCompletionPercentage,
    };
  }

  // ============ UPDATE PROFILE ============
  static async updateProfile(userId: string, input: UpdateProfileInputType): Promise<UpdateProfileOutputType> {
    let imageUrl = input.image;

    // Handle base64 image upload
    if (input.image && input.image.startsWith('data:')) {
      const { uploadUserAvatar } = await import('@yayago-app/cloudinary');
      const result = await uploadUserAvatar(input.image, userId);
      imageUrl = result.secure_url;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.displayUsername !== undefined && { displayUsername: input.displayUsername }),
        ...(input.dateOfBirth !== undefined && { dateOfBirth: input.dateOfBirth }),
        ...(input.gender !== undefined && { gender: input.gender }),
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });

    return { success: true };
  }

  // ============ UPDATE PERSONAL INFO ============
  static async updatePersonalInfo(
    userId: string,
    input: UpdatePersonalInfoInputType
  ): Promise<UpdatePersonalInfoOutputType> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.addressLine1 !== undefined && { addressLine1: input.addressLine1 }),
        ...(input.addressLine2 !== undefined && { addressLine2: input.addressLine2 }),
        ...(input.addressCity !== undefined && { addressCity: input.addressCity }),
        ...(input.addressState !== undefined && { addressState: input.addressState }),
        ...(input.addressCountry !== undefined && { addressCountry: input.addressCountry }),
        ...(input.addressZipCode !== undefined && { addressZipCode: input.addressZipCode }),
        ...(input.emergencyContactName !== undefined && { emergencyContactName: input.emergencyContactName }),
        ...(input.emergencyContactPhone !== undefined && { emergencyContactPhone: input.emergencyContactPhone }),
      },
    });

    return { success: true };
  }

  // ============ SUBMIT DRIVER LICENSE ============
  static async submitDriverLicense(
    userId: string,
    input: SubmitDriverLicenseInputType
  ): Promise<SubmitDriverLicenseOutputType> {
    // Upload images
    const { uploadDriverLicense } = await import('@yayago-app/cloudinary');

    const frontResult = await uploadDriverLicense(input.frontImage, userId, 'front');
    let backUrl: string | undefined;
    if (input.backImage) {
      const backResult = await uploadDriverLicense(input.backImage, userId, 'back');
      backUrl = backResult.secure_url;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        driverLicenseNumber: input.licenseNumber,
        driverLicenseCountry: input.country,
        driverLicenseExpiry: input.expiryDate,
        driverLicenseFrontUrl: frontResult.secure_url,
        driverLicenseBackUrl: backUrl,
        driverLicenseVerificationStatus: 'PENDING',
        driverLicenseRejectionReason: null,
      },
    });

    return { success: true, status: 'PENDING' };
  }

  // ============ ADMIN: VERIFY DRIVER LICENSE ============
  static async verifyDriverLicense(input: VerifyDriverLicenseInputType): Promise<VerifyDriverLicenseOutputType> {
    await prisma.user.update({
      where: { id: input.userId },
      data: {
        driverLicenseVerificationStatus: input.status,
        driverLicenseVerifiedAt: input.status === 'APPROVED' ? new Date() : null,
        driverLicenseRejectionReason: input.status === 'REJECTED' ? input.rejectionReason : null,
      },
    });

    return { success: true };
  }

  // ============ UPDATE PREFERENCES ============
  static async updatePreferences(
    userId: string,
    input: UpdatePreferencesInputType
  ): Promise<UpdatePreferencesOutputType> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.preferredCurrency !== undefined && { preferredCurrency: input.preferredCurrency }),
        ...(input.preferredLanguage !== undefined && { preferredLanguage: input.preferredLanguage }),
        ...(input.preferredDistanceUnit !== undefined && { preferredDistanceUnit: input.preferredDistanceUnit }),
      },
    });

    return { success: true };
  }

  // ============ UPDATE NOTIFICATION PREFERENCES ============
  static async updateNotificationPreferences(
    userId: string,
    input: UpdateNotificationPreferencesInputType
  ): Promise<UpdateNotificationPreferencesOutputType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    const current = (user?.notificationPreferences as Record<string, boolean>) || {};
    const updated = { ...current, ...input };

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPreferences: updated },
    });

    return { success: true };
  }

  // ============ ADD FAVORITE ============
  static async addFavorite(userId: string, input: AddFavoriteInputType): Promise<AddFavoriteOutputType> {
    const listing = await prisma.listing.findUnique({
      where: { slug: input.listingSlug, deletedAt: null },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: listing.id } },
    });

    if (existing) {
      return { success: true, favoriteId: existing.id };
    }

    const [favorite] = await prisma.$transaction([
      prisma.favorite.create({
        data: { userId, listingId: listing.id },
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);

    return { success: true, favoriteId: favorite.id };
  }

  // ============ REMOVE FAVORITE ============
  static async removeFavorite(userId: string, input: RemoveFavoriteInputType): Promise<RemoveFavoriteOutputType> {
    const listing = await prisma.listing.findUnique({
      where: { slug: input.listingSlug, deletedAt: null },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: listing.id } },
    });

    if (!existing) {
      return { success: true };
    }

    await prisma.$transaction([
      prisma.favorite.delete({
        where: { id: existing.id },
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);

    return { success: true };
  }

  // ============ LIST FAVORITES ============
  static async listFavorites(
    userId: string,
    input: ListFavoritesInputType,
    locale: string
  ): Promise<ListFavoritesOutputType> {
    const { page, limit, sortOrder } = input;
    const skip = (page - 1) * limit;

    // Simple orderBy - only by createdAt for now to avoid complex nested ordering
    const orderBy = { createdAt: sortOrder as 'asc' | 'desc' };

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId, listing: { deletedAt: null } },
        skip,
        take: limit,
        orderBy,
        include: {
          listing: {
            include: {
              pricing: true,
              vehicle: {
                include: {
                  model: { include: { brand: true } },
                },
              },
              organization: true,
              city: { include: { country: true } },
              bookingDetails: { select: { hasInstantBooking: true } },
              media: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId, listing: { deletedAt: null } } }),
    ]);

    return {
      items: favorites.map((fav) => ({
        id: fav.id,
        addedAt: fav.createdAt,
        listing: {
          id: fav.listing.id,
          slug: fav.listing.slug,
          title: fav.listing.title,
          status: fav.listing.status,
          primaryImage: fav.listing.media[0]?.url ?? null,
          pricePerDay: fav.listing.pricing?.pricePerDay ?? 0,
          currency: fav.listing.pricing?.currency ?? 'AED',
          location: fav.listing.city
            ? {
                city: getLocalizedValue(fav.listing.city.name, locale),
                country: getLocalizedValue(fav.listing.city.country.name, locale),
              }
            : null,
          vehicle: {
            brand: fav.listing.vehicle ? getLocalizedValue(fav.listing.vehicle.model.brand.name, locale) : 'Unknown',
            model: fav.listing.vehicle ? getLocalizedValue(fav.listing.vehicle.model.name, locale) : 'Unknown',
            year: fav.listing.vehicle?.year ?? 0,
            class: fav.listing.vehicle?.class ?? 'OTHER',
          },
          organization: {
            name: fav.listing.organization.name,
            slug: fav.listing.organization.slug,
          },
          bookingDetails: fav.listing.bookingDetails
            ? { instantBooking: fav.listing.bookingDetails.hasInstantBooking }
            : null,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============ CHECK FAVORITE ============
  static async checkFavorite(userId: string, input: CheckFavoriteInputType): Promise<CheckFavoriteOutputType> {
    const listing = await prisma.listing.findUnique({
      where: { slug: input.listingSlug, deletedAt: null },
    });

    if (!listing) {
      return { isFavorite: false };
    }

    const favorite = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: listing.id } },
    });

    return { isFavorite: !!favorite };
  }

  // ============ LIST MY REVIEWS ============
  static async listMyReviews(userId: string, input: ListMyReviewsInputType): Promise<ListMyReviewsOutputType> {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: { media: { where: { isPrimary: true }, take: 1 } },
          },
        },
      }),
      prisma.review.count({ where: { userId, deletedAt: null } }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        listing: {
          id: review.listing.id,
          slug: review.listing.slug,
          title: review.listing.title,
          primaryImage: review.listing.media[0]?.url ?? null,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============ LIST PENDING REVIEWS ============
  static async listPendingReviews(userId: string): Promise<ListPendingReviewsOutputType> {
    // Get completed bookings without reviews
    const completedBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        // No review exists for this booking
        listing: {
          reviews: {
            none: { userId },
          },
        },
      },
      orderBy: { endDate: 'desc' },
      take: 10,
      include: {
        listing: {
          include: { media: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    return completedBookings.map((booking) => ({
      bookingId: booking.id,
      completedAt: booking.endDate,
      listing: {
        id: booking.listing.id,
        slug: booking.listing.slug,
        title: booking.listing.title,
        primaryImage: booking.listing.media[0]?.url ?? null,
      },
    }));
  }

  // ============ GET ACCOUNT OVERVIEW ============
  static async getAccountOverview(userId: string): Promise<GetAccountOverviewOutputType> {
    const [
      user,
      bookingStats,
      favoriteCount,
      reviewCount,
      upcomingBooking,
      recentBookings,
      recentReviews,
      recentFavorites,
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.booking.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
        _sum: { totalPrice: true },
      }),
      prisma.favorite.count({ where: { userId } }),
      prisma.review.count({ where: { userId, deletedAt: null } }),
      prisma.booking.findFirst({
        where: { userId, startDate: { gte: new Date() }, status: { in: ['APPROVED'] } },
        orderBy: { startDate: 'asc' },
        include: { listing: { include: { media: { where: { isPrimary: true }, take: 1 } } } },
      }),
      prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { listing: { select: { title: true, slug: true } } },
      }),
      prisma.review.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { listing: { select: { title: true, slug: true } } },
      }),
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { listing: { select: { title: true, slug: true } } },
      }),
    ]);

    // Calculate stats
    let totalBookings = 0;
    let activeBookings = 0;
    let completedBookings = 0;
    let totalSpent = 0;

    for (const stat of bookingStats) {
      const count = stat._count._all ?? 0;
      totalBookings += count;
      totalSpent += stat._sum?.totalPrice || 0;
      if (stat.status === 'ACTIVE') activeBookings = count;
      if (stat.status === 'COMPLETED') completedBookings = count;
    }

    // Build recent activity
    const recentActivity: GetAccountOverviewOutputType['recentActivity'] = [];

    for (const booking of recentBookings) {
      recentActivity.push({
        type: 'booking',
        description: `Booked ${booking.listing.title}`,
        createdAt: booking.createdAt,
        link: `/account/bookings/${booking.id}`,
      });
    }

    for (const review of recentReviews) {
      recentActivity.push({
        type: 'review',
        description: `Reviewed ${review.listing.title}`,
        createdAt: review.createdAt,
        link: `/rent/cars/${review.listing.slug}`,
      });
    }

    for (const fav of recentFavorites) {
      recentActivity.push({
        type: 'favorite',
        description: `Added ${fav.listing.title} to favorites`,
        createdAt: fav.createdAt,
        link: `/rent/cars/${fav.listing.slug}`,
      });
    }

    // Sort by date
    recentActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Profile completion
    const requiredFields = ['name', 'phoneNumber', 'addressLine1', 'addressCity', 'addressCountry'];
    const allFields = [...requiredFields, 'image', 'firstName', 'lastName', 'dateOfBirth'];
    const missingFields: string[] = [];
    let completedCount = 0;

    if (user) {
      for (const field of allFields) {
        const value = (user as Record<string, unknown>)[field];
        if (value !== null && value !== undefined && value !== '') {
          completedCount++;
        } else if (requiredFields.includes(field)) {
          missingFields.push(field);
        }
      }
    }

    return {
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent,
        favoriteCount,
        reviewCount,
      },
      upcomingBooking: upcomingBooking
        ? {
            id: upcomingBooking.id,
            startDate: upcomingBooking.startDate,
            endDate: upcomingBooking.endDate,
            listing: {
              title: upcomingBooking.listing.title,
              slug: upcomingBooking.listing.slug,
              primaryImage: upcomingBooking.listing.media[0]?.url ?? null,
            },
          }
        : null,
      recentActivity: recentActivity.slice(0, 5),
      profileCompletion: {
        percentage: Math.round((completedCount / allFields.length) * 100),
        missingFields,
      },
    };
  }

  // ============ ADMIN: LIST USERS ============
  static async list(input: ListUsersInputType): Promise<ListUsersOutputType> {
    const { page, take, q, role, banned } = input;

    const where = {
      deletedAt: null,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { username: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(banned !== undefined && { banned }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          username: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginate(users, page, take, total);
  }

  // ============ ADMIN: FIND ONE USER ============
  static async findOne(input: FindOneUserInputType): Promise<FindOneUserOutputType> {
    const user = await prisma.user.findFirst({
      where: { username: input.username, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        username: true,
        displayUsername: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        phoneNumber: true,
        phoneNumberVerified: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    return user;
  }

  // ============ ADMIN: UPDATE USER ROLE ============
  static async updateRole(input: UpdateUserRoleInputType): Promise<UpdateUserRoleOutputType> {
    const user = await prisma.user.findFirst({
      where: { username: input.username, deletedAt: null },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: input.role },
      select: { id: true, username: true, role: true },
    });

    return updated;
  }

  // ============ ADMIN: BAN USER ============
  static async banUser(input: BanUserInputType): Promise<BanUserOutputType> {
    const user = await prisma.user.findFirst({
      where: { username: input.username, deletedAt: null },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    if (user.role === 'admin') {
      throw new ORPCError('FORBIDDEN', { message: 'Cannot ban an admin user' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        banned: true,
        banReason: input.reason ?? null,
        banExpires: input.expiresAt ?? null,
      },
      select: {
        id: true,
        username: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    return {
      ...updated,
      banned: updated.banned ?? false,
    };
  }

  // ============ ADMIN: UNBAN USER ============
  static async unbanUser(input: UnbanUserInputType): Promise<UnbanUserOutputType> {
    const user = await prisma.user.findFirst({
      where: { username: input.username, deletedAt: null },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
      select: { id: true, username: true, banned: true },
    });

    return {
      ...updated,
      banned: updated.banned ?? false,
    };
  }
}
