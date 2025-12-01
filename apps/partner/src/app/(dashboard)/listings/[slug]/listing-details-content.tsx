'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FindOneListingOutputType } from '@yayago-app/validators';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Car,
  Calendar,
  Eye,
  Star,
  CalendarCheck,
  Fuel,
  Cog,
  Users,
  DoorOpen,
  Gauge,
  Send,
  ImageIcon,
  Ban,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';

interface ListingDetailsContentProps {
  listing: FindOneListingOutputType;
}

function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'PENDING_VERIFICATION':
      return 'warning';
    case 'DRAFT':
      return 'secondary';
    case 'UNAVAILABLE':
      return 'outline';
    case 'MAINTENANCE':
      return 'info';
    default:
      return 'secondary';
  }
}

function getVerificationBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function ListingDetailsContent({ listing }: ListingDetailsContentProps) {
  const queryClient = useQueryClient();

  const { mutate: submitForReview, isPending: isSubmitting } = useMutation(
    orpc.listings.submitForReview.mutationOptions({
      onSuccess: () => {
        toast.success('Listing submitted for review');
        queryClient.invalidateQueries({
          queryKey: orpc.listings.findOne.queryKey({ input: { slug: listing.slug } }),
        });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit for review');
      },
    })
  );

  const canSubmitForReview = listing.status === 'DRAFT' && listing.verificationStatus !== 'PENDING';

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Main Content */}
      <div className='lg:col-span-2 space-y-6'>
        {/* Status & Actions */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Badge variant={getStatusBadgeVariant(listing.status)} className='text-sm'>
                  {formatEnumValue(listing.status)}
                </Badge>
                <Badge variant={getVerificationBadgeVariant(listing.verificationStatus)} appearance='outline'>
                  {formatEnumValue(listing.verificationStatus)}
                </Badge>
              </div>
              {canSubmitForReview && (
                <Button onClick={() => submitForReview({ slug: listing.slug })} disabled={isSubmitting}>
                  <Send className='size-4' />
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='flex items-center gap-2'>
                <Eye className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>{listing.viewCount}</p>
                  <p className='text-xs text-muted-foreground'>Views</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <CalendarCheck className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>{listing.bookingCount}</p>
                  <p className='text-xs text-muted-foreground'>Bookings</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Star className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>{listing.averageRating?.toFixed(1) || '—'}</p>
                  <p className='text-xs text-muted-foreground'>Rating</p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='size-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>{format(listing.createdAt, 'd MMM yyyy')}</p>
                  <p className='text-xs text-muted-foreground'>Created</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        {listing.vehicle && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Car className='size-5' />
                Vehicle Details
              </CardTitle>
              <CardDescription>
                {listing.vehicle.year} {listing.vehicle.model.brand.name} {listing.vehicle.model.name}
                {listing.vehicle.trim && ` ${listing.vehicle.trim}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div className='flex items-center gap-2'>
                  <Cog className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{formatEnumValue(listing.vehicle.transmissionType)}</p>
                    <p className='text-xs text-muted-foreground'>Transmission</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Fuel className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{formatEnumValue(listing.vehicle.fuelType)}</p>
                    <p className='text-xs text-muted-foreground'>Fuel Type</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{listing.vehicle.seats}</p>
                    <p className='text-xs text-muted-foreground'>Seats</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <DoorOpen className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{listing.vehicle.doors}</p>
                    <p className='text-xs text-muted-foreground'>Doors</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Car className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{formatEnumValue(listing.vehicle.bodyType)}</p>
                    <p className='text-xs text-muted-foreground'>Body Type</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Gauge className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{formatEnumValue(listing.vehicle.class)}</p>
                    <p className='text-xs text-muted-foreground'>Class</p>
                  </div>
                </div>
              </div>

              {listing.vehicle.features.length > 0 && (
                <>
                  <Separator className='my-4' />
                  <div>
                    <p className='text-sm font-medium mb-2'>Features</p>
                    <div className='flex flex-wrap gap-2'>
                      {listing.vehicle.features.map((feature) => (
                        <Badge key={feature.id} variant='secondary'>
                          {feature.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        {listing.bookingDetails && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CalendarCheck className='size-5' />
                Booking Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm font-medium'>
                    {listing.bookingDetails.hasInstantBooking ? (
                      <span className='flex items-center gap-1 text-green-600'>
                        <CheckCircle className='size-4' /> Instant Booking
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-muted-foreground'>
                        <Clock className='size-4' /> Approval Required
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Minimum Age</p>
                  <p className='text-sm font-medium'>{listing.bookingDetails.minAge} years</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Min Rental</p>
                  <p className='text-sm font-medium'>{listing.bookingDetails.minRentalDays} day(s)</p>
                </div>
                {listing.bookingDetails.maxRentalDays && (
                  <div>
                    <p className='text-xs text-muted-foreground'>Max Rental</p>
                    <p className='text-sm font-medium'>{listing.bookingDetails.maxRentalDays} days</p>
                  </div>
                )}
                {listing.bookingDetails.maxMileagePerDay && (
                  <div>
                    <p className='text-xs text-muted-foreground'>Daily Mileage Limit</p>
                    <p className='text-sm font-medium'>
                      {listing.bookingDetails.maxMileagePerDay} {listing.bookingDetails.mileageUnit}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ImageIcon className='size-5' />
              Media ({listing.media.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listing.media.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
                <ImageIcon className='size-12 mb-2' />
                <p>No media uploaded yet</p>
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {listing.media.map((media) => (
                  <div key={media.id} className='relative aspect-video rounded-lg overflow-hidden bg-muted'>
                    <Avatar className='w-full h-full rounded-none'>
                      <AvatarImage src={media.url} className='object-cover' />
                      <AvatarFallback className='rounded-none'>
                        <ImageIcon className='size-8' />
                      </AvatarFallback>
                    </Avatar>
                    {media.isPrimary && (
                      <Badge className='absolute top-2 left-2' variant='secondary'>
                        Primary
                      </Badge>
                    )}
                    <Badge className='absolute top-2 right-2' variant={media.verificationStatus === 'APPROVED' ? 'success' : 'warning'}>
                      {formatEnumValue(media.verificationStatus)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className='space-y-6'>
        {/* Pricing */}
        {listing.pricing && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Daily Rate</span>
                <span className='text-xl font-bold'>
                  {formatCurrency(listing.pricing.pricePerDay, listing.pricing.currency)}
                </span>
              </div>
              {listing.pricing.pricePerWeek && (
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Weekly Rate</span>
                  <span className='font-medium'>
                    {formatCurrency(listing.pricing.pricePerWeek, listing.pricing.currency)}
                  </span>
                </div>
              )}
              {listing.pricing.pricePerMonth && (
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Monthly Rate</span>
                  <span className='font-medium'>
                    {formatCurrency(listing.pricing.pricePerMonth, listing.pricing.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>Deposit</span>
                <span className='font-medium'>
                  {listing.pricing.depositAmount
                    ? formatCurrency(listing.pricing.depositAmount, listing.pricing.currency)
                    : '—'}
                </span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>Cancellation</span>
                <span className='font-medium'>{formatEnumValue(listing.pricing.cancellationPolicy)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {listing.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{listing.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {listing.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant='outline'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

