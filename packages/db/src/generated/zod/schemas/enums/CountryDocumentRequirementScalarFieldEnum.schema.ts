import * as z from 'zod';

export const CountryDocumentRequirementScalarFieldEnumSchema = z.enum(['id', 'countryId', 'documentType', 'isRequired', 'allowedFormats', 'label', 'description'])

export type CountryDocumentRequirementScalarFieldEnum = z.infer<typeof CountryDocumentRequirementScalarFieldEnumSchema>;