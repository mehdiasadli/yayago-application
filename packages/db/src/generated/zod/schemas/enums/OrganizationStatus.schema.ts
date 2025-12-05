import * as z from 'zod';

export const OrganizationStatusSchema = z.enum(['DRAFT', 'ONBOARDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED'])

export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>;