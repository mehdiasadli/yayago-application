import PageHeader from '@/components/page-header';
import CreateVehicleBrandForm from './create-vehicle-brand-form';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreateVehicleBrandPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Create Vehicle Brand' description='Create a new vehicle brand'>
        <Button asChild variant='outline'>
          <Link href='/vehicles'>
            <ArrowLeftIcon className='size-4' />
            Back to vehicles
          </Link>
        </Button>
      </PageHeader>
      <CreateVehicleBrandForm />
    </div>
  );
}
