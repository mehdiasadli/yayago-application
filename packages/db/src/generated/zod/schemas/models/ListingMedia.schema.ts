import * as z from 'zod';
import { ListingMediaKindSchema } from '../enums/ListingMediaKind.schema';
import { ListingMediaStatusSchema } from '../enums/ListingMediaStatus.schema';
import { VerificationStatusSchema } from '../enums/VerificationStatus.schema';

export const ListingMediaSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  listingId: z.string(),
  displayOrder: z.number().int(),
  type: ListingMediaKindSchema,
  status: ListingMediaStatusSchema,
  rejectionReason: z.string().nullish(),
  verificationStatus: VerificationStatusSchema.default("PENDING"),
  isPrimary: z.boolean(),
  publicId: z.string(),
  url: z.string(),
  alt: z.string().nullish(),
  caption: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  width: z.number().int(),
  height: z.number().int(),
  size: z.number().int(),
  mimeType: z.string(),
});

export type ListingMediaType = z.infer<typeof ListingMediaSchema>;
