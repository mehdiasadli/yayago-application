import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

// ============ ENUMS ============
const ListingStatusSchema = z.enum([
  'DRAFT',
  'AVAILABLE',
  'UNAVAILABLE',
  'MAINTENANCE',
  'LOST_OR_STOLEN',
  'ARCHIVED',
  'BLOCKED',
  'PENDING_VERIFICATION',
]);
const VerificationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
const VehicleClassSchema = z.enum([
  'ECONOMY',
  'COMPACT',
  'STANDARD',
  'PREMIUM',
  'BUSINESS',
  'LUXURY',
  'HYPERCAR',
  'OTHER',
]);
const VehicleBodyTypeSchema = z.enum([
  'SEDAN',
  'HATCHBACK',
  'SUV',
  'MINIVAN',
  'COUPE',
  'CONVERTIBLE',
  'ROADSTER',
  'SPORTS_CAR',
  'VAN',
  'PICKUP',
  'MOTORCYCLE',
  'BUS',
  'SCOOTER',
  'BICYCLE',
  'OTHER',
]);
const VehicleFuelTypeSchema = z.enum([
  'GASOLINE',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'PLUGIN_HYBRID',
  'HYDROGEN',
  'CNG',
  'LPG',
  'OTHER',
]);
const VehicleTransmissionTypeSchema = z.enum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC', 'CVT']);
const VehicleDriveTypeSchema = z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD']);
const VehicleEngineLayoutSchema = z.enum([
  'INLINE',
  'V_TYPE',
  'FLAT',
  'W_TYPE',
  'RADIAL',
  'ROTARY',
  'U_TYPE',
  'H_TYPE',
  'X_TYPE',
  'OTHER',
]);
const MileageUnitSchema = z.enum(['KM', 'MI']);
const CancellationPolicySchema = z.enum(['STRICT', 'FLEXIBLE', 'FREE_CANCELLATION']);
const ListingMediaKindSchema = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']);

