import { CountryService } from './country.service';
import {
  CreateCountryInputSchema,
  CreateCountryOutputSchema,
  DeleteCountryInputSchema,
  FindOneCountryInputSchema,
  FindOneCountryOutputSchema,
  ListCountriesInputSchema,
  ListCountriesOutputSchema,
  UpdateCountryInputSchema,
  UpdateCountryOutputSchema,
  UpdateCountryStatusInputSchema,
  UpdateCountryStatusOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';

export default {
  create: procedures
    .withRoles('admin', 'moderator')
    .input(CreateCountryInputSchema)
    .output(CreateCountryOutputSchema)
    .handler(async ({ input, context }) => await CountryService.create(input, context.locale)),
  findOne: procedures.public
    .input(FindOneCountryInputSchema)
    .output(FindOneCountryOutputSchema)
    .handler(async ({ input }) => await CountryService.findOne(input)),
  list: procedures.public
    .input(ListCountriesInputSchema)
    .output(ListCountriesOutputSchema)
    .handler(async ({ input, context }) => await CountryService.list(input, context.locale)),
  updateStatus: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateCountryStatusInputSchema)
    .output(UpdateCountryStatusOutputSchema)
    .handler(async ({ input }) => await CountryService.updateStatus(input)),
  update: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateCountryInputSchema)
    .output(UpdateCountryOutputSchema)
    .handler(async ({ input }) => await CountryService.update(input)),
  delete: procedures
    .withRoles('admin')
    .input(DeleteCountryInputSchema)
    .handler(async ({ input }) => await CountryService.delete(input)),
};
