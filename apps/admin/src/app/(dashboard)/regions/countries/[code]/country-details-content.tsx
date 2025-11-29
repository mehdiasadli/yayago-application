'use client';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Phone,
  DollarSign,
  Flag,
  Calendar,
  MapPin,
  Car,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatEnumValue } from '@/lib/utils';
import EditCountryStatus from './edit-country-status';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';

interface CountryDetailsContentProps {
  code: string;
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

export default function CountryDetailsContent({ code }: CountryDetailsContentProps) {
  const {
    data: country,
    isLoading,
    error,
  } = useQuery(
    orpc.countries.findOne.queryOptions({
      input: { code },
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

  if (!country) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Country not found</CardContent>
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
              <span className='text-5xl'>{country.flag}</span>
              <div>
                <h2 className='text-2xl font-bold'>{country.name.en}</h2>
                <p className='text-muted-foreground font-normal'>Code: {country.code.toUpperCase()}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <EditCountryStatus initialStatus={country.status} code={country.code}>
                <Badge
                  variant={getStatusVariant(country.status)}
                  appearance='outline'
                  className='cursor-pointer px-3 py-1'
                >
                  {formatEnumValue(country.status)}
                </Badge>
              </EditCountryStatus>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Currency */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <DollarSign className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Currency</p>
                <p className='font-medium'>{country.currency}</p>
              </div>
            </div>

            {/* Phone Code */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Phone className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Phone Code</p>
                <p className='font-medium'>{country.phoneCode}</p>
              </div>
            </div>

            {/* Emergency Number */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <AlertTriangle className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Emergency</p>
                <p className='font-medium'>{country.emergencyPhoneNumber || '—'}</p>
              </div>
            </div>

            {/* Traffic Direction */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Car className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Traffic</p>
                <p className='font-medium'>{formatEnumValue(country.trafficDirection)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Localized Names */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Globe className='size-5' />
              Localized Names
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>English</span>
                <span className='font-medium'>{country.name.en}</span>
              </div>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Azerbaijani</span>
                <span className='font-medium'>{country.name.az || '—'}</span>
              </div>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Russian</span>
                <span className='font-medium'>{country.name.ru || '—'}</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Arabic</span>
                <span className='font-medium'>{country.name.ar || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Car className='size-5' />
              Driver Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Minimum Driver Age</span>
                <span className='font-medium'>{country.minDriverAge} years</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Min. License Experience</span>
                <span className='font-medium'>{country.minDriverLicenseAge} year(s)</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className='font-medium'>{(country.title as Record<string, string> | null)?.en || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Description</p>
                <p className='text-sm'>{(country.description as Record<string, string> | null)?.en || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Clock className='size-5' />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Created</span>
                <span className='font-medium'>{format(country.createdAt, 'dd.MM.yyyy, HH:mm')}</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Updated</span>
                <span className='font-medium'>{format(country.updatedAt, 'dd.MM.yyyy, HH:mm')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cities Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MapPin className='size-5' />
              Cities
            </div>
            <Button asChild>
              <Link href={`/regions/countries/${country.code}/cities`}>
                View All Cities
                <ChevronRight className='size-4' />
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Manage cities within {country.name.en}. Cities define the operational areas for car rentals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
