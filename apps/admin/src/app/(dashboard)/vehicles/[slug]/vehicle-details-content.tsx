'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Globe, MapPin, FileText, Tag, Plus } from 'lucide-react';
import { countries } from 'country-data-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VehicleModelsTable from './vehicle-models-table';

interface VehicleDetailsContentProps {
  slug: string;
}

export default function VehicleDetailsContent({ slug }: VehicleDetailsContentProps) {
  const { data: brand, isLoading } = useQuery(
    orpc.vehicleBrands.findOne.queryOptions({
      input: { slug },
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

  if (!brand) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Brand not found</CardContent>
      </Card>
    );
  }

  const country = countries.all.find((c) => c.alpha2.toLowerCase() === brand.originCountryCode?.toLowerCase());

  return (
    <div className='space-y-6'>
      {/* Brand Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className='size-12 object-contain' />
            ) : (
              <div className='size-12 rounded bg-muted flex items-center justify-center'>
                <Car className='size-6 text-muted-foreground' />
              </div>
            )}
            <div>
              <h2 className='text-xl font-bold'>{brand.name}</h2>
              <p className='text-sm text-muted-foreground font-normal'>{brand.slug}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Origin Country */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <MapPin className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Origin Country</p>
                {country ? (
                  <p className='font-medium flex items-center gap-1'>
                    <span>{country.emoji}</span>
                    {country.name}
                  </p>
                ) : (
                  <p className='text-muted-foreground'>Not specified</p>
                )}
              </div>
            </div>

            {/* Website */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Globe className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Website</p>
                {brand.website ? (
                  <Link href={brand.website} target='_blank' className='font-medium text-primary hover:underline'>
                    Visit Website
                  </Link>
                ) : (
                  <p className='text-muted-foreground'>Not specified</p>
                )}
              </div>
            </div>

            {/* Title */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <FileText className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>SEO Title</p>
                <p className='font-medium'>{brand.title || 'Not specified'}</p>
              </div>
            </div>

            {/* Keywords */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Tag className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Keywords</p>
                {brand.keywords && brand.keywords.length > 0 ? (
                  <p className='font-medium'>{brand.keywords.join(', ')}</p>
                ) : (
                  <p className='text-muted-foreground'>None</p>
                )}
              </div>
            </div>
          </div>

          {brand.description && (
            <div className='mt-4 p-4 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground mb-1'>Description</p>
              <p>{brand.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Models Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Car className='size-5' />
              Vehicle Models
            </div>
            <Button asChild size='sm'>
              <Link href={`/vehicles/${slug}/models/create`}>
                <Plus className='size-4' />
                Add Model
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleModelsTable brandSlug={slug} />
        </CardContent>
      </Card>
    </div>
  );
}
