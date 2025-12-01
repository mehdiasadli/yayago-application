import * as z from 'zod';

export const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say'])

export type Gender = z.infer<typeof GenderSchema>;