// ============ CREATE LISTING ============
export const CreateListingInputSchema = z.object({
  // Basic info
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),

  // Vehicle details
  vehicle: z.object({
    modelId: z.uuid(),
    licensePlate: z.string().max(20).optional(),
    vin: z.string().max(17).optional(),
    year: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1),
    trim: z.string().max(100).optional(),
    odometer: z.number().int().min(0).optional(),

    // Specs
    class: VehicleClassSchema,
    bodyType: VehicleBodyTypeSchema,
    fuelType: VehicleFuelTypeSchema,
    transmissionType: VehicleTransmissionTypeSchema,
    driveType: VehicleDriveTypeSchema,
    doors: z.number().int().min(1).max(10).default(4),
    seats: z.number().int().min(1).max(50).default(5),

    // Engine
    engineLayout: VehicleEngineLayoutSchema,
    engineDisplacement: z.number().min(0).optional(),
    cylinders: z.number().int().min(0).optional(),
    horsepower: z.number().int().min(0).optional(),
    torque: z.number().int().min(0).optional(),

    // Dimensions (in cm)
    height: z.number().int().min(0).optional(),
    width: z.number().int().min(0).optional(),
    length: z.number().int().min(0).optional(),
    wheelbaseLength: z.number().int().min(0).optional(),
    curbWeight: z.number().int().min(0).optional(),
    cargoCapacity: z.number().int().min(0).optional(),
    towingCapacity: z.number().int().min(0).optional(),

    // Performance
    topSpeed: z.number().int().min(0).optional(),
    acceleration0to100: z.number().min(0).optional(),
    fuelEfficiencyCity: z.number().min(0).optional(),
    fuelEfficiencyHighway: z.number().min(0).optional(),
    fuelTankCapacity: z.number().min(0).optional(),
    batterCapacity: z.number().min(0).optional(),
    electricRange: z.number().min(0).optional(),

    // Colors
    interiorColors: z.array(z.string()).default([]),
    exteriorColors: z.array(z.string()).default([]),

    // Features
    featureIds: z.array(z.uuid()).default([]),

    // Condition
    conditionNotes: z.string().max(1000).optional(),
    lastServiceDate: z.coerce.date().optional(),
    nextServiceDue: z.coerce.date().optional(),
    registrationExpiry: z.coerce.date().optional(),
    insuranceExpiry: z.coerce.date().optional(),
  }),

  // Booking details
  bookingDetails: z.object({
    hasInstantBooking: z.boolean().default(false),
    minAge: z.number().int().min(16).max(100).default(18),
    maxAge: z.number().int().min(18).max(120).default(120),
    minRentalDays: z.number().int().min(1).default(1),
    maxRentalDays: z.number().int().min(1).optional(),
    mileageUnit: MileageUnitSchema.default('KM'),
    maxMileagePerDay: z.number().int().min(0).optional(),
    maxMileagePerRental: z.number().int().min(0).optional(),
    preparationTimeMinutes: z.number().int().min(0).optional(),
    minNoticeHours: z.number().int().min(0).optional(),
    // Delivery options
    deliveryEnabled: z.boolean().default(false),
    deliveryMaxDistance: z.number().min(0).optional(), // in km
    deliveryBaseFee: z.number().min(0).optional(),
    deliveryPerKmFee: z.number().min(0).optional(),
    deliveryFreeRadius: z.number().min(0).optional(), // free within this radius
    deliveryNotes: z.string().max(500).optional(),
  }),

  // Location - where the car is physically located
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      address: z.string().max(500),
      cityId: z.uuid().optional(),
    })
    .optional(),

  // Pricing
  pricing: z.object({
    currency: z.string().length(3).default('AED'),
    pricePerHour: z.number().min(0).optional(),
    pricePerDay: z.number().min(0),
    pricePerThreeDays: z.number().min(0).optional(),
    pricePerWeek: z.number().min(0).optional(),
    pricePerMonth: z.number().min(0).optional(),
    weekendPricePerDay: z.number().min(0).optional(),
    depositAmount: z.number().min(0).optional(),
    securityDepositRequired: z.boolean().default(true),
    securityDepositAmount: z.number().min(0).optional(),
    acceptsSecurityDepositWaiver: z.boolean().default(false),
    securityDepositWaiverCost: z.number().min(0).optional(),
    cancellationPolicy: CancellationPolicySchema.default('STRICT'),
    cancellationFee: z.number().min(0).optional(),
    refundableDepositAmount: z.number().min(0).optional(),
    cancelGracePeriodHours: z.number().int().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
  }),
});

export const CreateListingOutputSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  status: ListingStatusSchema,
});

export type CreateListingInputType = z.infer<typeof CreateListingInputSchema>;
export type CreateListingOutputType = z.infer<typeof CreateListingOutputSchema>;

// ============ UPDATE LISTING ============
export const UpdateListingInputSchema = z.object({
  slug: z.string(),
  data: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
  }),
});

export const UpdateListingOutputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  updatedAt: z.date(),
});

export type UpdateListingInputType = z.infer<typeof UpdateListingInputSchema>;
export type UpdateListingOutputType = z.infer<typeof UpdateListingOutputSchema>;

// ============ UPDATE LISTING VEHICLE ============
export const UpdateListingVehicleInputSchema = z.object({
  slug: z.string(),
  data: CreateListingInputSchema.shape.vehicle.partial(),
});

export const UpdateListingVehicleOutputSchema = z.object({
  slug: z.string(),
  updatedAt: z.date(),
});

export type UpdateListingVehicleInputType = z.infer<typeof UpdateListingVehicleInputSchema>;
export type UpdateListingVehicleOutputType = z.infer<typeof UpdateListingVehicleOutputSchema>;

// ============ UPDATE LISTING PRICING ============
export const UpdateListingPricingInputSchema = z.object({
  slug: z.string(),
  data: CreateListingInputSchema.shape.pricing.partial(),
});

export const UpdateListingPricingOutputSchema = z.object({
  slug: z.string(),
  updatedAt: z.date(),
});

