'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useQueryState, parseAsString } from 'nuqs';

export default function PendingOrganizationsAlert() {
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(orpc.organizations.getPendingCount.queryOptions({}));

  if (isLoading || !data || data.count === 0) {
    return null;
  }

  const handleViewPending = () => {
    setStatus('PENDING');
  };

  return (
    <Alert variant='destructive' className='border-warning/50 bg-warning/10'>
      <AlertTriangle className='size-4' />
      <AlertTitle className='flex items-center gap-2'>
        <Clock className='size-4' />
        Pending Review
      </AlertTitle>
      <AlertDescription className='flex items-center justify-between'>
        <span>
          You have <strong>{data.count}</strong> organization{data.count !== 1 ? 's' : ''} waiting for approval.
        </span>
        <Button variant='destructive' size='sm' onClick={handleViewPending}>
          View Pending
          <ArrowRight className='size-4' />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
