import * as z from 'zod';

export const OrganizationDocumentScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'documentNumber', 'expiresAt', 'status', 'rejectionReason', 'createdAt', 'updatedAt'])

export type OrganizationDocumentScalarFieldEnum = z.infer<typeof OrganizationDocumentScalarFieldEnumSchema>;