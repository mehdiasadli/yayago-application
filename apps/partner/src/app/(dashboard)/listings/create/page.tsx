import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import CreateListingForm from './create-listing-form';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CreateListingPage() {
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
  const hasSubscription = !!sessionData?.subscription;
  const isApproved = organizationStatus === 'APPROVED' && hasSubscription;

  // Only approved organizations with subscription can create listings
  if (!isApproved) {
    return (
      <div className='space-y-6'>
        <PageHeader
          title={
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/listings'>
                  <ArrowLeft className='size-4' />
                </Link>
              </Button>
              <span>Create New Listing</span>
            </div>
          }
          description='Add a new vehicle to your fleet'
        />
        <Card className='max-w-lg mx-auto'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20'>
              <ShieldAlert className='size-8 text-yellow-600' />
            </div>
            <CardTitle>Cannot Create Listings</CardTitle>
            <CardDescription>
              {organizationStatus === 'PENDING_APPROVAL'
                ? 'Your organization is pending approval. Once approved, you can create listings.'
                : organizationStatus === 'REJECTED'
                  ? 'Your organization needs corrections. Please complete the onboarding process first.'
                  : organizationStatus === 'APPROVED' && !hasSubscription
                    ? 'Please select a subscription plan to start creating listings.'
                    : 'Your organization must be approved with an active subscription to create listings.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <Button asChild variant='outline'>
              <Link href='/listings'>
                <ArrowLeft className='size-4 mr-2' />
                Back to Listings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/listings'>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <span>Create New Listing</span>
          </div>
        }
        description='Add a new vehicle to your fleet'
      />
      <CreateListingForm />
    </div>
  );
}
