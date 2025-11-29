import PageHeader from '@/components/page-header';
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';
// import Link from 'next/link';
import UsersContent from './users-content';

export default async function UsersPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Users' description='Manage the users of the application'>
        {/* <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/users/create'>
              <Plus className='size-4' />
              Add User
            </Link>
          </Button>
        </div> */}
      </PageHeader>
      <UsersContent />
    </div>
  );
}
