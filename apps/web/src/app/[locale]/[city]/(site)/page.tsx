import HomeHero from './_components/home-hero';

interface HomePageProps extends PageProps<'/[locale]/[city]'> {}

export default async function HomePage({ params }: HomePageProps) {
  return (
    <div>
      <HomeHero />
    </div>
  );
}
