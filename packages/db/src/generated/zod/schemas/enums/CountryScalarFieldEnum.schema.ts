import * as z from 'zod';

export const CountryScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'lookup', 'code', 'status', 'phoneCode', 'flag', 'trafficDirection', 'emergencyPhoneNumber', 'minDriverAge', 'minDriverLicenseAge', 'title', 'description', 'currency', 'platformCommissionRate', 'maxCarRentalAge', 'hasCarRentalAgeExceptions'])

export type CountryScalarFieldEnum = z.infer<typeof CountryScalarFieldEnumSchema>;