import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import UserDetailsContent from './user-details-content';
import type { PageProps } from '@/types/next';

interface UserPageProps extends PageProps<'/users/[username]'> {}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  return (
    <div className='space-y-4'>
      <PageHeader title='User Details' description='View the user details'>
        <Button asChild variant='outline'>
          <Link href={`/users`}>
            <ArrowLeftIcon className='size-4' />
            Back to users
          </Link>
        </Button>
      </PageHeader>
      <UserDetailsContent username={username} />
    </div>
  );
}
