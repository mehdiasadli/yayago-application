import * as z from 'zod';
import { NotificationCategorySchema } from '../enums/NotificationCategory.schema';
import { NotificationPrioritySchema } from '../enums/NotificationPriority.schema';
import { NotificationTypeSchema } from '../enums/NotificationType.schema';

export const NotificationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().nullish(),
  category: NotificationCategorySchema,
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema.default("MEDIUM"),
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().nullish(),
  actionUrl: z.string().nullish(),
  actionLabel: z.string().nullish(),
  userId: z.string().nullish(),
  organizationId: z.string().nullish(),
  targetRole: z.string().nullish(),
  targetOrgRole: z.string().nullish(),
  isRead: z.boolean(),
  readAt: z.date().nullish(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullish(),
  sentViaEmail: z.boolean(),
  emailSentAt: z.date().nullish(),
  sentViaPush: z.boolean(),
  pushSentAt: z.date().nullish(),
  sentViaSms: z.boolean(),
  smsSentAt: z.date().nullish(),
  inAppDeliveredAt: z.date(),
  bookingId: z.string().nullish(),
  listingId: z.string().nullish(),
  reviewId: z.string().nullish(),
  metadata: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  actorId: z.string().nullish(),
  groupKey: z.string().nullish(),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
