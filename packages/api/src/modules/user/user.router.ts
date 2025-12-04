import z from 'zod';
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
  // Verification schemas
  GetVerificationStatusOutputSchema,
  RequestVerificationOtpInputSchema,
  RequestVerificationOtpOutputSchema,
  VerifyOtpInputSchema,
  VerifyOtpOutputSchema,
  SubmitVerificationInputSchema,
  SubmitVerificationOutputSchema,
  GetVerificationDocumentUrlsInputSchema,
  GetVerificationDocumentUrlsOutputSchema,
  ResubmitVerificationInputSchema,
  ResubmitVerificationOutputSchema,
  // Admin verification schemas
  ListPendingVerificationsInputSchema,
  ListPendingVerificationsOutputSchema,
  GetVerificationAttemptInputSchema,
  GetVerificationAttemptOutputSchema,
  ReviewVerificationInputSchema,
  ReviewVerificationOutputSchema,
  GetUserVerificationHistoryInputSchema,
  GetUserVerificationHistoryOutputSchema,
  // Admin schemas
  ListUsersInputSchema,
  ListUsersOutputSchema,
  FindOneUserInputSchema,
  FindOneUserOutputSchema,
  UpdateUserRoleInputSchema,
  UpdateUserRoleOutputSchema,
  BanUserInputSchema,
  BanUserOutputSchema,
  UnbanUserInputSchema,
  UnbanUserOutputSchema,
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

  // ============ USER VERIFICATION ============
  getVerificationStatus: procedures.protected
    .output(GetVerificationStatusOutputSchema)
    .handler(async ({ context: { session } }) => {
      return UserService.getVerificationStatus(session.user.id);
    }),

  requestVerificationOtp: procedures.protected
    .input(RequestVerificationOtpInputSchema)
    .output(RequestVerificationOtpOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.requestVerificationOtp(session.user.id, input);
    }),

  verifyOtp: procedures.protected
    .input(VerifyOtpInputSchema)
    .output(VerifyOtpOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.verifyOtp(session.user.id, input);
    }),

  submitVerification: procedures.protected
    .input(SubmitVerificationInputSchema)
    .output(SubmitVerificationOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.submitVerification(session.user.id, input);
    }),

  // Get signed URLs for verification documents (secure access)
  getVerificationDocumentUrls: procedures.protected
    .input(GetVerificationDocumentUrlsInputSchema)
    .output(GetVerificationDocumentUrlsOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.getVerificationDocumentUrls(session.user.id, input);
    }),

  // Resubmit verification documents (for expired or rejected status)
  resubmitVerification: procedures.protected
    .input(ResubmitVerificationInputSchema)
    .output(ResubmitVerificationOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.resubmitVerification(session.user.id, input);
    }),

  // ============ ADMIN: VERIFICATION MANAGEMENT ============
  listPendingVerifications: procedures
    .withRoles('admin', 'moderator')
    .input(ListPendingVerificationsInputSchema)
    .output(ListPendingVerificationsOutputSchema)
    .handler(async ({ input }) => {
      return UserService.listPendingVerifications(input);
    }),

  getVerificationAttempt: procedures
    .withRoles('admin', 'moderator')
    .input(GetVerificationAttemptInputSchema)
    .output(GetVerificationAttemptOutputSchema)
    .handler(async ({ input }) => {
      return UserService.getVerificationAttempt(input);
    }),

  reviewVerification: procedures
    .withRoles('admin', 'moderator')
    .input(ReviewVerificationInputSchema)
    .output(ReviewVerificationOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return UserService.reviewVerification(session.user.id, input);
    }),

  getUserVerificationHistory: procedures
    .withRoles('admin', 'moderator')
    .input(GetUserVerificationHistoryInputSchema)
    .output(GetUserVerificationHistoryOutputSchema)
    .handler(async ({ input }) => {
      return UserService.getUserVerificationHistory(input);
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
    .output(z.object({ success: z.boolean() }))
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

  // ============ ADMIN: USER MANAGEMENT ============
  list: procedures
    .withRoles('admin', 'moderator')
    .input(ListUsersInputSchema)
    .output(ListUsersOutputSchema)
    .handler(async ({ input }) => {
      return UserService.list(input);
    }),

  findOne: procedures
    .withRoles('admin', 'moderator')
    .input(FindOneUserInputSchema)
    .output(FindOneUserOutputSchema)
    .handler(async ({ input }) => {
      return UserService.findOne(input);
    }),

  updateRole: procedures
    .withRoles('admin')
    .input(UpdateUserRoleInputSchema)
    .output(UpdateUserRoleOutputSchema)
    .handler(async ({ input }) => {
      return UserService.updateRole(input);
    }),

  banUser: procedures
    .withRoles('admin', 'moderator')
    .input(BanUserInputSchema)
    .output(BanUserOutputSchema)
    .handler(async ({ input }) => {
      return UserService.banUser(input);
    }),

  unbanUser: procedures
    .withRoles('admin', 'moderator')
    .input(UnbanUserInputSchema)
    .output(UnbanUserOutputSchema)
    .handler(async ({ input }) => {
      return UserService.unbanUser(input);
    }),
};

export default users;
