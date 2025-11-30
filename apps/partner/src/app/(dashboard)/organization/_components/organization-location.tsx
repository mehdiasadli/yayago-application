'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Pencil, ExternalLink } from 'lucide-react';
import { useOrgContext } from '../page';
import { MapProvider, MapPreview } from '@/components/maps';

export function OrganizationLocation() {
  const { org, canEdit } = useOrgContext();
  const hasLocation = org.lat && org.lng;
  const googleMapsUrl = hasLocation 
    ? `https://www.google.com/maps?q=${org.lat},${org.lng}`
    : null;

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='size-4' />
            Location
          </CardTitle>
          <CardDescription>Where your business is located</CardDescription>
        </div>
        {canEdit && (
          <Button asChild variant='outline' size='sm'>
            <Link href='/organization/edit/location'>
              <Pencil className='size-3 mr-1.5' />
              Edit
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        {org.city && (
          <div>
            <p className='text-sm text-muted-foreground'>City</p>
            <p className='font-medium'>
              {org.city.name}, {org.city.country.name}
            </p>
          </div>
        )}

        {org.address && (
          <div>
            <p className='text-sm text-muted-foreground'>Address</p>
            <p className='font-medium'>{org.address}</p>
          </div>
        )}

        {hasLocation && (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Latitude</p>
                <p className='font-medium font-mono text-sm'>{org.lat?.toFixed(6)}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Longitude</p>
                <p className='font-medium font-mono text-sm'>{org.lng?.toFixed(6)}</p>
              </div>
            </div>

            {/* Map Preview */}
            <div className='relative'>
              <MapProvider>
                <MapPreview lat={org.lat!} lng={org.lng!} height='200px' zoom={15} />
              </MapProvider>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute bottom-2 right-2 z-10'
                >
                  <Button size='sm' variant='secondary' className='gap-1.5'>
                    <ExternalLink className='size-3' />
                    Open in Maps
                  </Button>
                </a>
              )}
            </div>
          </>
        )}

        {!org.address && !hasLocation && (
          <p className='text-sm text-muted-foreground text-center py-4'>
            No location information added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
