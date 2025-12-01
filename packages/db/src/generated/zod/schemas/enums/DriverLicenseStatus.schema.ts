import * as z from 'zod';

export const DriverLicenseStatusSchema = z.enum(['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'])

export type DriverLicenseStatus = z.infer<typeof DriverLicenseStatusSchema>;