export type UpdateListingPricingInputType = z.infer<typeof UpdateListingPricingInputSchema>;
export type UpdateListingPricingOutputType = z.infer<typeof UpdateListingPricingOutputSchema>;

// ============ UPDATE LISTING BOOKING DETAILS ============
export const UpdateListingBookingDetailsInputSchema = z.object({
  slug: z.string(),
  data: CreateListingInputSchema.shape.bookingDetails.partial(),
});

export const UpdateListingBookingDetailsOutputSchema = z.object({
  slug: z.string(),
  updatedAt: z.date(),
});

export type UpdateListingBookingDetailsInputType = z.infer<typeof UpdateListingBookingDetailsInputSchema>;
export type UpdateListingBookingDetailsOutputType = z.infer<typeof UpdateListingBookingDetailsOutputSchema>;

// ============ UPDATE LISTING LOCATION ============
export const UpdateListingLocationInputSchema = z.object({
  slug: z.string(),
  data: z.object({
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
    address: z.string().max(500).nullable(),
    cityId: z.uuid().optional().nullable(),
  }),
});

export const UpdateListingLocationOutputSchema = z.object({
  slug: z.string(),
  updatedAt: z.date(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    })
    .nullable(),
});

export type UpdateListingLocationInputType = z.infer<typeof UpdateListingLocationInputSchema>;
export type UpdateListingLocationOutputType = z.infer<typeof UpdateListingLocationOutputSchema>;

// ============ DELETE LISTING ============
export const DeleteListingInputSchema = z.object({
  slug: z.string(),
});

export const DeleteListingOutputSchema = z.object({
  slug: z.string(),
});

export type DeleteListingInputType = z.infer<typeof DeleteListingInputSchema>;
export type DeleteListingOutputType = z.infer<typeof DeleteListingOutputSchema>;

// ============ UPDATE LISTING STATUS (Partner) ============
export const UpdateListingStatusInputSchema = z.object({
  slug: z.string(),
  status: z.enum(['DRAFT', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'ARCHIVED']),
});

export const UpdateListingStatusOutputSchema = z.object({
  slug: z.string(),
  status: ListingStatusSchema,
});

export type UpdateListingStatusInputType = z.infer<typeof UpdateListingStatusInputSchema>;
export type UpdateListingStatusOutputType = z.infer<typeof UpdateListingStatusOutputSchema>;

// ============ SUBMIT FOR REVIEW (Partner) ============
export const SubmitListingForReviewInputSchema = z.object({
  slug: z.string(),
});

export const SubmitListingForReviewOutputSchema = z.object({
  slug: z.string(),
  status: ListingStatusSchema,
  verificationStatus: VerificationStatusSchema,
});

export type SubmitListingForReviewInputType = z.infer<typeof SubmitListingForReviewInputSchema>;
export type SubmitListingForReviewOutputType = z.infer<typeof SubmitListingForReviewOutputSchema>;

// ============ UPDATE VERIFICATION STATUS (Admin) ============
export const UpdateListingVerificationInputSchema = z.object({
  slug: z.string(),
  verificationStatus: VerificationStatusSchema,
  rejectionReason: z.string().max(1000).optional(),
});

export const UpdateListingVerificationOutputSchema = z.object({
  slug: z.string(),
  verificationStatus: VerificationStatusSchema,
  status: ListingStatusSchema,
});

export type UpdateListingVerificationInputType = z.infer<typeof UpdateListingVerificationInputSchema>;
export type UpdateListingVerificationOutputType = z.infer<typeof UpdateListingVerificationOutputSchema>;

// ============ UPDATE MEDIA VERIFICATION STATUS (Admin) ============
export const UpdateMediaVerificationInputSchema = z.object({
  mediaId: z.string(),
  verificationStatus: VerificationStatusSchema,
  rejectionReason: z.string().max(500).optional(),
});

export const UpdateMediaVerificationOutputSchema = z.object({
  id: z.string(),
  verificationStatus: VerificationStatusSchema,
});

