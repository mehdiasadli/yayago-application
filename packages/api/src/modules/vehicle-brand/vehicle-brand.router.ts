import {
  CreateVehicleBrandInputSchema,
  CreateVehicleBrandOutputSchema,
  DeleteVehicleBrandInputSchema,
  DeleteVehicleBrandOutputSchema,
  FindOneVehicleBrandInputSchema,
  FindOneVehicleBrandOutputSchema,
  ListVehicleBrandInputSchema,
  ListVehicleBrandOutputSchema,
  UpdateVehicleBrandInputSchema,
  UpdateVehicleBrandOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';
import { VehicleBrandService } from './vehicle-brand.service';

export default {
  create: procedures
    .withRoles('admin', 'moderator')
    .input(CreateVehicleBrandInputSchema)
    .output(CreateVehicleBrandOutputSchema)
    .handler(async ({ input, context }) => await VehicleBrandService.create(input, context.locale)),
  findOne: procedures.public
    .input(FindOneVehicleBrandInputSchema)
    .output(FindOneVehicleBrandOutputSchema)
    .handler(async ({ input, context }) => await VehicleBrandService.findOne(input, context.locale)),
  list: procedures.public
    .input(ListVehicleBrandInputSchema)
    .output(ListVehicleBrandOutputSchema)
    .handler(async ({ input, context }) => await VehicleBrandService.list(input, context.locale)),
  update: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateVehicleBrandInputSchema)
    .output(UpdateVehicleBrandOutputSchema)
    .handler(async ({ input, context }) => await VehicleBrandService.update(input, context.locale)),
  delete: procedures
    .withRoles('admin')
    .input(DeleteVehicleBrandInputSchema)
    .output(DeleteVehicleBrandOutputSchema)
    .handler(async ({ input }) => await VehicleBrandService.delete(input)),
};
