import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import type { DecodeVinInputType, DecodeVinOutputType, AutoDevApiResponseType } from '@yayago-app/validators';
import { AutoDevApiResponseSchema } from '@yayago-app/validators';
import { getLocalizedValue } from '../__shared__/utils';

const AUTODEV_API_URL = 'https://api.auto.dev/vin';

export class AutoDevService {
  /**
   * Decode a VIN using the Auto.dev API and match to database records
   */
  static async decodeVin(
    input: DecodeVinInputType,
    locale: string,
    organizationId?: string
  ): Promise<DecodeVinOutputType> {
    const { vin } = input;

    // Check if VIN already exists in database
    const existingVehicle = await prisma.listingVehicle.findFirst({
      where: { vin },
      include: {
        listing: {
          select: {
            organizationId: true,
            deletedAt: true,
          },
        },
      },
    });

    // Only block if the listing is not deleted
    if (existingVehicle && !existingVehicle.listing.deletedAt) {
      const isSameOrg = organizationId && existingVehicle.listing.organizationId === organizationId;
      return {
        vinValid: false,
        vin,
        error: isSameOrg
          ? 'This VIN is already used by another listing in your organization'
          : 'This VIN is already registered by another organization',
        code: 'VIN_ALREADY_EXISTS',
      };
    }

    // Call Auto.dev API
    const apiResponse = await this.callAutoDevApi(vin);

    if (!apiResponse.vinValid) {
      return {
        vinValid: false,
        vin,
        error: apiResponse.error,
        code: apiResponse.code,
      };
    }

    // Extract data from API response - handle optional fields
    // Try to get make from root level first, then from vehicle object
    const make = apiResponse.make || apiResponse.vehicle?.make || null;
    const model = apiResponse.model || apiResponse.vehicle?.model || null;
    const rawYear = apiResponse.vehicle?.year;
    const trim = apiResponse.trim || null;
    const style = apiResponse.style || null;
    const manufacturer = apiResponse.vehicle?.manufacturer || null;

    // Handle year being either a number, array of numbers, or undefined
    let year: number | null = null;
    let years: number[] | undefined;

    if (rawYear !== undefined) {
      if (Array.isArray(rawYear)) {
        // Sort years descending (most recent first)
        years = [...rawYear].sort((a, b) => b - a);
        year = years[0]; // Default to the most recent year
      } else {
        year = rawYear;
        years = undefined; // Single year, no need for array
      }
    }

    // Check if we have enough data or require manual entry
    const requiresManualEntry = !make || !model || year === null;

    // Try to match brand and model in database (only if we have the data)
    let matchedBrand: Awaited<ReturnType<typeof this.findBrandByApiName>> = null;
    let matchedModel: Awaited<ReturnType<typeof this.findModelByApiName>> = null;

    if (make) {
      matchedBrand = await this.findBrandByApiName(make);
      if (matchedBrand && model) {
        matchedModel = await this.findModelByApiName(model, matchedBrand.id);
      }
    }

    return {
      vinValid: true,
      vin,
      make,
      model,
      year,
      years,
      trim,
      style,
      manufacturer,
      matchedBrandId: matchedBrand?.id || null,
      matchedBrandName: matchedBrand ? getLocalizedValue(matchedBrand.name, locale) : null,
      matchedModelId: matchedModel?.id || null,
      matchedModelName: matchedModel ? getLocalizedValue(matchedModel.name, locale) : null,
      requiresManualEntry,
    };
  }

  /**
   * Call the Auto.dev VIN decoder API
   */
  private static async callAutoDevApi(vin: string): Promise<AutoDevApiResponseType> {
    const apiKey = process.env.AUTO_DEV_API_KEY;

    if (!apiKey) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Auto.dev API key is not configured',
      });
    }

    try {
      const response = await fetch(`${AUTODEV_API_URL}/${vin}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json()) as Record<string, unknown>;

      // Handle error responses from API
      if (!response.ok) {
        // API returns error in different formats
        if (typeof data.error === 'string' && typeof data.code === 'string') {
          return {
            vinValid: false,
            error: data.error,
            code: data.code,
          };
        }
        return {
          vinValid: false,
          error: typeof data.message === 'string' ? data.message : 'Failed to decode VIN',
          code: 'API_ERROR',
        };
      }

      // Parse and validate the response
      const parsed = AutoDevApiResponseSchema.safeParse(data);

      if (!parsed.success) {
        console.error('Auto.dev API response validation failed:', parsed.error);
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Invalid response from VIN decoder service',
        });
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error('Auto.dev API call failed:', error);
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to connect to VIN decoder service',
      });
    }
  }

  /**
   * Find a vehicle brand by its API name using the lookup array
   * The lookup array contains various spellings/names of the brand
   */
  private static async findBrandByApiName(make: string) {
    const makeLower = make.toLowerCase();

    // Search for brand where lookup array contains the make string (case-insensitive)
    const brand = await prisma.vehicleBrand.findFirst({
      where: {
        deletedAt: null,
        lookup: {
          has: makeLower,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return brand;
  }

  /**
   * Find a vehicle model by its API name using the lookup array
   * Must belong to the specified brand
   */
  private static async findModelByApiName(model: string, brandId: string) {
    const modelLower = model.toLowerCase();

    // Search for model where lookup array contains the model string AND belongs to brand
    const vehicleModel = await prisma.vehicleModel.findFirst({
      where: {
        deletedAt: null,
        brandId,
        lookup: {
          has: modelLower,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return vehicleModel;
  }
}
