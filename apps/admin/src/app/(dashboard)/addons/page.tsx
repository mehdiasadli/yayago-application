import PageHeader from '@/components/page-header';
import AddonsContent from './addons-content';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddonsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Addons' description='Manage rental addons and extras'>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/addons/create'>
              <Plus className='size-4' />
              Add Addon
            </Link>
          </Button>
        </div>
      </PageHeader>
      <AddonsContent />
    </div>
  );
}

