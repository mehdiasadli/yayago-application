import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import stripeClient from '@yayago-app/stripe';
import type { BookingStatus } from '@yayago-app/db/enums';
import { getLocalizedValue } from '../__shared__/utils';
import type {
  CalculateBookingPriceInputType,
  CalculateBookingPriceOutputType,
  CheckAvailabilityInputType,
  CheckAvailabilityOutputType,
  CreateBookingInputType,
  CreateBookingOutputType,
  GetBookingInputType,
  BookingOutputType,
  ListUserBookingsInputType,
  ListUserBookingsOutputType,
  ListPartnerBookingsInputType,
  ListPartnerBookingsOutputType,
  ListAllBookingsInputType,
  ListAllBookingsOutputType,
  UpdateBookingStatusInputType,
  UpdateBookingStatusOutputType,
  CancelBookingInputType,
  CancelBookingOutputType,
  StartTripInputType,
  StartTripOutputType,
  CompleteTripInputType,
  CompleteTripOutputType,
  GetBookingStatsOutputType,
} from '@yayago-app/validators';

// Generate a unique reference code (e.g., "YAYA-8823")
function generateReferenceCode(): string {
  const prefix = 'YAYA';
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
}

// Calculate days between two dates
function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Calculate delivery fee based on distance
function calculateDeliveryFee(
  distance: number,
  baseFee: number | null,
  perKmFee: number | null,
  freeRadius: number | null
): { fee: number; isFree: boolean } {
  // If within free radius, no charge
  if (freeRadius && distance <= freeRadius) {
    return { fee: 0, isFree: true };
  }

  // Calculate fee: base + per km (for distance beyond free radius)
  const base = baseFee || 0;
  const chargeableDistance = freeRadius ? Math.max(0, distance - freeRadius) : distance;
  const distanceFee = (perKmFee || 0) * chargeableDistance;

  return { fee: Math.round((base + distanceFee) * 100) / 100, isFree: false };
}

// Format booking output with EXTREME null safety - every single field is defensive
function formatBookingOutput(booking: any): BookingOutputType {
  const vehicleSnapshot = (booking.vehicleSnapshot || {}) as any;
  const totalDays = calculateDays(booking.startDate, booking.endDate);

  // Defensive access for nested objects
  const listingMedia = Array.isArray(booking.listing?.media) ? booking.listing.media : [];
  const primaryMediaUrl = listingMedia[0]?.url || null;

  return {
    id: String(booking.id || ''),
    referenceCode: String(booking.referenceCode || ''),
    createdAt: booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt),
    updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt : new Date(booking.updatedAt),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    timezone: String(booking.timezone || 'Asia/Dubai'),
    startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
    endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
    totalDays: Number(totalDays) || 1,
    currency: String(booking.currency || 'AED'),
    basePrice: Number(booking.basePrice) || 0,
    addonsTotal: Number(booking.addonsTotal) || 0,
    deliveryFee: Number(booking.deliveryFee) || 0,
    taxAmount: Number(booking.taxAmount) || 0,
    depositHeld: Number(booking.depositHeld) || 0,
    totalPrice: Number(booking.totalPrice) || 0,
    pickupType: booking.pickupType || 'MEET_AT_LOCATION',
    pickupAddress: booking.pickupAddress || null,
    dropoffType: booking.dropoffType || 'MEET_AT_LOCATION',
    dropoffAddress: booking.dropoffAddress || null,
    listing: {
      id: String(booking.listing?.id || ''),
      slug: String(booking.listing?.slug || ''),
      title: String(booking.listing?.title || 'Unknown Listing'),
      primaryImage: primaryMediaUrl,
    },
    vehicle: {
      year: Number(vehicleSnapshot.year) || 0,
      make: String(vehicleSnapshot.make || 'Unknown'),
      model: String(vehicleSnapshot.model || 'Unknown'),
      licensePlate: vehicleSnapshot.plate || null,
    },
    user: {
      id: String(booking.user?.id || ''),
      name: String(booking.user?.name || 'Unknown'),
      email: String(booking.user?.email || ''),
      image: booking.user?.image || null,
    },
    organization: {
      id: String(booking.listing?.organization?.id || ''),
      name: String(booking.listing?.organization?.name || 'Unknown'),
      slug: String(booking.listing?.organization?.slug || ''),
      logo: booking.listing?.organization?.logo || null,
      phoneNumber: booking.listing?.organization?.phoneNumber || null,
      email: booking.listing?.organization?.email || null,
    },
    actualPickupTime: booking.actualPickupTime || null,
    actualReturnTime: booking.actualReturnTime || null,
    startOdometer:
      booking.startOdometer !== undefined && booking.startOdometer !== null ? Number(booking.startOdometer) : null,
    endOdometer: booking.endOdometer !== undefined && booking.endOdometer !== null ? Number(booking.endOdometer) : null,
    // Payout tracking
    platformCommission: booking.platformCommission ?? null,
    partnerPayoutAmount: booking.partnerPayoutAmount ?? null,
    partnerPayoutStatus: booking.partnerPayoutStatus ?? null,
    partnerPaidAt: booking.partnerPaidAt ?? null,
    depositRefundStatus: booking.depositRefundStatus ?? null,
    depositRefundedAt: booking.depositRefundedAt ?? null,
  };
}

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

