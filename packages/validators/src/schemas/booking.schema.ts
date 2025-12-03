import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import { BookingStatusSchema, PaymentStatusSchema, HandoverTypeSchema } from '@yayago-app/db/enums';

// ============ CALCULATE PRICE ============

// Addon selection for price calculation
export const AddonSelectionSchema = z.object({
  listingAddonId: z.string().uuid(), // The listing-specific addon ID
  quantity: z.number().int().min(1).default(1),
  selectedOptionId: z.string().uuid().optional(), // For selection-type addons
});

export const CalculateBookingPriceInputSchema = z.object({
  listingSlug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  // Optional extras - now with quantity support
  addons: z.array(AddonSelectionSchema).optional(),
  // Delivery (optional)
  deliveryRequested: z.boolean().optional(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
});

// Addon breakdown item in price calculation output
export const AddonPriceBreakdownSchema = z.object({
  listingAddonId: z.string(),
  addonId: z.string(),
  name: z.string(), // Localized name
  quantity: z.number(),
  unitPrice: z.number(), // Price per unit
  billingType: z.string(), // FIXED, PER_DAY, etc.
  subtotal: z.number(), // After quantity and days calculation
  discountApplied: z.number(), // Discount amount applied
  total: z.number(), // Final price for this addon
  isIncludedFree: z.boolean(),
});

export const CalculateBookingPriceOutputSchema = z.object({
  // Duration
  totalDays: z.number(),
  totalWeeks: z.number(),
  remainingDays: z.number(),

  // Pricing breakdown
  dailyRate: z.number(),
  weeklyRate: z.number().nullable(),
  monthlyRate: z.number().nullable(),

  basePrice: z.number(), // Before addons and taxes
  addonsTotal: z.number(),
  deliveryFee: z.number(), // Delivery fee
  taxAmount: z.number(),
  taxRate: z.number().nullable(),
  
  // Platform fee (charged to user, goes to platform)
  platformFee: z.number(),
  platformRate: z.number(), // e.g., 0.05 for 5%

  // Addon breakdown for display
  addonsBreakdown: z.array(AddonPriceBreakdownSchema).optional(),

  // Deposits
  securityDeposit: z.number(),
  securityDepositRequired: z.boolean(),

  // Final
  totalPrice: z.number(), // Final amount to charge (excludes security deposit)
  grandTotal: z.number(), // Including security deposit

  // Currency
  currency: z.string(),

  // Listing details for display
  listing: z.object({
    slug: z.string(),
    title: z.string(),
    hasInstantBooking: z.boolean(),
    minNoticeHours: z.number().nullable(),
    minRentalDays: z.number(),
    maxRentalDays: z.number().nullable(),
  }),

  // Delivery info (if requested)
  delivery: z
    .object({
      available: z.boolean(),
      fee: z.number(),
      distance: z.number(), // km
      freeDelivery: z.boolean(),
      maxDistanceExceeded: z.boolean(),
    })
    .nullable(),
});

export type AddonSelectionType = z.infer<typeof AddonSelectionSchema>;
export type AddonPriceBreakdownType = z.infer<typeof AddonPriceBreakdownSchema>;

export type CalculateBookingPriceInputType = z.infer<typeof CalculateBookingPriceInputSchema>;
export type CalculateBookingPriceOutputType = z.infer<typeof CalculateBookingPriceOutputSchema>;

// ============ CHECK AVAILABILITY ============
export const CheckAvailabilityInputSchema = z.object({
  listingSlug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const CheckAvailabilityOutputSchema = z.object({
  available: z.boolean(),
  reason: z.string().optional(),
  // Validation results
  meetsMinNotice: z.boolean(),
  meetsMinRentalDays: z.boolean(),
  meetsMaxRentalDays: z.boolean(),
  hasNoConflicts: z.boolean(),
  // Conflicting bookings if any
  conflictingBookings: z
    .array(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .optional(),
});

export type CheckAvailabilityInputType = z.infer<typeof CheckAvailabilityInputSchema>;
export type CheckAvailabilityOutputType = z.infer<typeof CheckAvailabilityOutputSchema>;

// ============ CREATE BOOKING (Initiate checkout) ============
export const CreateBookingInputSchema = z.object({
  listingSlug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  timezone: z.string().default('Asia/Dubai'),

  // Pickup/dropoff
  pickupType: HandoverTypeSchema,
  pickupLocationId: z.string().uuid().optional(),
  pickupAddress: z.string().max(500).optional(),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),

  dropoffType: HandoverTypeSchema,
  dropoffLocationId: z.string().uuid().optional(),
  dropoffAddress: z.string().max(500).optional(),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),

  // Optional extras - with quantity support
  addons: z.array(AddonSelectionSchema).optional(),

  // For Stripe checkout
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const CreateBookingOutputSchema = z.object({
  bookingId: z.string(),
  referenceCode: z.string(),
  checkoutUrl: z.string(), // Stripe checkout URL
  status: BookingStatusSchema,
});

export type CreateBookingInputType = z.infer<typeof CreateBookingInputSchema>;
export type CreateBookingOutputType = z.infer<typeof CreateBookingOutputSchema>;

// ============ GET BOOKING (User/Partner) ============
export const GetBookingInputSchema = z
  .object({
    bookingId: z.string().uuid().optional(),
    referenceCode: z.string().optional(),
  })
  .refine((data) => data.bookingId || data.referenceCode, {
    message: 'Either bookingId or referenceCode must be provided',
  });

export const BookingOutputSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  // Status
  status: BookingStatusSchema,
  paymentStatus: PaymentStatusSchema,

  // Schedule
  timezone: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  totalDays: z.number(),

  // Financials
  currency: z.string(),
  basePrice: z.number(),
  addonsTotal: z.number(),
  // Addon breakdown for display
  addonsBreakdown: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        total: z.number(),
      })
    )
    .optional(),
  deliveryFee: z.number(),
  taxAmount: z.number(),
  platformFee: z.number(),
  platformRate: z.number(),
  depositHeld: z.number(),
  totalPrice: z.number(),
  
  // Cancellation policy info
  cancellationPolicy: z.object({
    policy: z.enum(['STRICT', 'FLEXIBLE', 'FREE_CANCELLATION']),
    description: z.string(), // Human-readable description
    refundInfo: z.object({
      refundable: z.boolean(),
      refundPercentage: z.number(), // 0-100
      deadline: z.date().nullable(), // Deadline for full/partial refund
    }),
  }),

  // Logistics
  pickupType: HandoverTypeSchema,
  pickupAddress: z.string().nullable(),
  dropoffType: HandoverTypeSchema,
  dropoffAddress: z.string().nullable(),

  // Related data
  listing: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    primaryImage: z.string().nullable(),
  }),

  vehicle: z.object({
    year: z.number(),
    make: z.string(),
    model: z.string(),
    licensePlate: z.string().nullable(),
  }),

  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }),

  organization: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    email: z.string().nullable(),
  }),

  // Post-trip data
  actualPickupTime: z.date().nullable(),
  actualReturnTime: z.date().nullable(),
  startOdometer: z.number().nullable(),
  endOdometer: z.number().nullable(),

  // Payout tracking
  platformCommission: z.number().nullable(),
  partnerPayoutAmount: z.number().nullable(),
  partnerPayoutStatus: z.string().nullable(),
  partnerPaidAt: z.date().nullable(),
  depositRefundStatus: z.string().nullable(),
  depositRefundedAt: z.date().nullable(),
});

