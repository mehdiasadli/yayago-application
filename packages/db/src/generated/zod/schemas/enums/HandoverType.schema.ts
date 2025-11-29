import * as z from 'zod';

export const HandoverTypeSchema = z.enum(['MEET_AT_LOCATION', 'DELIVERY'])

export type HandoverType = z.infer<typeof HandoverTypeSchema>;