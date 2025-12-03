import type { RouterClient } from '@orpc/server';

import countries from '../modules/country/country.router';
import users from '../modules/user/user.router';
import cities from '../modules/city/city.router';
import members from '../modules/member/member.router';
import organizations from '../modules/organization/organization.router';
import vehicleBrands from '../modules/vehicle-brand/vehicle-brand.router';
import vehicleModels from '../modules/vehicle-model/vehicle-model.router';
import subscriptionPlans from '../modules/subscription-plan/subscription-plan.router';
import listings from '../modules/listing/listing.router';
import media from '../modules/media/media.router';
import bookings from '../modules/booking/booking.router';
import admin from '../modules/admin/admin.router';
import { finance } from '../modules/finance';
import autodev from '../modules/autodev/autodev.router';
import stripeConnect from '../modules/stripe-connect/stripe-connect.router';
import reviews from '../modules/review/review.router';

export const appRouter = {
  cities,
  countries,
  users,
  members,
  organizations,
  vehicleBrands,
  vehicleModels,
  subscriptionPlans,
  listings,
  media,
  bookings,
  admin,
  finance,
  autodev,
  stripeConnect,
  reviews,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
