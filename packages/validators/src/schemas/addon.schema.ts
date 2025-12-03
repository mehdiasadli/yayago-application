import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import {
  AddonCategorySchema,
  AddonBillingTypeSchema,
  AddonInputTypeSchema,
  AddonDiscountTypeSchema,
  AddonBookingStatusSchema,
} from '@yayago-app/db/enums';

// ============ SHARED SCHEMAS ============

export const LocalizedTextSchema = z.record(z.string(), z.string()); // { "en": "...", "az": "..." }

export const SelectionOptionSchema = z.object({
  key: z.string(), // e.g., "basic", "premium", "full"
  name: LocalizedTextSchema, // { "en": "Basic Coverage" }
  description: LocalizedTextSchema.optional(),
  priceMultiplier: z.number().min(0).default(1), // 1 = base price, 1.5 = 50% more
});

// ============ ADDON OUTPUT (Base template) ============

export const AddonOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  slug: z.string(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.nullable(),
  shortName: LocalizedTextSchema.nullable(),

  category: AddonCategorySchema,
  iconKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  displayOrder: z.number(),
  isFeatured: z.boolean(),
  isPopular: z.boolean(),

  inputType: AddonInputTypeSchema,
  billingType: AddonBillingTypeSchema,
  suggestedPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),

  minQuantity: z.number(),
  maxQuantity: z.number(),

  minRentalDays: z.number().nullable(),
  maxRentalDays: z.number().nullable(),
  minDriverAge: z.number().nullable(),
  requiresApproval: z.boolean(),

  allowedVehicleClasses: z.array(z.string()).nullable(),
  allowedVehicleBodyTypes: z.array(z.string()).nullable(),

  termsAndConditions: LocalizedTextSchema.nullable(),
  isRefundable: z.boolean(),
  refundPolicy: LocalizedTextSchema.nullable(),
  isTaxExempt: z.boolean(),

  isActive: z.boolean(),

  selectionOptions: z.array(SelectionOptionSchema).nullable(),
});

export type AddonOutputType = z.infer<typeof AddonOutputSchema>;

// ============ CREATE ADDON (Admin) ============

export const CreateAddonInputSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  shortName: LocalizedTextSchema.optional(),

  category: AddonCategorySchema,
  iconKey: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),

  inputType: AddonInputTypeSchema.default('BOOLEAN'),
  billingType: AddonBillingTypeSchema.default('FIXED'),
  suggestedPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),

  minQuantity: z.number().int().min(1).default(1),
  maxQuantity: z.number().int().min(1).default(10),

  minRentalDays: z.number().int().min(1).optional(),
  maxRentalDays: z.number().int().min(1).optional(),
  minDriverAge: z.number().int().min(18).max(100).optional(),
  requiresApproval: z.boolean().default(false),

  allowedVehicleClasses: z.array(z.string()).optional(),
  allowedVehicleBodyTypes: z.array(z.string()).optional(),

  termsAndConditions: LocalizedTextSchema.optional(),
  isRefundable: z.boolean().default(true),
  refundPolicy: LocalizedTextSchema.optional(),
  isTaxExempt: z.boolean().default(false),

  isActive: z.boolean().default(true),

  selectionOptions: z.array(SelectionOptionSchema).optional(),

  // Countries where this addon is available (country IDs)
  supportedCountryIds: z.array(z.uuid()).optional(),
});

export const CreateAddonOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
});

export type CreateAddonInputType = z.infer<typeof CreateAddonInputSchema>;
export type CreateAddonOutputType = z.infer<typeof CreateAddonOutputSchema>;

// ============ UPDATE ADDON (Admin) ============

