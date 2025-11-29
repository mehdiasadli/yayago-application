import PageHeader from '@/components/page-header';
import PlansContent from './plans-content';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Subscription Plans' description='Manage the subscription plans of the application'>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/plans/create'>
              <Plus className='size-4' />
              Add Plan
            </Link>
          </Button>
        </div>
      </PageHeader>
      <PlansContent />
    </div>
  );
}
