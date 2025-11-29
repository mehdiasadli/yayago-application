import * as z from 'zod';

export const CountryScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'lookup', 'code', 'status', 'phoneCode', 'flag', 'trafficDirection', 'emergencyPhoneNumber', 'minDriverAge', 'minDriverLicenseAge', 'title', 'description', 'currency'])

export type CountryScalarFieldEnum = z.infer<typeof CountryScalarFieldEnumSchema>;