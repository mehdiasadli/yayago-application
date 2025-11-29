import * as z from 'zod';

export const DocumentKindSchema = z.enum(['TRADE_LICENSE', 'TAX_CERTIFICATE', 'ID_CARD_FRONT', 'ID_CARD_BACK', 'SIGNATORY_AUTHORITY'])

export type DocumentKind = z.infer<typeof DocumentKindSchema>;