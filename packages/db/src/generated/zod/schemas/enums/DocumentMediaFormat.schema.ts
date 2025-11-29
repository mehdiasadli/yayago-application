import * as z from 'zod';

export const DocumentMediaFormatSchema = z.enum(['PDF', 'DOCX', 'JPEG', 'PNG'])

export type DocumentMediaFormat = z.infer<typeof DocumentMediaFormatSchema>;