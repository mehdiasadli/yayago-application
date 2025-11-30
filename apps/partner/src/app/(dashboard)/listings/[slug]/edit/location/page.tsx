'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EditLocationForm from './edit-location-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EditListingLocationPage({ params }: PageProps) {
  const { slug } = use(params);

  const { data: listing, isLoading, error } = useQuery(
    orpc.listings.findOne.queryOptions({
      input: { slug },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-[500px] w-full rounded-xl' />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='size-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load listing details. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' asChild>
          <Link href={`/listings/${slug}/edit`}>
            <ArrowLeft className='size-4' />
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <MapPin className='size-6' />
            Edit Location
          </h1>
          <p className='text-muted-foreground'>
            Set where this vehicle is located for pickup
          </p>
        </div>
      </div>

      <EditLocationForm listing={listing} />
    </div>
  );
}

