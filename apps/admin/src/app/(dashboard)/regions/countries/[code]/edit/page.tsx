import PageHeader from '@/components/page-header';
import EditCountryForm from './edit-country-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import type { PageProps } from '@/types/next';

interface CountryEditPageProps extends PageProps<'/regions/countries/[code]/edit'> {}

export default async function CountryEditPage({ params }: CountryEditPageProps) {
  const { code } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Edit Country' description='Edit the country details'>
        <Button asChild variant='outline'>
          <Link href={`/regions/countries/${code}`}>
            <ArrowLeftIcon className='size-4' />
            Back to country details
          </Link>
        </Button>
      </PageHeader>
      <EditCountryForm code={code} />
    </div>
  );
}
