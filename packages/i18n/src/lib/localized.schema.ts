import { z } from 'zod';
import { type Locale } from '..';

export const zLocalized = (baseSchema: z.ZodString = z.string(), langSpecificSchemas?: Record<Locale, z.ZodString>) => {
  return z.object({
    en: langSpecificSchemas?.['en'] || baseSchema,
    az: langSpecificSchemas?.['az'] || baseSchema.optional(),
    ru: langSpecificSchemas?.['ru'] || baseSchema.optional(),
    ar: langSpecificSchemas?.['ar'] || baseSchema.optional(),
  });
};

export type ZLocalizedInput = z.infer<ReturnType<typeof zLocalized>>;