export type UpdateMediaVerificationInputType = z.infer<typeof UpdateMediaVerificationInputSchema>;
export type UpdateMediaVerificationOutputType = z.infer<typeof UpdateMediaVerificationOutputSchema>;

// ============ ADD MEDIA ============
export const AddListingMediaInputSchema = z.object({
  slug: z.string(),
  media: z.object({
    type: ListingMediaKindSchema,
    url: z.string(), // Can be URL or base64 data URL
    alt: z.string().max(200).optional(),
    caption: z.record(z.string(), z.string()).optional(), // Localized caption
    width: z.number().int().min(1),
    height: z.number().int().min(1),
    size: z.number().int().min(1),
    mimeType: z.string(),
    isPrimary: z.boolean().default(false),
  }),
});

export const AddListingMediaOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  isPrimary: z.boolean(),
});

export type AddListingMediaInputType = z.infer<typeof AddListingMediaInputSchema>;
export type AddListingMediaOutputType = z.infer<typeof AddListingMediaOutputSchema>;

// ============ DELETE MEDIA ============
export const DeleteListingMediaInputSchema = z.object({
  slug: z.string(),
  mediaId: z.uuid(),
});

export const DeleteListingMediaOutputSchema = z.object({
  success: z.boolean(),
});

export type DeleteListingMediaInputType = z.infer<typeof DeleteListingMediaInputSchema>;
export type DeleteListingMediaOutputType = z.infer<typeof DeleteListingMediaOutputSchema>;

// ============ SET PRIMARY MEDIA ============
export const SetPrimaryMediaInputSchema = z.object({
  slug: z.string(),
  mediaId: z.uuid(),
});

export const SetPrimaryMediaOutputSchema = z.object({
  success: z.boolean(),
});

export type SetPrimaryMediaInputType = z.infer<typeof SetPrimaryMediaInputSchema>;
export type SetPrimaryMediaOutputType = z.infer<typeof SetPrimaryMediaOutputSchema>;

// ============ FIND ONE (Partner) ============
export const FindOneListingInputSchema = z.object({
  slug: z.string(),
});

export const FindOneListingOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  status: ListingStatusSchema,
  verificationStatus: VerificationStatusSchema,
  viewCount: z.number(),
  bookingCount: z.number(),
  reviewCount: z.number(),
  averageRating: z.number().nullable(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  vehicle: z
    .object({
      id: z.string(),
      licensePlate: z.string().nullable(),
      vin: z.string().nullable(),
      year: z.number(),
      trim: z.string().nullable(),
      odometer: z.number().nullable(),
      class: VehicleClassSchema,
      bodyType: VehicleBodyTypeSchema,
      fuelType: VehicleFuelTypeSchema,
      transmissionType: VehicleTransmissionTypeSchema,
      driveType: VehicleDriveTypeSchema,
      doors: z.number(),
      seats: z.number(),
      engineLayout: VehicleEngineLayoutSchema,
      engineDisplacement: z.number().nullable(),
      cylinders: z.number().nullable(),
      horsepower: z.number().nullable(),
      torque: z.number().nullable(),
      interiorColors: z.array(z.string()),
      exteriorColors: z.array(z.string()),
      conditionNotes: z.string().nullable(),
      model: z.object({
        slug: z.string(),
        name: z.string(),
        brand: z.object({
          slug: z.string(),
          name: z.string(),
          logo: z.string().nullable(),
        }),
      }),
      features: z.array(
        z.object({
          id: z.string(),
          code: z.string(),
          name: z.string(),
          category: z.string(),
        })
      ),
    })
    .nullable(),
  pricing: z
    .object({
      id: z.string(),
      currency: z.string(),
      pricePerHour: z.number().nullable(),
      pricePerDay: z.number(),
      pricePerThreeDays: z.number().nullable(),
      pricePerWeek: z.number().nullable(),
      pricePerMonth: z.number().nullable(),
      weekendPricePerDay: z.number().nullable(),
      depositAmount: z.number().nullable(),
      securityDepositRequired: z.boolean(),
      securityDepositAmount: z.number().nullable(),
      cancellationPolicy: CancellationPolicySchema,
      cancellationFee: z.number().nullable(),
      taxRate: z.number().nullable(),
    })
    .nullable(),
  bookingDetails: z
    .object({
      id: z.string(),
      hasInstantBooking: z.boolean(),
      minAge: z.number(),
      maxAge: z.number(),
      minRentalDays: z.number(),
      maxRentalDays: z.number().nullable(),
      mileageUnit: MileageUnitSchema,
      maxMileagePerDay: z.number().nullable(),
      maxMileagePerRental: z.number().nullable(),
      preparationTimeMinutes: z.number().nullable(),
      minNoticeHours: z.number().nullable(),
      // Delivery options
      deliveryEnabled: z.boolean(),
      deliveryMaxDistance: z.number().nullable(),
      deliveryBaseFee: z.number().nullable(),
      deliveryPerKmFee: z.number().nullable(),
      deliveryFreeRadius: z.number().nullable(),
      deliveryNotes: z.string().nullable(),
    })
    .nullable(),
  // Listing location (separate from organization)
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  address: z.string().nullable(),
  media: z.array(
    z.object({
      id: z.string(),
      type: ListingMediaKindSchema,
      status: z.string(),
      verificationStatus: VerificationStatusSchema,
      isPrimary: z.boolean(),
      url: z.string(),
      alt: z.string().nullable(),
      width: z.number(),
      height: z.number(),
      displayOrder: z.number(),
    })
  ),
  organization: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo: z.string().nullable(),
    // Organization location (for fallback)
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    address: z.string().nullable(),
  }),
});

