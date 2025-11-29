import { seedVehicleBrands } from './vehicle-brand.seed';

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Run seeds in order (if there are dependencies)
    await seedVehicleBrands();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { default: prisma } = await import('..');
    await prisma.$disconnect();
  });
