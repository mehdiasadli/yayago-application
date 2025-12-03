import * as z from 'zod';

export const PushSubscriptionScalarFieldEnumSchema = z.enum(['id', 'userId', 'createdAt', 'updatedAt', 'endpoint', 'p256dhKey', 'authKey', 'deviceType', 'deviceName', 'userAgent', 'isActive'])

export type PushSubscriptionScalarFieldEnum = z.infer<typeof PushSubscriptionScalarFieldEnumSchema>;