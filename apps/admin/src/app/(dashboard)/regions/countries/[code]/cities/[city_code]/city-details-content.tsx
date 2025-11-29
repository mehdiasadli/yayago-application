'use client';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Clock, Navigation, Image as ImageIcon, FileText, Calendar, Map, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CityDetailsContentProps {
  countryCode: string;
  cityCode: string;
}

function getStatusVariant(status: PlaceStatus): BadgeProps['variant'] {
  const map: Record<PlaceStatus, BadgeProps['variant']> = {
    [PlaceStatusSchema.enum.ACTIVE]: 'success',
    [PlaceStatusSchema.enum.ARCHIVED]: 'destructive',
    [PlaceStatusSchema.enum.COMING_SOON]: 'info',
    [PlaceStatusSchema.enum.DRAFT]: 'warning',
  };
  return map[status];
}

export default function CityDetailsContent({ countryCode, cityCode }: CityDetailsContentProps) {
  const {
    data: city,
    isLoading,
    error,
  } = useQuery(
    orpc.cities.findOne.queryOptions({
      input: { code: cityCode },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-destructive'>Error: {error.message}</CardContent>
      </Card>
    );
  }

  if (!city) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>City not found</CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='size-16 rounded-lg bg-muted flex items-center justify-center'>
                <MapPin className='size-8 text-muted-foreground' />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{city.name}</h2>
                <p className='text-muted-foreground font-normal'>
                  {city.country.name} • Code: {city.code.toUpperCase()}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={getStatusVariant(city.status)} appearance='outline' className='px-3 py-1'>
                {formatEnumValue(city.status)}
              </Badge>
              <Button asChild variant='outline' size='sm'>
                <Link href={`/regions/countries/${countryCode}/cities/${cityCode}/edit`}>
                  <Edit className='size-4' />
                  Edit
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Timezone */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Clock className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Timezone</p>
                <p className='font-medium'>{city.timezone || '—'}</p>
              </div>
            </div>

            {/* Coordinates */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Navigation className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Coordinates</p>
                <p className='font-medium text-sm'>
                  {city.lat?.toFixed(4)}, {city.lng?.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Google Maps ID */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Map className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Google Maps ID</p>
                <p className='font-medium text-xs truncate max-w-32'>{city.googleMapsPlaceId || '—'}</p>
              </div>
            </div>

            {/* Default */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Globe className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Default City</p>
                <p className='font-medium'>{city.isDefaultOfCounry ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* SEO / Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='size-5' />
              SEO / Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Title</p>
                <p className='font-medium'>{city.title || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Description</p>
                <p className='text-sm'>{city.description || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Image */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <ImageIcon className='size-5' />
              Hero Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {city.heroImageUrl ? (
              <div className='space-y-2'>
                <div className='aspect-video rounded-lg overflow-hidden bg-muted'>
                  <img
                    src={city.heroImageUrl}
                    alt={city.heroImageAlt || city.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                {city.heroImageAlt && <p className='text-sm text-muted-foreground'>Alt: {city.heroImageAlt}</p>}
              </div>
            ) : (
              <div className='aspect-video rounded-lg bg-muted flex items-center justify-center'>
                <div className='text-center text-muted-foreground'>
                  <ImageIcon className='size-8 mx-auto mb-2' />
                  <p>No hero image</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Globe className='size-5' />
              Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{city.country.name}</span>
                <Badge variant={getStatusVariant(city.country.status)} appearance='outline' className='text-xs'>
                  {formatEnumValue(city.country.status)}
                </Badge>
              </div>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>Code: {city.country.code.toUpperCase()}</p>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calendar className='size-5' />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Created</span>
                <span className='font-medium'>{format(city.createdAt, 'dd.MM.yyyy, HH:mm')}</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Updated</span>
                <span className='font-medium'>{format(city.updatedAt, 'dd.MM.yyyy, HH:mm')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
