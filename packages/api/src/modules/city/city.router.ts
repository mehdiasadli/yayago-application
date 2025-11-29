import { CityService } from './city.service';
import {
  CreateCityInputSchema,
  CreateCityOutputSchema,
  ListCityInputSchema,
  ListCityOutputSchema,
  FindOneCityInputSchema,
  FindOneCityOutputSchema,
  UpdateCityInputSchema,
  UpdateCityOutputSchema,
  UpdateCityStatusInputSchema,
  UpdateCityStatusOutputSchema,
  DeleteCityInputSchema,
  DeleteCityOutputSchema,
  FindCitiesForOnboardingInputSchema,
  FindCitiesForOnboardingOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';

export default {
  create: procedures
    .withRoles('admin', 'moderator')
    .input(CreateCityInputSchema)
    .output(CreateCityOutputSchema)
    .handler(async ({ input, context }) => await CityService.create(input, context.locale)),
  list: procedures.public
    .input(ListCityInputSchema)
    .output(ListCityOutputSchema)
    .handler(async ({ input, context }) => await CityService.list(input, context.locale)),
  findOne: procedures.public
    .input(FindOneCityInputSchema)
    .output(FindOneCityOutputSchema)
    .handler(async ({ input, context }) => await CityService.findOne(input, context.locale)),
  update: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateCityInputSchema)
    .output(UpdateCityOutputSchema)
    .handler(async ({ input }) => await CityService.update(input)),
  updateStatus: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateCityStatusInputSchema)
    .output(UpdateCityStatusOutputSchema)
    .handler(async ({ input }) => await CityService.updateStatus(input)),
  delete: procedures
    .withRoles('admin')
    .input(DeleteCityInputSchema)
    .output(DeleteCityOutputSchema)
    .handler(async ({ input }) => await CityService.delete(input)),
  findCitiesForOnboarding: procedures.public
    .input(FindCitiesForOnboardingInputSchema)
    .output(FindCitiesForOnboardingOutputSchema)
    .handler(async ({ input, context }) => await CityService.findCitiesForOnboarding(input, context.locale)),
};
