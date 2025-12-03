import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/server';
import type {
  CreateAddonInputType,
  CreateAddonOutputType,
  UpdateAddonInputType,
  UpdateAddonOutputType,
  DeleteAddonInputType,
  DeleteAddonOutputType,
  GetAddonInputType,
  AddonOutputType,
  ListAddonsInputType,
  ListAddonsOutputType,
  ListAvailableAddonsInputType,
  ListAvailableAddonsOutputType,
  CreateListingAddonInputType,
  CreateListingAddonOutputType,
  UpdateListingAddonInputType,
  UpdateListingAddonOutputType,
  DeleteListingAddonInputType,
  DeleteListingAddonOutputType,
  ListListingAddonsInputType,
  ListListingAddonsOutputType,
  AddAddonToBookingInputType,
  AddAddonToBookingOutputType,
  RemoveAddonFromBookingInputType,
  RemoveAddonFromBookingOutputType,
  CancelBookingAddonInputType,
  CancelBookingAddonOutputType,
  ListBookingAddonsInputType,
  ListBookingAddonsOutputType,
  CreateAddonBundleInputType,
  CreateAddonBundleOutputType,
  UpdateAddonBundleInputType,
  UpdateAddonBundleOutputType,
  DeleteAddonBundleInputType,
  DeleteAddonBundleOutputType,
  ListAddonBundlesInputType,
  ListAddonBundlesOutputType,
  GetBundlePriceInputType,
  GetBundlePriceOutputType,
  GetAddonStatsOutputType,
  GetPartnerAddonStatsOutputType,
  CalculateAddonPriceInputType,
  CalculateAddonPriceOutputType,
  LocalizedTextSchema,
} from '@yayago-app/validators';
import { z } from 'zod';

type LocalizedText = z.infer<typeof LocalizedTextSchema>;

// ============ HELPER FUNCTIONS ============

async function getPartnerOrganizationId(userId: string): Promise<string> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organization: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    },
    select: { organizationId: true },
  });

  if (!member) {
    throw new ORPCError('FORBIDDEN', {
      message: 'No active organization membership found',
    });
  }

  return member.organizationId;
}

async function verifyListingOwnership(listingId: string, organizationId: string): Promise<void> {
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!listing) {
    throw new ORPCError('NOT_FOUND', {
      message: 'Listing not found or does not belong to your organization',
    });
  }
}

function parseJsonField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  return value as T;
}

// Helper to convert null to undefined for Prisma JSON fields
function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

// ============ ADDON SERVICE ============

export class AddonService {
  // ============ BASE ADDON (Admin) ============

  static async createAddon(input: CreateAddonInputType): Promise<CreateAddonOutputType> {
    // Check if slug is unique
    const existing = await prisma.addon.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new ORPCError('CONFLICT', {
        message: 'An addon with this slug already exists',
      });
    }

    const addon = await prisma.addon.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        shortName: input.shortName,
        category: input.category,
        iconKey: input.iconKey,
        imageUrl: input.imageUrl,
        displayOrder: input.displayOrder ?? 0,
        isFeatured: input.isFeatured ?? false,
        isPopular: input.isPopular ?? false,
        inputType: input.inputType ?? 'BOOLEAN',
        billingType: input.billingType ?? 'FIXED',
        suggestedPrice: input.suggestedPrice,
        maxPrice: input.maxPrice,
        minQuantity: input.minQuantity ?? 1,
        maxQuantity: input.maxQuantity ?? 10,
        minRentalDays: input.minRentalDays,
        maxRentalDays: input.maxRentalDays,
        minDriverAge: input.minDriverAge,
        requiresApproval: input.requiresApproval ?? false,
        allowedVehicleClasses: input.allowedVehicleClasses,
        allowedVehicleBodyTypes: input.allowedVehicleBodyTypes,
        termsAndConditions: input.termsAndConditions,
        isRefundable: input.isRefundable ?? true,
        refundPolicy: input.refundPolicy,
        isTaxExempt: input.isTaxExempt ?? false,
        isActive: input.isActive ?? true,
        selectionOptions: input.selectionOptions,
        supportedCountries: input.supportedCountryIds
          ? { connect: input.supportedCountryIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    return {
      id: addon.id,
      slug: addon.slug,
    };
  }

