import * as z from 'zod';
import { DocumentMediaFormatSchema } from '../enums/DocumentMediaFormat.schema';

export const OrganizationFileSchema = z.object({
  id: z.string(),
  organizationDocumentId: z.string(),
  url: z.string(),
  format: DocumentMediaFormatSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrganizationFileType = z.infer<typeof OrganizationFileSchema>;
