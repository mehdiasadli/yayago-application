import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditVehicleModelForm from './edit-vehicle-model-form';

interface EditVehicleModelPageProps {
  params: Promise<{ slug: string; modelSlug: string }>;
}

export default async function EditVehicleModelPage({ params }: EditVehicleModelPageProps) {
  const { slug, modelSlug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Edit Vehicle Model' description={`Editing model: ${modelSlug}`}>
        <Button asChild variant='outline'>
          <Link href={`/vehicles/${slug}`}>
            <ArrowLeft className='size-4' />
            Back to Brand
          </Link>
        </Button>
      </PageHeader>
      <EditVehicleModelForm brandSlug={slug} modelSlug={modelSlug} />
    </div>
  );
}

