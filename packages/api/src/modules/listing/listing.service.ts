import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { upload as cloudinaryUpload } from '@yayago-app/cloudinary';
import { generateSlug } from './listing.utils';
import { getLocalizedValue } from '../__shared__/utils';
import { ListingNotifications } from '../notification/notification.helpers';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
}
import type {
  CreateListingInputType,
  CreateListingOutputType,
  UpdateListingInputType,
  UpdateListingOutputType,
  UpdateListingVehicleInputType,
  UpdateListingVehicleOutputType,
  UpdateListingPricingInputType,
  UpdateListingPricingOutputType,
  UpdateListingBookingDetailsInputType,
  UpdateListingBookingDetailsOutputType,
  UpdateListingLocationInputType,
  UpdateListingLocationOutputType,
  DeleteListingInputType,
  DeleteListingOutputType,
  UpdateListingStatusInputType,
  UpdateListingStatusOutputType,
  SubmitListingForReviewInputType,
  SubmitListingForReviewOutputType,
  UpdateListingVerificationInputType,
  UpdateListingVerificationOutputType,
  UpdateMediaVerificationInputType,
  UpdateMediaVerificationOutputType,
  AddListingMediaInputType,
  AddListingMediaOutputType,
  DeleteListingMediaInputType,
  DeleteListingMediaOutputType,
  SetPrimaryMediaInputType,
  SetPrimaryMediaOutputType,
  FindOneListingInputType,
  FindOneListingOutputType,
  ListOwnListingsInputType,
  ListOwnListingsOutputType,
  ListAllListingsInputType,
  ListAllListingsOutputType,
  ListPublicListingsInputType,
  ListPublicListingsOutputType,
  GetPublicListingInputType,
  GetPublicListingOutputType,
  GetSubscriptionUsageOutputType,
} from '@yayago-app/validators';

// ============ HELPER: Get user's organization and subscription ============
interface OrganizationContext {
  userId: string;
  organizationId: string;
  membership: {
    id: string;
    role: string;
  };
  subscription: {
    id: string;
    status: string;
    plan: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    trialStart: Date | null;
    trialEnd: Date | null;
    cancelAtPeriodEnd: boolean | null;
    maxListings: number | null;
    maxFeaturedListings: number | null;
    maxMembers: number | null;
    maxImagesPerListing: number | null;
    maxVideosPerListing: number | null;
    hasAnalytics: boolean | null;
    currentListings: number;
    currentFeaturedListings: number;
    currentMembers: number;
    currentTotalImages: number;
    currentTotalVideos: number;
  };
}

async function getOrganizationContext(userId: string): Promise<OrganizationContext> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organization: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    },
    include: {
      organization: {
        include: {
          subscriptions: {
            where: {
              status: { in: ['active', 'trialing'] },
              OR: [{ periodEnd: { gte: new Date() } }, { periodEnd: null }],
            },
            orderBy: { periodEnd: 'desc' },
            take: 1,
          },
          members: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!member) {
    throw new ORPCError('FORBIDDEN', {
      message: 'No active organization membership found',
    });
  }

  const subscription = member.organization.subscriptions[0];

  if (!subscription) {
    throw new ORPCError('FORBIDDEN', {
      message: 'No active subscription found. Please subscribe to a plan.',
    });
  }

  // Check if subscription is expired (for non-trialing)
  if (subscription.status !== 'trialing' && subscription.periodEnd && subscription.periodEnd < new Date()) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Your subscription has expired. Please renew to continue.',
    });
  }

  // Check if trial has ended
  if (subscription.status === 'trialing' && subscription.trialEnd && subscription.trialEnd < new Date()) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Your trial has ended. Please subscribe to continue.',
    });
  }

  // Calculate current member count from organization
  const currentMembers = member.organization.members.length;

  return {
    userId,
    organizationId: member.organizationId,
    membership: {
      id: member.id,
      role: member.role,
    },
    subscription: {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.plan,
      periodStart: subscription.periodStart,
      periodEnd: subscription.periodEnd,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      maxListings: subscription.maxListings,
      maxFeaturedListings: subscription.maxFeaturedListings,
      maxMembers: subscription.maxMembers,
      maxImagesPerListing: subscription.maxImagesPerListing,
      maxVideosPerListing: subscription.maxVideosPerListing,
      hasAnalytics: subscription.hasAnalytics,
      currentListings: subscription.currentListings,
      currentFeaturedListings: subscription.currentFeaturedListings,
      currentMembers,
      currentTotalImages: subscription.currentTotalImages,
      currentTotalVideos: subscription.currentTotalVideos,
    },
  };
}

// ============ HELPER: Check listing ownership ============
async function getListingWithOwnershipCheck(slug: string, organizationId: string) {
  const listing = await prisma.listing.findUnique({
    where: { slug, deletedAt: null },
    include: {
      vehicle: true,
      pricing: true,
      bookingDetails: true,
      media: { orderBy: { displayOrder: 'asc' } },
    },
  });

  if (!listing) {
    throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
  }

  if (listing.organizationId !== organizationId) {
    throw new ORPCError('FORBIDDEN', { message: 'You do not own this listing' });
  }

  return listing;
}

// ============ HELPER: Check listing limits ============
function checkListingLimits(ctx: OrganizationContext, operation: 'create' | 'feature') {
  if (operation === 'create') {
    const maxListings = ctx.subscription.maxListings ?? 0;
    if (ctx.subscription.currentListings >= maxListings) {
      throw new ORPCError('FORBIDDEN', {
        message: `You have reached the maximum number of listings (${maxListings}) for your plan. Please upgrade to create more.`,
      });
    }
  }

  if (operation === 'feature') {
    const maxFeatured = ctx.subscription.maxFeaturedListings ?? 0;
    if (ctx.subscription.currentFeaturedListings >= maxFeatured) {
      throw new ORPCError('FORBIDDEN', {
        message: `You have reached the maximum number of featured listings (${maxFeatured}) for your plan.`,
      });
    }
  }
}

// ============ HELPER: Check media limits ============
function checkMediaLimits(ctx: OrganizationContext, listingMediaCount: number, type: 'IMAGE' | 'VIDEO') {
  if (type === 'IMAGE') {
    const maxImages = ctx.subscription.maxImagesPerListing ?? 5;
    if (listingMediaCount >= maxImages) {
      throw new ORPCError('FORBIDDEN', {
        message: `Maximum ${maxImages} images per listing allowed on your plan.`,
      });
    }
  }

  if (type === 'VIDEO') {
    const maxVideos = ctx.subscription.maxVideosPerListing ?? 1;
    if (listingMediaCount >= maxVideos) {
      throw new ORPCError('FORBIDDEN', {
        message: `Maximum ${maxVideos} videos per listing allowed on your plan.`,
      });
    }
  }
}

