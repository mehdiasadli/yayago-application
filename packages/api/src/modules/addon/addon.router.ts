import { procedures } from '../../procedures';
import { z } from 'zod';
import {
  CreateAddonInputSchema,
  CreateAddonOutputSchema,
  UpdateAddonInputSchema,
  UpdateAddonOutputSchema,
  DeleteAddonInputSchema,
  DeleteAddonOutputSchema,
  GetAddonInputSchema,
  AddonOutputSchema,
  ListAddonsInputSchema,
  ListAddonsOutputSchema,
  ListAvailableAddonsInputSchema,
  ListAvailableAddonsOutputSchema,
  CreateListingAddonInputSchema,
  CreateListingAddonOutputSchema,
  UpdateListingAddonInputSchema,
  UpdateListingAddonOutputSchema,
  DeleteListingAddonInputSchema,
  DeleteListingAddonOutputSchema,
  ListListingAddonsInputSchema,
  ListListingAddonsOutputSchema,
  AddAddonToBookingInputSchema,
  AddAddonToBookingOutputSchema,
  RemoveAddonFromBookingInputSchema,
  RemoveAddonFromBookingOutputSchema,
  CancelBookingAddonInputSchema,
  CancelBookingAddonOutputSchema,
  ListBookingAddonsInputSchema,
  ListBookingAddonsOutputSchema,
  CreateAddonBundleInputSchema,
  CreateAddonBundleOutputSchema,
  UpdateAddonBundleInputSchema,
  UpdateAddonBundleOutputSchema,
  DeleteAddonBundleInputSchema,
  DeleteAddonBundleOutputSchema,
  ListAddonBundlesInputSchema,
  ListAddonBundlesOutputSchema,
  GetBundlePriceInputSchema,
  GetBundlePriceOutputSchema,
  GetAddonStatsOutputSchema,
  GetPartnerAddonStatsOutputSchema,
  CalculateAddonPriceInputSchema,
  CalculateAddonPriceOutputSchema,
} from '@yayago-app/validators';
import { AddonService } from './addon.service';

