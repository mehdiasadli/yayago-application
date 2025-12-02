import * as z from 'zod';
import { DriverLicenseStatusSchema } from '../enums/DriverLicenseStatus.schema';

export const VerificationAttemptSchema = z.object({
  id: z.string(),
  userId: z.string(),
  licenseFrontUrl: z.string(),
  licenseBackUrl: z.string(),
  selfieUrl: z.string(),
  phoneNumber: z.string(),
  status: DriverLicenseStatusSchema.default("PENDING"),
  rejectionReason: z.string().nullish(),
  reviewedBy: z.string().nullish(),
  reviewedAt: z.date().nullish(),
  createdAt: z.date(),
});

export type VerificationAttemptType = z.infer<typeof VerificationAttemptSchema>;
