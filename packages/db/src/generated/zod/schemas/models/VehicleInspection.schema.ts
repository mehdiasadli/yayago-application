import * as z from 'zod';
import { InspectionStatusSchema } from '../enums/InspectionStatus.schema';

export const VehicleInspectionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  listingVehicleId: z.string(),
  inspectionDate: z.date(),
  inspectorName: z.string(),
  odometer: z.number().int(),
  brakes: InspectionStatusSchema,
  tires: InspectionStatusSchema,
  engine: InspectionStatusSchema,
  interior: InspectionStatusSchema,
  exterior: InspectionStatusSchema,
  otherResults: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  notes: z.string().nullish(),
  nextInspectionDue: z.date().nullish(),
});

export type VehicleInspectionType = z.infer<typeof VehicleInspectionSchema>;
