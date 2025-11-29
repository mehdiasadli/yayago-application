import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import ListingsContent from './listings-content';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function ListingsPage() {
  const headersList = await headers();

  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  const sessionData = session.data as any;
  const organizationStatus = sessionData?.organization?.status;
  const isActive = organizationStatus === 'ACTIVE';
  const isPending = organizationStatus === 'PENDING';
  const isRejected = organizationStatus === 'REJECTED';

  return (
    <div className='space-y-4'>
      <PageHeader title='My Listings' description='Manage your vehicle listings'>
        {isActive && (
          <Button asChild>
            <Link href='/listings/create'>
              <Plus className='size-4' />
              Add Listing
            </Link>
          </Button>
        )}
        {isPending && (
          <Button disabled variant='secondary'>
            <Clock className='size-4' />
            Pending Approval
          </Button>
        )}
        {isRejected && (
          <Button disabled variant='destructive'>
            <AlertTriangle className='size-4' />
            Fix Required
          </Button>
        )}
      </PageHeader>

      {/* Status-specific messages */}
      {isPending && (
        <Alert>
          <Clock className='size-4' />
          <AlertTitle>Your organization is pending review</AlertTitle>
          <AlertDescription>
            Once approved, you'll be able to create and manage vehicle listings. This typically takes 2-3 business days.
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert variant='destructive'>
          <AlertTriangle className='size-4' />
          <AlertTitle>Action required</AlertTitle>
          <AlertDescription>
            Your organization application needs corrections. Please go to{' '}
            <Link href='/onboarding' className='underline font-medium'>
              onboarding
            </Link>{' '}
            to fix the issues and resubmit.
          </AlertDescription>
        </Alert>
      )}

      {/* Only show listings content for ACTIVE organizations */}
      {isActive ? (
        <ListingsContent />
      ) : (
        <div className='text-center py-12 bg-muted/30 rounded-xl border border-dashed'>
          <p className='text-muted-foreground'>Listings will be available once your organization is approved.</p>
        </div>
      )}
    </div>
  );
}
