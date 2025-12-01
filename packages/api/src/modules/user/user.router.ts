import { procedures } from '../../procedures';
import { UserService } from './user.service';
import {
  GetMyProfileOutputSchema,
  UpdateProfileInputSchema,
  UpdateProfileOutputSchema,
  UpdatePersonalInfoInputSchema,
  UpdatePersonalInfoOutputSchema,
  SubmitDriverLicenseInputSchema,
  SubmitDriverLicenseOutputSchema,
  VerifyDriverLicenseInputSchema,
  VerifyDriverLicenseOutputSchema,
  UpdatePreferencesInputSchema,
  UpdatePreferencesOutputSchema,
  UpdateNotificationPreferencesInputSchema,
  UpdateNotificationPreferencesOutputSchema,
  AddFavoriteInputSchema,
  AddFavoriteOutputSchema,
  RemoveFavoriteInputSchema,
  RemoveFavoriteOutputSchema,
  ListFavoritesInputSchema,
  ListFavoritesOutputSchema,
  CheckFavoriteInputSchema,
  CheckFavoriteOutputSchema,
  ListMyReviewsInputSchema,
  ListMyReviewsOutputSchema,
  ListPendingReviewsOutputSchema,
  GetAccountOverviewOutputSchema,
} from '@yayago-app/validators';

const users = {
  // ============ PROFILE ============
  getMyProfile: procedures.protected.output(GetMyProfileOutputSchema).handler(async ({ context: { session } }) => {
    return UserService.getMyProfile(session.user.id);
  }),

  updateProfile: procedures.protected
    .input(UpdateProfileInputSchema)
    .output(UpdateProfileOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.updateProfile(session.user.id, input);
    }),

  updatePersonalInfo: procedures.protected
    .input(UpdatePersonalInfoInputSchema)
    .output(UpdatePersonalInfoOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.updatePersonalInfo(session.user.id, input);
    }),

  // ============ DRIVER LICENSE ============
  submitDriverLicense: procedures.protected
    .input(SubmitDriverLicenseInputSchema)
    .output(SubmitDriverLicenseOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.submitDriverLicense(session.user.id, input);
    }),

  // Admin only - verify driver license
  verifyDriverLicense: procedures
    .withRoles('admin', 'moderator')
    .input(VerifyDriverLicenseInputSchema)
    .output(VerifyDriverLicenseOutputSchema)
    .handler(async ({ input }) => {
      return UserService.verifyDriverLicense(input);
    }),

  // ============ PREFERENCES ============
  updatePreferences: procedures.protected
    .input(UpdatePreferencesInputSchema)
    .output(UpdatePreferencesOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.updatePreferences(session.user.id, input);
    }),

  updateNotificationPreferences: procedures.protected
    .input(UpdateNotificationPreferencesInputSchema)
    .output(UpdateNotificationPreferencesOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.updateNotificationPreferences(session.user.id, input);
    }),

  // ============ FAVORITES ============
  addFavorite: procedures.protected
    .input(AddFavoriteInputSchema)
    .output(AddFavoriteOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.addFavorite(session.user.id, input);
    }),

  removeFavorite: procedures.protected
    .input(RemoveFavoriteInputSchema)
    .output(RemoveFavoriteOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.removeFavorite(session.user.id, input);
    }),

  listFavorites: procedures.protected
    .input(ListFavoritesInputSchema)
    .output(ListFavoritesOutputSchema)
    .handler(async ({ input, context: { session, locale } }) => {
      return UserService.listFavorites(session.user.id, input, locale);
    }),

  checkFavorite: procedures.protected
    .input(CheckFavoriteInputSchema)
    .output(CheckFavoriteOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.checkFavorite(session.user.id, input);
    }),

  // ============ REVIEWS ============
  listMyReviews: procedures.protected
    .input(ListMyReviewsInputSchema)
    .output(ListMyReviewsOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.listMyReviews(session.user.id, input);
    }),

  listPendingReviews: procedures.protected
    .output(ListPendingReviewsOutputSchema)
    .handler(async ({ context: { session } }) => {
      return UserService.listPendingReviews(session.user.id);
    }),

  // ============ ACCOUNT OVERVIEW ============
  getAccountOverview: procedures.protected
    .output(GetAccountOverviewOutputSchema)
    .handler(async ({ context: { session } }) => {
      return UserService.getAccountOverview(session.user.id);
    }),
};

export default users;
