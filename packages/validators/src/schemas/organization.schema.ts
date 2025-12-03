import { MemberSchema, OrganizationSchema, OrganizationDocumentSchema } from '@yayago-app/db/models';
import { OrganizationStatusSchema } from '@yayago-app/db/enums';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import { z } from 'zod';

const LocalizedTextSchema = z.record(z.string(), z.string()); // { "en": "...", "az": "..." }

// Admin - List Organizations
export const ListOrganizationInputSchema = z
  .object({
    q: z.string().optional(),
    status: OrganizationStatusSchema.optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListOrganizationOutputSchema = PaginationOutputSchema(
  OrganizationSchema.pick({
    id: true,
    name: true,
    slug: true,
    logo: true,
    createdAt: true,
    phoneNumber: true,
    email: true,
    status: true,
    legalName: true,
  }).extend({
    city: z
      .object({
        name: z.string(),
        code: z.string(),
        country: z.object({
          name: z.string(),
          code: z.string(),
        }),
      })
      .nullable(),
    _count: z.object({
      members: z.number(),
      listings: z.number(),
    }),
  })
);

export type ListOrganizationInputType = z.infer<typeof ListOrganizationInputSchema>;
export type ListOrganizationOutputType = z.infer<typeof ListOrganizationOutputSchema>;

// Admin - Find One Organization
export const FindOneOrganizationInputSchema = z.object({
  slug: z.string().min(1),
});

export const FindOneOrganizationOutputSchema = OrganizationSchema.pick({
  id: true,
  name: true,
  slug: true,
  logo: true,
  cover: true,
  description: true,
  legalName: true,
  taxId: true,
  email: true,
  phoneNumber: true,
  phoneNumberVerified: true,
  website: true,
  address: true,
  lat: true,
  lng: true,
  status: true,
  onboardingStep: true,
  rejectionReason: true,
  banReason: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  city: z
    .object({
      name: z.string(),
      code: z.string(),
      country: z.object({
        name: z.string(),
        code: z.string(),
        flag: z.string().nullable(),
      }),
    })
    .nullable(),
  members: z.array(
    MemberSchema.pick({
      id: true,
      role: true,
      createdAt: true,
    }).extend({
      user: z.object({
        name: z.string(),
        username: z.string(),
        email: z.string(),
        image: z.string().nullable(),
      }),
    })
  ),
  documents: z.array(
    OrganizationDocumentSchema.pick({
      id: true,
      documentNumber: true,
      expiresAt: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
    }).extend({
      files: z.array(
        z.object({
          id: z.string(),
          url: z.string(),
          format: z.string(),
        })
      ),
    })
  ),
  _count: z.object({
    members: z.number(),
    listings: z.number(),
    subscriptions: z.number(),
  }),
});

export type FindOneOrganizationInputType = z.infer<typeof FindOneOrganizationInputSchema>;
export type FindOneOrganizationOutputType = z.infer<typeof FindOneOrganizationOutputSchema>;

// Admin - Update Organization Status (Approve/Reject/Suspend)
export const UpdateOrganizationStatusInputSchema = z.object({
  slug: z.string().min(1),
  status: OrganizationStatusSchema,
  reason: z.string().max(500).optional(),
});

export const UpdateOrganizationStatusOutputSchema = OrganizationSchema.pick({
  slug: true,
  status: true,
  rejectionReason: true,
  banReason: true,
});

export type UpdateOrganizationStatusInputType = z.infer<typeof UpdateOrganizationStatusInputSchema>;
export type UpdateOrganizationStatusOutputType = z.infer<typeof UpdateOrganizationStatusOutputSchema>;

// Admin - Get Pending Organizations Count
export const GetPendingOrganizationsCountOutputSchema = z.object({
  count: z.number(),
});

export type GetPendingOrganizationsCountOutputType = z.infer<typeof GetPendingOrganizationsCountOutputSchema>;

export const GetOnboardingDataOutputSchema = OrganizationSchema.pick({
  id: true,
  createdAt: true,
  email: true,
  name: true,
  status: true,
  address: true,
  description: true,
  slug: true,
  logo: true,
  phoneNumber: true,
  lat: true,
  lng: true,
  cover: true,
  legalName: true,
  taxId: true,
  website: true,
  cityId: true,
  onboardingStep: true,
  rejectionReason: true,
}).extend({
  city: z
    .object({
      code: z.string(),
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
      googleMapsPlaceId: z.string(),
      country: z.object({
        code: z.string(),
        phoneCode: z.string(),
        name: z.string(),
        requiredDocuments: z.array(
          z.object({
            isRequired: z.boolean(),
            label: z.string(),
            description: z.string(),
          })
        ),
      }),
    })
    .nullable(),
});

export type GetOnboardingDataOutputType = z.infer<typeof GetOnboardingDataOutputSchema>;

export const GetOrganizationOutputSchema = OrganizationSchema.pick({
  createdAt: true,
  email: true,
  name: true,
  status: true,
  address: true,
  description: true,
  slug: true,
  logo: true,
  phoneNumber: true,
  lat: true,
  lng: true,
  cover: true,
  legalName: true,
  taxId: true,
  website: true,
  cityId: true,
}).extend({
  member: MemberSchema.pick({
    id: true,
    createdAt: true,
    userId: true,
    organizationId: true,
    role: true,
  }),
  city: z
    .object({
      id: z.string(),
      name: LocalizedTextSchema,
      code: z.string(),
      slug: z.string(),
      country: z.object({
        id: z.string(),
        name: LocalizedTextSchema,
        code: z.string(),
        currency: z.string(),
        maxCarRentalAge: z.number().int().nullable(),
        hasCarRentalAgeExceptions: z.boolean(),
      }),
    })
    .nullable(),
});

export type GetOrganizationOutputType = z.infer<typeof GetOrganizationOutputSchema>;

export const CompleteOnboardingInputSchema = z.object({
  // Organization Details
  name: z.string().min(1, 'Organization name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9_]+$/, 'Slug can only contain lowercase letters, numbers, and underscores'),
  legalName: z.string().min(1, 'Legal name is required'),
  description: z.any().optional(),
  logo: z.string().optional(),

  // City & Location
  cityCode: z.string().min(1, 'City is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),

  // Contact Information
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),

  // Documents
  taxId: z.string().min(1, 'Tax ID is required'),
  documents: z
    .array(
      z.object({
        documentType: z.string(),
        files: z.array(
          z.object({
            url: z.string(),
            format: z.enum(['PDF', 'DOCX', 'JPEG', 'PNG']),
          })
        ),
      })
    )
    .optional(),
});

export const CompleteOnboardingOutputSchema = z.object({
  success: z.boolean(),
  organizationId: z.string(),
  status: z.enum(['PENDING', 'ACTIVE']),
});

export type CompleteOnboardingInputType = z.infer<typeof CompleteOnboardingInputSchema>;
export type CompleteOnboardingOutputType = z.infer<typeof CompleteOnboardingOutputSchema>;

// Save onboarding progress (draft)
export const SaveOnboardingProgressInputSchema = z.object({
  step: z.number().min(1).max(5),
  // Organization Details (Step 1)
  name: z.string().optional(),
  slug: z.string().optional(),
  legalName: z.string().optional(),
  description: z.any().optional(),
  logo: z.string().optional(),
  // City (Step 2)
  cityCode: z.string().optional(),
  // Contact (Step 3)
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(), // Pinpointed location latitude
  lng: z.number().optional(), // Pinpointed location longitude
  // Documents (Step 4)
  taxId: z.string().optional(),
});

export const SaveOnboardingProgressOutputSchema = z.object({
  success: z.boolean(),
  onboardingStep: z.number(),
});

export type SaveOnboardingProgressInputType = z.infer<typeof SaveOnboardingProgressInputSchema>;
export type SaveOnboardingProgressOutputType = z.infer<typeof SaveOnboardingProgressOutputSchema>;

// ============ PARTNER - GET OWN ORGANIZATION ============

// Business hours schema for a single day
const BusinessHoursDaySchema = z.object({
  open: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(), // "09:00"
  close: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(), // "18:00"
  closed: z.boolean().default(false),
});

// Full business hours for week
const BusinessHoursSchema = z.object({
  monday: BusinessHoursDaySchema.optional(),
  tuesday: BusinessHoursDaySchema.optional(),
  wednesday: BusinessHoursDaySchema.optional(),
  thursday: BusinessHoursDaySchema.optional(),
  friday: BusinessHoursDaySchema.optional(),
  saturday: BusinessHoursDaySchema.optional(),
  sunday: BusinessHoursDaySchema.optional(),
});

// Holiday hours
const HolidayHoursEntrySchema = z.object({
  date: z.string(), // "2024-12-25"
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean().default(true),
  note: z.string().optional(),
});

// Policy schemas
const CancellationPolicySchema = z.object({
  type: z.enum(['flexible', 'moderate', 'strict', 'custom']),
  description: z.string().optional(),
  fullRefundHours: z.number().optional(), // Hours before pickup for full refund
  partialRefundHours: z.number().optional(),
  partialRefundPercent: z.number().optional(),
});

const LateReturnPolicySchema = z.object({
  gracePeriodMinutes: z.number().default(30),
  hourlyCharge: z.number().optional(),
  dailyCharge: z.number().optional(),
  description: z.string().optional(),
});

const FuelPolicySchema = z.object({
  type: z.enum(['full_to_full', 'same_to_same', 'prepaid']),
  description: z.string().optional(),
});

const MileagePolicySchema = z.object({
  type: z.enum(['unlimited', 'limited']),
  dailyLimit: z.number().optional(),
  extraKmCharge: z.number().optional(),
  description: z.string().optional(),
});

const DamagePolicySchema = z.object({
  depositRequired: z.boolean().default(true),
  depositAmount: z.number().optional(),
  description: z.string().optional(),
});

const InsurancePolicySchema = z.object({
  included: z.boolean().default(true),
  types: z.array(z.string()).default(['basic']),
  description: z.string().optional(),
});

const AgePolicySchema = z.object({
  minAge: z.number().default(21),
  maxAge: z.number().optional(),
  youngDriverSurcharge: z.number().optional(),
  youngDriverAge: z.number().optional(), // Age below which surcharge applies
  description: z.string().optional(),
});

const AdditionalDriverPolicySchema = z.object({
  allowed: z.boolean().default(true),
  feePerDay: z.number().optional(),
  maxAdditional: z.number().optional(),
  description: z.string().optional(),
});

const CrossBorderPolicySchema = z.object({
  allowed: z.boolean().default(false),
  countries: z.array(z.string()).default([]),
  additionalFee: z.number().optional(),
  description: z.string().optional(),
});

const PetPolicySchema = z.object({
  allowed: z.boolean().default(false),
  feePerDay: z.number().optional(),
  description: z.string().optional(),
});

const SmokingPolicySchema = z.object({
  allowed: z.boolean().default(false),
  cleaningFee: z.number().optional(),
  description: z.string().optional(),
});

// Get own organization (for partner)
export const GetMyOrganizationOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string().nullable(),
  logo: z.string().nullable(),
  cover: z.string().nullable(),
  description: z.any().nullable(),

  // Legal
  legalName: z.string().nullable(),
  taxId: z.string().nullable(),

  // Contact
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean(),
  website: z.string().nullable(),
  whatsapp: z.string().nullable(),

  // Location
  cityId: z.string().nullable(),
  city: z
    .object({
      code: z.string(),
      name: z.any(),
      timezone: z.string().nullable(),
      country: z.object({
        code: z.string(),
        name: z.any(),
      }),
    })
    .nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  address: z.string().nullable(),

  // Social Media
  facebookUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  twitterUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  youtubeUrl: z.string().nullable(),
  tiktokUrl: z.string().nullable(),

  // Business Settings
  businessHours: z.any().nullable(),
  holidayHours: z.any().nullable(),

  // Policies
  cancellationPolicy: z.any().nullable(),
  lateReturnPolicy: z.any().nullable(),
  fuelPolicy: z.any().nullable(),
  mileagePolicy: z.any().nullable(),
  damagePolicy: z.any().nullable(),
  insurancePolicy: z.any().nullable(),
  agePolicy: z.any().nullable(),
  additionalDriverPolicy: z.any().nullable(),
  crossBorderPolicy: z.any().nullable(),
  petPolicy: z.any().nullable(),
  smokingPolicy: z.any().nullable(),

  // Additional Info
  foundedYear: z.number().nullable(),
  certificationsJson: z.any().nullable(),
  specializations: z.array(z.string()),

  // Status
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Current user's role
  memberRole: z.string(),

  // Counts
  _count: z.object({
    listings: z.number(),
    members: z.number(),
  }),
});

export type GetMyOrganizationOutputType = z.infer<typeof GetMyOrganizationOutputSchema>;

// ============ PARTNER - UPDATE BASIC INFO ============

export const UpdateOrgBasicInfoInputSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().max(200).optional().nullable(),
  description: z.any().optional().nullable(),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()).optional().nullable(),
  specializations: z.array(z.string()).optional(),
});

export const UpdateOrgBasicInfoOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgBasicInfoInputType = z.infer<typeof UpdateOrgBasicInfoInputSchema>;
export type UpdateOrgBasicInfoOutputType = z.infer<typeof UpdateOrgBasicInfoOutputSchema>;

// ============ PARTNER - UPDATE CONTACT INFO ============

export const UpdateOrgContactInfoInputSchema = z.object({
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  whatsapp: z.string().optional().nullable(),
});

export const UpdateOrgContactInfoOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgContactInfoInputType = z.infer<typeof UpdateOrgContactInfoInputSchema>;
export type UpdateOrgContactInfoOutputType = z.infer<typeof UpdateOrgContactInfoOutputSchema>;

// ============ PARTNER - UPDATE LOCATION ============

export const UpdateOrgLocationInputSchema = z.object({
  address: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const UpdateOrgLocationOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgLocationInputType = z.infer<typeof UpdateOrgLocationInputSchema>;
export type UpdateOrgLocationOutputType = z.infer<typeof UpdateOrgLocationOutputSchema>;

// ============ PARTNER - UPDATE SOCIAL MEDIA ============

export const UpdateOrgSocialMediaInputSchema = z.object({
  facebookUrl: z.string().url().optional().or(z.literal('')).nullable(),
  instagramUrl: z.string().url().optional().or(z.literal('')).nullable(),
  twitterUrl: z.string().url().optional().or(z.literal('')).nullable(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).nullable(),
  youtubeUrl: z.string().url().optional().or(z.literal('')).nullable(),
  tiktokUrl: z.string().url().optional().or(z.literal('')).nullable(),
});

export const UpdateOrgSocialMediaOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgSocialMediaInputType = z.infer<typeof UpdateOrgSocialMediaInputSchema>;
export type UpdateOrgSocialMediaOutputType = z.infer<typeof UpdateOrgSocialMediaOutputSchema>;

// ============ PARTNER - UPDATE BUSINESS HOURS ============

export const UpdateOrgBusinessHoursInputSchema = z.object({
  businessHours: BusinessHoursSchema.optional().nullable(),
  holidayHours: z.array(HolidayHoursEntrySchema).optional().nullable(),
});

export const UpdateOrgBusinessHoursOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgBusinessHoursInputType = z.infer<typeof UpdateOrgBusinessHoursInputSchema>;
export type UpdateOrgBusinessHoursOutputType = z.infer<typeof UpdateOrgBusinessHoursOutputSchema>;

// ============ PARTNER - UPDATE POLICIES ============

export const UpdateOrgPoliciesInputSchema = z.object({
  cancellationPolicy: CancellationPolicySchema.optional().nullable(),
  lateReturnPolicy: LateReturnPolicySchema.optional().nullable(),
  fuelPolicy: FuelPolicySchema.optional().nullable(),
  mileagePolicy: MileagePolicySchema.optional().nullable(),
  damagePolicy: DamagePolicySchema.optional().nullable(),
  insurancePolicy: InsurancePolicySchema.optional().nullable(),
  agePolicy: AgePolicySchema.optional().nullable(),
  additionalDriverPolicy: AdditionalDriverPolicySchema.optional().nullable(),
  crossBorderPolicy: CrossBorderPolicySchema.optional().nullable(),
  petPolicy: PetPolicySchema.optional().nullable(),
  smokingPolicy: SmokingPolicySchema.optional().nullable(),
});

export const UpdateOrgPoliciesOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateOrgPoliciesInputType = z.infer<typeof UpdateOrgPoliciesInputSchema>;
export type UpdateOrgPoliciesOutputType = z.infer<typeof UpdateOrgPoliciesOutputSchema>;

// ============ PARTNER - UPDATE LOGO/COVER ============

export const UpdateOrgBrandingInputSchema = z.object({
  logo: z.string().optional().nullable(),
  cover: z.string().optional().nullable(),
});

export const UpdateOrgBrandingOutputSchema = z.object({
  success: z.boolean(),
  logo: z.string().nullable(),
  cover: z.string().nullable(),
});

export type UpdateOrgBrandingInputType = z.infer<typeof UpdateOrgBrandingInputSchema>;
export type UpdateOrgBrandingOutputType = z.infer<typeof UpdateOrgBrandingOutputSchema>;

// ============ STRIPE CONNECT - PAYOUT SETUP ============

export const CreateOnboardingLinkInputSchema = z.object({
  organizationId: z.string().uuid(),
  refreshUrl: z.string().url(),
  returnUrl: z.string().url(),
});

export const CreateOnboardingLinkOutputSchema = z.object({
  url: z.string().url(),
  expiresAt: z.date(),
});

export type CreateOnboardingLinkInputType = z.infer<typeof CreateOnboardingLinkInputSchema>;
export type CreateOnboardingLinkOutputType = z.infer<typeof CreateOnboardingLinkOutputSchema>;

// Get Connect Account Status
export const GetConnectAccountStatusInputSchema = z.object({
  organizationId: z.string().uuid(),
});

export const GetConnectAccountStatusOutputSchema = z.object({
  hasAccount: z.boolean(),
  status: z.enum(['pending', 'enabled', 'restricted', 'disabled']).nullable(),
  chargesEnabled: z.boolean(),
  payoutsEnabled: z.boolean(),
  detailsSubmitted: z.boolean(),
});

export type GetConnectAccountStatusInputType = z.infer<typeof GetConnectAccountStatusInputSchema>;
export type GetConnectAccountStatusOutputType = z.infer<typeof GetConnectAccountStatusOutputSchema>;

// Create Dashboard Link
export const CreateDashboardLinkInputSchema = z.object({
  organizationId: z.string().uuid(),
});

export const CreateDashboardLinkOutputSchema = z.object({
  url: z.string().url(),
});

export type CreateDashboardLinkInputType = z.infer<typeof CreateDashboardLinkInputSchema>;
export type CreateDashboardLinkOutputType = z.infer<typeof CreateDashboardLinkOutputSchema>;

// Create Account Session (for embedded components)
export const CreateAccountSessionInputSchema = z.object({
  organizationId: z.string().uuid(),
});

export const CreateAccountSessionOutputSchema = z.object({
  clientSecret: z.string(),
  accountId: z.string(),
});

export type CreateAccountSessionInputType = z.infer<typeof CreateAccountSessionInputSchema>;
export type CreateAccountSessionOutputType = z.infer<typeof CreateAccountSessionOutputSchema>;

// Process Trip Payout (Internal/Admin)
export const ProcessTripPayoutInputSchema = z.object({
  bookingId: z.string().uuid(),
});

export const ProcessTripPayoutOutputSchema = z.object({
  success: z.boolean(),
  partnerPayoutAmount: z.number(),
  platformCommission: z.number(),
  depositRefunded: z.number(),
  partnerPayoutId: z.string().nullable(),
  depositRefundId: z.string().nullable(),
});

export type ProcessTripPayoutInputType = z.infer<typeof ProcessTripPayoutInputSchema>;
export type ProcessTripPayoutOutputType = z.infer<typeof ProcessTripPayoutOutputSchema>;
