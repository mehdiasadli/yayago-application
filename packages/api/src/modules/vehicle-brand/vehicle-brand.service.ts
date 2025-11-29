import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { generateSlug } from './vehicle-brand.utils';
import type {
  CreateVehicleBrandInputType,
  CreateVehicleBrandOutputType,
  DeleteVehicleBrandInputType,
  DeleteVehicleBrandOutputType,
  FindOneVehicleBrandInputType,
  FindOneVehicleBrandOutputType,
  ListVehicleBrandInputType,
  ListVehicleBrandOutputType,
  UpdateVehicleBrandInputType,
  UpdateVehicleBrandOutputType,
} from '@yayago-app/validators';
import { generateLookup, getLocalizedValue, getPagination, paginate } from '../__shared__/utils';

export class VehicleBrandService {
  static async create(input: CreateVehicleBrandInputType, locale: string): Promise<CreateVehicleBrandOutputType> {
    const slug = generateSlug(input.name.en);

    const existingBrand = await prisma.vehicleBrand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      throw new ORPCError('CONFLICT', { message: 'Vehicle brand with this name already exists' });
    }

    const result = await prisma.vehicleBrand.create({
      data: {
        ...input,
        slug,
        lookup: generateLookup(input.name),
      },
      select: {
        slug: true,
        name: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async findOne(input: FindOneVehicleBrandInputType, locale: string): Promise<FindOneVehicleBrandOutputType> {
    const { slug } = input;

    const brand = await prisma.vehicleBrand.findUnique({
      where: { slug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        website: true,
        originCountryCode: true,
        description: true,
        title: true,
        keywords: true,
      },
    });

    if (!brand) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle brand not found' });
    }

    return {
      ...brand,
      name: getLocalizedValue(brand.name, locale),
      description: getLocalizedValue(brand.description, locale),
      title: getLocalizedValue(brand.title, locale),
      keywords: getLocalizedValue(brand.keywords, locale)
        .split(',')
        .map((keyword) => keyword.trim()),
    };
  }

  static async list(input: ListVehicleBrandInputType, locale: string): Promise<ListVehicleBrandOutputType> {
    const { page, take, originCountryCode, q } = input;

    const where = {
      deletedAt: null,
      ...(originCountryCode && { originCountryCode }),
      ...(q && {
        OR: [
          { slug: { contains: q, mode: 'insensitive' as const } },
          { lookup: { hasSome: [q.toLowerCase()] } },
          { name: { path: [locale], string_contains: q } },
        ],
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.vehicleBrand.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          slug: true,
          logo: true,
          website: true,
          originCountryCode: true,
        },
      }),
      prisma.vehicleBrand.count({ where }),
    ]);

    const items = data.map((item) => ({
      ...item,
      name: getLocalizedValue(item.name, locale),
    }));

    return paginate(items, page, take, total);
  }

  static async update(input: UpdateVehicleBrandInputType, locale: string): Promise<UpdateVehicleBrandOutputType> {
    const { slug, data } = input;

    const brand = await prisma.vehicleBrand.findUnique({
      where: { slug, deletedAt: null },
    });

    if (!brand) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle brand not found' });
    }

    // If name is being updated, regenerate lookup
    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.lookup = generateLookup(data.name);
    }

    const result = await prisma.vehicleBrand.update({
      where: { slug },
      data: updateData,
      select: {
        slug: true,
        name: true,
      },
    });

    return {
      ...result,
      name: getLocalizedValue(result.name, locale),
    };
  }

  static async delete(input: DeleteVehicleBrandInputType): Promise<DeleteVehicleBrandOutputType> {
    const { slug } = input;

    const brand = await prisma.vehicleBrand.findUnique({
      where: { slug, deletedAt: null },
    });

    if (!brand) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle brand not found' });
    }

    await prisma.vehicleBrand.update({
      where: { slug },
      data: { deletedAt: new Date() },
    });

    return { slug };
  }
}