export const UpdateAddonInputSchema = z.object({
  addonId: z.uuid(),
  name: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema.optional().nullable(),
  shortName: LocalizedTextSchema.optional().nullable(),

  category: AddonCategorySchema.optional(),
  iconKey: z.string().max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),

  inputType: AddonInputTypeSchema.optional(),
  billingType: AddonBillingTypeSchema.optional(),
  suggestedPrice: z.number().min(0).optional().nullable(),
  maxPrice: z.number().min(0).optional().nullable(),

  minQuantity: z.number().int().min(1).optional(),
  maxQuantity: z.number().int().min(1).optional(),

  minRentalDays: z.number().int().min(1).optional().nullable(),
  maxRentalDays: z.number().int().min(1).optional().nullable(),
  minDriverAge: z.number().int().min(18).max(100).optional().nullable(),
  requiresApproval: z.boolean().optional(),

  allowedVehicleClasses: z.array(z.string()).optional().nullable(),
  allowedVehicleBodyTypes: z.array(z.string()).optional().nullable(),

  termsAndConditions: LocalizedTextSchema.optional().nullable(),
  isRefundable: z.boolean().optional(),
  refundPolicy: LocalizedTextSchema.optional().nullable(),
  isTaxExempt: z.boolean().optional(),

  isActive: z.boolean().optional(),

  selectionOptions: z.array(SelectionOptionSchema).optional().nullable(),

  supportedCountryIds: z.array(z.uuid()).optional(),
});

export const UpdateAddonOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  updatedAt: z.date(),
});

export type UpdateAddonInputType = z.infer<typeof UpdateAddonInputSchema>;
export type UpdateAddonOutputType = z.infer<typeof UpdateAddonOutputSchema>;

// ============ DELETE ADDON (Admin) ============

export const DeleteAddonInputSchema = z.object({
  addonId: z.uuid(),
});

export const DeleteAddonOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export type DeleteAddonInputType = z.infer<typeof DeleteAddonInputSchema>;
export type DeleteAddonOutputType = z.infer<typeof DeleteAddonOutputSchema>;

// ============ GET ADDON ============

export const GetAddonInputSchema = z.object({
  addonId: z.uuid().optional(),
  slug: z.string().optional(),
}).refine((data) => data.addonId || data.slug, {
  message: 'Either addonId or slug must be provided',
});

export type GetAddonInputType = z.infer<typeof GetAddonInputSchema>;

// ============ LIST ADDONS (Public/Admin) ============

export const ListAddonsInputSchema = PaginationInputSchema.extend({
  q: z.string().optional(), // Search by name
  category: AddonCategorySchema.optional(),
  inputType: AddonInputTypeSchema.optional(),
  billingType: AddonBillingTypeSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  countryId: z.uuid().optional(), // Filter by supported country
  vehicleClass: z.string().optional(), // Filter by vehicle class compatibility
});

export const ListAddonsOutputSchema = PaginationOutputSchema(
  AddonOutputSchema.omit({
    termsAndConditions: true,
    refundPolicy: true,
    selectionOptions: true,
  })
);

export type ListAddonsInputType = z.infer<typeof ListAddonsInputSchema>;
export type ListAddonsOutputType = z.infer<typeof ListAddonsOutputSchema>;

// ============ LIST ADDONS FOR LISTING (Public - Available addons for a listing) ============

export const ListAvailableAddonsInputSchema = z.object({
  listingSlug: z.string(),
  rentalDays: z.number().int().min(1).optional(), // To filter by rental duration requirements
});

export const AvailableAddonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.nullable(),
  shortName: LocalizedTextSchema.nullable(),

  category: AddonCategorySchema,
  iconKey: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isFeatured: z.boolean(),
  isPopular: z.boolean(),

  inputType: AddonInputTypeSchema,
  billingType: AddonBillingTypeSchema,

  minQuantity: z.number(),
  maxQuantity: z.number(),

  minDriverAge: z.number().nullable(),
  requiresApproval: z.boolean(),

  termsAndConditions: LocalizedTextSchema.nullable(),
  isRefundable: z.boolean(),

  selectionOptions: z.array(SelectionOptionSchema).nullable(),

  // ListingAddon specific pricing
  listingAddon: z.object({
    id: z.string(),
    price: z.number(),
    currency: z.string(),
    discountAmount: z.number().nullable(),
    discountType: AddonDiscountTypeSchema,
    discountValidUntil: z.date().nullable(),
    stockQuantity: z.number().nullable(), // null = unlimited
    maxPerBooking: z.number().nullable(),
    minPerBooking: z.number(),
    isIncludedFree: z.boolean(),
    isRecommended: z.boolean(),
    customName: LocalizedTextSchema.nullable(),
    customDescription: LocalizedTextSchema.nullable(),
  }),
});

