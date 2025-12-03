import * as z from 'zod';

export const PushSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  endpoint: z.string(),
  p256dhKey: z.string(),
  authKey: z.string(),
  deviceType: z.string().nullish(),
  deviceName: z.string().nullish(),
  userAgent: z.string().nullish(),
  isActive: z.boolean().default(true),
});

export type PushSubscriptionType = z.infer<typeof PushSubscriptionSchema>;
