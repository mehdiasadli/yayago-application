import { procedures } from '../../procedures';
import { z } from 'zod';
import {
  CreateReviewInputSchema,
  CreateReviewOutputSchema,
  UpdateReviewInputSchema,
  UpdateReviewOutputSchema,
  DeleteReviewInputSchema,
  DeleteReviewOutputSchema,
  GetReviewInputSchema,
  ReviewOutputSchema,
  ListListingReviewsInputSchema,
  ListListingReviewsOutputSchema,
  GetListingReviewSummaryInputSchema,
  GetListingReviewSummaryOutputSchema,
  ListUserReviewsInputSchema,
  ListUserReviewsOutputSchema,
  ListPartnerReviewsInputSchema,
  ListPartnerReviewsOutputSchema,
  ListAllReviewsInputSchema,
  ListAllReviewsOutputSchema,
  GetPartnerReviewStatsOutputSchema,
  CanReviewBookingInputSchema,
  CanReviewBookingOutputSchema,
  GetPendingReviewsOutputSchema,
} from '@yayago-app/validators';
import { ReviewService } from './review.service';

export default {
  // ============ PUBLIC ENDPOINTS ============

  // Get single review (public)
  get: procedures.public
    .input(GetReviewInputSchema)
    .output(ReviewOutputSchema)
    .handler(async ({ input }) => await ReviewService.getReview(input)),

  // List reviews for a listing (public)
  listForListing: procedures.public
    .input(ListListingReviewsInputSchema)
    .output(ListListingReviewsOutputSchema)
    .handler(async ({ input }) => await ReviewService.listListingReviews(input)),

  // Get listing review summary (public)
  getListingSummary: procedures.public
    .input(GetListingReviewSummaryInputSchema)
    .output(GetListingReviewSummaryOutputSchema)
    .handler(async ({ input }) => await ReviewService.getListingReviewSummary(input)),

  // ============ USER ENDPOINTS ============

  // Create review
  create: procedures.protected
    .input(CreateReviewInputSchema)
    .output(CreateReviewOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.createReview(input, session.user.id)),

  // Update review
  update: procedures.protected
    .input(UpdateReviewInputSchema)
    .output(UpdateReviewOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.updateReview(input, session.user.id)),

  // Delete review
  delete: procedures.protected
    .input(DeleteReviewInputSchema)
    .output(DeleteReviewOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.deleteReview(input, session.user.id)),

  // List user's reviews
  listMyReviews: procedures.protected
    .input(ListUserReviewsInputSchema)
    .output(ListUserReviewsOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.listUserReviews(input, session.user.id)),

  // Check if user can review a booking
  canReview: procedures.protected
    .input(CanReviewBookingInputSchema)
    .output(CanReviewBookingOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.canReviewBooking(input, session.user.id)),

  // Get pending reviews (bookings user can review)
  getPendingReviews: procedures.protected
    .input(z.object({}))
    .output(GetPendingReviewsOutputSchema)
    .handler(async ({ context: { session } }) => await ReviewService.getPendingReviews(session.user.id)),

  // ============ PARTNER ENDPOINTS ============

  // List partner's reviews (reviews for their listings)
  listPartnerReviews: procedures.protected
    .input(ListPartnerReviewsInputSchema)
    .output(ListPartnerReviewsOutputSchema)
    .handler(async ({ input, context: { session } }) => await ReviewService.listPartnerReviews(input, session.user.id)),

  // Get partner review stats
  getPartnerStats: procedures.protected
    .input(z.object({}))
    .output(GetPartnerReviewStatsOutputSchema)
    .handler(async ({ context: { session } }) => await ReviewService.getPartnerReviewStats(session.user.id)),

  // ============ ADMIN ENDPOINTS ============

  // List all reviews (admin)
  listAll: procedures
    .withRoles('admin', 'moderator')
    .input(ListAllReviewsInputSchema)
    .output(ListAllReviewsOutputSchema)
    .handler(async ({ input }) => await ReviewService.listAllReviews(input)),
};

