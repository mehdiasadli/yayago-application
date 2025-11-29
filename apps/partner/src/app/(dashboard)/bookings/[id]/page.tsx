'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Shield,
  Loader2,
  Play,
  Square,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
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

function getStatusBadgeVariant(status: BookingStatus): BadgeProps['variant'] {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'success';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'ACTIVE':
      return 'info';
    case 'REJECTED':
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_HOST':
      return 'destructive';
    case 'DISPUTED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStartTripDialog, setShowStartTripDialog] = useState(false);
  const [showCompleteTripDialog, setShowCompleteTripDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery(
    orpc.bookings.getPartnerBooking.queryOptions({
      input: { bookingId: id },
    })
  );

  const { mutate: updateStatus, isPending: isUpdating } = useMutation(
    orpc.bookings.updateStatus.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success(`Booking ${data.status === 'APPROVED' ? 'approved' : data.status === 'REJECTED' ? 'rejected' : 'updated'}`);
        setShowRejectDialog(false);
        setShowCancelDialog(false);
        setRejectReason('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update booking');
      },
    })
  );

  const { mutate: startTrip, isPending: isStartingTrip } = useMutation(
    orpc.bookings.startTrip.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success('Trip started successfully');
        setShowStartTripDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to start trip');
      },
    })
  );

  const { mutate: completeTrip, isPending: isCompletingTrip } = useMutation(
    orpc.bookings.completeTrip.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast.success('Trip completed successfully');
        setShowCompleteTripDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to complete trip');
      },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className='space-y-6'>
        <PageHeader
          title={
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/bookings'>
                  <ArrowLeft className='size-4' />
                </Link>
              </Button>
              <span>Booking Not Found</span>
            </div>
          }
        />
        <Card>
          <CardContent className='py-16 text-center'>
            <AlertTriangle className='size-12 mx-auto mb-4 text-amber-500' />
            <p className='text-lg font-medium'>Booking not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = booking.status === 'PENDING_APPROVAL';
  const isApproved = booking.status === 'APPROVED';
  const isActive = booking.status === 'ACTIVE';
  const canCancel = ['PENDING_APPROVAL', 'APPROVED'].includes(booking.status);

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/bookings'>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <span>Booking {booking.referenceCode}</span>
          </div>
        }
        description={booking.listing.title}
      >
        <Badge variant={getStatusBadgeVariant(booking.status)} className='text-sm'>
          {formatEnumValue(booking.status)}
        </Badge>
      </PageHeader>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Action Required Alert */}
          {isPending && (
            <Card className='border-amber-500/50 bg-amber-50 dark:bg-amber-950/20'>
              <CardContent className='py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Clock className='size-5 text-amber-600' />
                    <div>
                      <p className='font-semibold text-amber-900 dark:text-amber-100'>Action Required</p>
                      <p className='text-sm text-amber-700 dark:text-amber-300'>
                        Please approve or reject this booking request
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' onClick={() => setShowRejectDialog(true)} disabled={isUpdating}>
                      <XCircle className='size-4 mr-2' />
                      Reject
                    </Button>
                    <Button
                      onClick={() => updateStatus({ bookingId: id, action: 'approve' })}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                      ) : (
                        <CheckCircle2 className='size-4 mr-2' />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Controls */}
          {isApproved && (
            <Card className='border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20'>
              <CardContent className='py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Car className='size-5 text-emerald-600' />
                    <div>
                      <p className='font-semibold text-emerald-900 dark:text-emerald-100'>Ready for Pickup</p>
                      <p className='text-sm text-emerald-700 dark:text-emerald-300'>
                        Start the trip when customer picks up the vehicle
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowStartTripDialog(true)}>
                    <Play className='size-4 mr-2' />
                    Start Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isActive && (
            <Card className='border-blue-500/50 bg-blue-50 dark:bg-blue-950/20'>
              <CardContent className='py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Car className='size-5 text-blue-600' />
                    <div>
                      <p className='font-semibold text-blue-900 dark:text-blue-100'>Trip in Progress</p>
                      <p className='text-sm text-blue-700 dark:text-blue-300'>
                        Complete the trip when vehicle is returned
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCompleteTripDialog(true)}>
                    <Square className='size-4 mr-2' />
                    Complete Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                {booking.listing.primaryImage ? (
                  <img
                    src={booking.listing.primaryImage}
                    alt={booking.listing.title}
                    className='size-24 rounded-xl object-cover'
                  />
                ) : (
                  <div className='size-24 rounded-xl bg-muted flex items-center justify-center'>
                    <Car className='size-10 text-muted-foreground' />
                  </div>
                )}
                <div>
                  <h3 className='font-semibold text-lg'>{booking.listing.title}</h3>
                  <p className='text-muted-foreground'>
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                  {booking.vehicle.licensePlate && (
                    <Badge variant='outline' className='mt-2'>
                      {booking.vehicle.licensePlate}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-muted/50 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Calendar className='size-4' />
                    Pick-up
                  </div>
                  <p className='font-semibold'>{format(new Date(booking.startDate), 'EEE, MMM d, yyyy')}</p>
                  {booking.pickupAddress && (
                    <p className='text-sm text-muted-foreground mt-1'>{booking.pickupAddress}</p>
                  )}
                </div>
                <div className='p-4 bg-muted/50 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Calendar className='size-4' />
                    Return
                  </div>
                  <p className='font-semibold'>{format(new Date(booking.endDate), 'EEE, MMM d, yyyy')}</p>
                  {booking.dropoffAddress && (
                    <p className='text-sm text-muted-foreground mt-1'>{booking.dropoffAddress}</p>
                  )}
                </div>
              </div>

              <div className='mt-4 text-center'>
                <Badge variant='secondary' className='text-sm'>
                  {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} rental
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Trip Data */}
          {(booking.actualPickupTime || booking.actualReturnTime) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Trip Data</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {booking.actualPickupTime && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Actual Pickup</span>
                    <span className='font-medium'>
                      {format(new Date(booking.actualPickupTime), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                {booking.actualReturnTime && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Actual Return</span>
                    <span className='font-medium'>
                      {format(new Date(booking.actualReturnTime), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                {booking.startOdometer && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Start Odometer</span>
                    <span className='font-medium'>{booking.startOdometer.toLocaleString()} km</span>
                  </div>
                )}
                {booking.endOdometer && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>End Odometer</span>
                    <span className='font-medium'>{booking.endOdometer.toLocaleString()} km</span>
                  </div>
                )}
                {booking.startOdometer && booking.endOdometer && (
                  <>
                    <Separator />
                    <div className='flex justify-between'>
                      <span className='font-medium'>Total Distance</span>
                      <span className='font-bold'>
                        {(booking.endOdometer - booking.startOdometer).toLocaleString()} km
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-3'>
                <Avatar className='size-12'>
                  <AvatarImage src={booking.user.image || undefined} />
                  <AvatarFallback>
                    <User className='size-6' />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-semibold'>{booking.user.name}</p>
                  <p className='text-sm text-muted-foreground'>{booking.user.email}</p>
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <a
                  href={`mailto:${booking.user.email}`}
                  className='flex items-center gap-2 text-sm text-primary hover:underline'
                >
                  <Mail className='size-4' />
                  {booking.user.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Payment</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Rental ({booking.totalDays} days)</span>
                <span>{formatCurrency(booking.basePrice, booking.currency)}</span>
              </div>
              {booking.addonsTotal > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Add-ons</span>
                  <span>{formatCurrency(booking.addonsTotal, booking.currency)}</span>
                </div>
              )}
              {booking.deliveryFee > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Delivery</span>
                  <span>{formatCurrency(booking.deliveryFee, booking.currency)}</span>
                </div>
              )}
              {booking.taxAmount > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Tax</span>
                  <span>{formatCurrency(booking.taxAmount, booking.currency)}</span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between'>
                <span className='font-semibold'>Rental Total</span>
                <span className='font-bold'>{formatCurrency(booking.totalPrice, booking.currency)}</span>
              </div>
              {booking.depositHeld > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Shield className='size-3' />
                    Security Deposit
                  </span>
                  <span>{formatCurrency(booking.depositHeld, booking.currency)}</span>
                </div>
              )}
              <Separator />
              <div className='flex justify-between'>
                <span className='font-semibold'>Total Collected</span>
                <span className='font-bold text-lg text-primary'>
                  {formatCurrency(booking.totalPrice + booking.depositHeld, booking.currency)}
                </span>
              </div>
              <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'} className='w-full justify-center'>
                {formatEnumValue(booking.paymentStatus)}
              </Badge>
            </CardContent>
          </Card>

          {/* Actions */}
          {canCancel && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isUpdating}
                >
                  <Ban className='size-4 mr-2' />
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this booking? The customer will be notified and refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <Textarea
              placeholder='Reason for rejection (optional)'
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus({ bookingId: id, action: 'reject', reason: rejectReason })}
              disabled={isUpdating}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isUpdating ? <Loader2 className='size-4 mr-2 animate-spin' /> : <XCircle className='size-4 mr-2' />}
              Reject Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? The customer will be notified and refunded according to the
              cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus({ bookingId: id, action: 'cancel' })}
              disabled={isUpdating}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isUpdating ? <Loader2 className='size-4 mr-2 animate-spin' /> : <Ban className='size-4 mr-2' />}
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Trip Dialog */}
      <AlertDialog open={showStartTripDialog} onOpenChange={setShowStartTripDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Record the vehicle handover. Enter the odometer reading if available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <label className='text-sm font-medium'>Start Odometer (km)</label>
            <Input
              type='number'
              placeholder='e.g., 50000'
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
              className='mt-2'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStartingTrip}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTrip({
                  bookingId: id,
                  startOdometer: startOdometer ? parseInt(startOdometer) : undefined,
                })
              }
              disabled={isStartingTrip}
            >
              {isStartingTrip ? <Loader2 className='size-4 mr-2 animate-spin' /> : <Play className='size-4 mr-2' />}
              Start Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Trip Dialog */}
      <AlertDialog open={showCompleteTripDialog} onOpenChange={setShowCompleteTripDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Trip</AlertDialogTitle>
            <AlertDialogDescription>Record the vehicle return. Enter the odometer reading if available.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <label className='text-sm font-medium'>End Odometer (km)</label>
            <Input
              type='number'
              placeholder='e.g., 50500'
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
              className='mt-2'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompletingTrip}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                completeTrip({
                  bookingId: id,
                  endOdometer: endOdometer ? parseInt(endOdometer) : undefined,
                })
              }
              disabled={isCompletingTrip}
            >
              {isCompletingTrip ? <Loader2 className='size-4 mr-2 animate-spin' /> : <Square className='size-4 mr-2' />}
              Complete Trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

