import * as z from 'zod';

export const ListingDocumentStatusSchema = z.enum(['PENDING_UPLOAD', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'REQUIRES_RENEWAL'])

export type ListingDocumentStatus = z.infer<typeof ListingDocumentStatusSchema>;