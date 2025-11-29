import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreateVehicleModelForm from './create-vehicle-model-form';

interface CreateVehicleModelPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CreateVehicleModelPage({ params }: CreateVehicleModelPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Add Vehicle Model' description={`Adding model to brand: ${slug}`}>
        <Button asChild variant='outline'>
          <Link href={`/vehicles/${slug}`}>
            <ArrowLeft className='size-4' />
            Back to Brand
          </Link>
        </Button>
      </PageHeader>
      <CreateVehicleModelForm brandSlug={slug} />
    </div>
  );
}