export const ListAvailableAddonsOutputSchema = z.object({
  addons: z.array(AvailableAddonSchema),
  // Group by category for UI - using string keys as categories may be dynamic/empty
  byCategory: z.record(z.string(), z.array(AvailableAddonSchema)),
});

export type ListAvailableAddonsInputType = z.infer<typeof ListAvailableAddonsInputSchema>;
export type AvailableAddonType = z.infer<typeof AvailableAddonSchema>;
export type ListAvailableAddonsOutputType = z.infer<typeof ListAvailableAddonsOutputSchema>;

// ============ LISTING ADDON OUTPUT ============

export const ListingAddonOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  listingId: z.string(),
  addonId: z.string(),

  isActive: z.boolean(),

  customName: LocalizedTextSchema.nullable(),
  customDescription: LocalizedTextSchema.nullable(),
  customTerms: LocalizedTextSchema.nullable(),

  price: z.number(),
  currency: z.string(),
  discountAmount: z.number().nullable(),
  discountType: AddonDiscountTypeSchema,
  discountValidUntil: z.date().nullable(),

  stockQuantity: z.number().nullable(),
  maxPerBooking: z.number().nullable(),
  minPerBooking: z.number(),

  isIncludedFree: z.boolean(),
  isRecommended: z.boolean(),
  displayOrder: z.number(),

  minDriverAge: z.number().nullable(),

  // Include base addon info
  addon: AddonOutputSchema.pick({
    id: true,
    slug: true,
    name: true,
    description: true,
    category: true,
    iconKey: true,
    imageUrl: true,
    inputType: true,
    billingType: true,
    minQuantity: true,
    maxQuantity: true,
    isRefundable: true,
  }),
});

export type ListingAddonOutputType = z.infer<typeof ListingAddonOutputSchema>;

// ============ CREATE LISTING ADDON (Partner) ============

export const CreateListingAddonInputSchema = z.object({
  listingId: z.uuid(),
  addonId: z.uuid(),

  isActive: z.boolean().default(true),

  customName: LocalizedTextSchema.optional(),
  customDescription: LocalizedTextSchema.optional(),
  customTerms: LocalizedTextSchema.optional(),

  price: z.number().min(0),
  currency: z.string().length(3).default('AED'),
  discountAmount: z.number().min(0).optional(),
  discountType: AddonDiscountTypeSchema.default('PERCENTAGE'),
  discountValidUntil: z.coerce.date().optional(),

  stockQuantity: z.number().int().min(0).optional(), // null = unlimited
  maxPerBooking: z.number().int().min(1).optional(),
  minPerBooking: z.number().int().min(1).default(1),

  isIncludedFree: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),

  minDriverAge: z.number().int().min(18).max(100).optional(),
});

export const CreateListingAddonOutputSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  addonId: z.string(),
});

export type CreateListingAddonInputType = z.infer<typeof CreateListingAddonInputSchema>;
export type CreateListingAddonOutputType = z.infer<typeof CreateListingAddonOutputSchema>;

// ============ UPDATE LISTING ADDON (Partner) ============

export const UpdateListingAddonInputSchema = z.object({
  listingAddonId: z.uuid(),

  isActive: z.boolean().optional(),

  customName: LocalizedTextSchema.optional().nullable(),
  customDescription: LocalizedTextSchema.optional().nullable(),
  customTerms: LocalizedTextSchema.optional().nullable(),

  price: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional().nullable(),
  discountType: AddonDiscountTypeSchema.optional(),
  discountValidUntil: z.coerce.date().optional().nullable(),

  stockQuantity: z.number().int().min(0).optional().nullable(),
  maxPerBooking: z.number().int().min(1).optional().nullable(),
  minPerBooking: z.number().int().min(1).optional(),

  isIncludedFree: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),

  minDriverAge: z.number().int().min(18).max(100).optional().nullable(),
});

export const UpdateListingAddonOutputSchema = z.object({
  id: z.string(),
  updatedAt: z.date(),
});

export type UpdateListingAddonInputType = z.infer<typeof UpdateListingAddonInputSchema>;
export type UpdateListingAddonOutputType = z.infer<typeof UpdateListingAddonOutputSchema>;

