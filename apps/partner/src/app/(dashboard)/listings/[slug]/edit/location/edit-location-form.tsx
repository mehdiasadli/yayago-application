'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, MapPin, Building2, Info } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import LocationPicker from '@/components/maps/location-picker';

const EditLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().max(500),
});

type EditLocationFormValues = z.infer<typeof EditLocationSchema>;

interface EditLocationFormProps {
  listing: FindOneListingOutputType;
}

export default function EditLocationForm({ listing }: EditLocationFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const hasOwnLocation = !!(listing.lat && listing.lng);
  const orgLocation = listing.organization?.lat && listing.organization?.lng 
    ? { lat: listing.organization.lat, lng: listing.organization.lng }
    : null;
  
  const [useCustomLocation, setUseCustomLocation] = useState(hasOwnLocation);

  const form = useForm<EditLocationFormValues>({
    resolver: zodResolver(EditLocationSchema),
    defaultValues: {
      lat: listing.lat || orgLocation?.lat || 25.2048,
      lng: listing.lng || orgLocation?.lng || 55.2708,
      address: listing.address || listing.organization?.address || '',
    },
  });

  const { mutate, isPending } = useMutation(
    orpc.listings.updateLocation.mutationOptions({
      onSuccess: () => {
        toast.success('Location updated successfully');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        router.push(`/listings/${listing.slug}/edit`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update location');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      slug: listing.slug,
      data: {
        lat: data.lat,
        lng: data.lng,
        address: data.address,
      },
    });
  });

  const handleLocationSelect = (loc: { lat: number; lng: number; address: string }) => {
    form.setValue('lat', loc.lat);
    form.setValue('lng', loc.lng);
    form.setValue('address', loc.address);
  };

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='size-5' />
            Vehicle Location
          </CardTitle>
          <CardDescription>
            Set where this vehicle is located. This affects search results and helps customers find cars nearby.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Organization default location info */}
          {orgLocation && (
            <Alert>
              <Building2 className='size-4' />
              <AlertDescription>
                <strong>Default:</strong> Your organization's location will be used if you don't set a custom location.
                {listing.organization?.address && (
                  <span className='block text-muted-foreground mt-1'>
                    {listing.organization.address}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Custom location toggle */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='space-y-1'>
              <Label htmlFor='custom-location' className='font-medium'>
                Use Custom Location
              </Label>
              <p className='text-sm text-muted-foreground'>
                Set a specific location for this vehicle (different from your organization)
              </p>
            </div>
            <Switch
              id='custom-location'
              checked={useCustomLocation}
              onCheckedChange={setUseCustomLocation}
            />
          </div>

          {useCustomLocation && (
            <div className='space-y-4'>
              <Alert>
                <Info className='size-4' />
                <AlertDescription>
                  Click on the map or search for an address to set the vehicle's pickup location.
                </AlertDescription>
              </Alert>

              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={
                  form.getValues('lat') && form.getValues('lng')
                    ? { lat: form.getValues('lat'), lng: form.getValues('lng') }
                    : orgLocation || undefined
                }
                centerCity={orgLocation || undefined}
                placeholder='Search for vehicle pickup location...'
                height='400px'
              />

              {/* Display current selection */}
              {form.watch('address') && (
                <div className='p-4 bg-muted rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <MapPin className='size-5 text-primary mt-0.5' />
                    <div>
                      <p className='font-medium'>Selected Location</p>
                      <p className='text-sm text-muted-foreground'>{form.watch('address')}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Coordinates: {form.watch('lat')?.toFixed(6)}, {form.watch('lng')?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!useCustomLocation && orgLocation && (
            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex items-start gap-3'>
                <Building2 className='size-5 text-muted-foreground mt-0.5' />
                <div>
                  <p className='font-medium text-muted-foreground'>Using Organization Location</p>
                  {listing.organization?.address && (
                    <p className='text-sm text-muted-foreground'>{listing.organization.address}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={isPending || !useCustomLocation}>
          {isPending ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='size-4' />
              Save Location
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

