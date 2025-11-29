import { procedures } from '../../procedures';
import { ListingService } from './listing.service';
import {
  CreateListingInputSchema,
  CreateListingOutputSchema,
  UpdateListingInputSchema,
  UpdateListingOutputSchema,
  UpdateListingVehicleInputSchema,
  UpdateListingVehicleOutputSchema,
  UpdateListingPricingInputSchema,
  UpdateListingPricingOutputSchema,
  UpdateListingBookingDetailsInputSchema,
  UpdateListingBookingDetailsOutputSchema,
  DeleteListingInputSchema,
  DeleteListingOutputSchema,
  UpdateListingStatusInputSchema,
  UpdateListingStatusOutputSchema,
  SubmitListingForReviewInputSchema,
  SubmitListingForReviewOutputSchema,
  UpdateListingVerificationInputSchema,
  UpdateListingVerificationOutputSchema,
  UpdateMediaVerificationInputSchema,
  UpdateMediaVerificationOutputSchema,
  AddListingMediaInputSchema,
  AddListingMediaOutputSchema,
  DeleteListingMediaInputSchema,
  DeleteListingMediaOutputSchema,
  SetPrimaryMediaInputSchema,
  SetPrimaryMediaOutputSchema,
  FindOneListingInputSchema,
  FindOneListingOutputSchema,
  ListOwnListingsInputSchema,
  ListOwnListingsOutputSchema,
  ListAllListingsInputSchema,
  ListAllListingsOutputSchema,
  ListPublicListingsInputSchema,
  ListPublicListingsOutputSchema,
  GetPublicListingInputSchema,
  GetPublicListingOutputSchema,
  GetSubscriptionUsageOutputSchema,
} from '@yayago-app/validators';

export default {
  // ============ PARTNER ENDPOINTS ============

  // Create new listing
  create: procedures.protected
    .input(CreateListingInputSchema)
    .output(CreateListingOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.create(input, session.user.id)),

  // Update listing basic info
  update: procedures.protected
    .input(UpdateListingInputSchema)
    .output(UpdateListingOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.update(input, session.user.id)),

  // Update vehicle details
  updateVehicle: procedures.protected
    .input(UpdateListingVehicleInputSchema)
    .output(UpdateListingVehicleOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.updateVehicle(input, session.user.id)),

  // Update pricing
  updatePricing: procedures.protected
    .input(UpdateListingPricingInputSchema)
    .output(UpdateListingPricingOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.updatePricing(input, session.user.id)),

  // Update booking details
  updateBookingDetails: procedures.protected
    .input(UpdateListingBookingDetailsInputSchema)
    .output(UpdateListingBookingDetailsOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await ListingService.updateBookingDetails(input, session.user.id)
    ),

  // Delete listing
  delete: procedures.protected
    .input(DeleteListingInputSchema)
    .output(DeleteListingOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.delete(input, session.user.id)),

  // Update listing status (available, unavailable, etc.)
  updateStatus: procedures.protected
    .input(UpdateListingStatusInputSchema)
    .output(UpdateListingStatusOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.updateStatus(input, session.user.id)),

  // Submit for review
  submitForReview: procedures.protected
    .input(SubmitListingForReviewInputSchema)
    .output(SubmitListingForReviewOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.submitForReview(input, session.user.id)),

  // Add media
  addMedia: procedures.protected
    .input(AddListingMediaInputSchema)
    .output(AddListingMediaOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.addMedia(input, session.user.id)),

  // Delete media
  deleteMedia: procedures.protected
    .input(DeleteListingMediaInputSchema)
    .output(DeleteListingMediaOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.deleteMedia(input, session.user.id)),

  // Set primary media
  setPrimaryMedia: procedures.protected
    .input(SetPrimaryMediaInputSchema)
    .output(SetPrimaryMediaOutputSchema)
    .handler(async ({ input, context: { session } }) => await ListingService.setPrimaryMedia(input, session.user.id)),

  // Get own listing details
  findOne: procedures.protected
    .input(FindOneListingInputSchema)
    .output(FindOneListingOutputSchema)
    .handler(
      async ({ input, context: { session, locale } }) => await ListingService.findOne(input, session.user.id, locale)
    ),

  // List own listings
  listOwn: procedures.protected
    .input(ListOwnListingsInputSchema)
    .output(ListOwnListingsOutputSchema)
    .handler(
      async ({ input, context: { session, locale } }) => await ListingService.listOwn(input, session.user.id, locale)
    ),

  // Get subscription usage
  getSubscriptionUsage: procedures.protected
    .output(GetSubscriptionUsageOutputSchema)
    .handler(
      async ({ context: { session, locale } }) => await ListingService.getSubscriptionUsage(session.user.id, locale)
    ),

  // ============ ADMIN ENDPOINTS ============

  // List all listings (admin)
  listAll: procedures
    .withRoles('admin', 'moderator')
    .input(ListAllListingsInputSchema)
    .output(ListAllListingsOutputSchema)
    .handler(async ({ input, context: { locale } }) => await ListingService.listAll(input, locale)),

  // Update verification status (admin)
  updateVerification: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateListingVerificationInputSchema)
    .output(UpdateListingVerificationOutputSchema)
    .handler(async ({ input }) => await ListingService.updateVerification(input)),

  // Update media verification status (admin)
  updateMediaVerification: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateMediaVerificationInputSchema)
    .output(UpdateMediaVerificationOutputSchema)
    .handler(async ({ input }) => await ListingService.updateMediaVerification(input)),

  // ============ PUBLIC ENDPOINTS ============

  // List public listings (browsing)
  listPublic: procedures.public
    .input(ListPublicListingsInputSchema)
    .output(ListPublicListingsOutputSchema)
    .handler(async ({ input, context: { locale } }) => await ListingService.listPublic(input, locale)),

  // Get public listing details
  getPublic: procedures.public
    .input(GetPublicListingInputSchema)
    .output(GetPublicListingOutputSchema)
    .handler(async ({ input, context: { locale } }) => await ListingService.getPublicListing(input, locale)),
};
