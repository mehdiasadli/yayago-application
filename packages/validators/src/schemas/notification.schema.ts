import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

// ============ ENUMS ============

export const NotificationCategorySchema = z.enum([
  'BOOKING',
  'LISTING',
  'REVIEW',
  'ORGANIZATION',
  'FINANCIAL',
  'FAVORITE',
  'VERIFICATION',
  'SYSTEM',
  'PROMOTIONAL',
  'SECURITY',
]);

export const NotificationTypeSchema = z.enum([
  // Booking types
  'BOOKING_CREATED',
  'BOOKING_CONFIRMED',
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'BOOKING_CANCELLED_BY_USER',
  'BOOKING_CANCELLED_BY_HOST',
  'BOOKING_STARTED',
  'BOOKING_COMPLETED',
  'BOOKING_REMINDER',
  'BOOKING_PICKUP_REMINDER',
  'BOOKING_RETURN_REMINDER',
  'BOOKING_OVERDUE',
  'BOOKING_DISPUTE',
  // Listing types
  'LISTING_PUBLISHED',
  'LISTING_APPROVED',
  'LISTING_REJECTED',
  'LISTING_SUSPENDED',
  'LISTING_EXPIRED',
  'LISTING_VIEWS_MILESTONE',
  'LISTING_INQUIRY',
  // Review types
  'REVIEW_RECEIVED',
  'REVIEW_REMINDER',
  'REVIEW_RESPONSE',
  // Organization types
  'ORG_MEMBER_JOINED',
  'ORG_MEMBER_LEFT',
  'ORG_MEMBER_ROLE_CHANGED',
  'ORG_INVITATION_RECEIVED',
  'ORG_INVITATION_ACCEPTED',
  'ORG_STATUS_CHANGED',
  'ORG_DOCUMENT_EXPIRING',
  // Financial types
  'PAYMENT_RECEIVED',
  'PAYMENT_FAILED',
  'PAYOUT_PROCESSED',
  'PAYOUT_FAILED',
  'REFUND_ISSUED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_RENEWED',
  'SUBSCRIPTION_EXPIRING',
  'SUBSCRIPTION_CANCELLED',
  'INVOICE_GENERATED',
  // Favorite types
  'FAVORITE_PRICE_DROP',
  'FAVORITE_AVAILABLE',
  'FAVORITE_ENDING_SOON',
  // Verification types
  'VERIFICATION_APPROVED',
  'VERIFICATION_REJECTED',
  'VERIFICATION_EXPIRING',
  'VERIFICATION_REQUIRED',
  // System types
  'SYSTEM_ANNOUNCEMENT',
  'SYSTEM_MAINTENANCE',
  'SYSTEM_UPDATE',
  'SYSTEM_POLICY_CHANGE',
  // Promotional types
  'PROMO_OFFER',
  'PROMO_REFERRAL',
  // Security types
  'SECURITY_NEW_LOGIN',
  'SECURITY_PASSWORD_CHANGED',
  'SECURITY_EMAIL_CHANGED',
  'SECURITY_SUSPICIOUS_ACTIVITY',
]);

export const NotificationPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

// ============ NOTIFICATION OUTPUT (Base) ============

export const NotificationOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),

  category: NotificationCategorySchema,
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,

  title: z.string(),
  body: z.string(),
  imageUrl: z.string().nullable(),

  actionUrl: z.string().nullable(),
  actionLabel: z.string().nullable(),

  isRead: z.boolean(),
  readAt: z.date().nullable(),

  isArchived: z.boolean(),

  // Related entities (optional)
  bookingId: z.string().nullable(),
  listingId: z.string().nullable(),
  reviewId: z.string().nullable(),
  organizationId: z.string().nullable(),

  metadata: z.record(z.any(), z.any()).nullable(),

  // Actor info (who triggered)
  actor: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),

  groupKey: z.string().nullable(),
});

export type NotificationOutputType = z.infer<typeof NotificationOutputSchema>;

// ============ CREATE NOTIFICATION (Internal/Admin) ============

export const CreateNotificationInputSchema = z.object({
  category: NotificationCategorySchema,
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema.default('MEDIUM'),

  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional(),

  actionUrl: z.string().optional(),
  actionLabel: z.string().max(50).optional(),

  // Targeting (at least one required)
  userId: z.uuid().optional(),
  organizationId: z.uuid().optional(),
  targetRole: z.string().optional(),
  targetOrgRole: z.string().optional(),

  // Related entities
  bookingId: z.uuid().optional(),
  listingId: z.uuid().optional(),
  reviewId: z.uuid().optional(),

  // Metadata
  metadata: z.record(z.any(), z.any()).optional(),

  // Actor
  actorId: z.uuid().optional(),

  // Grouping
  groupKey: z.string().optional(),

  // Expiration
  expiresAt: z.coerce.date().optional(),
});

export const CreateNotificationOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
});

