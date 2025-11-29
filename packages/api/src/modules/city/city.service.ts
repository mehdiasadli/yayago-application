import type z from 'zod';
import type {
  CreateCityInputSchema,
  CreateCityOutputSchema,
  DeleteCityInputType,
  DeleteCityOutputType,
  FindCitiesForOnboardingInputType,
  FindCitiesForOnboardingOutputType,
  FindOneCityInputType,
  FindOneCityOutputType,
  ListCityInputSchema,
  ListCityOutputSchema,
  UpdateCityInputType,
  UpdateCityOutputType,
  UpdateCityStatusInputType,
  UpdateCityStatusOutputType,
} from '@yayago-app/validators';
import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { generateLookup, generateSlug, getLocalizedValue, getPagination, paginate } from '../__shared__/utils';

export class CityService {
  private static async findBySlug(slug: string) {
    return await prisma.city.findUnique({
      where: { slug },
    });
  }

  static async create(
    input: z.infer<typeof CreateCityInputSchema>,
    locale: string
  ): Promise<z.infer<typeof CreateCityOutputSchema>> {
    const { countryCode, ...data } = input;
    const code = data.code.toLowerCase();
    const slug = generateSlug(code);

    const existingCity = await this.findBySlug(slug);

    if (existingCity) {
      throw new ORPCError('CONFLICT', { message: 'City with this code already exists' });
    }

    const country = await prisma.country.findUnique({
      where: { code: input.countryCode, deletedAt: null },
    });

    if (!country) {
      throw new ORPCError('NOT_FOUND', { message: 'Country not found' });
    }

    if (input.isDefaultOfCounry) {
      await prisma.city.updateMany({
        where: { countryId: country.id, slug: { not: slug } },
        data: { isDefaultOfCounry: false },
      });
    }

    const result = await prisma.city.create({
      data: {
        ...data,
        slug,
        lookup: generateLookup(data.name),
        boundaries: {},
        countryId: country.id,
      },
      select: {
        id: true,
        name: true,
        code: true,
        slug: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async list(
    input: z.infer<typeof ListCityInputSchema>,
    locale: string
  ): Promise<z.infer<typeof ListCityOutputSchema>> {
    const { page, take, q, status, countryCode } = input;

    const where = {
      deletedAt: null,
      ...(countryCode && {
        country: {
          code: countryCode,
        },
      }),
      ...(status && { status }),
      ...(q && {
        OR: [
          {
            lookup: {
              hasSome: [q.toLowerCase()],
            },
          },
        ],
      }),
    };

    console.log(where);

    const [data, total] = await prisma.$transaction([
      prisma.city.findMany({
        where,
        ...getPagination({ page, take }),
        select: {
          id: true,
          name: true,
          code: true,
          slug: true,
          status: true,
          lat: true,
          lng: true,
          timezone: true,
          createdAt: true,
          country: {
            select: {
              name: true,
              status: true,
              code: true,
            },
          },
        },
      }),
      prisma.city.count({ where }),
    ]);

    console.log(data);

    const items = data.map((item) => ({
      ...item,
      name: getLocalizedValue(item.name, locale),
      country: {
        ...item.country,
        name: getLocalizedValue(item.country.name, locale),
      },
    }));

    return paginate(items, page, take, total);
  }

  static async findOne(input: FindOneCityInputType, locale: string): Promise<FindOneCityOutputType> {
    const { code } = input;

    const city = await prisma.city.findUnique({
      where: { code, deletedAt: null },
      select: {
        name: true,
        code: true,
        status: true,
        lat: true,
        lng: true,
        timezone: true,
        heroImageAlt: true,
        heroImageUrl: true,
        description: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        googleMapsPlaceId: true,
        isDefaultOfCounry: true,
        country: {
          select: {
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });

    if (!city) {
      throw new ORPCError('NOT_FOUND', { message: 'City not found' });
    }

    return {
      ...city,
      name: getLocalizedValue(city.name, locale),
      title: getLocalizedValue(city.title, locale),
      description: getLocalizedValue(city.description, locale),
      heroImageAlt: getLocalizedValue(city.heroImageAlt, locale),
      country: {
        ...city.country,
        name: getLocalizedValue(city.country.name, locale),
      },
    };
  }

  static async findCitiesForOnboarding(
    input: FindCitiesForOnboardingInputType,
    locale: string
  ): Promise<FindCitiesForOnboardingOutputType> {
    const { q } = input;

    const cities = await prisma.city.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        ...(q && {
          OR: [
            {
              lookup: {
                hasSome: [q.toLowerCase()],
              },
            },
            {
              name: {
                path: ['en'],
                string_contains: q,
                mode: 'insensitive',
              },
            },
            {
              name: {
                path: ['ar'],
                string_contains: q,
                mode: 'insensitive',
              },
            },
            {
              name: {
                path: ['ru'],
                string_contains: q,
                mode: 'insensitive',
              },
            },
            {
              name: {
                path: ['az'],
                string_contains: q,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      select: {
        code: true,
        googleMapsPlaceId: true,
        lat: true,
        lng: true,
        name: true,
        country: {
          select: {
            code: true,
            name: true,
            requiredDocuments: {
              select: {
                isRequired: true,
                label: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return cities.map((city) => ({
      ...city,
      name: getLocalizedValue(city.name, locale),
      country: {
        ...city.country,
        name: getLocalizedValue(city.country.name, locale),
        requiredDocuments: city.country.requiredDocuments.map((document) => ({
          ...document,
          label: getLocalizedValue(document.label, locale),
          description: getLocalizedValue(document.description, locale),
        })),
      },
    }));
  }

  static async update(input: UpdateCityInputType): Promise<UpdateCityOutputType> {
    const { code, ...data } = input;

    const city = await prisma.city.update({
      where: { code },
      data,
      select: {
        code: true,
        country: {
          select: {
            code: true,
          },
        },
      },
    });

    return {
      code: city.code,
      countryCode: city.country.code,
    };
  }

  static async updateStatus(input: UpdateCityStatusInputType): Promise<UpdateCityStatusOutputType> {
    const { code, status } = input;

    const city = await prisma.city.update({
      where: { code },
      data: { status },
      select: {
        status: true,
      },
    });

    return city;
  }

  static async delete(input: DeleteCityInputType): Promise<DeleteCityOutputType> {
    const { code } = input;

    const city = await prisma.city.update({
      where: { code },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
      select: {
        code: true,
      },
    });

    return city;
  }
}
