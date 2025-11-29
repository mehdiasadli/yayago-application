import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import VehiclesContent from './vehicles-content';

export default function VehiclesPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Vehicle Brands' description='Manage vehicle brands and their models'>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/vehicles/create'>
              <Plus className='size-4' />
              Add Brand
            </Link>
          </Button>
        </div>
      </PageHeader>
      <VehiclesContent />
    </div>
  );
}