// ============ DELETE LISTING ADDON (Partner) ============

export const DeleteListingAddonInputSchema = z.object({
  listingAddonId: z.uuid(),
});

export const DeleteListingAddonOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export type DeleteListingAddonInputType = z.infer<typeof DeleteListingAddonInputSchema>;
export type DeleteListingAddonOutputType = z.infer<typeof DeleteListingAddonOutputSchema>;

// ============ LIST LISTING ADDONS (Partner) ============

export const ListListingAddonsInputSchema = PaginationInputSchema.extend({
  listingId: z.uuid(),
  isActive: z.boolean().optional(),
  category: AddonCategorySchema.optional(),
});

export const ListListingAddonsOutputSchema = PaginationOutputSchema(ListingAddonOutputSchema);

export type ListListingAddonsInputType = z.infer<typeof ListListingAddonsInputSchema>;
export type ListListingAddonsOutputType = z.infer<typeof ListListingAddonsOutputSchema>;

// ============ BOOKING ADDON OUTPUT ============

export const BookingAddonOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),

  bookingId: z.string(),
  listingAddonId: z.string(),

  addonSnapshot: z.object({
    slug: z.string(),
    name: LocalizedTextSchema,
    description: LocalizedTextSchema.nullable(),
    category: AddonCategorySchema,
    iconKey: z.string().nullable(),
    billingType: AddonBillingTypeSchema,
    inputType: AddonInputTypeSchema,
    isRefundable: z.boolean(),
  }),

  quantity: z.number(),
  selectedOption: z.string().nullable(),

  unitPrice: z.number(),
  totalPrice: z.number(),
  currency: z.string(),
  discountApplied: z.number(),
  taxAmount: z.number(),

  status: AddonBookingStatusSchema,
  cancelledAt: z.date().nullable(),
  cancelledReason: z.string().nullable(),
  refundAmount: z.number().nullable(),
});

export type BookingAddonOutputType = z.infer<typeof BookingAddonOutputSchema>;

// ============ ADD ADDON TO BOOKING (During checkout) ============

export const AddAddonToBookingInputSchema = z.object({
  bookingId: z.uuid(),
  listingAddonId: z.uuid(),
  quantity: z.number().int().min(1).default(1),
  selectedOption: z.string().optional(), // For SELECTION type addons
});

export const AddAddonToBookingOutputSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  totalPrice: z.number(),
  // Updated booking totals
  bookingAddonsTotal: z.number(),
  bookingGrandTotal: z.number(),
});

export type AddAddonToBookingInputType = z.infer<typeof AddAddonToBookingInputSchema>;
export type AddAddonToBookingOutputType = z.infer<typeof AddAddonToBookingOutputSchema>;

// ============ REMOVE ADDON FROM BOOKING ============

export const RemoveAddonFromBookingInputSchema = z.object({
  bookingAddonId: z.uuid(),
});

export const RemoveAddonFromBookingOutputSchema = z.object({
  id: z.string(),
  removed: z.boolean(),
  // Updated booking totals
  bookingAddonsTotal: z.number(),
  bookingGrandTotal: z.number(),
});

export type RemoveAddonFromBookingInputType = z.infer<typeof RemoveAddonFromBookingInputSchema>;
export type RemoveAddonFromBookingOutputType = z.infer<typeof RemoveAddonFromBookingOutputSchema>;

// ============ CANCEL BOOKING ADDON (After booking confirmed) ============

export const CancelBookingAddonInputSchema = z.object({
  bookingAddonId: z.uuid(),
  reason: z.string().max(500).optional(),
});

export const CancelBookingAddonOutputSchema = z.object({
  id: z.string(),
  status: AddonBookingStatusSchema,
  refundAmount: z.number().nullable(),
});

export type CancelBookingAddonInputType = z.infer<typeof CancelBookingAddonInputSchema>;
export type CancelBookingAddonOutputType = z.infer<typeof CancelBookingAddonOutputSchema>;

// ============ LIST BOOKING ADDONS ============

export const ListBookingAddonsInputSchema = z.object({
  bookingId: z.uuid(),
});