// Get listing with pricing and booking details
async function getListingForBooking(slug: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      slug,
      deletedAt: null,
      status: 'AVAILABLE',
      verificationStatus: 'APPROVED',
      organization: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    },
    include: {
      pricing: true,
      bookingDetails: true,
      organization: {
        include: {
          city: {
            include: {
              country: {
                select: {
                  minDriverAge: true,
                  minDriverLicenseAge: true,
                },
              },
            },
          },
        },
      },
      vehicle: {
        include: {
          model: {
            include: {
              brand: true,
            },
          },
        },
      },
      media: {
        where: {
          isPrimary: true,
          deletedAt: null,
          verificationStatus: 'APPROVED',
        },
        take: 1,
      },
    },
  });

  if (!listing) {
    throw new ORPCError('NOT_FOUND', { message: 'Listing not found or not available' });
  }

  if (!listing.pricing || !listing.bookingDetails) {
    throw new ORPCError('PRECONDITION_FAILED', { message: 'Listing is not properly configured for booking' });
  }

  return listing;
}

// Check for conflicting bookings
async function getConflictingBookings(listingId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
  return prisma.booking.findMany({
    where: {
      listingId,
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
      status: {
        in: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE'],
      },
      OR: [
        // New booking starts during existing booking
        {
          startDate: { lte: startDate },
          endDate: { gte: startDate },
        },
        // New booking ends during existing booking
        {
          startDate: { lte: endDate },
          endDate: { gte: endDate },
        },
        // New booking encompasses existing booking
        {
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      ],
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });
}

export class BookingService {
  // ============ CALCULATE PRICE ============
  static async calculatePrice(input: CalculateBookingPriceInputType): Promise<CalculateBookingPriceOutputType> {
    const listing = await getListingForBooking(input.listingSlug);
    const pricing = listing.pricing!;
    const bookingDetails = listing.bookingDetails!;

    const totalDays = calculateDays(input.startDate, input.endDate);

    if (totalDays < 1) {
      throw new ORPCError('BAD_REQUEST', { message: 'End date must be after start date' });
    }

    // Calculate weeks and remaining days for pricing
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Calculate base price using best available rates
    let basePrice = 0;

    // If monthly rate available and >= 30 days
    if (pricing.pricePerMonth && totalDays >= 30) {
      const months = Math.floor(totalDays / 30);
      const extraDays = totalDays % 30;
      basePrice = months * pricing.pricePerMonth + extraDays * pricing.pricePerDay;
    }
    // If weekly rate available and >= 7 days
    else if (pricing.pricePerWeek && totalDays >= 7) {
      basePrice = totalWeeks * pricing.pricePerWeek + remainingDays * pricing.pricePerDay;
    }
    // Just daily rate
    else {
      basePrice = totalDays * pricing.pricePerDay;
    }

    // TODO: Calculate addons total when addon system is implemented
    const addonsTotal = 0;

    // Calculate delivery fee if requested
    let deliveryFee = 0;
    let deliveryInfo: CalculateBookingPriceOutputType['delivery'] = null;

    if (input.deliveryRequested && input.deliveryLat && input.deliveryLng) {
      // Check if delivery is enabled for this listing
      if (!bookingDetails.deliveryEnabled) {
        throw new ORPCError('BAD_REQUEST', { message: 'Delivery is not available for this listing' });
      }

      // Get listing/organization location
      const carLat = listing.lat ?? listing.organization.lat;
      const carLng = listing.lng ?? listing.organization.lng;

      if (carLat && carLng) {
        const distance = calculateDistance(carLat, carLng, input.deliveryLat, input.deliveryLng);

        // Check if within max delivery distance
        const maxDistance = bookingDetails.deliveryMaxDistance || 100; // Default 100km
        const maxDistanceExceeded = distance > maxDistance;

        if (maxDistanceExceeded) {
          deliveryInfo = {
            available: false,
            fee: 0,
            distance: Math.round(distance * 10) / 10,
            freeDelivery: false,
            maxDistanceExceeded: true,
          };
        } else {
          // Calculate delivery fee
          const { fee, isFree } = calculateDeliveryFee(
            distance,
            bookingDetails.deliveryBaseFee,
            bookingDetails.deliveryPerKmFee,
            bookingDetails.deliveryFreeRadius
          );
          deliveryFee = fee;
          deliveryInfo = {
            available: true,
            fee,
            distance: Math.round(distance * 10) / 10,
            freeDelivery: isFree,
            maxDistanceExceeded: false,
          };
        }
      }
    }

    // Calculate tax (including delivery fee)
    const taxRate = pricing.taxRate || 0;
    const taxAmount = (basePrice + addonsTotal + deliveryFee) * (taxRate / 100);

    // Total price (what we charge)
    const totalPrice = basePrice + addonsTotal + deliveryFee + taxAmount;

    // Security deposit
    const securityDeposit = pricing.securityDepositRequired ? pricing.securityDepositAmount || 0 : 0;

    // Grand total including deposit
    const grandTotal = totalPrice + securityDeposit;

    return {
      totalDays,
      totalWeeks,
      remainingDays,
      dailyRate: pricing.pricePerDay,
      weeklyRate: pricing.pricePerWeek,
      monthlyRate: pricing.pricePerMonth,
      basePrice,
      addonsTotal,
      deliveryFee,
      taxAmount,
      taxRate: pricing.taxRate,
      securityDeposit,
      securityDepositRequired: pricing.securityDepositRequired,
      totalPrice,
      grandTotal,
      currency: pricing.currency,
      listing: {
        slug: listing.slug,
        title: listing.title,
        hasInstantBooking: bookingDetails.hasInstantBooking,
        minNoticeHours: bookingDetails.minNoticeHours,
        minRentalDays: bookingDetails.minRentalDays,
        maxRentalDays: bookingDetails.maxRentalDays,
      },
      delivery: deliveryInfo,
    };
  }

  // ============ CHECK AVAILABILITY ============
  static async checkAvailability(input: CheckAvailabilityInputType): Promise<CheckAvailabilityOutputType> {
    const listing = await getListingForBooking(input.listingSlug);
    const bookingDetails = listing.bookingDetails!;

    const totalDays = calculateDays(input.startDate, input.endDate);
    const now = new Date();

    // Check minimum notice
    const hoursUntilStart = (input.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const meetsMinNotice = !bookingDetails.minNoticeHours || hoursUntilStart >= bookingDetails.minNoticeHours;

    // Check minimum rental days
    const meetsMinRentalDays = totalDays >= bookingDetails.minRentalDays;

    // Check maximum rental days
    const meetsMaxRentalDays = !bookingDetails.maxRentalDays || totalDays <= bookingDetails.maxRentalDays;

    // Check for conflicting bookings
    const conflictingBookings = await getConflictingBookings(listing.id, input.startDate, input.endDate);
    const hasNoConflicts = conflictingBookings.length === 0;

    // Determine overall availability
    const available = meetsMinNotice && meetsMinRentalDays && meetsMaxRentalDays && hasNoConflicts;

    // Build reason if not available
    let reason: string | undefined;
    if (!available) {
      if (!meetsMinNotice) {
        reason = `Minimum ${bookingDetails.minNoticeHours} hours notice required`;
      } else if (!meetsMinRentalDays) {
        reason = `Minimum rental is ${bookingDetails.minRentalDays} day(s)`;
      } else if (!meetsMaxRentalDays) {
        reason = `Maximum rental is ${bookingDetails.maxRentalDays} days`;
      } else if (!hasNoConflicts) {
        reason = 'Selected dates are not available';
      }
    }

    return {
      available,
      reason,
      meetsMinNotice,
      meetsMinRentalDays,
      meetsMaxRentalDays,
      hasNoConflicts,
      conflictingBookings: hasNoConflicts ? undefined : conflictingBookings,
    };
  }

  // ============ CREATE BOOKING ============
  static async createBooking(input: CreateBookingInputType, userId: string): Promise<CreateBookingOutputType> {
    // First, verify user identity and license
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        driverLicenseVerificationStatus: true,
        driverLicenseExpiry: true,
        dateOfBirth: true,
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    // Check verification status
    if (user.driverLicenseVerificationStatus !== 'APPROVED') {
      const statusMessages: Record<string, string> = {
        NOT_SUBMITTED: 'Identity verification is required to book a vehicle. Please complete your verification.',
        PENDING: 'Your identity verification is still pending review. Please wait for approval before booking.',
        REJECTED: 'Your identity verification was rejected. Please resubmit your documents to book a vehicle.',
        EXPIRED: 'Your driver license has expired. Please update your documents to continue booking.',
      };
      throw new ORPCError('FORBIDDEN', {
        message: statusMessages[user.driverLicenseVerificationStatus] || 'Identity verification is required.',
        data: { errorCode: 'VERIFICATION_REQUIRED', verificationStatus: user.driverLicenseVerificationStatus },
      });
    }

    // Check license expiry
    if (user.driverLicenseExpiry && new Date(user.driverLicenseExpiry) < new Date()) {
      // Update status to EXPIRED if it was APPROVED but license is now expired
      await prisma.user.update({
        where: { id: userId },
        data: { driverLicenseVerificationStatus: 'EXPIRED' },
      });

      throw new ORPCError('FORBIDDEN', {
        message: 'Your driver license has expired. Please update your documents to continue booking.',
        data: { errorCode: 'LICENSE_EXPIRED', expiryDate: user.driverLicenseExpiry },
      });
    }

    // First check availability
    const availability = await this.checkAvailability({
      listingSlug: input.listingSlug,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    if (!availability.available) {
      throw new ORPCError('PRECONDITION_FAILED', {
        message: availability.reason || 'Selected dates are not available',
      });
    }

    // Check if delivery is requested
    const deliveryRequested = input.pickupType === 'DELIVERY' || input.dropoffType === 'DELIVERY';
    const deliveryLat = input.pickupType === 'DELIVERY' ? input.pickupLat : input.dropoffLat;
    const deliveryLng = input.pickupType === 'DELIVERY' ? input.pickupLng : input.dropoffLng;

    // Get price calculation (including delivery if requested)
    const priceCalc = await this.calculatePrice({
      listingSlug: input.listingSlug,
      startDate: input.startDate,
      endDate: input.endDate,
      addons: input.addons,
      deliveryRequested,
      deliveryLat,
      deliveryLng,
    });

    // Get the listing
    const listing = await getListingForBooking(input.listingSlug);
    const vehicle = listing.vehicle!;
    const bookingDetails = listing.bookingDetails!;

    // Check minimum driver age if applicable
    if (listing.organization?.city?.country?.minDriverAge && user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < listing.organization.city.country.minDriverAge) {
        throw new ORPCError('FORBIDDEN', {
          message: `You must be at least ${listing.organization.city.country.minDriverAge} years old to rent a vehicle in this country.`,
          data: {
            errorCode: 'AGE_REQUIREMENT_NOT_MET',
            requiredAge: listing.organization.city.country.minDriverAge,
            userAge: age,
          },
        });
      }
    }

    // Generate unique reference code
    let referenceCode = generateReferenceCode();
    let attempts = 0;
    while (await prisma.booking.findUnique({ where: { referenceCode } })) {
      referenceCode = generateReferenceCode();
      attempts++;
      if (attempts > 10) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Could not generate unique reference code' });
      }
    }

    // Create vehicle snapshot with localized brand/model names
    const vehicleSnapshot = {
      make: getLocalizedValue(vehicle.model.brand.name, 'en'),
      model: getLocalizedValue(vehicle.model.name, 'en'),
      year: vehicle.year,
      plate: vehicle.licensePlate,
      class: vehicle.class,
      fuelType: vehicle.fuelType,
      transmissionType: vehicle.transmissionType,
    };

    // Create booking in DRAFT status
    const booking = await prisma.booking.create({
      data: {
        referenceCode,
        listingId: listing.id,
        userId,
        vehicleSnapshot,
        status: 'DRAFT',
        paymentStatus: 'NOT_PAID',
        timezone: input.timezone,
        startDate: input.startDate,
        endDate: input.endDate,
        currency: priceCalc.currency,
        totalPrice: priceCalc.totalPrice,
        basePrice: priceCalc.basePrice,
        addonsTotal: priceCalc.addonsTotal,
        deliveryFee: priceCalc.deliveryFee,
        taxAmount: priceCalc.taxAmount,
        depositHeld: priceCalc.securityDeposit,
        pickupType: input.pickupType,
        pickupLocationId: input.pickupLocationId,
        pickupAddress: input.pickupAddress,
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        dropoffType: input.dropoffType,
        dropoffLocationId: input.dropoffLocationId,
        dropoffAddress: input.dropoffAddress,
        dropoffLat: input.dropoffLat,
        dropoffLng: input.dropoffLng,
      },
    });

    // Create Stripe checkout session
    // Ensure user has a Stripe customer ID
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: priceCalc.currency.toLowerCase(),
          product_data: {
            name: `${listing.title} - ${priceCalc.totalDays} day(s)`,
            description: `${getLocalizedValue(vehicle.model.brand.name, 'en')} ${getLocalizedValue(vehicle.model.name, 'en')} ${vehicle.year}`,
            images: listing.media[0]?.url ? [listing.media[0].url] : undefined,
          },
          unit_amount: Math.round(priceCalc.totalPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Add delivery fee as separate line item if applicable
    if (priceCalc.delivery && priceCalc.delivery.fee > 0) {
      lineItems.push({
        price_data: {
          currency: priceCalc.currency.toLowerCase(),
          product_data: {
            name: 'Delivery Fee',
            description: `Vehicle delivery (${priceCalc.delivery.distance.toFixed(1)} km)`,
            images: undefined,
          },
          unit_amount: Math.round(priceCalc.delivery.fee * 100),
        },
        quantity: 1,
      });
    }

    // Add security deposit as separate line item if required
    if (priceCalc.securityDepositRequired && priceCalc.securityDeposit > 0) {
      lineItems.push({
        price_data: {
          currency: priceCalc.currency.toLowerCase(),
          product_data: {
            name: 'Security Deposit (Refundable)',
            description: 'Will be refunded after successful return of vehicle',
            images: undefined,
          },
          unit_amount: Math.round(priceCalc.securityDeposit * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${input.successUrl}?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.cancelUrl}?booking_id=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        referenceCode: booking.referenceCode,
        listingId: listing.id,
        userId,
        type: 'booking',
        hasInstantBooking: bookingDetails.hasInstantBooking ? 'true' : 'false',
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    return {
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      checkoutUrl: session.url!,
      status: booking.status,
    };
  }

  // ============ GET BOOKING (User) ============
  static async getBooking(input: GetBookingInputType, userId?: string, isAdmin = false): Promise<BookingOutputType> {
    const booking = await prisma.booking.findFirst({
      where: {
        ...(input.bookingId && { id: input.bookingId }),
        ...(input.referenceCode && { referenceCode: input.referenceCode }),
        // Access control - only user's own bookings unless admin
        ...(!isAdmin && userId && { userId }),
      },
      include: {
        listing: {
          include: {
            media: {
              where: { isPrimary: true, deletedAt: null, verificationStatus: 'APPROVED' },
              take: 1,
            },
            organization: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' });
    }

    return formatBookingOutput(booking);
  }

  // ============ GET PARTNER BOOKING ============
  static async getPartnerBooking(input: GetBookingInputType, userId: string): Promise<BookingOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const booking = await prisma.booking.findFirst({
      where: {
        ...(input.bookingId && { id: input.bookingId }),
        ...(input.referenceCode && { referenceCode: input.referenceCode }),
        listing: { organizationId },
      },
      include: {
        listing: {
          include: {
            media: {
              where: { isPrimary: true, deletedAt: null, verificationStatus: 'APPROVED' },
              take: 1,
            },
            organization: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' });
    }

    return formatBookingOutput(booking);
  }

  // ============ LIST USER BOOKINGS ============
  static async listUserBookings(input: ListUserBookingsInputType, userId: string): Promise<ListUserBookingsOutputType> {
    const { page, take, status, upcoming } = input;
    const now = new Date();

    const where = {
      userId,
      ...(status && status.length > 0 && { status: { in: status } }),
      ...(upcoming && { startDate: { gte: now } }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              media: {
                where: { isPrimary: true, deletedAt: null, verificationStatus: 'APPROVED' },
                take: 1,
              },
              organization: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items: bookings.map((booking) => {
        const vehicleSnapshot = (booking.vehicleSnapshot || {}) as any;
        const listingMedia = Array.isArray(booking.listing?.media) ? booking.listing.media : [];
        return {
          id: String(booking.id),
          referenceCode: String(booking.referenceCode),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
          endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
          totalDays: Number(calculateDays(booking.startDate, booking.endDate)) || 1,
          totalPrice: Number(booking.totalPrice) || 0,
          currency: String(booking.currency || 'AED'),
          listing: {
            slug: String(booking.listing?.slug || ''),
            title: String(booking.listing?.title || 'Unknown'),
            primaryImage: listingMedia[0]?.url || null,
          },
          vehicle: {
            year: Number(vehicleSnapshot.year) || 0,
            make: String(vehicleSnapshot.make || 'Unknown'),
            model: String(vehicleSnapshot.model || 'Unknown'),
          },
          organization: {
            name: String(booking.listing?.organization?.name || 'Unknown'),
            slug: String(booking.listing?.organization?.slug || ''),
          },
          createdAt: booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt),
        };
      }),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST PARTNER BOOKINGS ============
  static async listPartnerBookings(
    input: ListPartnerBookingsInputType,
    userId: string
  ): Promise<ListPartnerBookingsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);
    const { page, take, status, listingSlug, upcoming, pendingOnly } = input;
    const now = new Date();

    const where: any = {
      listing: {
        organizationId,
        ...(listingSlug && { slug: listingSlug }),
      },
      ...(status && status.length > 0 && { status: { in: status } }),
      ...(upcoming && { startDate: { gte: now } }),
      ...(pendingOnly && { status: 'PENDING_APPROVAL' as BookingStatus }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              media: {
                where: { isPrimary: true, deletedAt: null, verificationStatus: 'APPROVED' },
                take: 1,
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items: bookings.map((booking) => {
        const vehicleSnapshot = (booking.vehicleSnapshot || {}) as any;
        const listingMedia = Array.isArray(booking.listing?.media) ? booking.listing.media : [];
        return {
          id: String(booking.id),
          referenceCode: String(booking.referenceCode),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
          endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
          totalDays: Number(calculateDays(booking.startDate, booking.endDate)) || 1,
          totalPrice: Number(booking.totalPrice) || 0,
          currency: String(booking.currency || 'AED'),
          listing: {
            slug: String(booking.listing?.slug || ''),
            title: String(booking.listing?.title || 'Unknown'),
            primaryImage: listingMedia[0]?.url || null,
          },
          vehicle: {
            year: Number(vehicleSnapshot.year) || 0,
            make: String(vehicleSnapshot.make || 'Unknown'),
            model: String(vehicleSnapshot.model || 'Unknown'),
            licensePlate: vehicleSnapshot.plate || null,
          },
          user: {
            id: String(booking.user?.id || ''),
            name: String(booking.user?.name || 'Unknown'),
            email: String(booking.user?.email || ''),
            image: booking.user?.image || null,
          },
          createdAt: booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt),
          requiresAction: booking.status === 'PENDING_APPROVAL',
        };
      }),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST ALL BOOKINGS (Admin) ============
  static async listAllBookings(input: ListAllBookingsInputType): Promise<ListAllBookingsOutputType> {
    const { page, take, status, paymentStatus, organizationSlug, listingSlug, userId, dateFrom, dateTo, q } = input;

    const where = {
      ...(status && status.length > 0 && { status: { in: status } }),
      ...(paymentStatus && paymentStatus.length > 0 && { paymentStatus: { in: paymentStatus } }),
      ...(organizationSlug && { listing: { organization: { slug: organizationSlug } } }),
      ...(listingSlug && { listing: { slug: listingSlug } }),
      ...(userId && { userId }),
      ...(dateFrom && { startDate: { gte: dateFrom } }),
      ...(dateTo && { endDate: { lte: dateTo } }),
      ...(q && { referenceCode: { contains: q, mode: 'insensitive' as const } }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              organization: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items: bookings.map((booking) => ({
        id: String(booking.id),
        referenceCode: String(booking.referenceCode),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
        endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
        totalDays: Number(calculateDays(booking.startDate, booking.endDate)) || 1,
        totalPrice: Number(booking.totalPrice) || 0,
        currency: String(booking.currency || 'AED'),
        listing: {
          slug: String(booking.listing?.slug || ''),
          title: String(booking.listing?.title || 'Unknown'),
        },
        organization: {
          name: String(booking.listing?.organization?.name || 'Unknown'),
          slug: String(booking.listing?.organization?.slug || ''),
        },
        user: {
          id: String(booking.user?.id || ''),
          name: String(booking.user?.name || 'Unknown'),
          email: String(booking.user?.email || ''),
        },
        createdAt: booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt),
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ UPDATE BOOKING STATUS (Partner) ============
  static async updateBookingStatus(
    input: UpdateBookingStatusInputType,
    userId: string
  ): Promise<UpdateBookingStatusOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        listing: { organizationId },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' });
    }

    let newStatus: BookingStatus;
    let newPaymentStatus = booking.paymentStatus;

    switch (input.action) {
      case 'approve':
        if (booking.status !== 'PENDING_APPROVAL') {
          throw new ORPCError('PRECONDITION_FAILED', { message: 'Booking is not pending approval' });
        }
        newStatus = 'APPROVED';
        // Capture the payment if it was authorized
        if (booking.paymentStatus === 'AUTHORIZED') {
          // TODO: Capture Stripe payment
          newPaymentStatus = 'PAID';
        }
        break;

      case 'reject':
        if (booking.status !== 'PENDING_APPROVAL') {
          throw new ORPCError('PRECONDITION_FAILED', { message: 'Booking is not pending approval' });
        }
        newStatus = 'REJECTED';
        // Refund if paid
        if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'AUTHORIZED') {
          // TODO: Refund via Stripe
          newPaymentStatus = 'REFUNDED';
        }
        break;

      case 'cancel':
        if (!['APPROVED', 'PENDING_APPROVAL'].includes(booking.status)) {
          throw new ORPCError('PRECONDITION_FAILED', { message: 'Booking cannot be cancelled' });
        }
        newStatus = 'CANCELLED_BY_HOST';
        // Refund if paid
        if (booking.paymentStatus === 'PAID') {
          // TODO: Refund via Stripe
          newPaymentStatus = 'REFUNDED';
        }
        break;

      default:
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid action' });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: newStatus,
        paymentStatus: newPaymentStatus,
      },
    });

    return {
      id: updated.id,
      referenceCode: updated.referenceCode,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
    };
  }

  // ============ CANCEL BOOKING (User) ============
  static async cancelBooking(input: CancelBookingInputType, userId: string): Promise<CancelBookingOutputType> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        userId,
      },
      include: {
        listing: {
          include: {
            pricing: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found' });
    }

    if (!['PENDING_APPROVAL', 'APPROVED'].includes(booking.status)) {
      throw new ORPCError('PRECONDITION_FAILED', { message: 'Booking cannot be cancelled' });
    }

    // Calculate refund based on cancellation policy
    let refundAmount: number | null = null;
    const pricing = booking.listing.pricing;

    if (booking.paymentStatus === 'PAID' && pricing) {
      const now = new Date();
      const hoursUntilStart = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      switch (pricing.cancellationPolicy) {
        case 'FREE_CANCELLATION':
          refundAmount = booking.totalPrice;
          break;
        case 'FLEXIBLE':
          refundAmount = hoursUntilStart >= 24 ? booking.totalPrice : booking.totalPrice * 0.5;
          break;
        case 'STRICT':
        default:
          if (hoursUntilStart >= 168) {
            // 7 days
            refundAmount = booking.totalPrice;
          } else if (hoursUntilStart >= 72) {
            // 3 days
            refundAmount = booking.totalPrice * 0.5;
          } else {
            refundAmount = 0;
          }
          break;
      }

      // TODO: Process refund via Stripe
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED_BY_USER',
        paymentStatus: refundAmount && refundAmount > 0 ? 'REFUNDED' : booking.paymentStatus,
      },
    });

    return {
      id: updated.id,
      referenceCode: updated.referenceCode,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      refundAmount,
    };
  }

  // ============ START TRIP ============
  static async startTrip(input: StartTripInputType, userId: string): Promise<StartTripOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        listing: { organizationId },
        status: 'APPROVED',
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found or not ready to start' });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'ACTIVE',
        actualPickupTime: new Date(),
        startOdometer: input.startOdometer,
      },
    });

    return {
      id: updated.id,
      referenceCode: updated.referenceCode,
      status: updated.status,
      actualPickupTime: updated.actualPickupTime!,
    };
  }

  // ============ COMPLETE TRIP ============
  static async completeTrip(input: CompleteTripInputType, userId: string): Promise<CompleteTripOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        listing: { organizationId },
        status: 'ACTIVE',
      },
      include: {
        listing: {
          include: {
            organization: {
              select: {
                id: true,
                stripeAccountId: true,
                payoutsEnabled: true,
                city: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', { message: 'Booking not found or not active' });
    }

    const totalMileage = booking.startOdometer && input.endOdometer ? input.endOdometer - booking.startOdometer : null;

    // Update booking to COMPLETED status
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'COMPLETED',
        actualReturnTime: new Date(),
        endOdometer: input.endOdometer,
      },
    });

    // Process payout asynchronously (don't block the response)
    // The payout will happen in the background
    const org = booking.listing.organization;
    this.processPayoutAsync(booking.id, {
      id: org.id,
      stripeAccountId: org.stripeAccountId,
      payoutsEnabled: org.payoutsEnabled,
      city: org.city,
    });

    return {
      id: updated.id,
      referenceCode: updated.referenceCode,
      status: updated.status,
      actualReturnTime: updated.actualReturnTime!,
      totalMileage,
    };
  }

  /**
   * Process payout asynchronously after trip completion
   * This runs in the background to avoid blocking the API response
   */
  private static async processPayoutAsync(
    bookingId: string,
    organization: {
      id: string;
      stripeAccountId: string | null;
      payoutsEnabled: boolean;
      city: {
        country: {
          platformCommissionRate: number;
        };
      } | null;
    }
  ): Promise<void> {
    try {
      // Skip payout processing if organization doesn't have payouts enabled
      if (!organization.stripeAccountId || !organization.payoutsEnabled) {
        console.log(
          `⚠️ Organization ${organization.id} has payouts disabled, skipping payout for booking ${bookingId}`
        );
        return;
      }

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        console.error(`❌ Booking ${bookingId} not found for payout processing`);
        return;
      }

      // Get commission rate from country (default 5%)
      const commissionRate = organization.city?.country?.platformCommissionRate || 0.05;

      // Calculate amounts (all in cents for Stripe)
      const basePriceCents = Math.round(booking.basePrice * 100);
      const addonsTotalCents = Math.round(booking.addonsTotal * 100);
      const deliveryFeeCents = Math.round(booking.deliveryFee * 100);
      const taxAmountCents = Math.round(booking.taxAmount * 100);
      const depositHeldCents = Math.round(booking.depositHeld * 100);

      // Commission is applied to (basePrice + addons + delivery + tax), NOT the deposit
      const revenueAmount = basePriceCents + addonsTotalCents + deliveryFeeCents + taxAmountCents;
      const platformCommissionCents = Math.round(revenueAmount * commissionRate);
      const partnerPayoutCents = revenueAmount - platformCommissionCents;

      let depositRefundId: string | null = null;
      let partnerPayoutId: string | null = null;

      // Step 1: Refund the security deposit to the user
      if (depositHeldCents > 0 && booking.stripePaymentIntentId) {
        try {
          const { getChargeIdFromPaymentIntent, createRefund } = await import('@yayago-app/stripe');

          const chargeId =
            booking.stripeChargeId || (await getChargeIdFromPaymentIntent(booking.stripePaymentIntentId));

          if (chargeId) {
            const refund = await createRefund({
              chargeId,
              amount: depositHeldCents,
              reason: 'requested_by_customer',
              metadata: {
                bookingId: booking.id,
                type: 'security_deposit_refund',
              },
            });
            depositRefundId = refund.id;
            console.log(`✅ Refunded deposit ${depositHeldCents / 100} ${booking.currency} for booking ${bookingId}`);
          }
        } catch (refundError) {
          console.error(`❌ Failed to refund deposit for booking ${bookingId}:`, refundError);
        }
      }

      // Step 2: Transfer partner payout to the organization
      if (partnerPayoutCents > 0) {
        try {
          const { createTransfer } = await import('@yayago-app/stripe');

          const transfer = await createTransfer({
            amount: partnerPayoutCents,
            currency: booking.currency,
            destinationAccountId: organization.stripeAccountId!,
            bookingId: booking.id,
            description: `Payout for booking ${booking.referenceCode}`,
          });
          partnerPayoutId = transfer.id;
          console.log(
            `✅ Transferred ${partnerPayoutCents / 100} ${booking.currency} to partner for booking ${bookingId}`
          );
        } catch (transferError) {
          console.error(`❌ Failed to transfer payout for booking ${bookingId}:`, transferError);
        }
      }

      // Step 3: Update the booking with payout details
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          platformCommission: platformCommissionCents / 100,
          partnerPayoutAmount: partnerPayoutCents / 100,
          partnerPayoutStatus: partnerPayoutId ? 'paid' : 'failed',
          partnerPayoutId,
          partnerPaidAt: partnerPayoutId ? new Date() : null,
          depositRefundStatus: depositHeldCents > 0 ? (depositRefundId ? 'refunded' : 'failed') : null,
          depositRefundId,
          depositRefundedAt: depositRefundId ? new Date() : null,
        },
      });

      console.log(`✅ Payout processing complete for booking ${bookingId}`);
    } catch (error) {
      console.error(`❌ Error processing payout for booking ${bookingId}:`, error);

      // Update booking with failed status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          partnerPayoutStatus: 'failed',
        },
      });
    }
  }

  // ============ GET BOOKING STATS (Partner Dashboard) ============
  static async getBookingStats(userId: string): Promise<GetBookingStatsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalBookings, activeBookings, pendingApproval, completedThisMonth, revenueData, upcomingBookings] =
      await Promise.all([
        // Total bookings
        prisma.booking.count({
          where: { listing: { organizationId } },
        }),
        // Active bookings
        prisma.booking.count({
          where: { listing: { organizationId }, status: 'ACTIVE' },
        }),
        // Pending approval
        prisma.booking.count({
          where: { listing: { organizationId }, status: 'PENDING_APPROVAL' },
        }),
        // Completed this month
        prisma.booking.count({
          where: {
            listing: { organizationId },
            status: 'COMPLETED',
            actualReturnTime: { gte: startOfMonth },
          },
        }),
        // Revenue this month
        prisma.booking.aggregate({
          where: {
            listing: { organizationId },
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            actualReturnTime: { gte: startOfMonth },
          },
          _sum: { totalPrice: true },
        }),
        // Upcoming bookings (next 7 days)
        prisma.booking.findMany({
          where: {
            listing: { organizationId },
            status: { in: ['APPROVED', 'PENDING_APPROVAL'] },
            startDate: { gte: now, lte: in7Days },
          },
          take: 5,
          orderBy: { startDate: 'asc' },
          include: {
            listing: { select: { title: true } },
            user: { select: { name: true } },
          },
        }),
      ]);

    return {
      totalBookings,
      activeBookings,
      pendingApproval,
      completedThisMonth,
      revenueThisMonth: revenueData._sum.totalPrice || 0,
      currency: 'AED', // TODO: Get from organization settings
      upcomingBookings: upcomingBookings.map((b) => ({
        id: String(b.id),
        referenceCode: String(b.referenceCode),
        startDate: b.startDate instanceof Date ? b.startDate : new Date(b.startDate),
        listing: { title: String(b.listing?.title || 'Unknown') },
        user: { name: String(b.user?.name || 'Unknown') },
      })),
    };
  }

  // ============ HANDLE STRIPE WEBHOOK (Payment completed) ============
  static async handlePaymentCompleted(bookingId: string): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            bookingDetails: true,
          },
        },
      },
    });

    if (!booking) {
      console.error('Booking not found for payment:', bookingId);
      return;
    }

    const hasInstantBooking = booking.listing.bookingDetails?.hasInstantBooking ?? false;

    // Update booking status based on instant booking setting
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: hasInstantBooking ? 'APPROVED' : 'PENDING_APPROVAL',
        paymentStatus: 'PAID',
      },
    });

    // TODO: Send email notifications
    // - To user: Booking confirmed / pending approval
    // - To partner: New booking received
  }
}
