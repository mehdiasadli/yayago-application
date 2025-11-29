import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Pencil } from 'lucide-react';
import Link from 'next/link';
import CountryDetailsContent from './country-details-content';

interface CountryPageProps extends PageProps<'/regions/countries/[code]/edit'> {}

export default async function CountryEditPage({ params }: CountryPageProps) {
  const { code } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Country Details' description='View the country details'>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href={`/regions`}>
              <ArrowLeftIcon className='size-4' />
              Back to countries
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/regions/countries/${code}/edit`}>
              <Pencil className='size-4' />
              Edit this country
            </Link>
          </Button>
        </div>
      </PageHeader>
      <CountryDetailsContent code={code} />
    </div>
  );
}
