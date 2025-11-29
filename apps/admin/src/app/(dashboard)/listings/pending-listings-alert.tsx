'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { Skeleton } from '@/components/ui/skeleton';

export default function PendingListingsAlert() {
  const [, setVerificationStatus] = useQueryState('verification', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.listings.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        verificationStatus: 'PENDING',
      },
    })
  );

  const pendingCount = data?.pagination.total || 0;

  if (isLoading) {
    return <Skeleton className='h-16 w-full' />;
  }

  if (pendingCount === 0) {
    return null;
  }

  return (
    <Alert className='bg-warning/10 border-warning/30'>
      <Clock className='size-4 text-warning' />
      <AlertTitle className='text-warning font-semibold'>Listings Awaiting Review</AlertTitle>
      <AlertDescription className='flex items-center justify-between'>
        <span>
          You have <strong>{pendingCount}</strong> listing{pendingCount > 1 ? 's' : ''} waiting for verification.
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setVerificationStatus('PENDING')}
          className='border-warning/50 hover:bg-warning/10'
        >
          View Pending
          <ArrowRight className='size-3' />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
