import { z } from 'zod';

// ============ ENUMS ============
export const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export const DriverLicenseStatusSchema = z.enum([
  'NOT_SUBMITTED',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
]);

// ============ GET MY PROFILE ============
export const GetMyProfileOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  username: z.string(),
  displayUsername: z.string().nullable(),
  image: z.string().nullable(),
  role: z.enum(['user', 'moderator', 'admin']),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean().nullable(),
  createdAt: z.date(),

  // Profile
  bio: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  gender: GenderSchema.nullable(),

  // Address
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressState: z.string().nullable(),
  addressCountry: z.string().nullable(),
  addressZipCode: z.string().nullable(),

  // Emergency contact
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),

  // Driver's License
  driverLicenseNumber: z.string().nullable(),
  driverLicenseCountry: z.string().nullable(),
  driverLicenseExpiry: z.date().nullable(),
  driverLicenseVerificationStatus: DriverLicenseStatusSchema,

  // Preferences
  preferredCurrency: z.string().nullable(),
  preferredLanguage: z.string().nullable(),
  preferredDistanceUnit: z.string().nullable(),

  // Notification preferences
  notificationPreferences: z
    .object({
      emailBookingConfirmation: z.boolean().optional(),
      emailBookingReminder: z.boolean().optional(),
      emailPromotions: z.boolean().optional(),
      emailNewsletter: z.boolean().optional(),
      smsBookingUpdates: z.boolean().optional(),
    })
    .nullable(),

  // Computed
  isHost: z.boolean(),
  organizationId: z.string().nullable(),
  profileCompletionPercentage: z.number(),
});

export type GetMyProfileOutputType = z.infer<typeof GetMyProfileOutputSchema>;

// ============ UPDATE PROFILE ============
export const UpdateProfileInputSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  displayUsername: z.string().min(3).max(50).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: GenderSchema.optional().nullable(),
  image: z.string().optional().nullable(), // Base64 or URL
});

export const UpdateProfileOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInputSchema>;
export type UpdateProfileOutputType = z.infer<typeof UpdateProfileOutputSchema>;

// ============ UPDATE PERSONAL INFO ============
export const UpdatePersonalInfoInputSchema = z.object({
  firstName: z.string().min(1).max(100).optional().nullable(),
  lastName: z.string().min(1).max(100).optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  addressCity: z.string().max(100).optional().nullable(),
  addressState: z.string().max(100).optional().nullable(),
  addressCountry: z.string().max(100).optional().nullable(),
  addressZipCode: z.string().max(20).optional().nullable(),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
});

export const UpdatePersonalInfoOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdatePersonalInfoInputType = z.infer<typeof UpdatePersonalInfoInputSchema>;
export type UpdatePersonalInfoOutputType = z.infer<typeof UpdatePersonalInfoOutputSchema>;

// ============ SUBMIT DRIVER LICENSE ============
export const SubmitDriverLicenseInputSchema = z.object({
  licenseNumber: z.string().min(1).max(50),
  country: z.string().min(2).max(100),
  expiryDate: z.coerce.date(),
  frontImage: z.string(), // Base64
  backImage: z.string().optional(), // Base64 (optional for some countries)
});

export const SubmitDriverLicenseOutputSchema = z.object({
  success: z.boolean(),
  status: DriverLicenseStatusSchema,
});

export type SubmitDriverLicenseInputType = z.infer<typeof SubmitDriverLicenseInputSchema>;
export type SubmitDriverLicenseOutputType = z.infer<typeof SubmitDriverLicenseOutputSchema>;