export type FindOneListingInputType = z.infer<typeof FindOneListingInputSchema>;
export type FindOneListingOutputType = z.infer<typeof FindOneListingOutputSchema>;

// ============ LIST (Partner - own listings) ============
export const ListOwnListingsInputSchema = z
  .object({
    q: z.string().optional(),
    status: ListingStatusSchema.optional(),
    verificationStatus: VerificationStatusSchema.optional(),
  })
  .merge(PaginationInputSchema);

export const ListOwnListingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: ListingStatusSchema,
    verificationStatus: VerificationStatusSchema,
    viewCount: z.number(),
    bookingCount: z.number(),
    averageRating: z.number().nullable(),
    createdAt: z.date(),
    primaryMedia: z
      .object({
        url: z.string(),
        alt: z.string().nullable(),
      })
      .nullable(),
    vehicle: z
      .object({
        year: z.number(),
        model: z.object({
          name: z.string(),
          brand: z.object({
            name: z.string(),
          }),
        }),
      })
      .nullable(),
    pricing: z
      .object({
        pricePerDay: z.number(),
        currency: z.string(),
      })
      .nullable(),
  })
);

export type ListOwnListingsInputType = z.infer<typeof ListOwnListingsInputSchema>;
export type ListOwnListingsOutputType = z.infer<typeof ListOwnListingsOutputSchema>;

// ============ LIST (Admin - all listings) ============
export const ListAllListingsInputSchema = z
  .object({
    q: z.string().optional(),
    status: ListingStatusSchema.optional(),
    verificationStatus: VerificationStatusSchema.optional(),
    organizationId: z.uuid().optional(),
  })
  .merge(PaginationInputSchema);

export const ListAllListingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: ListingStatusSchema,
    verificationStatus: VerificationStatusSchema,
    viewCount: z.number(),
    bookingCount: z.number(),
    createdAt: z.date(),
    organization: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
    primaryMedia: z
      .object({
        url: z.string(),
        alt: z.string().nullable(),
      })
      .nullable(),
    vehicle: z
      .object({
        year: z.number(),
        model: z.object({
          name: z.string(),
          brand: z.object({
            name: z.string(),
          }),
        }),
      })
      .nullable(),
    pricing: z
      .object({
        pricePerDay: z.number(),
        currency: z.string(),
      })
      .nullable(),
  })
);

