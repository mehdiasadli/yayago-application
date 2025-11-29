import * as z from 'zod';
import { DocumentVerificationStatusSchema } from '../enums/DocumentVerificationStatus.schema';

export const OrganizationDocumentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  documentNumber: z.string().nullish(),
  expiresAt: z.date().nullish(),
  status: DocumentVerificationStatusSchema.default("PENDING"),
  rejectionReason: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrganizationDocumentType = z.infer<typeof OrganizationDocumentSchema>;
