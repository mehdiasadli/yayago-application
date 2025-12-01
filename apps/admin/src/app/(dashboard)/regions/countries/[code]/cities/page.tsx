import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import CitiesContent from './cities-content';
import PageWrapper from '@/components/page-wrapper';
import type { PageProps } from '@/types/next';

interface CountryCitiesPageProps extends PageProps<'/regions/countries/[code]/cities'> {}

export default async function CountryCitiesPage({ params }: CountryCitiesPageProps) {
  const { code } = await params;

  return (
    <PageWrapper
      title='Country Cities'
      description='View the country cities'
      header={
        <>
          <div className='flex items-center gap-2'>
            <Button asChild variant='outline'>
              <Link href={`/regions/countries/${code}`}>
                <ArrowLeftIcon className='size-4' />
                Back to country details
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href={`/regions/countries/${code}/cities/create`}>
                <Plus className='size-4' />
                Add City
              </Link>
            </Button>
          </div>
        </>
      }
    >
      <CitiesContent code={code} />
    </PageWrapper>
  );
}