export const ListBookingAddonsOutputSchema = z.object({
  addons: z.array(BookingAddonOutputSchema),
  totalAddonsPrice: z.number(),
  currency: z.string(),
});

export type ListBookingAddonsInputType = z.infer<typeof ListBookingAddonsInputSchema>;
export type ListBookingAddonsOutputType = z.infer<typeof ListBookingAddonsOutputSchema>;

// ============ ADDON BUNDLE OUTPUT ============

export const AddonBundleOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  slug: z.string(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.nullable(),
  imageUrl: z.string().nullable(),

  displayOrder: z.number(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),

  discountType: AddonDiscountTypeSchema,
  discountAmount: z.number(),

  organizationId: z.string().nullable(),

  items: z.array(
    z.object({
      id: z.string(),
      addonId: z.string(),
      quantity: z.number(),
      isRequired: z.boolean(),
      addon: AddonOutputSchema.pick({
        id: true,
        slug: true,
        name: true,
        shortName: true,
        category: true,
        iconKey: true,
        billingType: true,
        suggestedPrice: true,
      }),
    })
  ),
});

export type AddonBundleOutputType = z.infer<typeof AddonBundleOutputSchema>;

// ============ CREATE ADDON BUNDLE (Admin/Partner) ============

export const CreateAddonBundleInputSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  imageUrl: z.string().url().optional(),

  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  discountType: AddonDiscountTypeSchema.default('PERCENTAGE'),
  discountAmount: z.number().min(0),

  // If provided, this is an organization-specific bundle
  organizationId: z.uuid().optional(),

  items: z
    .array(
      z.object({
        addonId: z.uuid(),
        quantity: z.number().int().min(1).default(1),
        isRequired: z.boolean().default(true),
      })
    )
    .min(2, 'Bundle must have at least 2 addons'),
});

export const CreateAddonBundleOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
});

export type CreateAddonBundleInputType = z.infer<typeof CreateAddonBundleInputSchema>;
export type CreateAddonBundleOutputType = z.infer<typeof CreateAddonBundleOutputSchema>;

// ============ UPDATE ADDON BUNDLE ============

export const UpdateAddonBundleInputSchema = z.object({
  bundleId: z.uuid(),
  name: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema.optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),

  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),

  discountType: AddonDiscountTypeSchema.optional(),
  discountAmount: z.number().min(0).optional(),

  // Replace all items
  items: z
    .array(
      z.object({
        addonId: z.uuid(),
        quantity: z.number().int().min(1).default(1),
        isRequired: z.boolean().default(true),
      })
    )
    .min(2)
    .optional(),
});

export const UpdateAddonBundleOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  updatedAt: z.date(),
});

export type UpdateAddonBundleInputType = z.infer<typeof UpdateAddonBundleInputSchema>;
export type UpdateAddonBundleOutputType = z.infer<typeof UpdateAddonBundleOutputSchema>;

// ============ DELETE ADDON BUNDLE ============

export const DeleteAddonBundleInputSchema = z.object({
  bundleId: z.uuid(),
});

export const DeleteAddonBundleOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export type DeleteAddonBundleInputType = z.infer<typeof DeleteAddonBundleInputSchema>;
export type DeleteAddonBundleOutputType = z.infer<typeof DeleteAddonBundleOutputSchema>;

// ============ LIST ADDON BUNDLES ============

export const ListAddonBundlesInputSchema = PaginationInputSchema.extend({
  q: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  organizationId: z.uuid().optional(), // Filter by organization
  includeGlobal: z.boolean().default(true), // Include platform-wide bundles
});

export const ListAddonBundlesOutputSchema = PaginationOutputSchema(AddonBundleOutputSchema);

export type ListAddonBundlesInputType = z.infer<typeof ListAddonBundlesInputSchema>;
export type ListAddonBundlesOutputType = z.infer<typeof ListAddonBundlesOutputSchema>;

// ============ GET BUNDLE PRICE FOR LISTING ============

export const GetBundlePriceInputSchema = z.object({
  bundleId: z.uuid(),
  listingId: z.uuid(),
  rentalDays: z.number().int().min(1),
});

