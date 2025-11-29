import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditVehicleBrandForm from './edit-vehicle-brand-form';

interface EditVehicleBrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditVehicleBrandPage({ params }: EditVehicleBrandPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Edit Vehicle Brand' description={`Editing: ${slug}`}>
        <Button asChild variant='outline'>
          <Link href={`/vehicles/${slug}`}>
            <ArrowLeft className='size-4' />
            Back to Brand
          </Link>
        </Button>
      </PageHeader>
      <EditVehicleBrandForm slug={slug} />
    </div>
  );
}