export type GetBookingInputType = z.infer<typeof GetBookingInputSchema>;
export type BookingOutputType = z.infer<typeof BookingOutputSchema>;

// ============ LIST USER'S BOOKINGS ============
export const ListUserBookingsInputSchema = z
  .object({
    status: z.array(BookingStatusSchema).optional(),
    upcoming: z.boolean().optional(), // Filter to upcoming only
  })
  .merge(PaginationInputSchema);

export const ListUserBookingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    referenceCode: z.string(),
    status: BookingStatusSchema,
    paymentStatus: PaymentStatusSchema,
    startDate: z.date(),
    endDate: z.date(),
    totalDays: z.number(),
    totalPrice: z.number(),
    currency: z.string(),
    listing: z.object({
      slug: z.string(),
      title: z.string(),
      primaryImage: z.string().nullable(),
    }),
    vehicle: z.object({
      year: z.number(),
      make: z.string(),
      model: z.string(),
    }),
    organization: z.object({
      name: z.string(),
      slug: z.string(),
    }),
    createdAt: z.date(),
  })
);

export type ListUserBookingsInputType = z.infer<typeof ListUserBookingsInputSchema>;
export type ListUserBookingsOutputType = z.infer<typeof ListUserBookingsOutputSchema>;

// ============ LIST PARTNER'S BOOKINGS ============
export const ListPartnerBookingsInputSchema = z
  .object({
    status: z.array(BookingStatusSchema).optional(),
    listingSlug: z.string().optional(), // Filter by specific listing
    upcoming: z.boolean().optional(),
    pendingOnly: z.boolean().optional(), // Quick filter for pending approval
  })
  .merge(PaginationInputSchema);

