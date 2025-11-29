import CreateCityForm from './create-city-form';

interface CountryCitiesCreatePageProps extends PageProps<'/regions/countries/[code]/cities/create'> {}

export default async function CountryCitiesCreatePage({ params }: CountryCitiesCreatePageProps) {
  const { code } = await params;

  return (
    <div>
      <CreateCityForm code={code} />
    </div>
  );
}
