import * as z from 'zod';

export const OrganizationScalarFieldEnumSchema = z.enum(['id', 'slug', 'name', 'logo', 'cover', 'description', 'legalName', 'taxId', 'email', 'phoneNumber', 'phoneNumberVerified', 'website', 'cityId', 'lat', 'lng', 'address', 'createdAt', 'updatedAt', 'deletedAt', 'metadata', 'status', 'onboardingStep', 'rejectionReason', 'banReason'])

export type OrganizationScalarFieldEnum = z.infer<typeof OrganizationScalarFieldEnumSchema>;