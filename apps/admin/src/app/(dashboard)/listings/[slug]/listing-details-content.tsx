'use client';

import { useState, useEffect } from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Eye,
  CalendarCheck,
  Star,
  Shield,
  Zap,
  ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Gauge,
  Users,
  Info,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import VerificationDialog from './verification-dialog';
import MediaVerificationCard from './media-verification-card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ListingDetailsContentProps {
  slug: string;
  initialAction?: string;
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
    case 'ARCHIVED':
    case 'BLOCKED':
      return 'secondary';
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

export default function ListingDetailsContent({ slug, initialAction }: ListingDetailsContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showVerificationDialog, setShowVerificationDialog] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (initialAction === 'approve') {
      setShowVerificationDialog('approve');
    } else if (initialAction === 'reject') {
      setShowVerificationDialog('reject');
    }
  }, [initialAction]);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery(
    orpc.listings.findOne.queryOptions({
      input: { slug },
    })
  );

  const { mutateAsync: updateVerification, isPending: isUpdating } = useMutation(
    orpc.listings.updateVerification.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        setShowVerificationDialog(null);
        router.push('/listings');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update verification status');
      },
    })
  );

  const handleVerification = async (status: 'APPROVED' | 'REJECTED', reason?: string) => {
    await updateVerification({
      slug,
      verificationStatus: status,
      rejectionReason: reason,
    });
    toast.success(`Listing ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
  };

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

  if (!listing) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Listing not found</CardContent>
      </Card>
    );
  }

  const isPending = listing.verificationStatus === 'PENDING';
  const MIN_APPROVED_IMAGES = 4;
  const approvedImagesCount = listing.media.filter(
    (m) => m.type === 'IMAGE' && m.verificationStatus === 'APPROVED'
  ).length;
  const canApproveListing = approvedImagesCount >= MIN_APPROVED_IMAGES;

  return (
    <div className='space-y-6'>
      {/* Pending Verification Alert */}
      {isPending && (
        <Alert className='bg-warning/10 border-warning/30'>
          <AlertTriangle className='size-4 text-warning' />
          <AlertTitle className='text-warning font-semibold'>Verification Required</AlertTitle>
          <AlertDescription className='flex flex-col gap-3'>
            <span>This listing is waiting for your review and approval.</span>
            {!canApproveListing && (
              <span className='text-destructive text-sm'>
                ⚠️ Cannot approve: Requires at least {MIN_APPROVED_IMAGES} approved images. Currently has{' '}
                {approvedImagesCount} approved. Please verify images below first.
              </span>
            )}
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={() => setShowVerificationDialog('reject')}>
                <XCircle className='size-4' />
                Reject
              </Button>
              <Button size='sm' onClick={() => setShowVerificationDialog('approve')} disabled={!canApproveListing}>
                <CheckCircle className='size-4' />
                Approve
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Card */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-6'>
            {/* Primary Image */}
            <div className='relative w-full md:w-64 h-48 rounded-xl overflow-hidden bg-muted'>
              {listing.media.find((m) => m.isPrimary)?.url ? (
                <img
                  src={listing.media.find((m) => m.isPrimary)?.url}
                  alt={listing.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Car className='size-16 text-muted-foreground/30' />
                </div>
              )}
            </div>

            {/* Info */}
            <div className='flex-1 space-y-4'>
              <div>
                <h2 className='text-2xl font-bold'>{listing.title}</h2>
                {listing.vehicle && (
                  <p className='text-muted-foreground'>
                    {listing.vehicle.year} {listing.vehicle.model.brand.name} {listing.vehicle.model.name}
                  </p>
                )}
              </div>

              <div className='flex flex-wrap gap-2'>
                <Badge variant={getStatusBadgeVariant(listing.status)} className='text-sm'>
                  {formatEnumValue(listing.status)}
                </Badge>
                <Badge variant={getVerificationBadgeVariant(listing.verificationStatus)} className='text-sm'>
                  {listing.verificationStatus === 'PENDING' && <Clock className='size-3 mr-1' />}
                  {listing.verificationStatus === 'APPROVED' && <CheckCircle className='size-3 mr-1' />}
                  {listing.verificationStatus === 'REJECTED' && <XCircle className='size-3 mr-1' />}
                  {formatEnumValue(listing.verificationStatus)}
                </Badge>
                {listing.isFeatured && (
                  <Badge variant='warning' className='text-sm'>
                    <Star className='size-3 mr-1 fill-current' />
                    Featured
                  </Badge>
                )}
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <Eye className='size-4 text-muted-foreground' />
                  <span>{listing.viewCount} views</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CalendarCheck className='size-4 text-muted-foreground' />
                  <span>{listing.bookingCount} bookings</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Star className='size-4 text-muted-foreground' />
                  <span>
                    {listing.averageRating
                      ? `${listing.averageRating.toFixed(1)} (${listing.reviewCount})`
                      : 'No ratings'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='size-4 text-muted-foreground' />
                  <span>{format(listing.createdAt, 'd MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Organization */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Building2 className='size-4' />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/organizations/${listing.organization.slug}`}
                className='flex items-center gap-3 hover:bg-muted/50 p-3 rounded-lg -m-3'
              >
                <Avatar className='size-12'>
                  <AvatarImage src={listing.organization.logo || undefined} />
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    <Building2 className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{listing.organization.name}</p>
                  <p className='text-sm text-muted-foreground'>@{listing.organization.slug}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Info className='size-4' />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{listing.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Details */}
          {listing.vehicle && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Car className='size-4' />
                  Vehicle Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Class</span>
                    <p className='font-medium'>{formatEnumValue(listing.vehicle.class)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Body Type</span>
                    <p className='font-medium'>{formatEnumValue(listing.vehicle.bodyType)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Fuel Type</span>
                    <p className='font-medium'>{formatEnumValue(listing.vehicle.fuelType)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Transmission</span>
                    <p className='font-medium'>{formatEnumValue(listing.vehicle.transmissionType)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Drive Type</span>
                    <p className='font-medium'>{formatEnumValue(listing.vehicle.driveType)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Year</span>
                    <p className='font-medium'>{listing.vehicle.year}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Seats</span>
                    <p className='font-medium'>{listing.vehicle.seats}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Doors</span>
                    <p className='font-medium'>{listing.vehicle.doors}</p>
                  </div>
                  {listing.vehicle.horsepower && (
                    <div>
                      <span className='text-muted-foreground'>Horsepower</span>
                      <p className='font-medium'>{listing.vehicle.horsepower} HP</p>
                    </div>
                  )}
                </div>

                {listing.vehicle.features && listing.vehicle.features.length > 0 && (
                  <>
                    <Separator className='my-4' />
                    <div>
                      <span className='text-sm text-muted-foreground'>Features</span>
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {listing.vehicle.features.map((f) => (
                          <Badge key={f.id} variant='secondary'>
                            {f.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Media Gallery with Verification */}
          <MediaVerificationCard media={listing.media} listingSlug={listing.slug} />
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Pricing */}
          {listing.pricing && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <DollarSign className='size-4' />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center p-4 bg-primary/5 rounded-lg'>
                  <p className='text-3xl font-bold text-primary'>
                    {formatCurrency(listing.pricing.pricePerDay, listing.pricing.currency)}
                  </p>
                  <p className='text-sm text-muted-foreground'>per day</p>
                </div>

                <div className='space-y-2 text-sm'>
                  {listing.pricing.pricePerWeek && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Weekly</span>
                      <span className='font-medium'>
                        {formatCurrency(listing.pricing.pricePerWeek, listing.pricing.currency)}
                      </span>
                    </div>
                  )}
                  {listing.pricing.pricePerMonth && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Monthly</span>
                      <span className='font-medium'>
                        {formatCurrency(listing.pricing.pricePerMonth, listing.pricing.currency)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <Shield className='size-3' />
                      Security Deposit
                    </span>
                    <span className='font-medium'>
                      {listing.pricing.securityDepositRequired
                        ? listing.pricing.securityDepositAmount
                          ? formatCurrency(listing.pricing.securityDepositAmount, listing.pricing.currency)
                          : 'Required'
                        : 'Not required'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Cancellation</span>
                    <Badge variant='outline'>{formatEnumValue(listing.pricing.cancellationPolicy)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Rules */}
          {listing.bookingDetails && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <CalendarCheck className='size-4' />
                  Booking Rules
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                  <Zap
                    className={listing.bookingDetails.hasInstantBooking ? 'text-yellow-500' : 'text-muted-foreground'}
                  />
                  <div>
                    <p className='font-medium text-sm'>
                      {listing.bookingDetails.hasInstantBooking ? 'Instant Booking' : 'Manual Approval'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {listing.bookingDetails.hasInstantBooking
                        ? 'Guests can book immediately'
                        : 'Host needs to approve'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <Users className='size-3' />
                      Age Requirement
                    </span>
                    <span className='font-medium'>
                      {listing.bookingDetails.minAge}
                      {listing.bookingDetails.maxAge && listing.bookingDetails.maxAge < 120
                        ? ` - ${listing.bookingDetails.maxAge}`
                        : '+'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Min. Rental</span>
                    <span className='font-medium'>{listing.bookingDetails.minRentalDays} day(s)</span>
                  </div>
                  {listing.bookingDetails.maxRentalDays && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Max. Rental</span>
                      <span className='font-medium'>{listing.bookingDetails.maxRentalDays} days</span>
                    </div>
                  )}
                  {listing.bookingDetails.maxMileagePerDay && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground flex items-center gap-1'>
                        <Gauge className='size-3' />
                        Daily Mileage
                      </span>
                      <span className='font-medium'>
                        {listing.bookingDetails.maxMileagePerDay} {listing.bookingDetails.mileageUnit}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {isPending && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>Actions</CardTitle>
                <CardDescription>Review and verify this listing</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {!canApproveListing && (
                  <p className='text-sm text-muted-foreground mb-2'>
                    Verify at least {MIN_APPROVED_IMAGES - approvedImagesCount} more image(s) to enable approval.
                  </p>
                )}
                <Button
                  className='w-full'
                  onClick={() => setShowVerificationDialog('approve')}
                  disabled={!canApproveListing}
                >
                  <CheckCircle className='size-4' />
                  Approve Listing
                </Button>
                <Button variant='destructive' className='w-full' onClick={() => setShowVerificationDialog('reject')}>
                  <XCircle className='size-4' />
                  Reject Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog !== null}
        onOpenChange={(open) => !open && setShowVerificationDialog(null)}
        type={showVerificationDialog || 'approve'}
        onConfirm={handleVerification}
        isLoading={isUpdating}
        listingTitle={listing.title}
      />
    </div>
  );
}
