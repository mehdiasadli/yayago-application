import { procedures } from '../../procedures';
import {
  CalculateBookingPriceInputSchema,
  CalculateBookingPriceOutputSchema,
  CheckAvailabilityInputSchema,
  CheckAvailabilityOutputSchema,
  CreateBookingInputSchema,
  CreateBookingOutputSchema,
  GetBookingInputSchema,
  BookingOutputSchema,
  ListUserBookingsInputSchema,
  ListUserBookingsOutputSchema,
  ListPartnerBookingsInputSchema,
  ListPartnerBookingsOutputSchema,
  ListAllBookingsInputSchema,
  ListAllBookingsOutputSchema,
  UpdateBookingStatusInputSchema,
  UpdateBookingStatusOutputSchema,
  CancelBookingInputSchema,
  CancelBookingOutputSchema,
  StartTripInputSchema,
  StartTripOutputSchema,
  CompleteTripInputSchema,
  CompleteTripOutputSchema,
  GetBookingStatsOutputSchema,
} from '@yayago-app/validators';
import { BookingService } from './booking.service';
import { z } from 'zod';

export default {
  // ============ PUBLIC ENDPOINTS ============

  // Calculate price for a booking (public - for price display)
  calculatePrice: procedures.public
    .input(CalculateBookingPriceInputSchema)
    .output(CalculateBookingPriceOutputSchema)
    .handler(async ({ input }) => await BookingService.calculatePrice(input)),

  // Check availability (public - for date picker)
  checkAvailability: procedures.public
    .input(CheckAvailabilityInputSchema)
    .output(CheckAvailabilityOutputSchema)
    .handler(async ({ input }) => await BookingService.checkAvailability(input)),

  // ============ USER ENDPOINTS ============

  // Create booking (initiates checkout)
  create: procedures.protected
    .input(CreateBookingInputSchema)
    .output(CreateBookingOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.createBooking(input, session.user.id)),

  // Get single booking (user)
  getMyBooking: procedures.protected
    .input(GetBookingInputSchema)
    .output(BookingOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.getBooking(input, session.user.id)),

  // List user's bookings
  listMyBookings: procedures.protected
    .input(ListUserBookingsInputSchema)
    .output(ListUserBookingsOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.listUserBookings(input, session.user.id)),

  // Cancel booking (user)
  cancel: procedures.protected
    .input(CancelBookingInputSchema)
    .output(CancelBookingOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.cancelBooking(input, session.user.id)),

  // ============ PARTNER ENDPOINTS ============

  // Get booking (partner)
  getPartnerBooking: procedures.protected
    .input(GetBookingInputSchema)
    .output(BookingOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.getPartnerBooking(input, session.user.id)),

  // List partner's bookings
  listPartnerBookings: procedures.protected
    .input(ListPartnerBookingsInputSchema)
    .output(ListPartnerBookingsOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await BookingService.listPartnerBookings(input, session.user.id)
    ),

  // Update booking status (approve/reject/cancel)
  updateStatus: procedures.protected
    .input(UpdateBookingStatusInputSchema)
    .output(UpdateBookingStatusOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await BookingService.updateBookingStatus(input, session.user.id)
    ),

  // Start trip (vehicle picked up)
  startTrip: procedures.protected
    .input(StartTripInputSchema)
    .output(StartTripOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.startTrip(input, session.user.id)),

  // Complete trip (vehicle returned)
  completeTrip: procedures.protected
    .input(CompleteTripInputSchema)
    .output(CompleteTripOutputSchema)
    .handler(async ({ input, context: { session } }) => await BookingService.completeTrip(input, session.user.id)),

  // Get booking stats for dashboard
  getStats: procedures.protected
    .input(z.object({}))
    .output(GetBookingStatsOutputSchema)
    .handler(async ({ context: { session } }) => await BookingService.getBookingStats(session.user.id)),

  // ============ ADMIN ENDPOINTS ============

  // Get booking (admin)
  getAdminBooking: procedures
    .withRoles('admin', 'moderator')
    .input(GetBookingInputSchema)
    .output(BookingOutputSchema)
    .handler(async ({ input }) => await BookingService.getBooking(input, undefined, true)),

  // List all bookings (admin)
  listAll: procedures
    .withRoles('admin', 'moderator')
    .input(ListAllBookingsInputSchema)
    .output(ListAllBookingsOutputSchema)
    .handler(async ({ input }) => await BookingService.listAllBookings(input)),
};
