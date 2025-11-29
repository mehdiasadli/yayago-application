import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/client';
import { generateSlug } from './vehicle-model.utils';
import type {
  CreateVehicleModelInputType,
  CreateVehicleModelOutputType,
  DeleteVehicleModelInputType,
  DeleteVehicleModelOutputType,
  FindOneVehicleModelInputType,
  FindOneVehicleModelOutputType,
  ListVehicleModelInputType,
  ListVehicleModelOutputType,
  UpdateVehicleModelInputType,
  UpdateVehicleModelOutputType,
} from '@yayago-app/validators';
import { generateLookup, getLocalizedValue, getPagination, paginate } from '../__shared__/utils';

export class VehicleModelService {
  static async create(input: CreateVehicleModelInputType, locale: string): Promise<CreateVehicleModelOutputType> {
    const { brandSlug, ...data } = input;

    // Find brand by slug
    const brand = await prisma.vehicleBrand.findUnique({
      where: { slug: brandSlug, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!brand) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle brand not found' });
    }

    const slug = generateSlug(input.name.en, brand.slug);

    const existingModel = await prisma.vehicleModel.findUnique({
      where: { slug },
    });

    if (existingModel) {
      throw new ORPCError('CONFLICT', { message: 'Vehicle model with this name already exists for this brand' });
    }

    const result = await prisma.vehicleModel.create({
      data: {
        ...data,
        brandId: brand.id,
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

  static async findOne(input: FindOneVehicleModelInputType, locale: string): Promise<FindOneVehicleModelOutputType> {
    const { slug } = input;

    const model = await prisma.vehicleModel.findUnique({
      where: { slug, deletedAt: null },
      select: {
        slug: true,
        name: true,
        description: true,
        title: true,
        keywords: true,
        brand: {
          select: {
            slug: true,
            name: true,
            logo: true,
            originCountryCode: true,
          },
        },
      },
    });

    if (!model) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle model not found' });
    }

    return {
      ...model,
      name: getLocalizedValue(model.name, locale),
      description: getLocalizedValue(model.description, locale) || undefined,
      title: getLocalizedValue(model.title, locale) || undefined,
      keywords: getLocalizedValue(model.keywords, locale)
        ?.split(',')
        .map((keyword) => keyword.trim()) || [],
      brand: {
        ...model.brand,
        name: getLocalizedValue(model.brand.name, locale),
      },
    };
  }

  static async list(input: ListVehicleModelInputType, locale: string): Promise<ListVehicleModelOutputType> {
    const { page, take, brandSlug, originCountryCode, q } = input;

    // If brandSlug is provided, find brandId
    let brandId: string | undefined;
    if (brandSlug) {
      const brand = await prisma.vehicleBrand.findUnique({
        where: { slug: brandSlug },
        select: { id: true },
      });
      if (brand) {
        brandId = brand.id;
      }
    }

    const where = {
      deletedAt: null,
      ...(brandId && { brandId }),
      ...(originCountryCode && { brand: { originCountryCode } }),
      ...(q && {
        OR: [
          { slug: { contains: q, mode: 'insensitive' as const } },
          { lookup: { hasSome: [q.toLowerCase()] } },
          { name: { path: [locale], string_contains: q } },
        ],
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.vehicleModel.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          brand: {
            select: {
              slug: true,
              name: true,
              logo: true,
              originCountryCode: true,
            },
          },
        },
      }),
      prisma.vehicleModel.count({ where }),
    ]);

    const items = data.map((item) => ({
      ...item,
      name: getLocalizedValue(item.name, locale),
      brand: {
        ...item.brand,
        name: getLocalizedValue(item.brand.name, locale),
      },
    }));

    return paginate(items, page, take, total);
  }

  static async update(input: UpdateVehicleModelInputType, locale: string): Promise<UpdateVehicleModelOutputType> {
    const { slug, name, description, title, keywords } = input;

    const model = await prisma.vehicleModel.findUnique({
      where: { slug, deletedAt: null },
      include: {
        brand: {
          select: { slug: true },
        },
      },
    });

    if (!model) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle model not found' });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    let newSlug = slug;

    if (name) {
      newSlug = generateSlug(name.en, model.brand.slug);
      updateData.name = name;
      updateData.lookup = generateLookup(name);
      updateData.slug = newSlug;

      const existingWithSlug = await prisma.vehicleModel.findUnique({
        where: { slug: newSlug },
      });
      if (existingWithSlug && existingWithSlug.id !== model.id) {
        throw new ORPCError('CONFLICT', { message: 'Vehicle model with this name already exists for this brand' });
      }
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    if (keywords !== undefined) {
      updateData.keywords = keywords;
    }

    const result = await prisma.vehicleModel.update({
      where: { id: model.id },
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

  static async delete(input: DeleteVehicleModelInputType): Promise<DeleteVehicleModelOutputType> {
    const { slug } = input;

    const model = await prisma.vehicleModel.findUnique({
      where: { slug, deletedAt: null },
    });

    if (!model) {
      throw new ORPCError('NOT_FOUND', { message: 'Vehicle model not found' });
    }

    await prisma.vehicleModel.update({
      where: { slug },
      data: { deletedAt: new Date() },
    });

    return { slug };
  }
}