export type ListAllListingsInputType = z.infer<typeof ListAllListingsInputSchema>;
export type ListAllListingsOutputType = z.infer<typeof ListAllListingsOutputSchema>;

// ============ LIST (Public - browsing) ============
export const ListPublicListingsInputSchema = z
  .object({
    q: z.string().optional(),
    cityCode: z.string().optional(),
    // Vehicle filters
    vehicleClass: VehicleClassSchema.optional(),
    bodyType: VehicleBodyTypeSchema.optional(),
    fuelType: VehicleFuelTypeSchema.optional(),
    transmissionType: VehicleTransmissionTypeSchema.optional(),
    minSeats: z.number().int().min(1).optional(),
    maxSeats: z.number().int().optional(),
    minDoors: z.number().int().min(1).optional(),
    maxDoors: z.number().int().optional(),
    minYear: z.number().int().optional(),
    maxYear: z.number().int().optional(),
    brandSlug: z.string().optional(),
    modelSlug: z.string().optional(),
    // Pricing filters
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    hasNoDeposit: z.boolean().optional(),
    // Booking filters
    hasInstantBooking: z.boolean().optional(),
    hasFreeCancellation: z.boolean().optional(),
    hasDelivery: z.boolean().optional(), // Only cars that offer delivery
    // Listing filters
    isFeatured: z.boolean().optional(),
    // LOCATION FILTERS
    lat: z.number().min(-90).max(90).optional(), // User's location
    lng: z.number().min(-180).max(180).optional(),
    radius: z.number().min(0).max(500).optional(), // Search radius in km (max 500km)
    // AVAILABILITY FILTERS - to show only available cars for selected dates
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    // Sorting
    sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular', 'rating', 'distance']).default('newest'),
  })
  .merge(PaginationInputSchema);

export const ListPublicListingsOutputSchema = PaginationOutputSchema(
  z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    averageRating: z.number().nullable(),
    reviewCount: z.number(),
    isFeatured: z.boolean(),
    primaryMedia: z
      .object({
        url: z.string(),
        alt: z.string().nullable(),
      })
      .nullable(),
    vehicle: z.object({
      year: z.number(),
      class: VehicleClassSchema,
      bodyType: VehicleBodyTypeSchema,
      fuelType: VehicleFuelTypeSchema,
      transmissionType: VehicleTransmissionTypeSchema,
      seats: z.number(),
      model: z.object({
        name: z.string(),
        brand: z.object({
          name: z.string(),
          logo: z.string().nullable(),
        }),
      }),
    }),
    pricing: z.object({
      pricePerDay: z.number(),
      currency: z.string(),
      // Total price if dates are selected
      totalPrice: z.number().optional(),
      totalDays: z.number().optional(),
    }),
    bookingDetails: z.object({
      hasInstantBooking: z.boolean(),
      // Delivery info
      deliveryEnabled: z.boolean(),
      deliveryBaseFee: z.number().nullable(),
    }),
    organization: z.object({
      name: z.string(),
      slug: z.string(),
    }),
    // Location info
    location: z
      .object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().nullable(),
        distance: z.number().optional(), // Distance from user in km if lat/lng provided
      })
      .nullable(),
  })
);

export type ListPublicListingsInputType = z.infer<typeof ListPublicListingsInputSchema>;
export type ListPublicListingsOutputType = z.infer<typeof ListPublicListingsOutputSchema>;

// ============ GET PUBLIC LISTING DETAILS ============
export const GetPublicListingInputSchema = z.object({
  slug: z.string(),
});

