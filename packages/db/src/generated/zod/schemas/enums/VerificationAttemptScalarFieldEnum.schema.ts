import * as z from 'zod';

export const VerificationAttemptScalarFieldEnumSchema = z.enum(['id', 'userId', 'licenseFrontUrl', 'licenseBackUrl', 'selfieUrl', 'phoneNumber', 'status', 'rejectionReason', 'reviewedBy', 'reviewedAt', 'createdAt'])

export type VerificationAttemptScalarFieldEnum = z.infer<typeof VerificationAttemptScalarFieldEnumSchema>;