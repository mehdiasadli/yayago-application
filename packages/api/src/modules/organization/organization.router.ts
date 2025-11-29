import {
  GetOnboardingDataOutputSchema,
  GetOrganizationOutputSchema,
  CompleteOnboardingInputSchema,
  CompleteOnboardingOutputSchema,
  ListOrganizationInputSchema,
  ListOrganizationOutputSchema,
  FindOneOrganizationInputSchema,
  FindOneOrganizationOutputSchema,
  UpdateOrganizationStatusInputSchema,
  UpdateOrganizationStatusOutputSchema,
  GetPendingOrganizationsCountOutputSchema,
  SaveOnboardingProgressInputSchema,
  SaveOnboardingProgressOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';
import { OrganizationService } from './organization.service';

export default {
  // Admin endpoints
  list: procedures
    .withRoles('admin', 'moderator')
    .input(ListOrganizationInputSchema)
    .output(ListOrganizationOutputSchema)
    .handler(async ({ input, context }) => await OrganizationService.list(input, context.locale)),

  findOne: procedures
    .withRoles('admin', 'moderator')
    .input(FindOneOrganizationInputSchema)
    .output(FindOneOrganizationOutputSchema)
    .handler(async ({ input, context }) => await OrganizationService.findOne(input, context.locale)),

  updateStatus: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateOrganizationStatusInputSchema)
    .output(UpdateOrganizationStatusOutputSchema)
    .handler(async ({ input }) => await OrganizationService.updateStatus(input)),

  getPendingCount: procedures
    .withRoles('admin', 'moderator')
    .output(GetPendingOrganizationsCountOutputSchema)
    .handler(async () => await OrganizationService.getPendingCount()),

  // User/Partner endpoints
  getOnboardingData: procedures.protected
    .output(GetOnboardingDataOutputSchema)
    .handler(async ({ context }) => await OrganizationService.getOnboardingData(context.session.user.id, context.locale)),

  getOrganization: procedures.protected
    .output(GetOrganizationOutputSchema)
    .handler(async ({ context: { session } }) => await OrganizationService.getOrganization(session.user.id)),

  completeOnboarding: procedures.protected
    .input(CompleteOnboardingInputSchema)
    .output(CompleteOnboardingOutputSchema)
    .handler(async ({ context: { session }, input }) =>
      OrganizationService.completeOnboarding(session.user.id, input)
    ),

  saveOnboardingProgress: procedures.protected
    .input(SaveOnboardingProgressInputSchema)
    .output(SaveOnboardingProgressOutputSchema)
    .handler(async ({ context: { session }, input }) =>
      OrganizationService.saveOnboardingProgress(session.user.id, input)
    ),
};
