import prisma from '..';

type JSONB = {
  en: string;
  az?: string;
  ru?: string;
  ar?: string;
};

type SeedType = {
  originCountryCode: string;
  name: JSONB;
  title?: JSONB;
  description?: JSONB;
  keywords?: JSONB;
  models?: {
    name: JSONB;
    title?: JSONB;
    description?: JSONB;
    keywords?: JSONB;
  }[];
};

const seed: SeedType[] = [
  {
    name: { en: 'BMW' },
    originCountryCode: 'de',
    models: [
      { name: { en: '3 Series' } },
      { name: { en: '5 Series' } },
      { name: { en: '7 Series' } },
      { name: { en: 'X5' } },
    ],
  },
  {
    name: { en: 'Mercedes-Benz' },
    originCountryCode: 'de',
    models: [{ name: { en: 'C-Class' } }, { name: { en: 'E-Class' } }],
  },
  {
    name: { en: 'Toyota' },
    originCountryCode: 'jp',
    models: [
      { name: { en: 'Corolla' } },
      { name: { en: 'Camry' } },
      { name: { en: 'RAV4' } },
      { name: { en: 'Land Cruiser' } },
    ],
  },
];

export async function seedVehicleBrands() {
  console.log('🚗 Seeding vehicle brands and models...');

  for (const brand of seed) {
    const slug = generateSlug(brand.name.en);

    // Upsert brand (create or skip if exists)
    const createdBrand = await prisma.vehicleBrand.upsert({
      where: { slug },
      update: {}, // Don't update if exists
      create: {
        name: brand.name,
        slug,
        lookup: generateLookup(brand.name),
        originCountryCode: brand.originCountryCode,
        title: brand.title,
        description: brand.description,
        keywords: brand.keywords,
      },
    });

    console.log(`  ✓ Brand: ${brand.name.en}`);

    // Seed models
    if (brand.models) {
      for (const model of brand.models) {
        const modelSlug = generateSlug(model.name.en);

        await prisma.vehicleModel.upsert({
          where: { slug: modelSlug },
          update: {}, // Don't update if exists
          create: {
            name: model.name,
            slug: modelSlug,
            brandId: createdBrand.id,
            lookup: generateLookup(model.name),
            title: model.title,
            description: model.description,
            keywords: model.keywords,
          },
        });

        console.log(`    ✓ Model: ${model.name.en}`);
      }
    }
  }

  console.log('✅ Vehicle brands and models seeded\n');
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateLookup(name: JSONB) {
  return [name.en.toLowerCase(), name.az?.toLowerCase(), name.ru?.toLowerCase(), name.ar?.toLowerCase()].filter(
    Boolean
  ) as string[];
}