export class ListingService {
  // ============ CREATE LISTING ============
  static async create(input: CreateListingInputType, userId: string): Promise<CreateListingOutputType> {
    const ctx = await getOrganizationContext(userId);
    checkListingLimits(ctx, 'create');

    return await prisma.$transaction(async (tx) => {
      // Validate vehicle model exists
      const vehicleModel = await tx.vehicleModel.findUnique({
        where: { id: input.vehicle.modelId, deletedAt: null },
      });

      if (!vehicleModel) {
        throw new ORPCError('NOT_FOUND', { message: 'Vehicle model not found' });
      }

      // Generate unique slug
      let slug = generateSlug(input.title);
      const existingSlug = await tx.listing.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      // Create listing with all related entities
      const listing = await tx.listing.create({
        data: {
          title: input.title.trim(),
          slug,
          description: input.description?.trim() || null,
          tags: input.tags,
          organizationId: ctx.organizationId,
          status: 'DRAFT',
          verificationStatus: 'PENDING',

          // Create vehicle
          vehicle: {
            create: {
              modelId: input.vehicle.modelId,
              licensePlate: input.vehicle.licensePlate,
              vin: input.vehicle.vin,
              year: input.vehicle.year,
              trim: input.vehicle.trim,
              odometer: input.vehicle.odometer,
              class: input.vehicle.class,
              bodyType: input.vehicle.bodyType,
              fuelType: input.vehicle.fuelType,
              transmissionType: input.vehicle.transmissionType,
              driveType: input.vehicle.driveType,
              doors: input.vehicle.doors,
              seats: input.vehicle.seats,
              engineLayout: input.vehicle.engineLayout,
              engineDisplacement: input.vehicle.engineDisplacement,
              cylinders: input.vehicle.cylinders,
              horsepower: input.vehicle.horsepower,
              torque: input.vehicle.torque,
              height: input.vehicle.height,
              width: input.vehicle.width,
              length: input.vehicle.length,
              wheelbaseLength: input.vehicle.wheelbaseLength,
              curbWeight: input.vehicle.curbWeight,
              cargoCapacity: input.vehicle.cargoCapacity,
              towingCapacity: input.vehicle.towingCapacity,
              topSpeed: input.vehicle.topSpeed,
              acceleration0to100: input.vehicle.acceleration0to100,
              fuelEfficiencyCity: input.vehicle.fuelEfficiencyCity,
              fuelEfficiencyHighway: input.vehicle.fuelEfficiencyHighway,
              fuelTankCapacity: input.vehicle.fuelTankCapacity,
              batterCapacity: input.vehicle.batterCapacity,
              electricRange: input.vehicle.electricRange,
              interiorColors: input.vehicle.interiorColors,
              exteriorColors: input.vehicle.exteriorColors,
              conditionNotes: input.vehicle.conditionNotes,
              lastServiceDate: input.vehicle.lastServiceDate,
              nextServiceDue: input.vehicle.nextServiceDue,
              registrationExpiry: input.vehicle.registrationExpiry,
              insuranceExpiry: input.vehicle.insuranceExpiry,
            },
          },

          // Location (if provided)
          lat: input.location?.lat,
          lng: input.location?.lng,
          address: input.location?.address,
          cityId: input.location?.cityId,

          // Create booking details
          bookingDetails: {
            create: {
              hasInstantBooking: input.bookingDetails.hasInstantBooking,
              minAge: input.bookingDetails.minAge,
              maxAge: input.bookingDetails.maxAge,
              minRentalDays: input.bookingDetails.minRentalDays,
              maxRentalDays: input.bookingDetails.maxRentalDays,
              mileageUnit: input.bookingDetails.mileageUnit,
              maxMileagePerDay: input.bookingDetails.maxMileagePerDay,
              maxMileagePerRental: input.bookingDetails.maxMileagePerRental,
              preparationTimeMinutes: input.bookingDetails.preparationTimeMinutes,
              minNoticeHours: input.bookingDetails.minNoticeHours,
              // Delivery options
              deliveryEnabled: input.bookingDetails.deliveryEnabled ?? false,
              deliveryMaxDistance: input.bookingDetails.deliveryMaxDistance,
              deliveryBaseFee: input.bookingDetails.deliveryBaseFee,
              deliveryPerKmFee: input.bookingDetails.deliveryPerKmFee,
              deliveryFreeRadius: input.bookingDetails.deliveryFreeRadius,
              deliveryNotes: input.bookingDetails.deliveryNotes,
            },
          },

          // Create pricing
          pricing: {
            create: {
              currency: input.pricing.currency,
              pricePerHour: input.pricing.pricePerHour,
              pricePerDay: input.pricing.pricePerDay,
              pricePerThreeDays: input.pricing.pricePerThreeDays,
              pricePerWeek: input.pricing.pricePerWeek,
              pricePerMonth: input.pricing.pricePerMonth,
              weekendPricePerDay: input.pricing.weekendPricePerDay,
              depositAmount: input.pricing.depositAmount,
              securityDepositRequired: input.pricing.securityDepositRequired,
              securityDepositAmount: input.pricing.securityDepositAmount,
              acceptsSecurityDepositWaiver: input.pricing.acceptsSecurityDepositWaiver,
              securityDepositWaiverCost: input.pricing.securityDepositWaiverCost,
              cancellationPolicy: input.pricing.cancellationPolicy,
              cancellationFee: input.pricing.cancellationFee,
              refundableDepositAmount: input.pricing.refundableDepositAmount,
              cancelGracePeriodHours: input.pricing.cancelGracePeriodHours,
              taxRate: input.pricing.taxRate,
            },
          },
        },
        include: {
          vehicle: true,
        },
      });

      // Add vehicle features if provided
      if (input.vehicle.featureIds && input.vehicle.featureIds.length > 0 && listing.vehicle) {
        await tx.listingFeature.createMany({
          data: input.vehicle.featureIds.map((featureId) => ({
            listingVehicleId: listing.vehicle!.id,
            vehicleFeatureId: featureId,
            available: true,
          })),
          skipDuplicates: true,
        });
      }

      // Update subscription usage
      await tx.subscription.update({
        where: { id: ctx.subscription.id },
        data: { currentListings: { increment: 1 } },
      });

      return {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        status: listing.status,
      };
    });
  }

