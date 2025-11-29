import * as z from 'zod';

export const LocationKindSchema = z.enum(['POINT_OF_INTEREST', 'HOTEL', 'BUILDING', 'AIRPORT', 'STATION', 'PARK', 'NEIGHBORHOOD', 'OTHER'])

export type LocationKind = z.infer<typeof LocationKindSchema>;