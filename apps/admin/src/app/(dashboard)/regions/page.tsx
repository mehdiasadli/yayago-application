import PageHeader from '@/components/page-header';
import RegionsContent from './regions-content';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function RegionsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader
        title='Regions'
        description='Manage the regions (countries, cities, locations etc.) of the application'
      >
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/regions/countries/create'>
              <Plus className='size-4' />
              Add Country
            </Link>
          </Button>
        </div>
      </PageHeader>
      <RegionsContent />
    </div>
  );
}
