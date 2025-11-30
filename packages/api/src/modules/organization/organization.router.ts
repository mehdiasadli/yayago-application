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
  GetMyOrganizationOutputSchema,
  UpdateOrgBasicInfoInputSchema,
  UpdateOrgBasicInfoOutputSchema,
  UpdateOrgContactInfoInputSchema,
  UpdateOrgContactInfoOutputSchema,
  UpdateOrgLocationInputSchema,
  UpdateOrgLocationOutputSchema,
  UpdateOrgSocialMediaInputSchema,
  UpdateOrgSocialMediaOutputSchema,
  UpdateOrgBusinessHoursInputSchema,
  UpdateOrgBusinessHoursOutputSchema,
  UpdateOrgPoliciesInputSchema,
  UpdateOrgPoliciesOutputSchema,
  UpdateOrgBrandingInputSchema,
  UpdateOrgBrandingOutputSchema,
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

  // User/Partner endpoints - Onboarding
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

  // Partner endpoints - Organization Management
  getMyOrganization: procedures.protected
    .output(GetMyOrganizationOutputSchema)
    .handler(async ({ context }) =>
      OrganizationService.getMyOrganization(context.session.user.id, context.locale)
    ),

  updateBasicInfo: procedures.protected
    .input(UpdateOrgBasicInfoInputSchema)
    .output(UpdateOrgBasicInfoOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateBasicInfo(context.session.user.id, input)
    ),

  updateContactInfo: procedures.protected
    .input(UpdateOrgContactInfoInputSchema)
    .output(UpdateOrgContactInfoOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateContactInfo(context.session.user.id, input)
    ),

  updateLocation: procedures.protected
    .input(UpdateOrgLocationInputSchema)
    .output(UpdateOrgLocationOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateLocation(context.session.user.id, input)
    ),

  updateSocialMedia: procedures.protected
    .input(UpdateOrgSocialMediaInputSchema)
    .output(UpdateOrgSocialMediaOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateSocialMedia(context.session.user.id, input)
    ),

  updateBusinessHours: procedures.protected
    .input(UpdateOrgBusinessHoursInputSchema)
    .output(UpdateOrgBusinessHoursOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateBusinessHours(context.session.user.id, input)
    ),

  updatePolicies: procedures.protected
    .input(UpdateOrgPoliciesInputSchema)
    .output(UpdateOrgPoliciesOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updatePolicies(context.session.user.id, input)
    ),

  updateBranding: procedures.protected
    .input(UpdateOrgBrandingInputSchema)
    .output(UpdateOrgBrandingOutputSchema)
    .handler(async ({ context, input }) =>
      OrganizationService.updateBranding(context.session.user.id, input)
    ),
};
