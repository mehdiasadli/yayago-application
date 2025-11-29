import * as z from 'zod';

export const InspectionStatusSchema = z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPAIR', 'UNUSABLE', 'UNKNOWN'])

export type InspectionStatus = z.infer<typeof InspectionStatusSchema>;