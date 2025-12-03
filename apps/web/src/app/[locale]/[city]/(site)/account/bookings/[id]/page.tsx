'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Shield,
  Building2,
  Loader2,
  Ban,
  ExternalLink,
  Activity,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
import { orpc } from '@/utils/orpc';
import { format } from 'date-fns';
import { toast } from 'sonner';

type BookingStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_HOST'
  | 'DISPUTED';

function getStatusBadgeVariant(status: BookingStatus): VariantProps<typeof badgeVariants>['variant'] {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
    case 'ACTIVE':
      return 'default';
    case 'PENDING_APPROVAL':
      return 'secondary';
    case 'REJECTED':
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_HOST':
    case 'DISPUTED':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusIcon(status: BookingStatus) {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return CheckCircle2;
    case 'PENDING_APPROVAL':
      return Clock;
    case 'ACTIVE':
      return Activity;
    case 'REJECTED':
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_HOST':
      return XCircle;
    case 'DISPUTED':
      return AlertTriangle;
    default:
      return Clock;
  }
}

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function AccountBookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery(
    orpc.bookings.getMyBooking.queryOptions({
      input: { bookingId: id },
    })
  );

  const { mutate: cancelBooking, isPending: isCancelling } = useMutation(
    orpc.bookings.cancel.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success('Booking cancelled successfully');
        setShowCancelDialog(false);
        if (data.refundAmount && data.refundAmount > 0) {
          toast.info(`Refund of ${formatCurrency(data.refundAmount, booking?.currency || 'AED')} will be processed.`);
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to cancel booking');
      },
    })
  );

  const copyReferenceCode = () => {
    if (booking?.referenceCode) {
      navigator.clipboard.writeText(booking.referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Reference code copied!');
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-10' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <Skeleton className='h-64' />
            <Skeleton className='h-48' />
          </div>
          <div className='space-y-6'>
            <Skeleton className='h-48' />
            <Skeleton className='h-32' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' asChild>
          <Link href='/account/bookings'>
            <ArrowLeft className='size-4 mr-2' />
            Back to My Bookings
          </Link>
        </Button>
        <Card>
          <CardContent className='py-16 text-center'>
            <AlertTriangle className='size-16 mx-auto mb-4 text-amber-500' />
            <p className='text-lg font-medium'>Booking Not Found</p>
            <p className='text-sm text-muted-foreground'>
              The booking you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(booking.status);
  const canCancel = ['PENDING_APPROVAL', 'APPROVED'].includes(booking.status);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/account/bookings'>
              <ArrowLeft className='size-5' />
            </Link>
          </Button>
          <div>
            <div className='flex items-center gap-3'>
              <h2 className='text-2xl font-bold font-mono'>{booking.referenceCode}</h2>
              <Button variant='ghost' size='icon' className='size-8' onClick={copyReferenceCode}>
                {copied ? <Check className='size-4 text-green-500' /> : <Copy className='size-4' />}
              </Button>
            </div>
            <p className='text-muted-foreground'>
              Created {format(new Date(booking.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(booking.status)}>
          <StatusIcon className='size-3 mr-1' />
          {formatEnumValue(booking.status)}
        </Badge>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Listing Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Car className='size-5' />
                Your Rental
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-start gap-4 p-4 bg-muted/50 rounded-lg'>
                {booking.listing.primaryImage ? (
                  <img
                    src={booking.listing.primaryImage}
                    alt={booking.listing.title}
                    className='size-24 rounded-lg object-cover'
                  />
                ) : (
                  <div className='size-24 rounded-lg bg-muted flex items-center justify-center'>
                    <Car className='size-10 text-muted-foreground' />
                  </div>
                )}
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold'>{booking.listing.title}</h3>
                  <p className='text-muted-foreground'>
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                  {booking.vehicle.licensePlate && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      License Plate: {booking.vehicle.licensePlate}
                    </p>
                  )}
                  <Link
                    href={`/rent/cars/${booking.listing.slug}`}
                    className='text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2'
                  >
                    View Listing <ExternalLink className='size-3' />
                  </Link>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Pick-up Date</p>
                  <p className='font-medium'>{format(new Date(booking.startDate), 'EEEE, MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Return Date</p>
                  <p className='font-medium'>{format(new Date(booking.endDate), 'EEEE, MMM d, yyyy')}</p>
                </div>
              </div>

              <div className='p-4 bg-primary/5 rounded-lg border border-primary/20 text-center'>
                <p className='text-3xl font-bold text-primary'>{booking.totalDays} days</p>
                <p className='text-sm text-muted-foreground'>Total rental duration</p>
              </div>

              {/* Trip Progress */}
              {booking.status === 'ACTIVE' && (
                <div className='p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20'>
                  <div className='flex items-center gap-2 text-emerald-600'>
                    <Activity className='size-5' />
                    <span className='font-medium'>Trip in Progress</span>
                  </div>
                  {booking.actualPickupTime && (
                    <p className='text-sm text-muted-foreground mt-2'>
                      Started: {format(new Date(booking.actualPickupTime), 'PPp')}
                    </p>
                  )}
                </div>
              )}

              {booking.status === 'COMPLETED' && (
                <div className='p-4 bg-blue-500/10 rounded-lg border border-blue-500/20'>
                  <div className='flex items-center gap-2 text-blue-600'>
                    <CheckCircle2 className='size-5' />
                    <span className='font-medium'>Trip Completed</span>
                  </div>
                  {booking.actualReturnTime && (
                    <p className='text-sm text-muted-foreground mt-2'>
                      Returned: {format(new Date(booking.actualReturnTime), 'PPp')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='size-5' />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Base Price</span>
                <span>{formatCurrency(booking.basePrice, booking.currency)}</span>
              </div>
              {/* Addons breakdown */}
              {booking.addonsBreakdown && booking.addonsBreakdown.length > 0 ? (
                booking.addonsBreakdown.map((addon, index) => (
                  <div key={index} className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      {addon.name} {addon.quantity > 1 && `×${addon.quantity}`}
                    </span>
                    <span>{formatCurrency(addon.total, booking.currency)}</span>
                  </div>
                ))
              ) : booking.addonsTotal > 0 ? (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Add-ons</span>
                  <span>{formatCurrency(booking.addonsTotal, booking.currency)}</span>
                </div>
              ) : null}
              {booking.deliveryFee > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Delivery Fee</span>
                  <span>{formatCurrency(booking.deliveryFee, booking.currency)}</span>
                </div>
              )}
              {booking.taxAmount > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tax</span>
                  <span>{formatCurrency(booking.taxAmount, booking.currency)}</span>
                </div>
              )}
              {booking.platformFee > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Service Fee ({Math.round(booking.platformRate * 100)}%)</span>
                  <span>{formatCurrency(booking.platformFee, booking.currency)}</span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between text-lg font-semibold'>
                <span>Total</span>
                <span className='text-primary'>{formatCurrency(booking.totalPrice, booking.currency)}</span>
              </div>
              {booking.depositHeld > 0 && (
                <div className='flex justify-between text-sm p-3 bg-amber-500/10 rounded-lg border border-amber-500/20'>
                  <span className='flex items-center gap-2'>
                    <Shield className='size-4 text-amber-500' />
                    Security Deposit (held)
                  </span>
                  <span>{formatCurrency(booking.depositHeld, booking.currency)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pickup/Dropoff */}
          {(booking.pickupAddress || booking.dropoffAddress) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='size-5' />
                  Locations
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Pick-up</p>
                    <Badge variant='outline' className='mb-2'>
                      {formatEnumValue(booking.pickupType)}
                    </Badge>
                    {booking.pickupAddress && <p className='text-sm'>{booking.pickupAddress}</p>}
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Drop-off</p>
                    <Badge variant='outline' className='mb-2'>
                      {formatEnumValue(booking.dropoffType)}
                    </Badge>
                    {booking.dropoffAddress && <p className='text-sm'>{booking.dropoffAddress}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='size-5' />
                Rental Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 mb-4'>
                <Avatar className='size-14'>
                  <AvatarImage src={booking.organization.logo || undefined} />
                  <AvatarFallback>
                    <Building2 className='size-6' />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-semibold'>{booking.organization.name}</p>
                </div>
              </div>
              <div className='space-y-2'>
                {booking.organization.email && (
                  <a
                    href={`mailto:${booking.organization.email}`}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
                  >
                    <Mail className='size-4' />
                    {booking.organization.email}
                  </a>
                )}
                {booking.organization.phoneNumber && (
                  <a
                    href={`tel:${booking.organization.phoneNumber}`}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
                  >
                    <Phone className='size-4' />
                    {booking.organization.phoneNumber}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='size-5' />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  booking.paymentStatus === 'PAID'
                    ? 'default'
                    : booking.paymentStatus === 'REFUNDED'
                      ? 'secondary'
                      : 'outline'
                }
                className='w-full justify-center py-2'
              >
                {formatEnumValue(booking.paymentStatus)}
              </Badge>
              {booking.paymentStatus === 'PAID' && (
                <p className='text-sm text-muted-foreground text-center mt-2'>
                  Your payment has been processed
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage your booking</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Cancellation Policy Info */}
                <div className='mb-4 p-3 bg-muted/50 rounded-lg text-sm'>
                  <p className='font-medium mb-1 capitalize'>
                    {formatEnumValue(booking.cancellationPolicy.policy)} Cancellation
                  </p>
                  <p className='text-muted-foreground text-xs mb-2'>
                    {booking.cancellationPolicy.description}
                  </p>
                  {booking.cancellationPolicy.refundInfo.refundable ? (
                    <p className='text-emerald-600 dark:text-emerald-400 text-xs'>
                      ✓ {booking.cancellationPolicy.refundInfo.refundPercentage}% refund available
                      {booking.cancellationPolicy.refundInfo.deadline && (
                        <span className='text-muted-foreground'>
                          {' '}(until {format(new Date(booking.cancellationPolicy.refundInfo.deadline), 'PPp')})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className='text-destructive text-xs'>✗ No refund available at this time</p>
                  )}
                </div>
                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Ban className='size-4 mr-2' />
                      Cancel Booking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Need Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button variant='outline' className='w-full' asChild>
                <Link href='/contact'>Contact Support</Link>
              </Button>
              <p className='text-xs text-muted-foreground text-center'>
                Available 24/7 for urgent inquiries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className='space-y-3'>
              <p>Are you sure you want to cancel this booking?</p>
              <div className='p-3 bg-muted rounded-lg text-foreground'>
                <p className='font-medium text-sm'>
                  {formatEnumValue(booking.cancellationPolicy.policy)} Cancellation Policy
                </p>
                {booking.cancellationPolicy.refundInfo.refundable ? (
                  <p className='text-emerald-600 dark:text-emerald-400 text-sm mt-1'>
                    You will receive a {booking.cancellationPolicy.refundInfo.refundPercentage}% refund
                    ({formatCurrency(
                      (booking.totalPrice - (booking.platformFee || 0)) * (booking.cancellationPolicy.refundInfo.refundPercentage / 100) + booking.depositHeld,
                      booking.currency
                    )})
                  </p>
                ) : (
                  <p className='text-destructive text-sm mt-1'>
                    No refund will be issued. Your security deposit ({formatCurrency(booking.depositHeld, booking.currency)}) will be returned.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBooking({ bookingId: booking.id })}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isCancelling ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Booking'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

