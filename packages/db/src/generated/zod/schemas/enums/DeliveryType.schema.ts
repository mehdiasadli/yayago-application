import * as z from 'zod';

export const DeliveryTypeSchema = z.enum(['AIRPORT', 'TO_RENTER'])

export type DeliveryType = z.infer<typeof DeliveryTypeSchema>;