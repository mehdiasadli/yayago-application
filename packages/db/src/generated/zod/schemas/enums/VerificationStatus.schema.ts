import * as z from 'zod';

export const VerificationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])

export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;