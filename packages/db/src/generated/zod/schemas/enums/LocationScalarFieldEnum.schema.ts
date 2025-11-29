import * as z from 'zod';

export const LocationScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'cityId', 'name', 'lookup', 'slug', 'type', 'status', 'lat', 'lng', 'googleMapsPlaceId', 'title', 'description'])

export type LocationScalarFieldEnum = z.infer<typeof LocationScalarFieldEnumSchema>;