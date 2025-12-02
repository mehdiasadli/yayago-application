'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import {
  Car,
  DollarSign,
  CalendarCheck,
  ImageIcon,
  CheckCircle,
  AlertTriangle,
  Zap,
  Gauge,
  Shield,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MediaItem } from '../create-listing-form';
import { CreateListingInputSchema } from '@yayago-app/validators';
import type { z } from 'zod';
import type { VinDecodedData } from './vin-step';

type FormValues = z.input<typeof CreateListingInputSchema>;

interface ReviewStepProps {
  form: UseFormReturn<FormValues>;
  mediaItems: MediaItem[];
  vinData: VinDecodedData | null;
}

export default function ReviewStep({ form, mediaItems, vinData }: ReviewStepProps) {
  // Use watch to get reactive values
  const values = form.watch();
  const images = mediaItems.filter((item) => item.type === 'IMAGE');
  const videos = mediaItems.filter((item) => item.type === 'VIDEO');

  // Get modelId from form or vinData as fallback
  const modelId = values.vehicle?.modelId || vinData?.matchedModelId;

  // Debug: Log the values being received
  console.log('[Review Step] Values:', {
    'form.vehicle.modelId': values.vehicle?.modelId,
    'vinData.matchedModelId': vinData?.matchedModelId,
    'resolved modelId': modelId,
    title: values.title,
  });

  const issues: string[] = [];

  if (!values.title || values.title.length < 3) issues.push('Listing title is too short (minimum 3 characters)');
  // Check for empty string or undefined/null - use modelId which includes vinData fallback
  if (!modelId || modelId === '') issues.push('Vehicle brand and model are required');
  if (!values.pricing?.pricePerDay || values.pricing.pricePerDay <= 0) issues.push('Daily rental price must be set');
  if (images.length === 0) issues.push('At least one image is required');

  return (
    <div className='space-y-8'>
      {/* Status Alert */}
      {issues.length > 0 ? (
        <Alert variant='destructive'>
          <AlertTriangle className='size-4' />
          <AlertTitle>Please fix the following issues</AlertTitle>
          <AlertDescription>
            <ul className='list-disc list-inside mt-2 space-y-1'>
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className='border-green-500/50 bg-green-500/5'>
          <CheckCircle className='size-4 text-green-600' />
          <AlertTitle className='text-green-600'>Ready to Create</AlertTitle>
          <AlertDescription>
            Your listing looks complete! Review the details below and click "Create Listing" to publish.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Vehicle Details */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Car className='size-4' />
              </div>
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <span className='text-sm text-muted-foreground'>Listing Title</span>
              <p className='font-semibold text-lg'>{values.title || '—'}</p>
            </div>
            {values.description && (
              <div>
                <span className='text-sm text-muted-foreground'>Description</span>
                <p className='text-sm line-clamp-2'>{values.description}</p>
              </div>
            )}
            <Separator />
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Year</span>
                <p className='font-medium'>{values.vehicle?.year || '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Class</span>
                <p className='font-medium'>{values.vehicle?.class ? formatEnumValue(values.vehicle.class) : '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Body Type</span>
                <p className='font-medium'>{values.vehicle?.bodyType ? formatEnumValue(values.vehicle.bodyType) : '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Fuel Type</span>
                <p className='font-medium'>{values.vehicle?.fuelType ? formatEnumValue(values.vehicle.fuelType) : '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Transmission</span>
                <p className='font-medium'>{values.vehicle?.transmissionType ? formatEnumValue(values.vehicle.transmissionType) : '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Drive Type</span>
                <p className='font-medium'>{values.vehicle?.driveType ? formatEnumValue(values.vehicle.driveType) : '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Seats</span>
                <p className='font-medium'>{values.vehicle?.seats || '—'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Doors</span>
                <p className='font-medium'>{values.vehicle?.doors || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500'>
                <DollarSign className='size-4' />
              </div>
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-primary/5 rounded-lg'>
              <span className='font-medium'>Daily Rate</span>
              <span className='text-2xl font-bold text-primary'>
                {formatCurrency(values.pricing?.pricePerDay || 0, values.pricing?.currency || 'AED')}
              </span>
            </div>
            {(values.pricing?.pricePerWeek || values.pricing?.pricePerMonth) && (
              <div className='grid grid-cols-2 gap-4'>
                {values.pricing?.pricePerWeek && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Weekly</span>
                    <span className='font-medium'>
                      {formatCurrency(values.pricing.pricePerWeek, values.pricing?.currency || 'AED')}
                    </span>
                  </div>
                )}
                {values.pricing?.pricePerMonth && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Monthly</span>
                    <span className='font-medium'>
                      {formatCurrency(values.pricing.pricePerMonth, values.pricing?.currency || 'AED')}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Separator />
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground flex items-center gap-1'>
                  <Shield className='size-3' />
                  Security Deposit
                </span>
                {values.pricing?.securityDepositRequired ? (
                  <span className='font-medium'>
                    {values.pricing?.securityDepositAmount
                      ? formatCurrency(values.pricing.securityDepositAmount, values.pricing?.currency || 'AED')
                      : 'Required'}
                  </span>
                ) : (
                  <Badge variant='secondary'>Not required</Badge>
                )}
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Cancellation Policy</span>
                <Badge variant='outline'>{formatEnumValue(values.pricing?.cancellationPolicy || 'STRICT')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Rules */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500'>
                <CalendarCheck className='size-4' />
              </div>
              Booking Rules
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
              <Zap className={values.bookingDetails?.hasInstantBooking ? 'text-yellow-500' : 'text-muted-foreground'} />
              <div>
                <p className='font-medium'>
                  {values.bookingDetails?.hasInstantBooking ? 'Instant Booking Enabled' : 'Manual Approval Required'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {values.bookingDetails?.hasInstantBooking
                    ? 'Guests can book immediately'
                    : 'You need to approve each booking'}
                </p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Minimum Age</span>
                <p className='font-medium'>{values.bookingDetails?.minAge || 21} years</p>
              </div>
              {values.bookingDetails?.maxAge && values.bookingDetails.maxAge < 120 && (
                <div>
                  <span className='text-muted-foreground'>Maximum Age</span>
                  <p className='font-medium'>{values.bookingDetails.maxAge} years</p>
                </div>
              )}
              <div>
                <span className='text-muted-foreground'>Minimum Rental</span>
                <p className='font-medium'>{values.bookingDetails?.minRentalDays || 1} day(s)</p>
              </div>
              {values.bookingDetails?.maxRentalDays && (
                <div>
                  <span className='text-muted-foreground'>Maximum Rental</span>
                  <p className='font-medium'>{values.bookingDetails.maxRentalDays} days</p>
                </div>
              )}
            </div>
            {values.bookingDetails?.maxMileagePerDay && (
              <div className='flex items-center gap-2 text-sm'>
                <Gauge className='size-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Daily Mileage Limit:</span>
                <span className='font-medium'>
                  {values.bookingDetails.maxMileagePerDay} {values.bookingDetails?.mileageUnit || 'KM'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Summary */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500'>
                <ImageIcon className='size-4' />
              </div>
              Media
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2'>
                <ImageIcon className='size-4 text-blue-500' />
                <span className='text-2xl font-bold'>{images.length}</span>
                <span className='text-muted-foreground'>images</span>
              </div>
              <div className='flex items-center gap-2'>
                <ImageIcon className='size-4 text-purple-500' />
                <span className='text-2xl font-bold'>{videos.length}</span>
                <span className='text-muted-foreground'>videos</span>
              </div>
            </div>
            {images.length > 0 && (
              <div className='grid grid-cols-4 gap-2'>
                {images.slice(0, 4).map((item, index) => (
                  <div key={index} className='aspect-video rounded-lg overflow-hidden bg-muted'>
                    <img src={item.url} alt={`Preview ${index + 1}`} className='w-full h-full object-cover' />
                  </div>
                ))}
              </div>
            )}
            {images.length > 4 && <p className='text-sm text-muted-foreground'>+{images.length - 4} more images</p>}
          </CardContent>
        </Card>
      </div>

      {/* What happens next */}
      <Card className='bg-muted/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Info className='size-4' />
            What happens next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className='space-y-3 text-sm'>
            <li className='flex items-start gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
                1
              </span>
              <span>
                Your listing will be created as a <strong>Draft</strong>
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground text-xs font-bold'>
                2
              </span>
              <span>Add any final touches and upload remaining media</span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground text-xs font-bold'>
                3
              </span>
              <span>Submit for review when ready</span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground text-xs font-bold'>
                4
              </span>
              <span>Our team will review and approve within 2-3 business days</span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold'>
                5
              </span>
              <span>
                Once approved, your listing will be <strong>live and bookable!</strong>
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
