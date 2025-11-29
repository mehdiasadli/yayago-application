import * as z from 'zod';

export const DocumentVerificationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])

export type DocumentVerificationStatus = z.infer<typeof DocumentVerificationStatusSchema>;