  // ============ UPDATE LISTING ============
  static async update(input: UpdateListingInputType, userId: string): Promise<UpdateListingOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: input.data.title?.trim(),
        description: input.data.description?.trim(),
        tags: input.data.tags,
      },
    });

    return {
      slug: updated.slug,
      title: updated.title,
      updatedAt: updated.updatedAt,
    };
  }

  // ============ UPDATE VEHICLE ============
  static async updateVehicle(
    input: UpdateListingVehicleInputType,
    userId: string
  ): Promise<UpdateListingVehicleOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    if (!listing.vehicle) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle not found for this listing' });
    }

    // Validate model if being changed
    if (input.data.modelId) {
      const model = await prisma.vehicleModel.findUnique({
        where: { id: input.data.modelId, deletedAt: null },
      });
      if (!model) {
        throw new ORPCError('NOT_FOUND', { message: 'Vehicle model not found' });
      }
    }

    await prisma.listingVehicle.update({
      where: { id: listing.vehicle.id },
      data: input.data,
    });

    // Update features if provided
    if (input.data.featureIds) {
      await prisma.listingFeature.deleteMany({
        where: { listingVehicleId: listing.vehicle.id },
      });

      if (input.data.featureIds.length > 0) {
        await prisma.listingFeature.createMany({
          data: input.data.featureIds.map((featureId) => ({
            listingVehicleId: listing.vehicle!.id,
            vehicleFeatureId: featureId,
            available: true,
          })),
        });
      }
    }

    return {
      slug: listing.slug,
      updatedAt: new Date(),
    };
  }

  // ============ UPDATE PRICING ============
  static async updatePricing(
    input: UpdateListingPricingInputType,
    userId: string
  ): Promise<UpdateListingPricingOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    if (!listing.pricing) {
      throw new ORPCError('NOT_FOUND', { message: 'Pricing not found for this listing' });
    }

    await prisma.listingPricing.update({
      where: { id: listing.pricing.id },
      data: input.data,
    });

    return {
      slug: listing.slug,
      updatedAt: new Date(),
    };
  }

  // ============ UPDATE BOOKING DETAILS ============
  static async updateBookingDetails(
    input: UpdateListingBookingDetailsInputType,
    userId: string
  ): Promise<UpdateListingBookingDetailsOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    if (!listing.bookingDetails) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking details not found for this listing' });
    }

    await prisma.listingBookingDetails.update({
      where: { id: listing.bookingDetails.id },
      data: input.data,
    });

    return {
      slug: listing.slug,
      updatedAt: new Date(),
    };
  }

  // ============ UPDATE LISTING LOCATION ============
  static async updateLocation(
    input: UpdateListingLocationInputType,
    userId: string
  ): Promise<UpdateListingLocationOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    // Validate city if provided and not null
    if (input.data.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: input.data.cityId, deletedAt: null },
      });
      if (!city) {
        throw new ORPCError('NOT_FOUND', { message: 'City not found' });
      }
    }

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        lat: input.data.lat,
        lng: input.data.lng,
        address: input.data.address,
        cityId: input.data.cityId ?? undefined,
      },
    });

    // Return null location if cleared (using org default)
    const hasLocation = updated.lat !== null && updated.lng !== null;

    return {
      slug: updated.slug,
      updatedAt: updated.updatedAt,
      location: hasLocation
        ? {
            lat: updated.lat!,
            lng: updated.lng!,
            address: updated.address || '',
          }
        : null,
    };
  }

  // ============ DELETE LISTING ============
  static async delete(input: DeleteListingInputType, userId: string): Promise<DeleteListingOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    // Check if listing has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        listingId: listing.id,
        status: { in: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
      },
    });

    if (activeBookings > 0) {
      throw new ORPCError('CONFLICT', {
        message: 'Cannot delete listing with active bookings',
      });
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete
      await tx.listing.update({
        where: { id: listing.id },
        data: { deletedAt: new Date(), status: 'ARCHIVED' },
      });

      // Update subscription usage
      await tx.subscription.update({
        where: { id: ctx.subscription.id },
        data: {
          currentListings: { decrement: 1 },
          ...(listing.isFeatured ? { currentFeaturedListings: { decrement: 1 } } : {}),
        },
      });
    });

    return { slug: input.slug };
  }

  // ============ UPDATE STATUS ============
  static async updateStatus(
    input: UpdateListingStatusInputType,
    userId: string
  ): Promise<UpdateListingStatusOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    // Can't change status if pending verification
    if (listing.verificationStatus === 'PENDING' && listing.status === 'PENDING_VERIFICATION') {
      throw new ORPCError('FORBIDDEN', {
        message: 'Cannot change status while listing is pending verification',
      });
    }

    // Can't make available if not approved
    if (input.status === 'AVAILABLE' && listing.verificationStatus !== 'APPROVED') {
      throw new ORPCError('FORBIDDEN', {
        message: 'Listing must be approved before it can be made available',
      });
    }

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: { status: input.status },
    });

    return {
      slug: updated.slug,
      status: updated.status,
    };
  }

  // ============ SUBMIT FOR REVIEW ============
  static async submitForReview(
    input: SubmitListingForReviewInputType,
    userId: string
  ): Promise<SubmitListingForReviewOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    // Validate listing is complete
    if (!listing.vehicle) {
      throw new ORPCError('BAD_REQUEST', { message: 'Vehicle information is required' });
    }
    if (!listing.pricing) {
      throw new ORPCError('BAD_REQUEST', { message: 'Pricing information is required' });
    }
    if (!listing.bookingDetails) {
      throw new ORPCError('BAD_REQUEST', { message: 'Booking details are required' });
    }
    if (listing.media.length === 0) {
      throw new ORPCError('BAD_REQUEST', { message: 'At least one image is required' });
    }

    // Check if already pending or approved
    if (listing.verificationStatus === 'PENDING' && listing.status === 'PENDING_VERIFICATION') {
      throw new ORPCError('CONFLICT', { message: 'Listing is already pending review' });
    }

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING',
      },
    });

    return {
      slug: updated.slug,
      status: updated.status,
      verificationStatus: updated.verificationStatus,
    };
  }

  // ============ UPDATE VERIFICATION (Admin) ============
  static async updateVerification(
    input: UpdateListingVerificationInputType
  ): Promise<UpdateListingVerificationOutputType> {
    const MIN_APPROVED_IMAGES = 4;

    const listing = await prisma.listing.findUnique({
      where: { slug: input.slug, deletedAt: null },
      include: {
        media: {
          where: { deletedAt: null },
        },
        organization: {
          include: {
            members: {
              where: { role: 'owner' },
              select: { userId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    // If approving, check for minimum verified images
    if (input.verificationStatus === 'APPROVED') {
      const approvedImagesCount = listing.media.filter(
        (m) => m.type === 'IMAGE' && m.verificationStatus === 'APPROVED'
      ).length;

      if (approvedImagesCount < MIN_APPROVED_IMAGES) {
        throw new ORPCError('PRECONDITION_FAILED', {
          message: `Listing requires at least ${MIN_APPROVED_IMAGES} approved images. Currently has ${approvedImagesCount} approved.`,
        });
      }
    }

    const newStatus =
      input.verificationStatus === 'APPROVED'
        ? 'AVAILABLE'
        : input.verificationStatus === 'REJECTED'
          ? 'DRAFT'
          : listing.status;

    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        verificationStatus: input.verificationStatus,
        status: newStatus,
        // Store rejection reason in metadata or a separate field if needed
      },
    });

    // Notify listing owner about verification status
    const ownerUserId = listing.organization.members[0]?.userId;
    if (ownerUserId) {
      if (input.verificationStatus === 'APPROVED') {
        await ListingNotifications.approved({
          listingId: listing.id,
          userId: ownerUserId,
          listingTitle: listing.title,
          organizationId: listing.organizationId,
        }).catch((err) => console.error('Failed to send listing approved notification:', err));
      } else if (input.verificationStatus === 'REJECTED') {
        await ListingNotifications.rejected({
          listingId: listing.id,
          userId: ownerUserId,
          listingTitle: listing.title,
          reason: input.reason,
          organizationId: listing.organizationId,
        }).catch((err) => console.error('Failed to send listing rejected notification:', err));
      }
    }

    return {
      slug: updated.slug,
      verificationStatus: updated.verificationStatus,
      status: updated.status,
    };
  }

  // ============ UPDATE MEDIA VERIFICATION (Admin) ============
  static async updateMediaVerification(
    input: UpdateMediaVerificationInputType
  ): Promise<UpdateMediaVerificationOutputType> {
    const media = await prisma.listingMedia.findUnique({
      where: { id: input.mediaId, deletedAt: null },
    });

    if (!media) {
      throw new ORPCError('NOT_FOUND', { message: 'Media not found' });
    }

    const updated = await prisma.listingMedia.update({
      where: { id: media.id },
      data: {
        verificationStatus: input.verificationStatus,
      },
    });

    return {
      id: updated.id,
      verificationStatus: updated.verificationStatus,
    };
  }

  // ============ ADD MEDIA ============
  static async addMedia(input: AddListingMediaInputType, userId: string): Promise<AddListingMediaOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    // Count existing media by type
    const mediaType = input.media.type;
    const existingCount = listing.media.filter((m) => m.type === mediaType).length;

    checkMediaLimits(ctx, existingCount, mediaType as 'IMAGE' | 'VIDEO');

    // Determine if URL is a base64 data URL that needs uploading
    let finalUrl = input.media.url;
    let publicId: string | undefined;
    let finalWidth = input.media.width;
    let finalHeight = input.media.height;
    let finalSize = input.media.size;
    let finalMimeType = input.media.mimeType;

    if (input.media.url.startsWith('data:')) {
      // Upload to Cloudinary
      const folder = `yayago/listings/${ctx.organizationId}/${listing.slug}`;
      const resourceType = mediaType === 'VIDEO' ? 'video' : 'image';

      try {
        const uploadResult = await cloudinaryUpload(input.media.url, {
          folder,
          resource_type: resourceType,
          allowed_formats:
            mediaType === 'VIDEO' ? ['mp4', 'mov', 'webm', 'avi'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        });

        finalUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        finalWidth = uploadResult.width || input.media.width;
        finalHeight = uploadResult.height || input.media.height;
        finalSize = uploadResult.bytes || input.media.size;
        finalMimeType = uploadResult.format || input.media.mimeType;
      } catch (error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Failed to upload media to storage' });
      }
    }

    // Get max display order
    const maxOrder = listing.media.length > 0 ? Math.max(...listing.media.map((m) => m.displayOrder)) : -1;

    // If setting as primary, unset other primaries
    if (input.media.isPrimary) {
      await prisma.listingMedia.updateMany({
        where: { listingId: listing.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const media = await prisma.listingMedia.create({
      data: {
        listingId: listing.id,
        type: input.media.type,
        url: finalUrl,
        publicId: publicId ?? '',
        alt: input.media.alt,
        caption: input.media.caption,
        width: finalWidth,
        height: finalHeight,
        size: finalSize,
        mimeType: finalMimeType,
        isPrimary: input.media.isPrimary || listing.media.length === 0, // First media is primary by default
        displayOrder: maxOrder + 1,
        status: 'ACTIVE',
        verificationStatus: 'PENDING',
      },
    });

    // Update subscription usage
    await prisma.subscription.update({
      where: { id: ctx.subscription.id },
      data: {
        ...(mediaType === 'IMAGE' ? { currentTotalImages: { increment: 1 } } : {}),
        ...(mediaType === 'VIDEO' ? { currentTotalVideos: { increment: 1 } } : {}),
      },
    });

    return {
      id: media.id,
      url: media.url,
      isPrimary: media.isPrimary,
    };
  }

  // ============ DELETE MEDIA ============
  static async deleteMedia(input: DeleteListingMediaInputType, userId: string): Promise<DeleteListingMediaOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    const media = listing.media.find((m) => m.id === input.mediaId);
    if (!media) {
      throw new ORPCError('NOT_FOUND', { message: 'Media not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.listingMedia.delete({
        where: { id: media.id },
      });

      // If deleted media was primary, set another as primary
      if (media.isPrimary) {
        const nextMedia = listing.media.find((m) => m.id !== media.id);
        if (nextMedia) {
          await tx.listingMedia.update({
            where: { id: nextMedia.id },
            data: { isPrimary: true },
          });
        }
      }

      // Update subscription usage
      await tx.subscription.update({
        where: { id: ctx.subscription.id },
        data: {
          ...(media.type === 'IMAGE' ? { currentTotalImages: { decrement: 1 } } : {}),
          ...(media.type === 'VIDEO' ? { currentTotalVideos: { decrement: 1 } } : {}),
        },
      });
    });

    return { success: true };
  }

  // ============ SET PRIMARY MEDIA ============
  static async setPrimaryMedia(input: SetPrimaryMediaInputType, userId: string): Promise<SetPrimaryMediaOutputType> {
    const ctx = await getOrganizationContext(userId);
    const listing = await getListingWithOwnershipCheck(input.slug, ctx.organizationId);

    const media = listing.media.find((m) => m.id === input.mediaId);
    if (!media) {
      throw new ORPCError('NOT_FOUND', { message: 'Media not found' });
    }

    await prisma.$transaction([
      prisma.listingMedia.updateMany({
        where: { listingId: listing.id, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.listingMedia.update({
        where: { id: media.id },
        data: { isPrimary: true },
      }),
    ]);

    return { success: true };
  }

  // ============ FIND ONE (Partner) ============
  static async findOne(
    input: FindOneListingInputType,
    userId: string,
    locale: string
  ): Promise<FindOneListingOutputType> {
    const ctx = await getOrganizationContext(userId);

    const listing = await prisma.listing.findUnique({
      where: { slug: input.slug, organizationId: ctx.organizationId, deletedAt: null },
      include: {
        vehicle: {
          include: {
            model: {
              include: {
                brand: true,
              },
            },
            features: {
              include: {
                vehicleFeature: true,
              },
            },
          },
        },
        pricing: true,
        bookingDetails: true,
        media: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
        organization: true,
      },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      tags: listing.tags,
      status: listing.status,
      verificationStatus: listing.verificationStatus,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      reviewCount: listing.reviewCount,
      averageRating: listing.averageRating,
      isFeatured: listing.isFeatured,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      vehicle: listing.vehicle
        ? {
            id: listing.vehicle.id,
            licensePlate: listing.vehicle.licensePlate,
            vin: listing.vehicle.vin,
            year: listing.vehicle.year,
            trim: listing.vehicle.trim,
            odometer: listing.vehicle.odometer,
            class: listing.vehicle.class,
            bodyType: listing.vehicle.bodyType,
            fuelType: listing.vehicle.fuelType,
            transmissionType: listing.vehicle.transmissionType,
            driveType: listing.vehicle.driveType,
            doors: listing.vehicle.doors,
            seats: listing.vehicle.seats,
            engineLayout: listing.vehicle.engineLayout,
            engineDisplacement: listing.vehicle.engineDisplacement,
            cylinders: listing.vehicle.cylinders,
            horsepower: listing.vehicle.horsepower,
            torque: listing.vehicle.torque,
            interiorColors: listing.vehicle.interiorColors,
            exteriorColors: listing.vehicle.exteriorColors,
            conditionNotes: listing.vehicle.conditionNotes,
            model: {
              slug: listing.vehicle.model.slug,
              name: getLocalizedValue(listing.vehicle.model.name, locale),
              brand: {
                slug: listing.vehicle.model.brand.slug,
                name: getLocalizedValue(listing.vehicle.model.brand.name, locale),
                logo: listing.vehicle.model.brand.logo,
              },
            },
            features: listing.vehicle.features.map((f) => ({
              id: f.vehicleFeature.id,
              code: f.vehicleFeature.code,
              name: getLocalizedValue(f.vehicleFeature.name, locale),
              category: f.vehicleFeature.category,
            })),
          }
        : null,
      pricing: listing.pricing,
      bookingDetails: listing.bookingDetails
        ? {
            ...listing.bookingDetails,
            deliveryEnabled: listing.bookingDetails.deliveryEnabled ?? false,
            deliveryMaxDistance: listing.bookingDetails.deliveryMaxDistance,
            deliveryBaseFee: listing.bookingDetails.deliveryBaseFee,
            deliveryPerKmFee: listing.bookingDetails.deliveryPerKmFee,
            deliveryFreeRadius: listing.bookingDetails.deliveryFreeRadius,
            deliveryNotes: listing.bookingDetails.deliveryNotes,
          }
        : null,
      lat: listing.lat,
      lng: listing.lng,
      address: listing.address,
      media: listing.media.map((m) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        verificationStatus: m.verificationStatus,
        isPrimary: m.isPrimary,
        url: m.url,
        alt: m.alt,
        width: m.width,
        height: m.height,
        displayOrder: m.displayOrder,
      })),
      organization: {
        id: listing.organization.id,
        name: listing.organization.name,
        slug: listing.organization.slug,
        logo: listing.organization.logo,
        lat: listing.organization.lat,
        lng: listing.organization.lng,
        address: listing.organization.address,
      },
    };
  }

  // ============ LIST OWN LISTINGS (Partner) ============
  static async listOwn(
    input: ListOwnListingsInputType,
    userId: string,
    locale: string
  ): Promise<ListOwnListingsOutputType> {
    const ctx = await getOrganizationContext(userId);
    const { page, take, q, status, verificationStatus } = input;

    const listings = await prisma.listing.findMany({
      where: {
        organizationId: ctx.organizationId,
        deletedAt: null,
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } },
          ],
        }),
        ...(status && { status }),
        ...(verificationStatus && { verificationStatus }),
      },
      skip: (page - 1) * take,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        media: {
          where: { isPrimary: true, deletedAt: null },
          take: 1,
        },
        vehicle: {
          include: {
            model: {
              include: { brand: true },
            },
          },
        },
        pricing: true,
      },
    });

    const total = await prisma.listing.count({
      where: {
        organizationId: ctx.organizationId,
        deletedAt: null,
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } },
          ],
        }),
        ...(status && { status }),
        ...(verificationStatus && { verificationStatus }),
      },
    });

    const items = listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      status: listing.status,
      verificationStatus: listing.verificationStatus,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      averageRating: listing.averageRating,
      createdAt: listing.createdAt,
      primaryMedia: listing.media[0]
        ? {
            url: listing.media[0].url,
            alt: listing.media[0].alt,
          }
        : null,
      vehicle: listing.vehicle
        ? {
            year: listing.vehicle.year,
            model: {
              name: getLocalizedValue(listing.vehicle.model.name, locale),
              brand: {
                name: getLocalizedValue(listing.vehicle.model.brand.name, locale),
              },
            },
          }
        : null,
      pricing: listing.pricing
        ? {
            pricePerDay: listing.pricing.pricePerDay,
            currency: listing.pricing.currency,
          }
        : null,
    }));

    return {
      items,
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST ALL LISTINGS (Admin) ============
  static async listAll(input: ListAllListingsInputType, locale: string): Promise<ListAllListingsOutputType> {
    const { page, take, q, status, verificationStatus, organizationId } = input;

    const whereClause = {
      deletedAt: null,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { slug: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(verificationStatus && { verificationStatus }),
      ...(organizationId && { organizationId }),
    };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: true,
        media: {
          where: { isPrimary: true, deletedAt: null },
          take: 1,
        },
        vehicle: {
          include: {
            model: {
              include: { brand: true },
            },
          },
        },
        pricing: true,
      },
    });

    const total = await prisma.listing.count({ where: whereClause });

    const items = listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      status: listing.status,
      verificationStatus: listing.verificationStatus,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      createdAt: listing.createdAt,
      organization: {
        id: listing.organization.id,
        name: listing.organization.name,
        slug: listing.organization.slug,
      },
      primaryMedia: listing.media[0]
        ? {
            url: listing.media[0].url,
            alt: listing.media[0].alt,
          }
        : null,
      vehicle: listing.vehicle
        ? {
            year: listing.vehicle.year,
            model: {
              name: getLocalizedValue(listing.vehicle.model.name, locale),
              brand: {
                name: getLocalizedValue(listing.vehicle.model.brand.name, locale),
              },
            },
          }
        : null,
      pricing: listing.pricing
        ? {
            pricePerDay: listing.pricing.pricePerDay,
            currency: listing.pricing.currency,
          }
        : null,
    }));

    return {
      items,
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ ADMIN FIND ONE LISTING ============
  static async adminFindOne(input: FindOneListingInputType, locale: string): Promise<FindOneListingOutputType> {
    const listing = await prisma.listing.findUnique({
      where: { slug: input.slug, deletedAt: null },
      include: {
        vehicle: {
          include: {
            model: {
              include: {
                brand: true,
              },
            },
            features: {
              include: {
                vehicleFeature: true,
              },
            },
          },
        },
        pricing: true,
        bookingDetails: true,
        media: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
        organization: true,
      },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      tags: listing.tags,
      status: listing.status,
      verificationStatus: listing.verificationStatus,
      viewCount: listing.viewCount,
      bookingCount: listing.bookingCount,
      reviewCount: listing.reviewCount,
      averageRating: listing.averageRating,
      isFeatured: listing.isFeatured,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      vehicle: listing.vehicle
        ? {
            id: listing.vehicle.id,
            licensePlate: listing.vehicle.licensePlate,
            vin: listing.vehicle.vin,
            year: listing.vehicle.year,
            trim: listing.vehicle.trim,
            odometer: listing.vehicle.odometer,
            class: listing.vehicle.class,
            bodyType: listing.vehicle.bodyType,
            fuelType: listing.vehicle.fuelType,
            transmissionType: listing.vehicle.transmissionType,
            driveType: listing.vehicle.driveType,
            doors: listing.vehicle.doors,
            seats: listing.vehicle.seats,
            engineLayout: listing.vehicle.engineLayout,
            engineDisplacement: listing.vehicle.engineDisplacement,
            cylinders: listing.vehicle.cylinders,
            horsepower: listing.vehicle.horsepower,
            torque: listing.vehicle.torque,
            interiorColors: listing.vehicle.interiorColors,
            exteriorColors: listing.vehicle.exteriorColors,
            conditionNotes: listing.vehicle.conditionNotes,
            model: {
              slug: listing.vehicle.model.slug,
              name: getLocalizedValue(listing.vehicle.model.name, locale),
              brand: {
                slug: listing.vehicle.model.brand.slug,
                name: getLocalizedValue(listing.vehicle.model.brand.name, locale),
                logo: listing.vehicle.model.brand.logo,
              },
            },
            features: listing.vehicle.features.map((f) => ({
              id: f.vehicleFeature.id,
              code: f.vehicleFeature.code,
              name: getLocalizedValue(f.vehicleFeature.name, locale),
              category: f.vehicleFeature.category,
            })),
          }
        : null,
      pricing: listing.pricing,
      bookingDetails: listing.bookingDetails
        ? {
            ...listing.bookingDetails,
            deliveryEnabled: listing.bookingDetails.deliveryEnabled ?? false,
            deliveryMaxDistance: listing.bookingDetails.deliveryMaxDistance,
            deliveryBaseFee: listing.bookingDetails.deliveryBaseFee,
            deliveryPerKmFee: listing.bookingDetails.deliveryPerKmFee,
            deliveryFreeRadius: listing.bookingDetails.deliveryFreeRadius,
            deliveryNotes: listing.bookingDetails.deliveryNotes,
          }
        : null,
      lat: listing.lat,
      lng: listing.lng,
      address: listing.address,
      media: listing.media.map((m) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        verificationStatus: m.verificationStatus,
        isPrimary: m.isPrimary,
        url: m.url,
        alt: m.alt,
        width: m.width,
        height: m.height,
        displayOrder: m.displayOrder,
      })),
      organization: {
        id: listing.organization.id,
        name: listing.organization.name,
        slug: listing.organization.slug,
        logo: listing.organization.logo,
        lat: listing.organization.lat,
        lng: listing.organization.lng,
        address: listing.organization.address,
      },
    };
  }

  // ============ LIST PUBLIC LISTINGS ============
  static async listPublic(input: ListPublicListingsInputType, locale: string): Promise<ListPublicListingsOutputType> {
    const { page, take, q, cityCode, sortBy, lat, lng, radius, startDate, endDate } = input;

    // Build vehicle filter properly to avoid overwriting
    const vehicleFilter: Record<string, unknown> = {};
    if (input.vehicleClass) vehicleFilter.class = input.vehicleClass;
    if (input.bodyType) vehicleFilter.bodyType = input.bodyType;
    if (input.fuelType) vehicleFilter.fuelType = input.fuelType;
    if (input.transmissionType) vehicleFilter.transmissionType = input.transmissionType;

    // Handle seats range
    if (input.minSeats || input.maxSeats) {
      vehicleFilter.seats = {
        ...(input.minSeats && { gte: input.minSeats }),
        ...(input.maxSeats && { lte: input.maxSeats }),
      };
    }

    // Handle year range
    if (input.minYear || input.maxYear) {
      vehicleFilter.year = {
        ...(input.minYear && { gte: input.minYear }),
        ...(input.maxYear && { lte: input.maxYear }),
      };
    }

    // Handle doors range
    if (input.minDoors || input.maxDoors) {
      vehicleFilter.doors = {
        ...(input.minDoors && { gte: input.minDoors }),
        ...(input.maxDoors && { lte: input.maxDoors }),
      };
    }

    // Handle brand and model
    if (input.brandSlug || input.modelSlug) {
      vehicleFilter.model = {
        ...(input.modelSlug && { slug: input.modelSlug }),
        ...(input.brandSlug && !input.modelSlug && { brand: { slug: input.brandSlug } }),
      };
    }

    // Build pricing filter
    const pricingFilter: Record<string, unknown> = {};
    if (input.minPrice || input.maxPrice) {
      pricingFilter.pricePerDay = {
        ...(input.minPrice && { gte: input.minPrice }),
        ...(input.maxPrice && { lte: input.maxPrice }),
      };
    }
    if (input.hasNoDeposit) {
      pricingFilter.depositAmount = 0;
    }

    // Build booking details filter
    const bookingDetailsFilter: Record<string, unknown> = {};
    if (input.hasInstantBooking) bookingDetailsFilter.hasInstantBooking = true;
    if (input.hasFreeCancellation) bookingDetailsFilter.allowsCancellation = true;
    if (input.hasDelivery) bookingDetailsFilter.deliveryEnabled = true;

    // Get listings with conflicting bookings if date range is provided
    let unavailableListingIds: string[] = [];
    if (startDate && endDate) {
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
          OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
        },
        select: { listingId: true },
      });
      unavailableListingIds = conflictingBookings.map((b) => b.listingId);
    }

    const whereClause = {
      deletedAt: null,
      status: 'AVAILABLE' as const,
      verificationStatus: 'APPROVED' as const,
      // Exclude unavailable listings if dates provided
      ...(unavailableListingIds.length > 0 && { id: { notIn: unavailableListingIds } }),
      organization: {
        status: 'ACTIVE' as const,
        deletedAt: null,
        ...(cityCode && {
          city: { code: cityCode },
        }),
        // Filter for organizations with location data when location search is active
        ...(lat !== undefined && lng !== undefined && { lat: { not: null }, lng: { not: null } }),
      },
      ...(q && {
        OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { tags: { hasSome: [q.toLowerCase()] } }],
      }),
      ...(Object.keys(vehicleFilter).length > 0 && { vehicle: vehicleFilter }),
      ...(Object.keys(pricingFilter).length > 0 && { pricing: pricingFilter }),
      ...(Object.keys(bookingDetailsFilter).length > 0 && { bookingDetails: bookingDetailsFilter }),
      ...(input.isFeatured && { isFeatured: true }),
    };

    // Note: For distance-based sorting, we need to sort in JS after fetching
    const orderByClause =
      sortBy === 'price_asc'
        ? { pricing: { pricePerDay: 'asc' as const } }
        : sortBy === 'price_desc'
          ? { pricing: { pricePerDay: 'desc' as const } }
          : sortBy === 'popular'
            ? { bookingCount: 'desc' as const }
            : sortBy === 'rating'
              ? { averageRating: 'desc' as const }
              : { createdAt: 'desc' as const };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take,
      orderBy: orderByClause,
      include: {
        organization: true,
        media: {
          where: { isPrimary: true, deletedAt: null, verificationStatus: 'APPROVED' },
          take: 1,
        },
        vehicle: {
          include: {
            model: {
              include: { brand: true },
            },
          },
        },
        pricing: true,
        bookingDetails: true,
      },
    });

    const total = await prisma.listing.count({ where: whereClause });

    // Get first approved image as fallback if primary is not approved
    const items = await Promise.all(
      listings.map(async (listing) => {
        let primaryMedia = listing.media[0]
          ? {
              url: listing.media[0].url,
              alt: listing.media[0].alt,
            }
          : null;

        // If no approved primary image, try to get any approved image
        if (!primaryMedia) {
          const fallbackMedia = await prisma.listingMedia.findFirst({
            where: {
              listingId: listing.id,
              deletedAt: null,
              verificationStatus: 'APPROVED',
            },
            orderBy: { displayOrder: 'asc' },
          });
          if (fallbackMedia) {
            primaryMedia = {
              url: fallbackMedia.url,
              alt: fallbackMedia.alt,
            };
          }
        }

        // Get effective location (listing location or fallback to organization location)
        const effectiveLat = listing.lat ?? listing.organization.lat;
        const effectiveLng = listing.lng ?? listing.organization.lng;
        const effectiveAddress = listing.address ?? listing.organization.address;

        // Calculate distance if user location provided
        let distance: number | undefined;
        if (lat !== undefined && lng !== undefined && effectiveLat && effectiveLng) {
          distance = calculateDistance(lat, lng, effectiveLat, effectiveLng);
        }

        // Calculate total price if dates provided
        let totalPrice: number | undefined;
        let totalDays: number | undefined;
        if (startDate && endDate) {
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalPrice = listing.pricing!.pricePerDay * totalDays;
        }

        return {
          id: listing.id,
          slug: listing.slug,
          title: listing.title,
          averageRating: listing.averageRating,
          reviewCount: listing.reviewCount,
          isFeatured: listing.isFeatured,
          primaryMedia,
          vehicle: {
            year: listing.vehicle!.year,
            class: listing.vehicle!.class,
            bodyType: listing.vehicle!.bodyType,
            fuelType: listing.vehicle!.fuelType,
            transmissionType: listing.vehicle!.transmissionType,
            seats: listing.vehicle!.seats,
            model: {
              name: getLocalizedValue(listing.vehicle!.model.name, locale),
              brand: {
                name: getLocalizedValue(listing.vehicle!.model.brand.name, locale),
                logo: listing.vehicle!.model.brand.logo,
              },
            },
          },
          pricing: {
            pricePerDay: listing.pricing!.pricePerDay,
            currency: listing.pricing!.currency,
            totalPrice,
            totalDays,
          },
          bookingDetails: {
            hasInstantBooking: listing.bookingDetails!.hasInstantBooking,
            deliveryEnabled: listing.bookingDetails!.deliveryEnabled,
            deliveryBaseFee: listing.bookingDetails!.deliveryBaseFee,
          },
          organization: {
            name: listing.organization.name,
            slug: listing.organization.slug,
          },
          location:
            effectiveLat && effectiveLng
              ? {
                  lat: effectiveLat,
                  lng: effectiveLng,
                  address: effectiveAddress,
                  distance,
                }
              : null,
        };
      })
    );

    // Filter by radius if specified
    let filteredItems = items;
    if (lat !== undefined && lng !== undefined && radius) {
      filteredItems = items.filter((item) => {
        if (!item.location?.distance) return false;
        return item.location.distance <= radius;
      });
    }

    // Sort by distance if requested
    if (sortBy === 'distance' && lat !== undefined && lng !== undefined) {
      filteredItems.sort((a, b) => {
        const distA = a.location?.distance ?? Infinity;
        const distB = b.location?.distance ?? Infinity;
        return distA - distB;
      });
    }

    return {
      items: filteredItems,
      pagination: {
        page,
        take,
        total: radius ? filteredItems.length : total,
        totalPages: Math.ceil((radius ? filteredItems.length : total) / take),
      },
    };
  }

  // ============ GET PUBLIC LISTING DETAILS ============
  static async getPublicListing(input: GetPublicListingInputType, locale: string): Promise<GetPublicListingOutputType> {
    const listing = await prisma.listing.findFirst({
      where: {
        slug: input.slug,
        deletedAt: null,
        status: 'AVAILABLE',
        verificationStatus: 'APPROVED',
        organization: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      include: {
        organization: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
        city: true, // Listing's city (where the car is located)
        media: {
          where: { deletedAt: null, verificationStatus: 'APPROVED' },
          orderBy: { displayOrder: 'asc' },
        },
        vehicle: {
          include: {
            model: {
              include: { brand: true },
            },
            features: {
              include: { vehicleFeature: true },
            },
          },
        },
        pricing: true,
        bookingDetails: true,
      },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      tags: listing.tags,
      averageRating: listing.averageRating,
      reviewCount: listing.reviewCount,
      isFeatured: listing.isFeatured,
      vehicle: {
        year: listing.vehicle!.year,
        class: listing.vehicle!.class,
        bodyType: listing.vehicle!.bodyType,
        fuelType: listing.vehicle!.fuelType,
        transmissionType: listing.vehicle!.transmissionType,
        driveType: listing.vehicle!.driveType,
        doors: listing.vehicle!.doors,
        seats: listing.vehicle!.seats,
        engineLayout: listing.vehicle!.engineLayout,
        engineDisplacement: listing.vehicle!.engineDisplacement,
        cylinders: listing.vehicle!.cylinders,
        horsepower: listing.vehicle!.horsepower,
        torque: listing.vehicle!.torque,
        interiorColors: listing.vehicle!.interiorColors,
        exteriorColors: listing.vehicle!.exteriorColors,
        model: {
          name: getLocalizedValue(listing.vehicle!.model.name, locale),
          slug: listing.vehicle!.model.slug,
          brand: {
            name: getLocalizedValue(listing.vehicle!.model.brand.name, locale),
            slug: listing.vehicle!.model.brand.slug,
            logo: listing.vehicle!.model.brand.logo,
          },
        },
        features: listing.vehicle!.features.map((f) => ({
          code: f.vehicleFeature.code,
          name: getLocalizedValue(f.vehicleFeature.name, locale),
          category: f.vehicleFeature.category,
          iconKey: f.vehicleFeature.iconKey,
        })),
      },
      pricing: {
        currency: listing.pricing!.currency,
        pricePerHour: listing.pricing!.pricePerHour,
        pricePerDay: listing.pricing!.pricePerDay,
        pricePerThreeDays: listing.pricing!.pricePerThreeDays,
        pricePerWeek: listing.pricing!.pricePerWeek,
        pricePerMonth: listing.pricing!.pricePerMonth,
        weekendPricePerDay: listing.pricing!.weekendPricePerDay,
        depositAmount: listing.pricing!.depositAmount,
        securityDepositRequired: listing.pricing!.securityDepositRequired,
        securityDepositAmount: listing.pricing!.securityDepositAmount,
        cancellationPolicy: listing.pricing!.cancellationPolicy,
        taxRate: listing.pricing!.taxRate,
      },
      bookingDetails: {
        hasInstantBooking: listing.bookingDetails!.hasInstantBooking,
        minAge: listing.bookingDetails!.minAge,
        maxAge: listing.bookingDetails!.maxAge,
        minRentalDays: listing.bookingDetails!.minRentalDays,
        maxRentalDays: listing.bookingDetails!.maxRentalDays,
        mileageUnit: listing.bookingDetails!.mileageUnit,
        maxMileagePerDay: listing.bookingDetails!.maxMileagePerDay,
        maxMileagePerRental: listing.bookingDetails!.maxMileagePerRental,
        minNoticeHours: listing.bookingDetails!.minNoticeHours,
        // Delivery options
        deliveryEnabled: listing.bookingDetails!.deliveryEnabled,
        deliveryMaxDistance: listing.bookingDetails!.deliveryMaxDistance,
        deliveryBaseFee: listing.bookingDetails!.deliveryBaseFee,
        deliveryPerKmFee: listing.bookingDetails!.deliveryPerKmFee,
        deliveryFreeRadius: listing.bookingDetails!.deliveryFreeRadius,
        deliveryNotes: listing.bookingDetails!.deliveryNotes,
      },
      // Location where the car is located (fallback to organization's location)
      location: (() => {
        const effectiveLat = listing.lat ?? listing.organization.lat;
        const effectiveLng = listing.lng ?? listing.organization.lng;
        const effectiveAddress = listing.address ?? listing.organization.address;
        const effectiveCity = listing.city ?? listing.organization.city;

        if (!effectiveLat || !effectiveLng) return null;

        return {
          lat: effectiveLat,
          lng: effectiveLng,
          address: effectiveAddress,
          city: effectiveCity
            ? {
                name: getLocalizedValue(effectiveCity.name, locale),
                code: effectiveCity.code,
              }
            : null,
        };
      })(),
      media: listing.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        alt: m.alt,
        isPrimary: m.isPrimary,
        width: m.width,
        height: m.height,
      })),
      organization: {
        name: listing.organization.name,
        slug: listing.organization.slug,
        logo: listing.organization.logo,
        phoneNumber: listing.organization.phoneNumber,
        email: listing.organization.email,
        address: listing.organization.address,
        city: listing.organization.city
          ? {
              name: getLocalizedValue(listing.organization.city.name, locale),
              country: {
                name: getLocalizedValue(listing.organization.city.country.name, locale),
              },
            }
          : null,
      },
    };
  }

  // ============ GET SUBSCRIPTION USAGE ============
  static async getSubscriptionUsage(userId: string, locale: string): Promise<GetSubscriptionUsageOutputType> {
    const ctx = await getOrganizationContext(userId);

    // Get plan name for display
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { slug: ctx.subscription.plan },
    });

    const maxMembers = ctx.subscription.maxMembers ?? 1;
    const currentMembers = ctx.subscription.currentMembers;

    return {
      plan: {
        name: plan ? getLocalizedValue(plan.name, locale) : ctx.subscription.plan,
        slug: ctx.subscription.plan,
        maxMembers,
        hasAnalytics: ctx.subscription.hasAnalytics ?? false,
      },
      usage: {
        listings: {
          current: ctx.subscription.currentListings,
          max: ctx.subscription.maxListings ?? 0,
          remaining: Math.max(0, (ctx.subscription.maxListings ?? 0) - ctx.subscription.currentListings),
        },
        featuredListings: {
          current: ctx.subscription.currentFeaturedListings,
          max: ctx.subscription.maxFeaturedListings ?? 0,
          remaining: Math.max(
            0,
            (ctx.subscription.maxFeaturedListings ?? 0) - ctx.subscription.currentFeaturedListings
          ),
        },
        members: {
          current: currentMembers,
          max: maxMembers,
          remaining: Math.max(0, maxMembers - currentMembers),
        },
        images: {
          current: ctx.subscription.currentTotalImages,
          maxPerListing: ctx.subscription.maxImagesPerListing ?? 5,
        },
        videos: {
          current: ctx.subscription.currentTotalVideos,
          maxPerListing: ctx.subscription.maxVideosPerListing ?? 1,
        },
      },
      subscription: {
        id: ctx.subscription.id,
        status: ctx.subscription.status,
        periodStart: ctx.subscription.periodStart,
        periodEnd: ctx.subscription.periodEnd,
        cancelAtPeriodEnd: ctx.subscription.cancelAtPeriodEnd ?? false,
        isTrialing: ctx.subscription.status === 'trialing',
        trialStart: ctx.subscription.trialStart,
        trialEnd: ctx.subscription.trialEnd,
        stripeSubscriptionId: ctx.subscription.id,
      },
      organizationId: ctx.organizationId,
    };
  }
}
