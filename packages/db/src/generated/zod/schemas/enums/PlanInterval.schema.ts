import * as z from 'zod';

export const PlanIntervalSchema = z.enum(['month', 'year'])

export type PlanInterval = z.infer<typeof PlanIntervalSchema>;