  static async updateAddon(input: UpdateAddonInputType): Promise<UpdateAddonOutputType> {
    const addon = await prisma.addon.findUnique({
      where: { id: input.addonId },
    });

    if (!addon || addon.deletedAt) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not found',
      });
    }

    const updated = await prisma.addon.update({
      where: { id: addon.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: nullToUndefined(input.description) }),
        ...(input.shortName !== undefined && { shortName: nullToUndefined(input.shortName) }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.iconKey !== undefined && { iconKey: input.iconKey }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input.isPopular !== undefined && { isPopular: input.isPopular }),
        ...(input.inputType !== undefined && { inputType: input.inputType }),
        ...(input.billingType !== undefined && { billingType: input.billingType }),
        ...(input.suggestedPrice !== undefined && { suggestedPrice: input.suggestedPrice }),
        ...(input.maxPrice !== undefined && { maxPrice: input.maxPrice }),
        ...(input.minQuantity !== undefined && { minQuantity: input.minQuantity }),
        ...(input.maxQuantity !== undefined && { maxQuantity: input.maxQuantity }),
        ...(input.minRentalDays !== undefined && { minRentalDays: input.minRentalDays }),
        ...(input.maxRentalDays !== undefined && { maxRentalDays: input.maxRentalDays }),
        ...(input.minDriverAge !== undefined && { minDriverAge: input.minDriverAge }),
        ...(input.requiresApproval !== undefined && { requiresApproval: input.requiresApproval }),
        ...(input.allowedVehicleClasses !== undefined && {
          allowedVehicleClasses: nullToUndefined(input.allowedVehicleClasses),
        }),
        ...(input.allowedVehicleBodyTypes !== undefined && {
          allowedVehicleBodyTypes: nullToUndefined(input.allowedVehicleBodyTypes),
        }),
        ...(input.termsAndConditions !== undefined && {
          termsAndConditions: nullToUndefined(input.termsAndConditions),
        }),
        ...(input.isRefundable !== undefined && { isRefundable: input.isRefundable }),
        ...(input.refundPolicy !== undefined && { refundPolicy: nullToUndefined(input.refundPolicy) }),
        ...(input.isTaxExempt !== undefined && { isTaxExempt: input.isTaxExempt }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.selectionOptions !== undefined && { selectionOptions: nullToUndefined(input.selectionOptions) }),
        ...(input.supportedCountryIds !== undefined && {
          supportedCountries: { set: input.supportedCountryIds.map((id) => ({ id })) },
        }),
      },
    });

    return {
      id: updated.id,
      slug: updated.slug,
      updatedAt: updated.updatedAt,
    };
  }

  static async deleteAddon(input: DeleteAddonInputType): Promise<DeleteAddonOutputType> {
    const addon = await prisma.addon.findUnique({
      where: { id: input.addonId },
    });

    if (!addon || addon.deletedAt) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not found',
      });
    }

    // Soft delete
    await prisma.addon.update({
      where: { id: addon.id },
      data: { deletedAt: new Date() },
    });

    return {
      id: addon.id,
      deleted: true,
    };
  }

  static async getAddon(input: GetAddonInputType): Promise<AddonOutputType> {
    const addon = await prisma.addon.findFirst({
      where: {
        deletedAt: null,
        ...(input.addonId && { id: input.addonId }),
        ...(input.slug && { slug: input.slug }),
      },
    });

    if (!addon) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not found',
      });
    }

    return {
      id: addon.id,
      createdAt: addon.createdAt,
      updatedAt: addon.updatedAt,
      slug: addon.slug,
      name: parseJsonField<LocalizedText>(addon.name) || {},
      description: parseJsonField<LocalizedText>(addon.description),
      shortName: parseJsonField<LocalizedText>(addon.shortName),
      category: addon.category,
      iconKey: addon.iconKey,
      imageUrl: addon.imageUrl,
      displayOrder: addon.displayOrder,
      isFeatured: addon.isFeatured,
      isPopular: addon.isPopular,
      inputType: addon.inputType,
      billingType: addon.billingType,
      suggestedPrice: addon.suggestedPrice,
      maxPrice: addon.maxPrice,
      minQuantity: addon.minQuantity,
      maxQuantity: addon.maxQuantity,
      minRentalDays: addon.minRentalDays,
      maxRentalDays: addon.maxRentalDays,
      minDriverAge: addon.minDriverAge,
      requiresApproval: addon.requiresApproval,
      allowedVehicleClasses: parseJsonField<string[]>(addon.allowedVehicleClasses),
      allowedVehicleBodyTypes: parseJsonField<string[]>(addon.allowedVehicleBodyTypes),
      termsAndConditions: parseJsonField<LocalizedText>(addon.termsAndConditions),
      isRefundable: addon.isRefundable,
      refundPolicy: parseJsonField<LocalizedText>(addon.refundPolicy),
      isTaxExempt: addon.isTaxExempt,
      isActive: addon.isActive,
      selectionOptions: parseJsonField<any[]>(addon.selectionOptions),
    };
  }

  static async listAddons(input: ListAddonsInputType): Promise<ListAddonsOutputType> {
    const { q, category, inputType, billingType, isActive, isFeatured, countryId, page, take } = input;

    const where = {
      deletedAt: null,
      ...(category && { category }),
      ...(inputType && { inputType }),
      ...(billingType && { billingType }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(countryId && { supportedCountries: { some: { id: countryId } } }),
      ...(q && {
        OR: [
          { slug: { contains: q, mode: 'insensitive' as const } },
          // Note: JSON field search is limited in Prisma
        ],
      }),
    };

    const [addons, total] = await Promise.all([
      prisma.addon.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.addon.count({ where }),
    ]);

    return {
      items: addons.map((addon) => ({
        id: addon.id,
        createdAt: addon.createdAt,
        updatedAt: addon.updatedAt,
        slug: addon.slug,
        name: parseJsonField<LocalizedText>(addon.name) || {},
        description: parseJsonField<LocalizedText>(addon.description),
        shortName: parseJsonField<LocalizedText>(addon.shortName),
        category: addon.category,
        iconKey: addon.iconKey,
        imageUrl: addon.imageUrl,
        displayOrder: addon.displayOrder,
        isFeatured: addon.isFeatured,
        isPopular: addon.isPopular,
        inputType: addon.inputType,
        billingType: addon.billingType,
        suggestedPrice: addon.suggestedPrice,
        maxPrice: addon.maxPrice,
        minQuantity: addon.minQuantity,
        maxQuantity: addon.maxQuantity,
        minRentalDays: addon.minRentalDays,
        maxRentalDays: addon.maxRentalDays,
        minDriverAge: addon.minDriverAge,
        requiresApproval: addon.requiresApproval,
        allowedVehicleClasses: parseJsonField<string[]>(addon.allowedVehicleClasses),
        allowedVehicleBodyTypes: parseJsonField<string[]>(addon.allowedVehicleBodyTypes),
        isRefundable: addon.isRefundable,
        isTaxExempt: addon.isTaxExempt,
        isActive: addon.isActive,
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LISTING ADDON (Partner) ============

  static async createListingAddon(
    input: CreateListingAddonInputType,
    userId: string
  ): Promise<CreateListingAddonOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);
    await verifyListingOwnership(input.listingId, organizationId);

    // Check if addon exists and is active
    const addon = await prisma.addon.findFirst({
      where: { id: input.addonId, isActive: true, deletedAt: null },
    });

    if (!addon) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not found or not active',
      });
    }

    // Check if listing addon already exists
    const existing = await prisma.listingAddon.findFirst({
      where: {
        listingId: input.listingId,
        addonId: input.addonId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ORPCError('CONFLICT', {
        message: 'This addon is already configured for this listing',
      });
    }

    // Validate price against max price
    if (addon.maxPrice && input.price > addon.maxPrice) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Price cannot exceed maximum allowed price of ${addon.maxPrice}`,
      });
    }

    const listingAddon = await prisma.listingAddon.create({
      data: {
        listingId: input.listingId,
        addonId: input.addonId,
        isActive: input.isActive ?? true,
        customName: input.customName,
        customDescription: input.customDescription,
        customTerms: input.customTerms,
        price: input.price,
        currency: input.currency ?? 'AED',
        discountAmount: input.discountAmount,
        discountType: input.discountType ?? 'PERCENTAGE',
        discountValidUntil: input.discountValidUntil,
        stockQuantity: input.stockQuantity,
        maxPerBooking: input.maxPerBooking,
        minPerBooking: input.minPerBooking ?? 1,
        isIncludedFree: input.isIncludedFree ?? false,
        isRecommended: input.isRecommended ?? false,
        displayOrder: input.displayOrder ?? 0,
        minDriverAge: input.minDriverAge,
      },
    });

    return {
      id: listingAddon.id,
      listingId: listingAddon.listingId,
      addonId: listingAddon.addonId,
    };
  }

  static async updateListingAddon(
    input: UpdateListingAddonInputType,
    userId: string
  ): Promise<UpdateListingAddonOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const listingAddon = await prisma.listingAddon.findFirst({
      where: { id: input.listingAddonId, deletedAt: null },
      include: { listing: true, addon: true },
    });

    if (!listingAddon || listingAddon.listing.organizationId !== organizationId) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Listing addon not found',
      });
    }

    // Validate price against max price if updating
    if (input.price !== undefined && listingAddon.addon.maxPrice && input.price > listingAddon.addon.maxPrice) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Price cannot exceed maximum allowed price of ${listingAddon.addon.maxPrice}`,
      });
    }

    const updated = await prisma.listingAddon.update({
      where: { id: listingAddon.id },
      data: {
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.customName !== undefined && { customName: nullToUndefined(input.customName) }),
        ...(input.customDescription !== undefined && { customDescription: nullToUndefined(input.customDescription) }),
        ...(input.customTerms !== undefined && { customTerms: nullToUndefined(input.customTerms) }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.discountAmount !== undefined && { discountAmount: input.discountAmount }),
        ...(input.discountType !== undefined && { discountType: input.discountType }),
        ...(input.discountValidUntil !== undefined && { discountValidUntil: input.discountValidUntil }),
        ...(input.stockQuantity !== undefined && { stockQuantity: input.stockQuantity }),
        ...(input.maxPerBooking !== undefined && { maxPerBooking: input.maxPerBooking }),
        ...(input.minPerBooking !== undefined && { minPerBooking: input.minPerBooking }),
        ...(input.isIncludedFree !== undefined && { isIncludedFree: input.isIncludedFree }),
        ...(input.isRecommended !== undefined && { isRecommended: input.isRecommended }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.minDriverAge !== undefined && { minDriverAge: input.minDriverAge }),
      },
    });

    return {
      id: updated.id,
      updatedAt: updated.updatedAt,
    };
  }

  static async deleteListingAddon(
    input: DeleteListingAddonInputType,
    userId: string
  ): Promise<DeleteListingAddonOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const listingAddon = await prisma.listingAddon.findFirst({
      where: { id: input.listingAddonId, deletedAt: null },
      include: { listing: true },
    });

    if (!listingAddon || listingAddon.listing.organizationId !== organizationId) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Listing addon not found',
      });
    }

    // Soft delete
    await prisma.listingAddon.update({
      where: { id: listingAddon.id },
      data: { deletedAt: new Date() },
    });

    return {
      id: listingAddon.id,
      deleted: true,
    };
  }

  static async listListingAddons(
    input: ListListingAddonsInputType,
    userId: string
  ): Promise<ListListingAddonsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);
    await verifyListingOwnership(input.listingId, organizationId);

    const { listingId, isActive, category, page, take } = input;

    const where = {
      listingId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(category && { addon: { category } }),
    };

    const [listingAddons, total] = await Promise.all([
      prisma.listingAddon.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          addon: true,
        },
      }),
      prisma.listingAddon.count({ where }),
    ]);

    return {
      items: listingAddons.map((la) => ({
        id: la.id,
        createdAt: la.createdAt,
        updatedAt: la.updatedAt,
        listingId: la.listingId,
        addonId: la.addonId,
        isActive: la.isActive,
        customName: parseJsonField<LocalizedText>(la.customName),
        customDescription: parseJsonField<LocalizedText>(la.customDescription),
        customTerms: parseJsonField<LocalizedText>(la.customTerms),
        price: la.price,
        currency: la.currency,
        discountAmount: la.discountAmount,
        discountType: la.discountType,
        discountValidUntil: la.discountValidUntil,
        stockQuantity: la.stockQuantity,
        maxPerBooking: la.maxPerBooking,
        minPerBooking: la.minPerBooking,
        isIncludedFree: la.isIncludedFree,
        isRecommended: la.isRecommended,
        displayOrder: la.displayOrder,
        minDriverAge: la.minDriverAge,
        addon: {
          id: la.addon.id,
          slug: la.addon.slug,
          name: parseJsonField<LocalizedText>(la.addon.name) || {},
          description: parseJsonField<LocalizedText>(la.addon.description),
          category: la.addon.category,
          iconKey: la.addon.iconKey,
          imageUrl: la.addon.imageUrl,
          inputType: la.addon.inputType,
          billingType: la.addon.billingType,
          minQuantity: la.addon.minQuantity,
          maxQuantity: la.addon.maxQuantity,
          isRefundable: la.addon.isRefundable,
        },
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ AVAILABLE ADDONS FOR LISTING (Public) ============

  static async listAvailableAddons(input: ListAvailableAddonsInputType): Promise<ListAvailableAddonsOutputType> {
    const { listingSlug, rentalDays } = input;

    // Find listing
    const listing = await prisma.listing.findFirst({
      where: { slug: listingSlug, deletedAt: null, status: 'AVAILABLE' },
      include: {
        vehicle: true,
      },
    });

    if (!listing) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Listing not found',
      });
    }

    // Get active listing addons with their base addons
    const listingAddons = await prisma.listingAddon.findMany({
      where: {
        listingId: listing.id,
        isActive: true,
        deletedAt: null,
        addon: {
          isActive: true,
          deletedAt: null,
          // Filter by rental days if provided
          ...(rentalDays && {
            OR: [{ minRentalDays: null }, { minRentalDays: { lte: rentalDays } }],
          }),
        },
      },
      include: {
        addon: true,
      },
      orderBy: [{ addon: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
    });

    // Filter by vehicle class/body type if applicable
    const filteredAddons = listingAddons.filter((la) => {
      const vehicleClasses = parseJsonField<string[]>(la.addon.allowedVehicleClasses);
      const bodyTypes = parseJsonField<string[]>(la.addon.allowedVehicleBodyTypes);

      if (vehicleClasses && listing.vehicle) {
        if (!vehicleClasses.includes(listing.vehicle.class)) {
          return false;
        }
      }

      if (bodyTypes && listing.vehicle) {
        if (!bodyTypes.includes(listing.vehicle.bodyType)) {
          return false;
        }
      }

      return true;
    });

    const addons = filteredAddons.map((la) => ({
      id: la.addon.id,
      slug: la.addon.slug,
      name: parseJsonField<LocalizedText>(la.addon.name) || {},
      description: parseJsonField<LocalizedText>(la.addon.description),
      shortName: parseJsonField<LocalizedText>(la.addon.shortName),
      category: la.addon.category,
      iconKey: la.addon.iconKey,
      imageUrl: la.addon.imageUrl,
      isFeatured: la.addon.isFeatured,
      isPopular: la.addon.isPopular,
      inputType: la.addon.inputType,
      billingType: la.addon.billingType,
      minQuantity: la.addon.minQuantity,
      maxQuantity: la.addon.maxQuantity,
      minDriverAge: la.minDriverAge || la.addon.minDriverAge,
      requiresApproval: la.addon.requiresApproval,
      termsAndConditions: parseJsonField<LocalizedText>(la.addon.termsAndConditions),
      isRefundable: la.addon.isRefundable,
      selectionOptions: parseJsonField<any[]>(la.addon.selectionOptions),
      listingAddon: {
        id: la.id,
        price: la.price,
        currency: la.currency,
        discountAmount: la.discountAmount,
        discountType: la.discountType,
        discountValidUntil: la.discountValidUntil,
        stockQuantity: la.stockQuantity,
        maxPerBooking: la.maxPerBooking || la.addon.maxQuantity,
        minPerBooking: la.minPerBooking,
        isIncludedFree: la.isIncludedFree,
        isRecommended: la.isRecommended,
        customName: parseJsonField<LocalizedText>(la.customName),
        customDescription: parseJsonField<LocalizedText>(la.customDescription),
      },
    }));

    // Group by category
    const byCategory: Record<string, typeof addons> = {};
    for (const addon of addons) {
      const cat = addon.category;
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat]!.push(addon);
    }

    return {
      addons,
      byCategory: byCategory as any,
    };
  }

  // ============ BOOKING ADDON ============

  static async addAddonToBooking(
    input: AddAddonToBookingInputType,
    userId: string
  ): Promise<AddAddonToBookingOutputType> {
    const { bookingId, listingAddonId, quantity, selectedOption } = input;

    // Verify booking belongs to user and is in DRAFT status
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: 'DRAFT',
      },
      include: {
        addons: true,
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking not found or not in draft status',
      });
    }

    // Get listing addon with addon details
    const listingAddon = await prisma.listingAddon.findFirst({
      where: {
        id: listingAddonId,
        listingId: booking.listingId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        addon: true,
      },
    });

    if (!listingAddon) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not available for this listing',
      });
    }

    // Check if addon is already added
    const existingAddon = booking.addons.find((a) => a.listingAddonId === listingAddonId);
    if (existingAddon) {
      throw new ORPCError('CONFLICT', {
        message: 'This addon is already added to the booking',
      });
    }

    // Validate quantity
    const maxQty = listingAddon.maxPerBooking || listingAddon.addon.maxQuantity;
    const minQty = listingAddon.minPerBooking;

    if (quantity < minQty) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Minimum quantity is ${minQty}`,
      });
    }

    if (quantity > maxQty) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Maximum quantity is ${maxQty}`,
      });
    }

    // Check stock
    if (listingAddon.stockQuantity !== null && quantity > listingAddon.stockQuantity) {
      throw new ORPCError('BAD_REQUEST', {
        message: `Only ${listingAddon.stockQuantity} units available`,
      });
    }

    // Calculate price
    const rentalDays = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24));

    let unitPrice = listingAddon.price;

    // Apply selection option multiplier if applicable
    if (selectedOption && listingAddon.addon.inputType === 'SELECTION') {
      const options = parseJsonField<any[]>(listingAddon.addon.selectionOptions);
      const option = options?.find((o) => o.key === selectedOption);
      if (option?.priceMultiplier) {
        unitPrice *= option.priceMultiplier;
      }
    }

    // Calculate total based on billing type
    let baseTotal = listingAddon.isIncludedFree ? 0 : unitPrice * quantity;
    if (listingAddon.addon.billingType === 'PER_DAY' && !listingAddon.isIncludedFree) {
      baseTotal = unitPrice * quantity * rentalDays;
    }

    // Apply discount
    let discount = 0;
    if (listingAddon.discountAmount && !listingAddon.isIncludedFree) {
      const now = new Date();
      if (!listingAddon.discountValidUntil || listingAddon.discountValidUntil > now) {
        if (listingAddon.discountType === 'PERCENTAGE') {
          discount = baseTotal * (listingAddon.discountAmount / 100);
        } else {
          discount = listingAddon.discountAmount;
        }
      }
    }

    const totalPrice = Math.max(0, baseTotal - discount);

    // Create addon snapshot
    const addonSnapshot = {
      slug: listingAddon.addon.slug,
      name: parseJsonField<LocalizedText>(listingAddon.addon.name),
      description: parseJsonField<LocalizedText>(listingAddon.addon.description),
      category: listingAddon.addon.category,
      iconKey: listingAddon.addon.iconKey,
      billingType: listingAddon.addon.billingType,
      inputType: listingAddon.addon.inputType,
      isRefundable: listingAddon.addon.isRefundable,
    };

    // Create booking addon
    const bookingAddon = await prisma.bookingAddon.create({
      data: {
        bookingId,
        listingAddonId,
        addonSnapshot,
        quantity,
        selectedOption,
        unitPrice,
        totalPrice,
        currency: listingAddon.currency,
        discountApplied: discount,
        taxAmount: 0, // TODO: Calculate tax based on jurisdiction
        status: 'CONFIRMED',
      },
    });

    // Update booking totals
    const newAddonsTotal = booking.addonsTotal + totalPrice;
    const newGrandTotal = booking.basePrice + newAddonsTotal + booking.deliveryFee + booking.taxAmount;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        addonsTotal: newAddonsTotal,
        totalPrice: newGrandTotal,
      },
    });

    return {
      id: bookingAddon.id,
      bookingId,
      totalPrice,
      bookingAddonsTotal: newAddonsTotal,
      bookingGrandTotal: newGrandTotal,
    };
  }

  static async removeAddonFromBooking(
    input: RemoveAddonFromBookingInputType,
    userId: string
  ): Promise<RemoveAddonFromBookingOutputType> {
    const { bookingAddonId } = input;

    // Find booking addon
    const bookingAddon = await prisma.bookingAddon.findFirst({
      where: { id: bookingAddonId },
      include: {
        booking: true,
      },
    });

    if (!bookingAddon || bookingAddon.booking.userId !== userId) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking addon not found',
      });
    }

    if (bookingAddon.booking.status !== 'DRAFT') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Can only remove addons from draft bookings',
      });
    }

    // Delete booking addon
    await prisma.bookingAddon.delete({
      where: { id: bookingAddonId },
    });

    // Update booking totals
    const newAddonsTotal = Math.max(0, bookingAddon.booking.addonsTotal - bookingAddon.totalPrice);
    const newGrandTotal =
      bookingAddon.booking.basePrice +
      newAddonsTotal +
      bookingAddon.booking.deliveryFee +
      bookingAddon.booking.taxAmount;

    await prisma.booking.update({
      where: { id: bookingAddon.bookingId },
      data: {
        addonsTotal: newAddonsTotal,
        totalPrice: newGrandTotal,
      },
    });

    return {
      id: bookingAddonId,
      removed: true,
      bookingAddonsTotal: newAddonsTotal,
      bookingGrandTotal: newGrandTotal,
    };
  }

  static async cancelBookingAddon(
    input: CancelBookingAddonInputType,
    userId: string
  ): Promise<CancelBookingAddonOutputType> {
    const { bookingAddonId, reason } = input;

    const bookingAddon = await prisma.bookingAddon.findFirst({
      where: { id: bookingAddonId },
      include: {
        booking: true,
        listingAddon: {
          include: { addon: true },
        },
      },
    });

    if (!bookingAddon || bookingAddon.booking.userId !== userId) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking addon not found',
      });
    }

    if (bookingAddon.status !== 'CONFIRMED') {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Addon is not in a cancellable state',
      });
    }

    // Calculate refund based on addon's refund policy
    let refundAmount: number | null = null;
    if (bookingAddon.listingAddon.addon.isRefundable) {
      // For now, full refund. In production, this would check the refund policy
      refundAmount = bookingAddon.totalPrice;
    }

    // Update booking addon status
    const updated = await prisma.bookingAddon.update({
      where: { id: bookingAddonId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledReason: reason,
        refundAmount,
      },
    });

    // Update booking totals if refunded
    if (refundAmount) {
      const newAddonsTotal = Math.max(0, bookingAddon.booking.addonsTotal - refundAmount);
      await prisma.booking.update({
        where: { id: bookingAddon.bookingId },
        data: {
          addonsTotal: newAddonsTotal,
          totalPrice:
            bookingAddon.booking.basePrice +
            newAddonsTotal +
            bookingAddon.booking.deliveryFee +
            bookingAddon.booking.taxAmount,
        },
      });
    }

    return {
      id: updated.id,
      status: updated.status,
      refundAmount: updated.refundAmount,
    };
  }

  static async listBookingAddons(
    input: ListBookingAddonsInputType,
    userId: string
  ): Promise<ListBookingAddonsOutputType> {
    const { bookingId } = input;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        addons: {
          include: {
            listingAddon: true,
          },
        },
      },
    });

    if (!booking) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Booking not found',
      });
    }

    return {
      addons: booking.addons.map((ba) => ({
        id: ba.id,
        createdAt: ba.createdAt,
        bookingId: ba.bookingId,
        listingAddonId: ba.listingAddonId,
        addonSnapshot: parseJsonField<any>(ba.addonSnapshot) || {
          slug: '',
          name: {},
          description: null,
          category: 'OTHER',
          iconKey: null,
          billingType: 'FIXED',
          inputType: 'BOOLEAN',
          isRefundable: true,
        },
        quantity: ba.quantity,
        selectedOption: ba.selectedOption,
        unitPrice: ba.unitPrice,
        totalPrice: ba.totalPrice,
        currency: ba.currency,
        discountApplied: ba.discountApplied,
        taxAmount: ba.taxAmount,
        status: ba.status,
        cancelledAt: ba.cancelledAt,
        cancelledReason: ba.cancelledReason,
        refundAmount: ba.refundAmount,
      })),
      totalAddonsPrice: booking.addonsTotal,
      currency: booking.currency,
    };
  }

  // ============ ADDON BUNDLE ============

  static async createAddonBundle(
    input: CreateAddonBundleInputType,
    userId?: string
  ): Promise<CreateAddonBundleOutputType> {
    // If organizationId provided, verify ownership
    if (input.organizationId && userId) {
      const member = await prisma.member.findFirst({
        where: {
          userId,
          organizationId: input.organizationId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!member) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Not authorized to create bundles for this organization',
        });
      }
    }

    // Check slug uniqueness
    const existing = await prisma.addonBundle.findFirst({
      where: { slug: input.slug, deletedAt: null },
    });

    if (existing) {
      throw new ORPCError('CONFLICT', {
        message: 'A bundle with this slug already exists',
      });
    }

    // Verify all addons exist
    const addonIds = input.items.map((i) => i.addonId);
    const addons = await prisma.addon.findMany({
      where: { id: { in: addonIds }, isActive: true, deletedAt: null },
    });

    if (addons.length !== addonIds.length) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Some addons not found or not active',
      });
    }

    const bundle = await prisma.addonBundle.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        displayOrder: input.displayOrder ?? 0,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        discountType: input.discountType ?? 'PERCENTAGE',
        discountAmount: input.discountAmount,
        organizationId: input.organizationId,
        items: {
          create: input.items.map((item) => ({
            addonId: item.addonId,
            quantity: item.quantity ?? 1,
            isRequired: item.isRequired ?? true,
          })),
        },
      },
    });

    return {
      id: bundle.id,
      slug: bundle.slug,
    };
  }

  static async updateAddonBundle(
    input: UpdateAddonBundleInputType,
    userId?: string
  ): Promise<UpdateAddonBundleOutputType> {
    const bundle = await prisma.addonBundle.findFirst({
      where: { id: input.bundleId, deletedAt: null },
    });

    if (!bundle) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Bundle not found',
      });
    }

    // If organization bundle, verify ownership
    if (bundle.organizationId && userId) {
      const member = await prisma.member.findFirst({
        where: {
          userId,
          organizationId: bundle.organizationId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!member) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Not authorized to update this bundle',
        });
      }
    }

    // If updating items, verify addons exist
    if (input.items) {
      const addonIds = input.items.map((i) => i.addonId);
      const addons = await prisma.addon.findMany({
        where: { id: { in: addonIds }, isActive: true, deletedAt: null },
      });

      if (addons.length !== addonIds.length) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Some addons not found or not active',
        });
      }

      // Delete existing items and recreate
      await prisma.addonBundleItem.deleteMany({
        where: { bundleId: bundle.id },
      });

      await prisma.addonBundleItem.createMany({
        data: input.items.map((item) => ({
          bundleId: bundle.id,
          addonId: item.addonId,
          quantity: item.quantity ?? 1,
          isRequired: item.isRequired ?? true,
        })),
      });
    }

    const updated = await prisma.addonBundle.update({
      where: { id: bundle.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: nullToUndefined(input.description) }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input.discountType !== undefined && { discountType: input.discountType }),
        ...(input.discountAmount !== undefined && { discountAmount: input.discountAmount }),
      },
    });

    return {
      id: updated.id,
      slug: updated.slug,
      updatedAt: updated.updatedAt,
    };
  }

  static async deleteAddonBundle(
    input: DeleteAddonBundleInputType,
    userId?: string
  ): Promise<DeleteAddonBundleOutputType> {
    const bundle = await prisma.addonBundle.findFirst({
      where: { id: input.bundleId, deletedAt: null },
    });

    if (!bundle) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Bundle not found',
      });
    }

    // If organization bundle, verify ownership
    if (bundle.organizationId && userId) {
      const member = await prisma.member.findFirst({
        where: {
          userId,
          organizationId: bundle.organizationId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!member) {
        throw new ORPCError('FORBIDDEN', {
          message: 'Not authorized to delete this bundle',
        });
      }
    }

    await prisma.addonBundle.update({
      where: { id: bundle.id },
      data: { deletedAt: new Date() },
    });

    return {
      id: bundle.id,
      deleted: true,
    };
  }

  static async listAddonBundles(input: ListAddonBundlesInputType): Promise<ListAddonBundlesOutputType> {
    const { q, isActive, isFeatured, organizationId, includeGlobal, page, take } = input;

    const where = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(q && {
        slug: { contains: q, mode: 'insensitive' as const },
      }),
      // Filter by organization or global
      ...(organizationId
        ? includeGlobal
          ? { OR: [{ organizationId }, { organizationId: null }] }
          : { organizationId }
        : includeGlobal
          ? { organizationId: null }
          : {}),
    };

    const [bundles, total] = await Promise.all([
      prisma.addonBundle.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          items: {
            include: {
              addon: true,
            },
          },
        },
      }),
      prisma.addonBundle.count({ where }),
    ]);

    return {
      items: bundles.map((bundle) => ({
        id: bundle.id,
        createdAt: bundle.createdAt,
        updatedAt: bundle.updatedAt,
        slug: bundle.slug,
        name: parseJsonField<LocalizedText>(bundle.name) || {},
        description: parseJsonField<LocalizedText>(bundle.description),
        imageUrl: bundle.imageUrl,
        displayOrder: bundle.displayOrder,
        isActive: bundle.isActive,
        isFeatured: bundle.isFeatured,
        discountType: bundle.discountType,
        discountAmount: bundle.discountAmount,
        organizationId: bundle.organizationId,
        items: bundle.items.map((item) => ({
          id: item.id,
          addonId: item.addonId,
          quantity: item.quantity,
          isRequired: item.isRequired,
          addon: {
            id: item.addon.id,
            slug: item.addon.slug,
            name: parseJsonField<LocalizedText>(item.addon.name) || {},
            shortName: parseJsonField<LocalizedText>(item.addon.shortName),
            category: item.addon.category,
            iconKey: item.addon.iconKey,
            billingType: item.addon.billingType,
            suggestedPrice: item.addon.suggestedPrice,
          },
        })),
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getBundlePrice(input: GetBundlePriceInputType): Promise<GetBundlePriceOutputType> {
    const { bundleId, listingId, rentalDays } = input;

    const bundle = await prisma.addonBundle.findFirst({
      where: { id: bundleId, isActive: true, deletedAt: null },
      include: {
        items: {
          include: { addon: true },
        },
      },
    });

    if (!bundle) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Bundle not found',
      });
    }

    // Get listing addons for this listing
    const listingAddons = await prisma.listingAddon.findMany({
      where: {
        listingId,
        isActive: true,
        deletedAt: null,
        addonId: { in: bundle.items.map((i) => i.addonId) },
      },
    });

    const listingAddonMap = new Map(listingAddons.map((la) => [la.addonId, la]));

    const items: GetBundlePriceOutputType['items'] = [];
    const unavailableAddons: string[] = [];
    let subtotal = 0;

    for (const item of bundle.items) {
      const listingAddon = listingAddonMap.get(item.addonId);
      const isAvailable = !!listingAddon;

      if (!isAvailable && item.isRequired) {
        unavailableAddons.push(item.addonId);
      }

      let totalPrice = 0;
      let unitPrice = listingAddon?.price || item.addon.suggestedPrice || 0;

      if (isAvailable && listingAddon) {
        if (listingAddon.isIncludedFree) {
          unitPrice = 0;
          totalPrice = 0;
        } else if (item.addon.billingType === 'PER_DAY') {
          totalPrice = unitPrice * item.quantity * rentalDays;
        } else {
          totalPrice = unitPrice * item.quantity;
        }
      }

      items.push({
        addonId: item.addonId,
        addonName: parseJsonField<LocalizedText>(item.addon.name) || {},
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        isAvailable,
      });

      if (isAvailable) {
        subtotal += totalPrice;
      }
    }

    // Calculate bundle discount
    let bundleDiscount = 0;
    if (bundle.discountType === 'PERCENTAGE') {
      bundleDiscount = subtotal * (bundle.discountAmount / 100);
    } else {
      bundleDiscount = bundle.discountAmount;
    }

    const finalPrice = Math.max(0, subtotal - bundleDiscount);

    return {
      bundleId: bundle.id,
      listingId,
      rentalDays,
      items,
      subtotal,
      bundleDiscount,
      finalPrice,
      currency: listingAddons[0]?.currency || 'AED',
      isAvailable: unavailableAddons.length === 0,
      unavailableAddons,
    };
  }

  // ============ STATS ============

  static async getAddonStats(): Promise<GetAddonStatsOutputType> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAddons,
      activeAddons,
      featuredAddons,
      categoryStats,
      totalBookingsWithAddons,
      revenueThisMonth,
      topAddons,
      recentlyCreated,
    ] = await Promise.all([
      prisma.addon.count({ where: { deletedAt: null } }),
      prisma.addon.count({ where: { deletedAt: null, isActive: true } }),
      prisma.addon.count({ where: { deletedAt: null, isFeatured: true } }),
      prisma.addon.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.booking.count({
        where: {
          addons: { some: {} },
        },
      }),
      prisma.bookingAddon.aggregate({
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.bookingAddon.groupBy({
        by: ['listingAddonId'],
        where: { status: 'CONFIRMED' },
        _count: { _all: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { listingAddonId: 'desc' } },
        take: 10,
      }),
      prisma.addon.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Get addon details for top addons
    const topAddonDetails = await prisma.listingAddon.findMany({
      where: {
        id: { in: topAddons.map((t) => t.listingAddonId) },
      },
      include: { addon: true },
    });

    const topAddonMap = new Map(topAddonDetails.map((la) => [la.id, la.addon]));

    return {
      totalAddons,
      activeAddons,
      featuredAddons,
      byCategory: Object.fromEntries(categoryStats.map((s) => [s.category, s._count._all])) as any,
      totalBookingsWithAddons,
      addonRevenueThisMonth: revenueThisMonth._sum.totalPrice || 0,
      currency: 'AED',
      topAddons: topAddons
        .map((t) => {
          const addon = topAddonMap.get(t.listingAddonId);
          return {
            id: addon?.id || '',
            slug: addon?.slug || '',
            name: parseJsonField<LocalizedText>(addon?.name) || {},
            category: addon?.category || 'OTHER',
            bookingCount: t._count._all,
            revenue: t._sum.totalPrice || 0,
          };
        })
        .filter((a) => a.id),
      recentlyCreated: recentlyCreated.map((a) => ({
        id: a.id,
        slug: a.slug,
        name: parseJsonField<LocalizedText>(a.name) || {},
        category: a.category,
        createdAt: a.createdAt,
      })),
    };
  }

  static async getPartnerAddonStats(userId: string): Promise<GetPartnerAddonStatsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get organization's listings
    const orgListings = await prisma.listing.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    const listingIds = orgListings.map((l) => l.id);

    const [
      totalConfiguredAddons,
      activeListingAddons,
      revenueThisMonth,
      revenueLastMonth,
      topAddons,
      unconfiguredPopularAddons,
    ] = await Promise.all([
      prisma.listingAddon.count({
        where: { listingId: { in: listingIds }, deletedAt: null },
      }),
      prisma.listingAddon.count({
        where: { listingId: { in: listingIds }, deletedAt: null, isActive: true },
      }),
      prisma.bookingAddon.aggregate({
        where: {
          status: 'CONFIRMED',
          booking: { listingId: { in: listingIds } },
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.bookingAddon.aggregate({
        where: {
          status: 'CONFIRMED',
          booking: { listingId: { in: listingIds } },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.bookingAddon.groupBy({
        by: ['listingAddonId'],
        where: {
          status: 'CONFIRMED',
          booking: { listingId: { in: listingIds } },
        },
        _count: { _all: true },
        _sum: { totalPrice: true },
        _avg: { quantity: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
      // Find popular addons not configured by this organization
      prisma.addon.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          isPopular: true,
          listingAddons: {
            none: { listingId: { in: listingIds } },
          },
        },
        take: 5,
      }),
    ]);

    // Get addon details for top addons
    const topAddonDetails = await prisma.listingAddon.findMany({
      where: {
        id: { in: topAddons.map((t) => t.listingAddonId) },
      },
      include: { addon: true },
    });

    const topAddonMap = new Map(topAddonDetails.map((la) => [la.id, la]));

    // Calculate market adoption rate for unconfigured addons
    const totalListings = await prisma.listing.count({
      where: { status: 'AVAILABLE', deletedAt: null },
    });

    const addonAdoptionRates = await Promise.all(
      unconfiguredPopularAddons.map(async (addon) => {
        const listingsWithAddon = await prisma.listingAddon.count({
          where: { addonId: addon.id, isActive: true, deletedAt: null },
        });
        return {
          addonId: addon.id,
          rate: totalListings > 0 ? (listingsWithAddon / totalListings) * 100 : 0,
        };
      })
    );

    const adoptionRateMap = new Map(addonAdoptionRates.map((r) => [r.addonId, r.rate]));

    return {
      totalConfiguredAddons,
      activeListingAddons,
      addonRevenueThisMonth: revenueThisMonth._sum.totalPrice || 0,
      addonRevenueLastMonth: revenueLastMonth._sum.totalPrice || 0,
      currency: 'AED',
      topAddons: topAddons
        .map((t) => {
          const la = topAddonMap.get(t.listingAddonId);
          return {
            addonId: la?.addonId || '',
            addonSlug: la?.addon.slug || '',
            addonName: parseJsonField<LocalizedText>(la?.addon.name) || {},
            category: la?.addon.category || 'OTHER',
            bookingCount: t._count._all,
            revenue: t._sum.totalPrice || 0,
            averageQuantity: t._avg.quantity || 1,
          };
        })
        .filter((a) => a.addonId),
      unconfiguredPopularAddons: unconfiguredPopularAddons.map((addon) => ({
        id: addon.id,
        slug: addon.slug,
        name: parseJsonField<LocalizedText>(addon.name) || {},
        category: addon.category,
        suggestedPrice: addon.suggestedPrice,
        marketAdoptionRate: adoptionRateMap.get(addon.id) || 0,
      })),
    };
  }

  // ============ CALCULATE ADDON PRICE ============

  static async calculateAddonPrice(input: CalculateAddonPriceInputType): Promise<CalculateAddonPriceOutputType> {
    const { listingAddonId, quantity, rentalDays, selectedOption } = input;

    const listingAddon = await prisma.listingAddon.findFirst({
      where: { id: listingAddonId, isActive: true, deletedAt: null },
      include: { addon: true },
    });

    if (!listingAddon) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Addon not found or not available',
      });
    }

    // Validate quantity
    const maxQty = listingAddon.maxPerBooking || listingAddon.addon.maxQuantity;
    const minQty = listingAddon.minPerBooking;
    const meetsQuantityRequirements = quantity >= minQty && quantity <= maxQty;

    // Check stock
    const stockRemaining = listingAddon.stockQuantity;
    const isAvailable = meetsQuantityRequirements && (stockRemaining === null || quantity <= stockRemaining);

    // Calculate price
    let unitPrice = listingAddon.price;

    // Apply selection option multiplier
    if (selectedOption && listingAddon.addon.inputType === 'SELECTION') {
      const options = parseJsonField<any[]>(listingAddon.addon.selectionOptions);
      const option = options?.find((o) => o.key === selectedOption);
      if (option?.priceMultiplier) {
        unitPrice *= option.priceMultiplier;
      }
    }

    // Calculate base total
    let baseTotal = listingAddon.isIncludedFree ? 0 : unitPrice * quantity;
    if (listingAddon.addon.billingType === 'PER_DAY' && !listingAddon.isIncludedFree) {
      baseTotal = unitPrice * quantity * rentalDays;
    }

    // Apply discount
    let discountAmount = 0;
    if (listingAddon.discountAmount && !listingAddon.isIncludedFree) {
      const now = new Date();
      if (!listingAddon.discountValidUntil || listingAddon.discountValidUntil > now) {
        if (listingAddon.discountType === 'PERCENTAGE') {
          discountAmount = baseTotal * (listingAddon.discountAmount / 100);
        } else {
          discountAmount = listingAddon.discountAmount;
        }
      }
    }

    // Calculate tax (simplified - would be more complex in production)
    const taxAmount = listingAddon.addon.isTaxExempt ? 0 : baseTotal * 0.05; // 5% VAT

    const finalPrice = Math.max(0, baseTotal - discountAmount + taxAmount);

    return {
      listingAddonId,
      addonSlug: listingAddon.addon.slug,
      addonName: parseJsonField<LocalizedText>(listingAddon.addon.name) || {},
      quantity,
      rentalDays,
      selectedOption: selectedOption || null,
      billingType: listingAddon.addon.billingType,
      unitPrice,
      baseTotal,
      discountAmount,
      taxAmount,
      finalPrice,
      currency: listingAddon.currency,
      isAvailable,
      stockRemaining,
      meetsQuantityRequirements,
      meetsDriverAgeRequirement: null, // Would need user age to check
    };
  }
}
