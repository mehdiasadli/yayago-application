import { procedures } from '../../procedures';
import { StripeConnectService } from './stripe-connect.service';
import {
  CreateOnboardingLinkInputSchema,
  CreateOnboardingLinkOutputSchema,
  GetConnectAccountStatusInputSchema,
  GetConnectAccountStatusOutputSchema,
  CreateDashboardLinkInputSchema,
  CreateDashboardLinkOutputSchema,
  CreateAccountSessionInputSchema,
  CreateAccountSessionOutputSchema,
  ProcessTripPayoutInputSchema,
  ProcessTripPayoutOutputSchema,
} from '@yayago-app/validators';

export default {
  // Partner endpoints
  createOnboardingLink: procedures.partner
    .input(CreateOnboardingLinkInputSchema)
    .output(CreateOnboardingLinkOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return await StripeConnectService.createOnboardingLink(input, session.user.id);
    }),

  getAccountStatus: procedures.partner
    .input(GetConnectAccountStatusInputSchema)
    .output(GetConnectAccountStatusOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return await StripeConnectService.getAccountStatus(input.organizationId, session.user.id);
    }),

  createDashboardLink: procedures.partner
    .input(CreateDashboardLinkInputSchema)
    .output(CreateDashboardLinkOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return await StripeConnectService.createDashboardLink(input.organizationId, session.user.id);
    }),

  // Create Account Session for embedded components
  createAccountSession: procedures.partner
    .input(CreateAccountSessionInputSchema)
    .output(CreateAccountSessionOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return await StripeConnectService.createAccountSession(input.organizationId, session.user.id);
    }),

  // Admin endpoints
  processTripPayout: procedures.admin
    .input(ProcessTripPayoutInputSchema)
    .output(ProcessTripPayoutOutputSchema)
    .handler(async ({ input }) => {
      return await StripeConnectService.processTripPayout(input);
    }),
};