export default {
  // ============ PUBLIC ENDPOINTS ============

  // Get single addon (public)
  get: procedures.public
    .input(GetAddonInputSchema)
    .output(AddonOutputSchema)
    .handler(async ({ input }) => await AddonService.getAddon(input)),

  // List all addons (public - for reference)
  list: procedures.public
    .input(ListAddonsInputSchema)
    .output(ListAddonsOutputSchema)
    .handler(async ({ input }) => await AddonService.listAddons(input)),

  // List available addons for a listing (public - for checkout)
  listAvailable: procedures.public
    .input(ListAvailableAddonsInputSchema)
    .output(ListAvailableAddonsOutputSchema)
    .handler(async ({ input }) => await AddonService.listAvailableAddons(input)),

  // Calculate addon price (public - for checkout)
  calculatePrice: procedures.public
    .input(CalculateAddonPriceInputSchema)
    .output(CalculateAddonPriceOutputSchema)
    .handler(async ({ input }) => await AddonService.calculateAddonPrice(input)),

  // List addon bundles (public)
  listBundles: procedures.public
    .input(ListAddonBundlesInputSchema)
    .output(ListAddonBundlesOutputSchema)
    .handler(async ({ input }) => await AddonService.listAddonBundles(input)),

  // Get bundle price for listing (public - for checkout)
  getBundlePrice: procedures.public
    .input(GetBundlePriceInputSchema)
    .output(GetBundlePriceOutputSchema)
    .handler(async ({ input }) => await AddonService.getBundlePrice(input)),

  // ============ USER ENDPOINTS (Booking) ============

  // Add addon to booking (during checkout)
  addToBooking: procedures.protected
    .input(AddAddonToBookingInputSchema)
    .output(AddAddonToBookingOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.addAddonToBooking(input, session.user.id)
    ),

  // Remove addon from booking (during checkout)
  removeFromBooking: procedures.protected
    .input(RemoveAddonFromBookingInputSchema)
    .output(RemoveAddonFromBookingOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.removeAddonFromBooking(input, session.user.id)
    ),

  // Cancel booking addon (after booking confirmed)
  cancelBookingAddon: procedures.protected
    .input(CancelBookingAddonInputSchema)
    .output(CancelBookingAddonOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.cancelBookingAddon(input, session.user.id)
    ),

  // List booking addons
  listBookingAddons: procedures.protected
    .input(ListBookingAddonsInputSchema)
    .output(ListBookingAddonsOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.listBookingAddons(input, session.user.id)
    ),

  // ============ PARTNER ENDPOINTS ============

  // Create listing addon
  createListingAddon: procedures.partner
    .input(CreateListingAddonInputSchema)
    .output(CreateListingAddonOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.createListingAddon(input, session.user.id)
    ),

  // Update listing addon
  updateListingAddon: procedures.partner
    .input(UpdateListingAddonInputSchema)
    .output(UpdateListingAddonOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.updateListingAddon(input, session.user.id)
    ),

  // Delete listing addon
  deleteListingAddon: procedures.partner
    .input(DeleteListingAddonInputSchema)
    .output(DeleteListingAddonOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.deleteListingAddon(input, session.user.id)
    ),

  // List listing addons (for a specific listing)
  listListingAddons: procedures.partner
    .input(ListListingAddonsInputSchema)
    .output(ListListingAddonsOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.listListingAddons(input, session.user.id)
    ),

  // Get partner addon stats
  getPartnerStats: procedures.partner
    .input(z.object({}))
    .output(GetPartnerAddonStatsOutputSchema)
    .handler(async ({ context: { session } }) =>
      await AddonService.getPartnerAddonStats(session.user.id)
    ),

  // Create organization bundle (partner)
  createOrgBundle: procedures.partner
    .input(CreateAddonBundleInputSchema)
    .output(CreateAddonBundleOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.createAddonBundle(input, session.user.id)
    ),

  // Update organization bundle (partner)
  updateOrgBundle: procedures.partner
    .input(UpdateAddonBundleInputSchema)
    .output(UpdateAddonBundleOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.updateAddonBundle(input, session.user.id)
    ),

  // Delete organization bundle (partner)
  deleteOrgBundle: procedures.partner
    .input(DeleteAddonBundleInputSchema)
    .output(DeleteAddonBundleOutputSchema)
    .handler(async ({ input, context: { session } }) =>
      await AddonService.deleteAddonBundle(input, session.user.id)
    ),

  // ============ ADMIN ENDPOINTS ============

  // Create addon (admin only)
  create: procedures.admin
    .input(CreateAddonInputSchema)
    .output(CreateAddonOutputSchema)
    .handler(async ({ input }) => await AddonService.createAddon(input)),

  // Update addon (admin only)
  update: procedures.admin
    .input(UpdateAddonInputSchema)
    .output(UpdateAddonOutputSchema)
    .handler(async ({ input }) => await AddonService.updateAddon(input)),

  // Delete addon (admin only)
  delete: procedures.admin
    .input(DeleteAddonInputSchema)
    .output(DeleteAddonOutputSchema)
    .handler(async ({ input }) => await AddonService.deleteAddon(input)),

  // Get addon stats (admin only)
  getStats: procedures.admin
    .input(z.object({}))
    .output(GetAddonStatsOutputSchema)
    .handler(async () => await AddonService.getAddonStats()),

  // Create global bundle (admin only)
  createBundle: procedures.admin
    .input(CreateAddonBundleInputSchema)
    .output(CreateAddonBundleOutputSchema)
    .handler(async ({ input }) => await AddonService.createAddonBundle(input)),

  // Update global bundle (admin only)
  updateBundle: procedures.admin
    .input(UpdateAddonBundleInputSchema)
    .output(UpdateAddonBundleOutputSchema)
    .handler(async ({ input }) => await AddonService.updateAddonBundle(input)),

  // Delete global bundle (admin only)
  deleteBundle: procedures.admin
    .input(DeleteAddonBundleInputSchema)
    .output(DeleteAddonBundleOutputSchema)
    .handler(async ({ input }) => await AddonService.deleteAddonBundle(input)),
};

