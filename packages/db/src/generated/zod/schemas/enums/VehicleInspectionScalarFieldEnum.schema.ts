import * as z from 'zod';

export const VehicleInspectionScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'listingVehicleId', 'inspectionDate', 'inspectorName', 'odometer', 'brakes', 'tires', 'engine', 'interior', 'exterior', 'otherResults', 'notes', 'nextInspectionDue'])

export type VehicleInspectionScalarFieldEnum = z.infer<typeof VehicleInspectionScalarFieldEnumSchema>;