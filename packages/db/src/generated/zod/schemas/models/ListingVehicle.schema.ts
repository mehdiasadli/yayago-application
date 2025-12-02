import * as z from 'zod';
import { VehicleBodyTypeSchema } from '../enums/VehicleBodyType.schema';
import { VehicleClassSchema } from '../enums/VehicleClass.schema';
import { VehicleDriveTypeSchema } from '../enums/VehicleDriveType.schema';
import { VehicleEngineLayoutSchema } from '../enums/VehicleEngineLayout.schema';
import { VehicleFuelTypeSchema } from '../enums/VehicleFuelType.schema';
import { VehicleTransmissionTypeSchema } from '../enums/VehicleTransmissionType.schema';

export const ListingVehicleSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  licensePlate: z.string().nullish(),
  vin: z.string().nullish(),
  listingId: z.string(),
  year: z.number().int(),
  trim: z.string().nullish(),
  odometer: z.number().int().nullish(),
  style: z.string().nullish(),
  manufacturer: z.string().nullish(),
  class: VehicleClassSchema,
  bodyType: VehicleBodyTypeSchema,
  fuelType: VehicleFuelTypeSchema,
  transmissionType: VehicleTransmissionTypeSchema,
  driveType: VehicleDriveTypeSchema,
  doors: z.number().int().default(4),
  seats: z.number().int().default(5),
  engineLayout: VehicleEngineLayoutSchema,
  engineDisplacement: z.number().nullish(),
  cylinders: z.number().int().nullish(),
  horsepower: z.number().int().nullish(),
  torque: z.number().int().nullish(),
  height: z.number().int().nullish(),
  width: z.number().int().nullish(),
  length: z.number().int().nullish(),
  wheelbaseLength: z.number().int().nullish(),
  curbWeight: z.number().int().nullish(),
  cargoCapacity: z.number().int().nullish(),
  towingCapacity: z.number().int().nullish(),
  topSpeed: z.number().int().nullish(),
  acceleration0to100: z.number().nullish(),
  fuelEfficiencyCity: z.number().nullish(),
  fuelEfficiencyHighway: z.number().nullish(),
  fuelTankCapacity: z.number().nullish(),
  batterCapacity: z.number().nullish(),
  electricRange: z.number().nullish(),
  interiorColors: z.array(z.string()),
  exteriorColors: z.array(z.string()),
  conditionNotes: z.string().nullish(),
  lastServiceDate: z.date().nullish(),
  nextServiceDue: z.date().nullish(),
  registrationExpiry: z.date().nullish(),
  insuranceExpiry: z.date().nullish(),
});

export type ListingVehicleType = z.infer<typeof ListingVehicleSchema>;
