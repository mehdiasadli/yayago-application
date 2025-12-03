import * as z from 'zod';

export const NotificationPreferenceScalarFieldEnumSchema = z.enum(['id', 'userId', 'createdAt', 'updatedAt', 'bookingEnabled', 'listingEnabled', 'reviewEnabled', 'organizationEnabled', 'financialEnabled', 'favoriteEnabled', 'verificationEnabled', 'systemEnabled', 'promotionalEnabled', 'securityEnabled', 'emailForHigh', 'emailForMedium', 'emailForLow', 'pushForHigh', 'pushForMedium', 'pushForLow', 'smsForHigh', 'smsForMedium', 'smsForLow', 'quietHoursEnabled', 'quietHoursStart', 'quietHoursEnd', 'quietHoursTimezone', 'emailDigestEnabled', 'emailDigestFrequency'])

export type NotificationPreferenceScalarFieldEnum = z.infer<typeof NotificationPreferenceScalarFieldEnumSchema>;