import type {
  CreateCountryInputType,
  CreateCountryOutputType,
  DeleteCountryInputType,
  FindOneCountryInputType,
  FindOneCountryOutputType,
  ListCountriesInputType,
  ListCountriesOutputType,
  UpdateCountryInputType,
  UpdateCountryOutputType,
  UpdateCountryStatusInputType,
  UpdateCountryStatusOutputType,
} from '@yayago-app/validators';
import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { getLocalizedValue, generateLookup, paginate, getPagination } from '../__shared__/utils';
import { zLocalized } from '@yayago-app/i18n';

export class CountryService {
  private static async findByCode(code: string, includeDeleted = false) {
    return await prisma.country.findUnique({
      where: { code, ...(!includeDeleted && { deletedAt: null }) },
    });
  }

  static async create(input: CreateCountryInputType, locale: string): Promise<CreateCountryOutputType> {
    const code = input.code.toLowerCase();

    if (await this.findByCode(code, true)) {
      throw new ORPCError('CONFLICT', { message: 'Country with this code already exists' });
    }

    const result = await prisma.country.create({
      data: { ...input, lookup: generateLookup(input.name), code },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async findOne(input: FindOneCountryInputType): Promise<FindOneCountryOutputType> {
    const { code } = input;

    const country = await prisma.country.findUnique({
      where: { code, deletedAt: null },
      select: {
        id: true,
        name: true,
        code: true,
        createdAt: true,
        updatedAt: true,
        currency: true,
        description: true,
        emergencyPhoneNumber: true,
        flag: true,
        minDriverAge: true,
        minDriverLicenseAge: true,
        phoneCode: true,
        status: true,
        title: true,
        trafficDirection: true,
      },
    });

    if (!country) {
      throw new ORPCError('NOT_FOUND', { message: 'Country not found' });
    }

    return {
      ...country,
      name: country.name as any,
    };
  }

  static async updateStatus(input: UpdateCountryStatusInputType): Promise<UpdateCountryStatusOutputType> {
    const { code, status } = input;

    const country = await this.findByCode(code, true);

    if (!country) {
      throw new ORPCError('NOT_FOUND', { message: 'Country not found' });
    }

    return await prisma.country.update({
      where: { id: country.id },
      data: { status },
      select: {
        status: true,
      },
    });
  }

  static async list(input: ListCountriesInputType, locale: string): Promise<ListCountriesOutputType> {
    const { page, take, q, status } = input;

    const where = {
      deletedAt: null,
      ...(q && {
        OR: [
          {
            lookup: {
              hasSome: [q.toLowerCase()],
            },
          },
          {
            name: {
              path: [locale],
              string_contains: q,
            },
          },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.country.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          code: true,
          createdAt: true,
          currency: true,
          flag: true,
          status: true,
        },
      }),
      prisma.country.count({ where }),
    ]);

    const items = data.map((item) => ({
      ...item,
      name: getLocalizedValue(item.name, locale),
    }));

    return paginate(items, page, take, total);
  }

  static async update(input: UpdateCountryInputType): Promise<UpdateCountryOutputType> {
    const { code, title, name, description, ...data } = input;

    const country = await this.findByCode(code, true);

    const { success: titleSuccess, data: titleData } = zLocalized().safeParse(title);
    const { success: descriptionSuccess, data: descriptionData } = zLocalized().safeParse(description);
    const { success: nameSuccess, data: nameData } = zLocalized().safeParse(name);

    if (!titleSuccess || !descriptionSuccess || !nameSuccess) {
      throw new ORPCError('INVALID_INPUT', { message: 'Invalid title, description, or name' });
    }

    if (!country) {
      throw new ORPCError('NOT_FOUND', { message: 'Country not found' });
    }

    return await prisma.country.update({
      where: { id: country.id },
      data: {
        ...data,
        ...(titleSuccess && { title: titleData }),
        ...(descriptionSuccess && { description: descriptionData }),
        ...(nameSuccess && { name: nameData }),
      },
      select: {
        code: true,
      },
    });
  }

  static async delete(input: DeleteCountryInputType): Promise<void> {
    const { code } = input;

    const country = await this.findByCode(code, true);

    if (!country) {
      throw new ORPCError('NOT_FOUND', { message: 'Country not found' });
    }

    await prisma.country.update({
      where: { id: country.id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }
}
