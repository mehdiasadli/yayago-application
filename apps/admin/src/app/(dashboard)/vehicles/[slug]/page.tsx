import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, EditIcon } from 'lucide-react';
import Link from 'next/link';
import VehicleDetailsContent from './vehicle-details-content';

interface VehicleBrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VehicleBrandPage({ params }: VehicleBrandPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4'>
      <PageHeader title='Vehicle Brand Details' description={`Viewing brand: ${slug}`}>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/vehicles'>
              <ArrowLeft className='size-4' />
              Back to Brands
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/vehicles/${slug}/edit`}>
              <EditIcon className='size-4' />
              Edit Brand
            </Link>
          </Button>
        </div>
      </PageHeader>
      <VehicleDetailsContent slug={slug} />
    </div>
  );
}
