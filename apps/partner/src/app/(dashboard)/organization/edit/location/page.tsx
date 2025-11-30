'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orpc } from '@/utils/orpc';
import { UpdateOrgLocationInputSchema, type UpdateOrgLocationInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, MapPin, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { LocationPicker, MapProvider } from '@/components/maps';

export default function EditOrganizationLocationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.getMyOrganization.queryOptions()
  );

  const form = useForm<UpdateOrgLocationInputType>({
    resolver: zodResolver(UpdateOrgLocationInputSchema),
    defaultValues: {
      address: '',
      lat: undefined,
      lng: undefined,
    },
  });

  const mutation = useMutation(
    orpc.organizations.updateLocation.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', 'getMyOrganization'] });
        toast.success('Location updated');
        router.push('/organization');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update');
      },
    })
  );

  useEffect(() => {
    if (org) {
      form.reset({
        address: org.address || '',
        lat: org.lat || undefined,
        lng: org.lng || undefined,
      });
    }
  }, [org, form]);

  const onSubmit = (data: UpdateOrgLocationInputType) => {
    mutation.mutate(data);
  };

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    country?: string;
  }) => {
    form.setValue('lat', location.lat);
    form.setValue('lng', location.lng);
    form.setValue('address', location.address);
  };

  if (isLoading) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Skeleton className='h-8 w-48 mb-6' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>Failed to load organization data</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is owner
  if (org.memberRole !== 'owner') {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners can edit location.
          </AlertDescription>
        </Alert>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/organization'>
            <ArrowLeft className='size-4 mr-1.5' />
            Back to Organization
          </Link>
        </Button>
      </div>
    );
  }

  const initialLocation = org.lat && org.lng
    ? { lat: org.lat, lng: org.lng }
    : org.city
      ? { lat: 25.2048, lng: 55.2708 } // Dubai default
      : undefined;

  return (
    <div className='container py-6 max-w-2xl'>
      <Button asChild variant='ghost' size='sm' className='mb-4'>
        <Link href='/organization'>
          <ArrowLeft className='size-4 mr-1.5' />
          Back to Organization
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='size-5' />
            Edit Location
          </CardTitle>
          <CardDescription>
            Update your business location. This helps customers find you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {org.city && (
              <div className='p-3 rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>
                  City: <span className='font-medium text-foreground'>{org.city.name}, {org.city.country.name}</span>
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <MapProvider>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={initialLocation}
                  placeholder='Search for your business address...'
                  height='400px'
                />
              </MapProvider>
            </div>

            {form.watch('lat') && form.watch('lng') && (
              <div className='p-3 rounded-lg bg-primary/5 border border-primary/20'>
                <p className='text-sm font-medium mb-1'>Selected Location</p>
                <p className='text-sm text-muted-foreground'>{form.watch('address')}</p>
                <p className='text-xs text-muted-foreground mt-1 font-mono'>
                  {form.watch('lat')?.toFixed(6)}, {form.watch('lng')?.toFixed(6)}
                </p>
              </div>
            )}

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
                Save Location
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

