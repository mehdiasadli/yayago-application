import * as z from 'zod';

export const OrganizationFileScalarFieldEnumSchema = z.enum(['id', 'organizationDocumentId', 'url', 'format', 'createdAt', 'updatedAt'])

export type OrganizationFileScalarFieldEnum = z.infer<typeof OrganizationFileScalarFieldEnumSchema>;