export const GetBundlePriceOutputSchema = z.object({
  bundleId: z.string(),
  listingId: z.string(),
  rentalDays: z.number(),

  // Individual addon prices
  items: z.array(
    z.object({
      addonId: z.string(),
      addonName: LocalizedTextSchema,
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(), // unitPrice * quantity * days (if per_day)
      isAvailable: z.boolean(), // Whether listing has this addon configured
    })
  ),

  // Totals
  subtotal: z.number(), // Sum of all items
  bundleDiscount: z.number(), // Discount amount
  finalPrice: z.number(), // subtotal - bundleDiscount
  currency: z.string(),

  // Availability
  isAvailable: z.boolean(), // All required items available
  unavailableAddons: z.array(z.string()), // Addon IDs not available
});

export type GetBundlePriceInputType = z.infer<typeof GetBundlePriceInputSchema>;
export type GetBundlePriceOutputType = z.infer<typeof GetBundlePriceOutputSchema>;

// ============ ADDON STATS (Admin Dashboard) ============

export const GetAddonStatsOutputSchema = z.object({
  totalAddons: z.number(),
  activeAddons: z.number(),
  featuredAddons: z.number(),

  // By category - using string keys as categories may be dynamic/empty
  byCategory: z.record(z.string(), z.number()),

  // Usage stats
  totalBookingsWithAddons: z.number(),
  addonRevenueThisMonth: z.number(),
  currency: z.string(),

  // Top addons
  topAddons: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name: LocalizedTextSchema,
      category: z.string(), // Allow any category string for stats
      bookingCount: z.number(),
      revenue: z.number(),
    })
  ),

  // Recent activity
  recentlyCreated: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name: LocalizedTextSchema,
      category: z.string(), // Allow any category string for stats
      createdAt: z.date(),
    })
  ),
});

export type GetAddonStatsOutputType = z.infer<typeof GetAddonStatsOutputSchema>;

// ============ PARTNER ADDON STATS ============

export const GetPartnerAddonStatsOutputSchema = z.object({
  totalConfiguredAddons: z.number(), // Listing addons configured
  activeListingAddons: z.number(),

  // Revenue
  addonRevenueThisMonth: z.number(),
  addonRevenueLastMonth: z.number(),
  currency: z.string(),

  // Top performing addons
  topAddons: z.array(
    z.object({
      addonId: z.string(),
      addonSlug: z.string(),
      addonName: LocalizedTextSchema,
      category: z.string(), // Allow any category string for stats
      bookingCount: z.number(),
      revenue: z.number(),
      averageQuantity: z.number(),
    })
  ),

  // Recommendations
  unconfiguredPopularAddons: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      name: LocalizedTextSchema,
      category: z.string(), // Allow any category string for stats
      suggestedPrice: z.number().nullable(),
      marketAdoptionRate: z.number(), // Percentage of listings with this addon
    })
  ),
});

export type GetPartnerAddonStatsOutputType = z.infer<typeof GetPartnerAddonStatsOutputSchema>;

// ============ CALCULATE ADDON PRICE ============

export const CalculateAddonPriceInputSchema = z.object({
  listingAddonId: z.uuid(),
  quantity: z.number().int().min(1).default(1),
  rentalDays: z.number().int().min(1),
  selectedOption: z.string().optional(), // For SELECTION type
});

export const CalculateAddonPriceOutputSchema = z.object({
  listingAddonId: z.string(),
  addonSlug: z.string(),
  addonName: LocalizedTextSchema,

  quantity: z.number(),
  rentalDays: z.number(),
  selectedOption: z.string().nullable(),

  billingType: AddonBillingTypeSchema,
  unitPrice: z.number(),
  baseTotal: z.number(), // unitPrice * quantity * (days if per_day)
  discountAmount: z.number(),
  taxAmount: z.number(),
  finalPrice: z.number(),
  currency: z.string(),

  // Validation
  isAvailable: z.boolean(),
  stockRemaining: z.number().nullable(),
  meetsQuantityRequirements: z.boolean(),
  meetsDriverAgeRequirement: z.boolean().nullable(),
});

export type CalculateAddonPriceInputType = z.infer<typeof CalculateAddonPriceInputSchema>;
export type CalculateAddonPriceOutputType = z.infer<typeof CalculateAddonPriceOutputSchema>;