export const GetPublicListingOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  isFeatured: z.boolean(),
  vehicle: z.object({
    year: z.number(),
    class: VehicleClassSchema,
    bodyType: VehicleBodyTypeSchema,
    fuelType: VehicleFuelTypeSchema,
    transmissionType: VehicleTransmissionTypeSchema,
    driveType: VehicleDriveTypeSchema,
    doors: z.number(),
    seats: z.number(),
    engineLayout: VehicleEngineLayoutSchema,
    engineDisplacement: z.number().nullable(),
    cylinders: z.number().nullable(),
    horsepower: z.number().nullable(),
    torque: z.number().nullable(),
    interiorColors: z.array(z.string()),
    exteriorColors: z.array(z.string()),
    model: z.object({
      name: z.string(),
      slug: z.string(),
      brand: z.object({
        name: z.string(),
        slug: z.string(),
        logo: z.string().nullable(),
      }),
    }),
    features: z.array(
      z.object({
        code: z.string(),
        name: z.string(),
        category: z.string(),
        iconKey: z.string().nullable(),
      })
    ),
  }),
  pricing: z.object({
    currency: z.string(),
    pricePerHour: z.number().nullable(),
    pricePerDay: z.number(),
    pricePerThreeDays: z.number().nullable(),
    pricePerWeek: z.number().nullable(),
    pricePerMonth: z.number().nullable(),
    weekendPricePerDay: z.number().nullable(),
    depositAmount: z.number().nullable(),
    securityDepositRequired: z.boolean(),
    securityDepositAmount: z.number().nullable(),
    cancellationPolicy: CancellationPolicySchema,
    taxRate: z.number().nullable(),
  }),
  bookingDetails: z.object({
    hasInstantBooking: z.boolean(),
    minAge: z.number(),
    maxAge: z.number(),
    minRentalDays: z.number(),
    maxRentalDays: z.number().nullable(),
    mileageUnit: MileageUnitSchema,
    maxMileagePerDay: z.number().nullable(),
    maxMileagePerRental: z.number().nullable(),
    minNoticeHours: z.number().nullable(),
    // Delivery options
    deliveryEnabled: z.boolean(),
    deliveryMaxDistance: z.number().nullable(),
    deliveryBaseFee: z.number().nullable(),
    deliveryPerKmFee: z.number().nullable(),
    deliveryFreeRadius: z.number().nullable(),
    deliveryNotes: z.string().nullable(),
  }),
  // Location where the car is located
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().nullable(),
      city: z
        .object({
          name: z.string(),
          code: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  media: z.array(
    z.object({
      id: z.string(),
      type: ListingMediaKindSchema,
      url: z.string(),
      alt: z.string().nullable(),
      isPrimary: z.boolean(),
      width: z.number(),
      height: z.number(),
    })
  ),
  organization: z.object({
    name: z.string(),
    slug: z.string(),
    logo: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    city: z
      .object({
        name: z.string(),
        country: z.object({
          name: z.string(),
        }),
      })
      .nullable(),
  }),
});

export type GetPublicListingInputType = z.infer<typeof GetPublicListingInputSchema>;
export type GetPublicListingOutputType = z.infer<typeof GetPublicListingOutputSchema>;

// ============ GET SUBSCRIPTION USAGE (for partners) ============
export const GetSubscriptionUsageOutputSchema = z.object({
  plan: z.object({
    name: z.string(),
    slug: z.string(),
    maxMembers: z.number(),
    hasAnalytics: z.boolean(),
  }),
  usage: z.object({
    listings: z.object({
      current: z.number(),
      max: z.number(),
      remaining: z.number(),
    }),
    featuredListings: z.object({
      current: z.number(),
      max: z.number(),
      remaining: z.number(),
    }),
    members: z.object({
      current: z.number(),
      max: z.number(),
      remaining: z.number(),
    }),
    images: z.object({
      current: z.number(),
      maxPerListing: z.number(),
    }),
    videos: z.object({
      current: z.number(),
      maxPerListing: z.number(),
    }),
  }),
  subscription: z.object({
    id: z.string(),
    status: z.string(),
    periodStart: z.date().nullable(),
    periodEnd: z.date().nullable(),
    cancelAtPeriodEnd: z.boolean().nullable(),
    isTrialing: z.boolean(),
    trialStart: z.date().nullable(),
    trialEnd: z.date().nullable(),
    stripeSubscriptionId: z.string().nullable(),
  }),
  organizationId: z.string(),
});

export type GetSubscriptionUsageOutputType = z.infer<typeof GetSubscriptionUsageOutputSchema>;
