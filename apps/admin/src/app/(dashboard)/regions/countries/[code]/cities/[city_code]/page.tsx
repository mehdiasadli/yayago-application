import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import CityDetailsContent from './city-details-content';
import type { PageProps } from '@/types/next';

interface CityDetailsPageProps extends PageProps<'/regions/countries/[code]/cities/[city_code]'> {}

export default async function CityDetailsPage({ params }: CityDetailsPageProps) {
  const { code, city_code } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='City Details' description='View the city details'>
        <Button asChild variant='outline'>
          <Link href={`/regions/countries/${code}/cities`}>
            <ArrowLeftIcon className='size-4' />
            Back to cities
          </Link>
        </Button>
      </PageHeader>
      <CityDetailsContent countryCode={code} cityCode={city_code} />
    </div>
  );
}