export type CreateNotificationInputType = z.infer<typeof CreateNotificationInputSchema>;
export type CreateNotificationOutputType = z.infer<typeof CreateNotificationOutputSchema>;

// ============ GET NOTIFICATION ============

export const GetNotificationInputSchema = z.object({
  notificationId: z.uuid(),
});

export type GetNotificationInputType = z.infer<typeof GetNotificationInputSchema>;

// ============ MARK AS READ ============

export const MarkNotificationReadInputSchema = z.object({
  notificationId: z.uuid(),
});

export const MarkNotificationReadOutputSchema = z.object({
  id: z.string(),
  isRead: z.boolean(),
  readAt: z.date().nullable(),
});

export type MarkNotificationReadInputType = z.infer<typeof MarkNotificationReadInputSchema>;
export type MarkNotificationReadOutputType = z.infer<typeof MarkNotificationReadOutputSchema>;

// ============ MARK ALL AS READ ============

export const MarkAllNotificationsReadInputSchema = z.object({
  category: NotificationCategorySchema.optional(),
});

export const MarkAllNotificationsReadOutputSchema = z.object({
  count: z.number(),
});

export type MarkAllNotificationsReadInputType = z.infer<typeof MarkAllNotificationsReadInputSchema>;
export type MarkAllNotificationsReadOutputType = z.infer<typeof MarkAllNotificationsReadOutputSchema>;

// ============ ARCHIVE NOTIFICATION ============

export const ArchiveNotificationInputSchema = z.object({
  notificationId: z.uuid(),
});

export const ArchiveNotificationOutputSchema = z.object({
  id: z.string(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
});

export type ArchiveNotificationInputType = z.infer<typeof ArchiveNotificationInputSchema>;
export type ArchiveNotificationOutputType = z.infer<typeof ArchiveNotificationOutputSchema>;

// ============ DELETE NOTIFICATION ============

export const DeleteNotificationInputSchema = z.object({
  notificationId: z.uuid(),
});

export const DeleteNotificationOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export type DeleteNotificationInputType = z.infer<typeof DeleteNotificationInputSchema>;
export type DeleteNotificationOutputType = z.infer<typeof DeleteNotificationOutputSchema>;

// ============ LIST NOTIFICATIONS (User) ============

export const ListNotificationsInputSchema = PaginationInputSchema.extend({
  category: NotificationCategorySchema.optional(),
  type: NotificationTypeSchema.optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional().default(false),
  priority: NotificationPrioritySchema.optional(),
});

export const ListNotificationsOutputSchema = PaginationOutputSchema(NotificationOutputSchema);

export type ListNotificationsInputType = z.infer<typeof ListNotificationsInputSchema>;
export type ListNotificationsOutputType = z.infer<typeof ListNotificationsOutputSchema>;

// ============ LIST ORGANIZATION NOTIFICATIONS (Partner) ============

export const ListOrgNotificationsInputSchema = PaginationInputSchema.extend({
  category: NotificationCategorySchema.optional(),
  type: NotificationTypeSchema.optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional().default(false),
});

export const ListOrgNotificationsOutputSchema = PaginationOutputSchema(NotificationOutputSchema);

export type ListOrgNotificationsInputType = z.infer<typeof ListOrgNotificationsInputSchema>;
export type ListOrgNotificationsOutputType = z.infer<typeof ListOrgNotificationsOutputSchema>;

// ============ LIST ALL NOTIFICATIONS (Admin) ============

export const ListAllNotificationsInputSchema = PaginationInputSchema.extend({
  userId: z.uuid().optional(),
  organizationId: z.uuid().optional(),
  category: NotificationCategorySchema.optional(),
  type: NotificationTypeSchema.optional(),
  priority: NotificationPrioritySchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const ListAllNotificationsOutputSchema = PaginationOutputSchema(
  NotificationOutputSchema.extend({
    user: z
      .object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      })
      .nullable(),
    organization: z
      .object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
      .nullable(),
  })
);

export type ListAllNotificationsInputType = z.infer<typeof ListAllNotificationsInputSchema>;
export type ListAllNotificationsOutputType = z.infer<typeof ListAllNotificationsOutputSchema>;

// ============ NOTIFICATION STATS ============

export const GetNotificationStatsOutputSchema = z.object({
  total: z.number(),
  unread: z.number(),
  byCategory: z.record(NotificationCategorySchema, z.number()),
  byPriority: z.record(NotificationPrioritySchema, z.number()),
});

export type GetNotificationStatsOutputType = z.infer<typeof GetNotificationStatsOutputSchema>;

// ============ UNREAD COUNT ============

export const GetUnreadCountOutputSchema = z.object({
  count: z.number(),
  byCategory: z.record(NotificationCategorySchema, z.number()).optional(),
});

export type GetUnreadCountOutputType = z.infer<typeof GetUnreadCountOutputSchema>;

// ============ NOTIFICATION PREFERENCES ============

export const NotificationPreferencesSchema = z.object({
  // Enable/disable entire categories
  bookingEnabled: z.boolean().default(true),
  listingEnabled: z.boolean().default(true),
  reviewEnabled: z.boolean().default(true),
  organizationEnabled: z.boolean().default(true),
  financialEnabled: z.boolean().default(true),
  favoriteEnabled: z.boolean().default(true),
  verificationEnabled: z.boolean().default(true),
  systemEnabled: z.boolean().default(true),
  promotionalEnabled: z.boolean().default(false),
  securityEnabled: z.boolean().default(true),

  // Channel preferences
  emailForHigh: z.boolean().default(true),
  emailForMedium: z.boolean().default(true),
  emailForLow: z.boolean().default(false),

  pushForHigh: z.boolean().default(true),
  pushForMedium: z.boolean().default(true),
  pushForLow: z.boolean().default(false),

  smsForHigh: z.boolean().default(false),
  smsForMedium: z.boolean().default(false),
  smsForLow: z.boolean().default(false),

  // Quiet hours
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().optional(), // "22:00"
  quietHoursEnd: z.string().optional(), // "08:00"
  quietHoursTimezone: z.string().optional(),

  // Digest
  emailDigestEnabled: z.boolean().default(false),
  emailDigestFrequency: z.enum(['daily', 'weekly']).optional(),
});

export type NotificationPreferencesType = z.infer<typeof NotificationPreferencesSchema>;

// ============ GET PREFERENCES ============

export const GetNotificationPreferencesOutputSchema = NotificationPreferencesSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetNotificationPreferencesOutputType = z.infer<typeof GetNotificationPreferencesOutputSchema>;

// ============ UPDATE PREFERENCES ============

export const UpdateNotificationPreferencesInputSchema = NotificationPreferencesSchema.partial();

export const UpdateNotificationPreferencesOutputSchema = GetNotificationPreferencesOutputSchema;

export type UpdateNotificationPreferencesInputType = z.infer<typeof UpdateNotificationPreferencesInputSchema>;
export type UpdateNotificationPreferencesOutputType = z.infer<typeof UpdateNotificationPreferencesOutputSchema>;

// ============ PUSH SUBSCRIPTION ============

export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dhKey: z.string(),
  authKey: z.string(),
  deviceType: z.enum(['web', 'ios', 'android']).optional(),
  deviceName: z.string().optional(),
});