export const ListPartnerBookingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    referenceCode: z.string(),
    status: BookingStatusSchema,
    paymentStatus: PaymentStatusSchema,
    startDate: z.date(),
    endDate: z.date(),
    totalDays: z.number(),
    totalPrice: z.number(),
    currency: z.string(),
    listing: z.object({
      slug: z.string(),
      title: z.string(),
      primaryImage: z.string().nullable(),
    }),
    vehicle: z.object({
      year: z.number(),
      make: z.string(),
      model: z.string(),
      licensePlate: z.string().nullable(),
    }),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
    }),
    createdAt: z.date(),
    // For pending approval
    requiresAction: z.boolean(),
  })
);

export type ListPartnerBookingsInputType = z.infer<typeof ListPartnerBookingsInputSchema>;
export type ListPartnerBookingsOutputType = z.infer<typeof ListPartnerBookingsOutputSchema>;

// ============ LIST ALL BOOKINGS (Admin) ============
export const ListAllBookingsInputSchema = z
  .object({
    status: z.array(BookingStatusSchema).optional(),
    paymentStatus: z.array(PaymentStatusSchema).optional(),
    organizationSlug: z.string().optional(),
    listingSlug: z.string().optional(),
    userId: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    q: z.string().optional(), // Search by reference code
  })
  .merge(PaginationInputSchema);

export const ListAllBookingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    referenceCode: z.string(),
    status: BookingStatusSchema,
    paymentStatus: PaymentStatusSchema,
    startDate: z.date(),
    endDate: z.date(),
    totalDays: z.number(),
    totalPrice: z.number(),
    currency: z.string(),
    listing: z.object({
      slug: z.string(),
      title: z.string(),
    }),
    organization: z.object({
      name: z.string(),
      slug: z.string(),
    }),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
    createdAt: z.date(),
  })
);

export type ListAllBookingsInputType = z.infer<typeof ListAllBookingsInputSchema>;
export type ListAllBookingsOutputType = z.infer<typeof ListAllBookingsOutputSchema>;

// ============ UPDATE BOOKING STATUS (Partner - Approve/Reject) ============
export const UpdateBookingStatusInputSchema = z.object({
  bookingId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'cancel']),
  reason: z.string().max(500).optional(), // For rejection
});

export const UpdateBookingStatusOutputSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: BookingStatusSchema,
  paymentStatus: PaymentStatusSchema,
});

export type UpdateBookingStatusInputType = z.infer<typeof UpdateBookingStatusInputSchema>;
export type UpdateBookingStatusOutputType = z.infer<typeof UpdateBookingStatusOutputSchema>;

// ============ CANCEL BOOKING (User) ============
export const CancelBookingInputSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const CancelBookingOutputSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: BookingStatusSchema,
  paymentStatus: PaymentStatusSchema,
  refundAmount: z.number().nullable(),
});

export type CancelBookingInputType = z.infer<typeof CancelBookingInputSchema>;
export type CancelBookingOutputType = z.infer<typeof CancelBookingOutputSchema>;

// ============ START TRIP (Partner - Vehicle picked up) ============
export const StartTripInputSchema = z.object({
  bookingId: z.string().uuid(),
  startOdometer: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const StartTripOutputSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: BookingStatusSchema,
  actualPickupTime: z.date(),
});

export type StartTripInputType = z.infer<typeof StartTripInputSchema>;
export type StartTripOutputType = z.infer<typeof StartTripOutputSchema>;

// ============ COMPLETE TRIP (Partner - Vehicle returned) ============
export const CompleteTripInputSchema = z.object({
  bookingId: z.string().uuid(),
  endOdometer: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  // For extra charges if any (late return, extra mileage, damage)
  extraCharges: z.number().min(0).optional(),
  extraChargesReason: z.string().max(500).optional(),
});

export const CompleteTripOutputSchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  status: BookingStatusSchema,
  actualReturnTime: z.date(),
  totalMileage: z.number().nullable(),
});

export type CompleteTripInputType = z.infer<typeof CompleteTripInputSchema>;
export type CompleteTripOutputType = z.infer<typeof CompleteTripOutputSchema>;

// ============ BOOKING STATS (Partner Dashboard) ============
export const GetBookingStatsOutputSchema = z.object({
  totalBookings: z.number(),
  activeBookings: z.number(),
  pendingApproval: z.number(),
  completedThisMonth: z.number(),
  revenueThisMonth: z.number(),
  currency: z.string(),
  // Upcoming in next 7 days
  upcomingBookings: z.array(
    z.object({
      id: z.string(),
      referenceCode: z.string(),
      startDate: z.date(),
      listing: z.object({
        title: z.string(),
      }),
      user: z.object({
        name: z.string(),
      }),
    })
  ),
});

export type GetBookingStatsOutputType = z.infer<typeof GetBookingStatsOutputSchema>;
