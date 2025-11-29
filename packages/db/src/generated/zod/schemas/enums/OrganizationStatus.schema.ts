import * as z from 'zod';

export const OrganizationStatusSchema = z.enum(['IDLE', 'ONBOARDING', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'ARCHIVED'])

export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>;