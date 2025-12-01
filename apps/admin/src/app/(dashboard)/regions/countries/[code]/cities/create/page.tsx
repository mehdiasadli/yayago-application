import CreateCityForm from './create-city-form';
import type { PageProps } from '@/types/next';

interface CountryCitiesCreatePageProps extends PageProps<'/regions/countries/[code]/cities/create'> {}

export default async function CountryCitiesCreatePage({ params }: CountryCitiesCreatePageProps) {
  const { code } = await params;

  return (
    <div>
      <CreateCityForm code={code} />
    </div>
  );
}
