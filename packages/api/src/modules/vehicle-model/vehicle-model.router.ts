import { procedures } from '../../procedures';
import { VehicleModelService } from './vehicle-model.service';
import {
  CreateVehicleModelInputSchema,
  CreateVehicleModelOutputSchema,
  UpdateVehicleModelInputSchema,
  UpdateVehicleModelOutputSchema,
  DeleteVehicleModelInputSchema,
  DeleteVehicleModelOutputSchema,
  FindOneVehicleModelInputSchema,
  FindOneVehicleModelOutputSchema,
  ListVehicleModelInputSchema,
  ListVehicleModelOutputSchema,
} from '@yayago-app/validators';

export default {
  create: procedures
    .withRoles('admin', 'moderator')
    .input(CreateVehicleModelInputSchema)
    .output(CreateVehicleModelOutputSchema)
    .handler(async ({ input, context }) => await VehicleModelService.create(input, context.locale)),

  update: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateVehicleModelInputSchema)
    .output(UpdateVehicleModelOutputSchema)
    .handler(async ({ input, context }) => await VehicleModelService.update(input, context.locale)),

  delete: procedures
    .withRoles('admin')
    .input(DeleteVehicleModelInputSchema)
    .output(DeleteVehicleModelOutputSchema)
    .handler(async ({ input }) => await VehicleModelService.delete(input)),

  findOne: procedures.public
    .input(FindOneVehicleModelInputSchema)
    .output(FindOneVehicleModelOutputSchema)
    .handler(async ({ input, context }) => await VehicleModelService.findOne(input, context.locale)),

  list: procedures.public
    .input(ListVehicleModelInputSchema)
    .output(ListVehicleModelOutputSchema)
    .handler(async ({ input, context }) => await VehicleModelService.list(input, context.locale)),
};
