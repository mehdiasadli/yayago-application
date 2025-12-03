import * as z from 'zod';

export const NotificationPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;