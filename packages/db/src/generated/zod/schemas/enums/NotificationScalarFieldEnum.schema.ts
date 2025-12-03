import * as z from 'zod';

export const NotificationScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'expiresAt', 'category', 'type', 'priority', 'title', 'body', 'imageUrl', 'actionUrl', 'actionLabel', 'userId', 'organizationId', 'targetRole', 'targetOrgRole', 'isRead', 'readAt', 'isArchived', 'archivedAt', 'sentViaEmail', 'emailSentAt', 'sentViaPush', 'pushSentAt', 'sentViaSms', 'smsSentAt', 'inAppDeliveredAt', 'bookingId', 'listingId', 'reviewId', 'metadata', 'actorId', 'groupKey'])

export type NotificationScalarFieldEnum = z.infer<typeof NotificationScalarFieldEnumSchema>;