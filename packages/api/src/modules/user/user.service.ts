import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/server';
import { VerificationNotifications } from '../notification/notification.helpers';
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
  // Verification types
  type GetVerificationStatusOutputType,
  type RequestVerificationOtpInputType,
  type RequestVerificationOtpOutputType,
  type VerifyOtpInputType,
  type VerifyOtpOutputType,
  type SubmitVerificationInputType,
  type SubmitVerificationOutputType,
  type ListPendingVerificationsInputType,
  type ListPendingVerificationsOutputType,
  type GetVerificationAttemptInputType,
  type GetVerificationAttemptOutputType,
  type ReviewVerificationInputType,
  type ReviewVerificationOutputType,
  type GetUserVerificationHistoryInputType,
  type GetUserVerificationHistoryOutputType,
  type GetVerificationDocumentUrlsInputType,
  type GetVerificationDocumentUrlsOutputType,
  type ResubmitVerificationInputType,
  type ResubmitVerificationOutputType,
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
import { generateSignedUrlFromStoredUrl } from '@yayago-app/cloudinary';
import { auth } from '@yayago-app/auth';

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
      driverLicenseCountryCode: user.driverLicenseCountryCode,
      driverLicenseExpiry: user.driverLicenseExpiry,
      driverLicenseFrontUrl: user.driverLicenseFrontUrl,
      driverLicenseBackUrl: user.driverLicenseBackUrl,
      driverLicenseVerificationStatus: user.driverLicenseVerificationStatus,
      selfieUrl: user.selfieUrl,
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
        // Note: dateOfBirth and gender are now managed through verification
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
  ): Promise<{ success: boolean }> {
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
    const { page, take, q, role, banned, verificationStatus } = input;

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
      ...(verificationStatus && { driverLicenseVerificationStatus: verificationStatus }),
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
          driverLicenseVerificationStatus: true,
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
        // User profile data (set after verification approval)
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        // Driver's License
        driverLicenseNumber: true,
        driverLicenseCountry: true,
        driverLicenseCountryCode: true,
        driverLicenseExpiry: true,
        // Verification fields
        driverLicenseVerificationStatus: true,
        driverLicenseRejectionReason: true,
        driverLicenseFrontUrl: true,
        driverLicenseBackUrl: true,
        selfieUrl: true,
        verificationSubmittedAt: true,
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

  // ============ USER VERIFICATION ============
  static async getVerificationStatus(userId: string): Promise<GetVerificationStatusOutputType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        driverLicenseVerificationStatus: true,
        driverLicenseRejectionReason: true,
        phoneVerifiedAt: true,
        verificationSubmittedAt: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    return {
      status: user.driverLicenseVerificationStatus,
      rejectionReason: user.driverLicenseRejectionReason,
      phoneVerified: user.phoneVerifiedAt !== null,
      submittedAt: user.verificationSubmittedAt,
    };
  }

  static async requestVerificationOtp(
    userId: string,
    input: RequestVerificationOtpInputType
  ): Promise<RequestVerificationOtpOutputType> {
    const { phoneNumber } = input;

    // Check if phone number is already verified by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber,
        phoneVerifiedAt: { not: null },
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ORPCError('CONFLICT', { message: 'This phone number is already verified by another account' });
    }

    const { message } = await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber,
      },
    });

    return {
      success: true,
      message,
    };
  }

  static async verifyOtp(userId: string, input: VerifyOtpInputType): Promise<VerifyOtpOutputType> {
    const { phoneNumber, otp } = input;

    // Better Auth stores OTPs in the 'verification' table
    // The identifier is the phone number, and value is the OTP code
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: phoneNumber,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'No OTP found for this phone number. Please request a new one.',
      });
    }

    // Check if OTP has expired
    if (new Date() > verification.expiresAt) {
      // Clean up expired OTP
      await prisma.verification.delete({ where: { id: verification.id } });
      throw new ORPCError('BAD_REQUEST', { message: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP matches
    // Better Auth stores the value as "{otp}:{counter}", so we need to extract just the OTP part
    const storedOtp = verification.value.split(':')[0];
    if (storedOtp !== otp) {
      throw new ORPCError('BAD_REQUEST', { message: 'Invalid OTP' });
    }

    // OTP verified successfully - update user and clean up
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          phoneNumber,
          phoneVerifiedAt: new Date(),
          phoneNumberVerified: true,
        },
      }),
      // Delete the used OTP
      prisma.verification.delete({ where: { id: verification.id } }),
    ]);

    return {
      success: true,
      message: 'Phone number verified successfully',
    };
  }

  static async submitVerification(
    userId: string,
    input: SubmitVerificationInputType
  ): Promise<SubmitVerificationOutputType> {
    const { licenseFrontImage, licenseBackImage, selfieImage, phoneNumber } = input;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        phoneVerifiedAt: true,
        driverLicenseVerificationStatus: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    // Check if phone is verified
    if (!user.phoneVerifiedAt || user.phoneNumber !== phoneNumber) {
      throw new ORPCError('BAD_REQUEST', { message: 'Phone number must be verified before submitting verification' });
    }

    // Check if already pending or approved
    if (user.driverLicenseVerificationStatus === 'PENDING') {
      throw new ORPCError('CONFLICT', { message: 'You already have a pending verification request' });
    }

    if (user.driverLicenseVerificationStatus === 'APPROVED') {
      throw new ORPCError('CONFLICT', { message: 'You are already verified' });
    }

    // Upload images to Cloudinary
    const { uploadVerificationLicenseFront, uploadVerificationLicenseBack, uploadVerificationSelfie } = await import(
      '@yayago-app/cloudinary'
    );

    const attemptId = crypto.randomUUID();

    const [frontResult, backResult, selfieResult] = await Promise.all([
      uploadVerificationLicenseFront(licenseFrontImage, userId, attemptId),
      uploadVerificationLicenseBack(licenseBackImage, userId, attemptId),
      uploadVerificationSelfie(selfieImage, userId, attemptId),
    ]);

    // Create verification attempt
    await prisma.verificationAttempt.create({
      data: {
        id: attemptId,
        userId,
        licenseFrontUrl: frontResult.secure_url,
        licenseBackUrl: backResult.secure_url,
        selfieUrl: selfieResult.secure_url,
        phoneNumber,
        status: 'PENDING',
      },
    });

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        driverLicenseVerificationStatus: 'PENDING',
        driverLicenseFrontUrl: frontResult.secure_url,
        driverLicenseBackUrl: backResult.secure_url,
        selfieUrl: selfieResult.secure_url,
        verificationSubmittedAt: new Date(),
        driverLicenseRejectionReason: null,
      },
    });

    return {
      success: true,
      status: 'PENDING',
      attemptId,
    };
  }

  // ============ ADMIN: VERIFICATION MANAGEMENT ============
  static async listPendingVerifications(
    input: ListPendingVerificationsInputType
  ): Promise<ListPendingVerificationsOutputType> {
    const { page, take, status } = input;

    const where = status ? { status } : {};

    const [attempts, total] = await prisma.$transaction([
      prisma.verificationAttempt.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...getPagination({ page, take }),
      }),
      prisma.verificationAttempt.count({ where }),
    ]);

    return {
      items: attempts.map((a) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user.name,
        userEmail: a.user.email,
        userImage: a.user.image,
        licenseFrontUrl: a.licenseFrontUrl,
        licenseBackUrl: a.licenseBackUrl,
        selfieUrl: a.selfieUrl,
        phoneNumber: a.phoneNumber,
        status: a.status,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt,
      })),
      pagination: paginate([], page, take, total).pagination,
    };
  }

  static async getVerificationAttempt(
    input: GetVerificationAttemptInputType
  ): Promise<GetVerificationAttemptOutputType> {
    const attempt = await prisma.verificationAttempt.findUnique({
      where: { id: input.attemptId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new ORPCError('NOT_FOUND', { message: 'Verification attempt not found' });
    }

    return {
      id: attempt.id,
      userId: attempt.userId,
      user: attempt.user,
      licenseFrontUrl: attempt.licenseFrontUrl,
      licenseBackUrl: attempt.licenseBackUrl,
      selfieUrl: attempt.selfieUrl,
      phoneNumber: attempt.phoneNumber,
      status: attempt.status,
      rejectionReason: attempt.rejectionReason,
      reviewedBy: attempt.reviewedBy,
      reviewedAt: attempt.reviewedAt,
      createdAt: attempt.createdAt,
    };
  }

  static async reviewVerification(
    adminUserId: string,
    input: ReviewVerificationInputType
  ): Promise<ReviewVerificationOutputType> {
    const {
      attemptId,
      status,
      rejectionReason,
      firstName,
      lastName,
      dateOfBirth,
      licenseNumber,
      licenseCountry,
      licenseCountryCode,
      licenseExpiry,
      gender,
    } = input;

    const attempt = await prisma.verificationAttempt.findUnique({
      where: { id: attemptId },
      include: { user: true },
    });

    if (!attempt) {
      throw new ORPCError('NOT_FOUND', { message: 'Verification attempt not found' });
    }

    if (attempt.status !== 'PENDING') {
      throw new ORPCError('CONFLICT', { message: 'This verification has already been reviewed' });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      throw new ORPCError('BAD_REQUEST', { message: 'Rejection reason is required when rejecting' });
    }

    // When approving, require extracted document data
    if (status === 'APPROVED') {
      if (!firstName || !lastName || !dateOfBirth || !licenseNumber || !licenseExpiry) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'First name, last name, date of birth, license number, and expiry date are required when approving',
        });
      }
    }

    // Update attempt
    await prisma.verificationAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: attempt.userId },
      data: {
        driverLicenseVerificationStatus: status,
        driverLicenseRejectionReason: status === 'REJECTED' ? rejectionReason : null,
        driverLicenseVerifiedAt: status === 'APPROVED' ? new Date() : null,
        // Save extracted document data when approving
        ...(status === 'APPROVED' && {
          firstName,
          lastName,
          dateOfBirth,
          driverLicenseNumber: licenseNumber,
          driverLicenseCountry: licenseCountry,
          driverLicenseCountryCode: licenseCountryCode,
          driverLicenseExpiry: licenseExpiry,
          gender,
        }),
      },
    });

    // Send notification to user about verification result
    if (status === 'APPROVED') {
      await VerificationNotifications.approved({ userId: attempt.userId }).catch((err) =>
        console.error('Failed to send verification approved notification:', err)
      );
    } else if (status === 'REJECTED') {
      await VerificationNotifications.rejected({ userId: attempt.userId, reason: rejectionReason }).catch((err) =>
        console.error('Failed to send verification rejected notification:', err)
      );
    }

    return { success: true };
  }

  static async getUserVerificationHistory(
    input: GetUserVerificationHistoryInputType
  ): Promise<GetUserVerificationHistoryOutputType> {
    const attempts = await prisma.verificationAttempt.findMany({
      where: { userId: input.userId },
      orderBy: { createdAt: 'desc' },
    });

    return attempts.map((a) => ({
      id: a.id,
      licenseFrontUrl: a.licenseFrontUrl,
      licenseBackUrl: a.licenseBackUrl,
      selfieUrl: a.selfieUrl,
      phoneNumber: a.phoneNumber,
      status: a.status,
      rejectionReason: a.rejectionReason,
      reviewedBy: a.reviewedBy,
      reviewedAt: a.reviewedAt,
      createdAt: a.createdAt,
    }));
  }

  // ============ GET VERIFICATION DOCUMENT URLS (Signed URLs with expiration) ============
  static async getVerificationDocumentUrls(
    userId: string,
    input: GetVerificationDocumentUrlsInputType
  ): Promise<GetVerificationDocumentUrlsOutputType> {
    // Determine which user's documents to fetch
    const targetUserId = input.userId || userId;

    // If requesting another user's documents, check if the requesting user is admin/moderator
    if (targetUserId !== userId) {
      const requestingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!requestingUser || !['admin', 'moderator'].includes(requestingUser.role)) {
        throw new ORPCError('FORBIDDEN', { message: 'You can only view your own verification documents' });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        driverLicenseFrontUrl: true,
        driverLicenseBackUrl: true,
        selfieUrl: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    // Generate signed URLs with 5-minute expiration
    const expiresInSeconds = 300; // 5 minutes
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      licenseFrontUrl: user.driverLicenseFrontUrl
        ? generateSignedUrlFromStoredUrl(user.driverLicenseFrontUrl, { expiresInSeconds })
        : null,
      licenseBackUrl: user.driverLicenseBackUrl
        ? generateSignedUrlFromStoredUrl(user.driverLicenseBackUrl, { expiresInSeconds })
        : null,
      selfieUrl: user.selfieUrl ? generateSignedUrlFromStoredUrl(user.selfieUrl, { expiresInSeconds }) : null,
      expiresAt,
    };
  }

  // ============ RESUBMIT VERIFICATION (for expired documents) ============
  static async resubmitVerification(
    userId: string,
    input: ResubmitVerificationInputType
  ): Promise<ResubmitVerificationOutputType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        phoneVerifiedAt: true,
        driverLicenseVerificationStatus: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    // Only allow resubmission if status is EXPIRED or REJECTED
    if (!['EXPIRED', 'REJECTED'].includes(user.driverLicenseVerificationStatus)) {
      throw new ORPCError('PRECONDITION_FAILED', {
        message: 'You can only resubmit verification if your previous submission was rejected or expired.',
      });
    }

    // Phone should already be verified from previous submission
    if (!user.phoneVerifiedAt || !user.phoneNumber) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Phone number must be verified. Please complete full verification flow.',
      });
    }

    // Upload new images
    const { uploadVerificationLicenseFront, uploadVerificationLicenseBack, uploadVerificationSelfie } = await import(
      '@yayago-app/cloudinary'
    );

    const attemptId = crypto.randomUUID();

    const [frontResult, backResult, selfieResult] = await Promise.all([
      uploadVerificationLicenseFront(input.licenseFrontImage, userId, attemptId),
      uploadVerificationLicenseBack(input.licenseBackImage, userId, attemptId),
      uploadVerificationSelfie(input.selfieImage, userId, attemptId),
    ]);

    // Create new verification attempt
    await prisma.verificationAttempt.create({
      data: {
        id: attemptId,
        userId,
        licenseFrontUrl: frontResult.secure_url,
        licenseBackUrl: backResult.secure_url,
        selfieUrl: selfieResult.secure_url,
        phoneNumber: user.phoneNumber,
        status: 'PENDING',
      },
    });

    // Update user's document URLs and reset status to PENDING
    await prisma.user.update({
      where: { id: userId },
      data: {
        driverLicenseFrontUrl: frontResult.secure_url,
        driverLicenseBackUrl: backResult.secure_url,
        selfieUrl: selfieResult.secure_url,
        driverLicenseVerificationStatus: 'PENDING',
        driverLicenseRejectionReason: null,
        verificationSubmittedAt: new Date(),
      },
    });

    return {
      success: true,
      status: 'PENDING',
    };
  }
}
