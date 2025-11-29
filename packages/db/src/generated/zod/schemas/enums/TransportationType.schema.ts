import * as z from 'zod';

export const TransportationTypeSchema = z.enum(['RENTAL_LOCATION', 'DELIVERY'])

export type TransportationType = z.infer<typeof TransportationTypeSchema>;