// ============ ADMIN: VERIFY DRIVER LICENSE ============
export const VerifyDriverLicenseInputSchema = z.object({
  userId: z.string(),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const VerifyDriverLicenseOutputSchema = z.object({
  success: z.boolean(),
});

export type VerifyDriverLicenseInputType = z.infer<typeof VerifyDriverLicenseInputSchema>;
export type VerifyDriverLicenseOutputType = z.infer<typeof VerifyDriverLicenseOutputSchema>;

// ============ UPDATE PREFERENCES ============
export const UpdatePreferencesInputSchema = z.object({
  preferredCurrency: z.string().length(3).optional(),
  preferredLanguage: z.string().min(2).max(5).optional(),
  preferredDistanceUnit: z.enum(['km', 'mi']).optional(),
});

export const UpdatePreferencesOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdatePreferencesInputType = z.infer<typeof UpdatePreferencesInputSchema>;
export type UpdatePreferencesOutputType = z.infer<typeof UpdatePreferencesOutputSchema>;

// ============ UPDATE NOTIFICATION PREFERENCES ============
export const UpdateNotificationPreferencesInputSchema = z.object({
  emailBookingConfirmation: z.boolean().optional(),
  emailBookingReminder: z.boolean().optional(),
  emailPromotions: z.boolean().optional(),
  emailNewsletter: z.boolean().optional(),
  smsBookingUpdates: z.boolean().optional(),
});

export const UpdateNotificationPreferencesOutputSchema = z.object({
  success: z.boolean(),
});

export type UpdateNotificationPreferencesInputType = z.infer<typeof UpdateNotificationPreferencesInputSchema>;
export type UpdateNotificationPreferencesOutputType = z.infer<typeof UpdateNotificationPreferencesOutputSchema>;

// ============ FAVORITES ============
export const AddFavoriteInputSchema = z.object({
  listingSlug: z.string(),
});

export const AddFavoriteOutputSchema = z.object({
  success: z.boolean(),
  favoriteId: z.string(),
});

export type AddFavoriteInputType = z.infer<typeof AddFavoriteInputSchema>;
export type AddFavoriteOutputType = z.infer<typeof AddFavoriteOutputSchema>;

export const RemoveFavoriteInputSchema = z.object({
  listingSlug: z.string(),
});

export const RemoveFavoriteOutputSchema = z.object({
  success: z.boolean(),
});

export type RemoveFavoriteInputType = z.infer<typeof RemoveFavoriteInputSchema>;
export type RemoveFavoriteOutputType = z.infer<typeof RemoveFavoriteOutputSchema>;

export const ListFavoritesInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sortBy: z.enum(['dateAdded', 'price', 'name']).default('dateAdded'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const ListFavoritesOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      addedAt: z.date(),
      listing: z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        status: z.string(),
        primaryImage: z.string().nullable(),
        pricePerDay: z.number(),
        currency: z.string(),
        location: z
          .object({
            city: z.string(),
            country: z.string(),
          })
          .nullable(),
        vehicle: z.object({
          brand: z.string(),
          model: z.string(),
          year: z.number(),
          class: z.string(),
        }),
        organization: z.object({
          name: z.string(),
          slug: z.string(),
        }),
        bookingDetails: z
          .object({
            instantBooking: z.boolean(),
          })
          .nullable(),
      }),
    })
  ),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type ListFavoritesInputType = z.infer<typeof ListFavoritesInputSchema>;
export type ListFavoritesOutputType = z.infer<typeof ListFavoritesOutputSchema>;

export const CheckFavoriteInputSchema = z.object({
  listingSlug: z.string(),
});

export const CheckFavoriteOutputSchema = z.object({
  isFavorite: z.boolean(),
});

export type CheckFavoriteInputType = z.infer<typeof CheckFavoriteInputSchema>;
export type CheckFavoriteOutputType = z.infer<typeof CheckFavoriteOutputSchema>;

// ============ GET USER REVIEWS ============
export const ListMyReviewsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const ListMyReviewsOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      rating: z.number(),
      comment: z.string().nullable(),
      createdAt: z.date(),
      listing: z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        primaryImage: z.string().nullable(),
      }),
    })
  ),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type ListMyReviewsInputType = z.infer<typeof ListMyReviewsInputSchema>;
export type ListMyReviewsOutputType = z.infer<typeof ListMyReviewsOutputSchema>;

// ============ GET PENDING REVIEWS ============
export const ListPendingReviewsOutputSchema = z.array(
  z.object({
    bookingId: z.string(),
    completedAt: z.date(),
    listing: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      primaryImage: z.string().nullable(),
    }),
  })
);

export type ListPendingReviewsOutputType = z.infer<typeof ListPendingReviewsOutputSchema>;

// ============ ACCOUNT OVERVIEW ============
export const GetAccountOverviewOutputSchema = z.object({
  stats: z.object({
    totalBookings: z.number(),
    activeBookings: z.number(),
    completedBookings: z.number(),
    totalSpent: z.number(),
    favoriteCount: z.number(),
    reviewCount: z.number(),
  }),
  upcomingBooking: z
    .object({
      id: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      listing: z.object({
        title: z.string(),
        slug: z.string(),
        primaryImage: z.string().nullable(),
      }),
    })
    .nullable(),
  recentActivity: z.array(
    z.object({
      type: z.enum(['booking', 'review', 'favorite']),
      description: z.string(),
      createdAt: z.date(),
      link: z.string().nullable(),
    })
  ),
  profileCompletion: z.object({
    percentage: z.number(),
    missingFields: z.array(z.string()),
  }),
});

export type GetAccountOverviewOutputType = z.infer<typeof GetAccountOverviewOutputSchema>;
