import * as z from 'zod';
import { DocumentKindSchema } from '../enums/DocumentKind.schema';
import { DocumentMediaFormatSchema } from '../enums/DocumentMediaFormat.schema';

export const CountryDocumentRequirementSchema = z.object({
  id: z.string(),
  countryId: z.string(),
  documentType: DocumentKindSchema,
  isRequired: z.boolean().default(true),
  allowedFormats: z.array(DocumentMediaFormatSchema),
  label: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  description: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
});

export type CountryDocumentRequirementType = z.infer<typeof CountryDocumentRequirementSchema>;
