import { MemberSchema, OrganizationSchema, OrganizationDocumentSchema } from '@yayago-app/db/models';
import { OrganizationStatusSchema } from '@yayago-app/db/enums';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import { z } from 'zod';

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
});

export type GetOrganizationOutputType = z.infer<typeof GetOrganizationOutputSchema>;

export const CompleteOnboardingInputSchema = z.object({
  // Organization Details
  name: z.string().min(1, 'Organization name is required'),
  slug: z.string().min(1, 'Slug is required'),
  legalName: z.string().optional(),
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
  // Documents (Step 4)
  taxId: z.string().optional(),
});

export const SaveOnboardingProgressOutputSchema = z.object({
  success: z.boolean(),
  onboardingStep: z.number(),
});

export type SaveOnboardingProgressInputType = z.infer<typeof SaveOnboardingProgressInputSchema>;
export type SaveOnboardingProgressOutputType = z.infer<typeof SaveOnboardingProgressOutputSchema>;
