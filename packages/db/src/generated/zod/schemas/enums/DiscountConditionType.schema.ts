import * as z from 'zod';

export const DiscountConditionTypeSchema = z.enum(['DURATION', 'EARLY_BOOKING', 'LATE_BOOKING', 'SEASONAL', 'MULTI_VEHICLE', 'FIRST_TIME_USER', 'RETURNING_USER', 'REFERRAL', 'PROMO_CODE', 'CUSTOM'])

export type DiscountConditionType = z.infer<typeof DiscountConditionTypeSchema>;