import * as z from 'zod';

export const NotificationCategorySchema = z.enum(['BOOKING', 'LISTING', 'REVIEW', 'ORGANIZATION', 'FINANCIAL', 'FAVORITE', 'VERIFICATION', 'SYSTEM', 'PROMOTIONAL', 'SECURITY'])

export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;