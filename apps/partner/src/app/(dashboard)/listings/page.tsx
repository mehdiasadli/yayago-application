import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import ListingsContent from './listings-content';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPageAccessContext } from '@/lib/page-access';

export default async function ListingsPage() {
  const { organizationStatus, hasSubscription } = await getPageAccessContext();

  // Updated status checks for new flow
  const isApproved = organizationStatus === 'APPROVED';
  const isPending = organizationStatus === 'PENDING_APPROVAL';
  const isRejected = organizationStatus === 'REJECTED';
  const isFullyActive = isApproved && hasSubscription;
  const needsSubscription = isApproved && !hasSubscription;

  return (
    <div className='space-y-4'>
      <PageHeader title='My Listings' description='Manage your vehicle listings'>
        {isFullyActive && (
          <Button asChild>
            <Link href='/listings/create'>
              <Plus className='size-4' />
              Add Listing
            </Link>
          </Button>
        )}
        {needsSubscription && (
          <Button asChild>
            <Link href='/plan-selection'>
              <CreditCard className='size-4' />
              Select a Plan
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

      {needsSubscription && (
        <Alert>
          <CreditCard className='size-4' />
          <AlertTitle>Subscription required</AlertTitle>
          <AlertDescription>
            Your organization is approved! Select a subscription plan to start creating listings.{' '}
            <Link href='/plan-selection' className='underline font-medium'>
              Choose a plan
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Only show listings content for fully active organizations */}
      {isFullyActive ? (
        <ListingsContent />
      ) : (
        <div className='text-center py-12 bg-muted/30 rounded-xl border border-dashed'>
          <p className='text-muted-foreground'>
            {isPending && 'Listings will be available once your organization is approved.'}
            {isRejected && 'Fix the issues with your application to access listings.'}
            {needsSubscription && 'Select a subscription plan to start listing your vehicles.'}
          </p>
        </div>
      )}
    </div>
  );
}