export type PushSubscriptionType = z.infer<typeof PushSubscriptionSchema>;

// ============ REGISTER PUSH SUBSCRIPTION ============

export const RegisterPushSubscriptionInputSchema = PushSubscriptionSchema;

export const RegisterPushSubscriptionOutputSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
});

export type RegisterPushSubscriptionInputType = z.infer<typeof RegisterPushSubscriptionInputSchema>;
export type RegisterPushSubscriptionOutputType = z.infer<typeof RegisterPushSubscriptionOutputSchema>;

// ============ UNREGISTER PUSH SUBSCRIPTION ============

export const UnregisterPushSubscriptionInputSchema = z.object({
  endpoint: z.string().url(),
});

export const UnregisterPushSubscriptionOutputSchema = z.object({
  deleted: z.boolean(),
});

export type UnregisterPushSubscriptionInputType = z.infer<typeof UnregisterPushSubscriptionInputSchema>;
export type UnregisterPushSubscriptionOutputType = z.infer<typeof UnregisterPushSubscriptionOutputSchema>;

// ============ LIST PUSH SUBSCRIPTIONS ============

export const ListPushSubscriptionsOutputSchema = z.array(
  z.object({
    id: z.string(),
    endpoint: z.string(),
    deviceType: z.string().nullable(),
    deviceName: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
);

export type ListPushSubscriptionsOutputType = z.infer<typeof ListPushSubscriptionsOutputSchema>;

// ============ SEND BROADCAST (Admin) ============

export const SendBroadcastInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  actionUrl: z.string().optional(),
  actionLabel: z.string().max(50).optional(),

  // Targeting
  targetRole: z.enum(['all', 'user', 'partner', 'admin', 'moderator']).default('all'),
  targetOrganizationId: z.uuid().optional(),

  priority: NotificationPrioritySchema.default('MEDIUM'),
  category: NotificationCategorySchema.default('SYSTEM'),
  type: NotificationTypeSchema.default('SYSTEM_ANNOUNCEMENT'),

  // Scheduling
  sendAt: z.coerce.date().optional(), // Schedule for later

  // Channels
  sendEmail: z.boolean().default(false),
  sendPush: z.boolean().default(true),
});

export const SendBroadcastOutputSchema = z.object({
  notificationCount: z.number(),
  scheduledFor: z.date().nullable(),
});

export type SendBroadcastInputType = z.infer<typeof SendBroadcastInputSchema>;
export type SendBroadcastOutputType = z.infer<typeof SendBroadcastOutputSchema>;
