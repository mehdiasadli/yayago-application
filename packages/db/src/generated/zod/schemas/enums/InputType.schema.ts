import * as z from 'zod';

export const InputTypeSchema = z.enum(['QUANTITY', 'BOOLEAN'])

export type InputType = z.infer<typeof InputTypeSchema>;