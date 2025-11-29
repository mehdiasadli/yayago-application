import * as z from 'zod';

export const CityScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'countryId', 'name', 'lookup', 'code', 'slug', 'status', 'lat', 'lng', 'boundaries', 'googleMapsPlaceId', 'timezone', 'isDefaultOfCounry', 'title', 'description', 'heroImageUrl', 'heroImageAlt'])

export type CityScalarFieldEnum = z.infer<typeof CityScalarFieldEnumSchema>;