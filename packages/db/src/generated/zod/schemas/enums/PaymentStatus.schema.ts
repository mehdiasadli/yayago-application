import * as z from 'zod';

export const PaymentStatusSchema = z.enum(['NOT_PAID', 'AUTHORIZED', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED', 'DISPUTED'])

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;