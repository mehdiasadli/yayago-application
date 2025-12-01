'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { CheckCircle2, Clock, Calendar, Car, MapPin, CreditCard, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
import { orpc } from '@/utils/orpc';
import { format } from 'date-fns';
import Confetti from 'react-confetti';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    ...orpc.bookings.getMyBooking.queryOptions({
      input: { bookingId: bookingId! },
    }),
    enabled: !!bookingId,
  });

  if (!bookingId) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>
        <div className='max-w-md mx-auto'>
          <AlertTriangle className='size-16 mx-auto mb-4 text-amber-500' />
          <h1 className='text-2xl font-bold mb-2'>Invalid Booking</h1>
          <p className='text-muted-foreground mb-6'>No booking ID was provided.</p>
          <Button asChild>
            <Link href='/rent/cars'>Browse Vehicles</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-2xl mx-auto'>
          <Skeleton className='h-16 w-16 rounded-full mx-auto mb-4' />
          <Skeleton className='h-8 w-48 mx-auto mb-2' />
          <Skeleton className='h-4 w-64 mx-auto mb-8' />
          <Skeleton className='h-64 w-full rounded-xl' />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>
        <div className='max-w-md mx-auto'>
          <AlertTriangle className='size-16 mx-auto mb-4 text-amber-500' />
          <h1 className='text-2xl font-bold mb-2'>Booking Not Found</h1>
          <p className='text-muted-foreground mb-6'>We couldn't find this booking.</p>
          <Button asChild>
            <Link href='/bookings'>View My Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isInstantBooking = booking.status === 'APPROVED';
  const isPendingApproval = booking.status === 'PENDING_APPROVAL';

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-2xl mx-auto'>
          {/* Success Header */}
          <div className='text-center mb-8'>
            <div className='size-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
              <CheckCircle2 className='size-10 text-emerald-600' />
            </div>
            <h1 className='text-3xl font-bold mb-2'>
              {isInstantBooking ? 'Booking Confirmed!' : 'Booking Request Submitted!'}
            </h1>
            <p className='text-muted-foreground'>
              {isInstantBooking
                ? 'Your booking has been confirmed. Get ready for your trip!'
                : 'The host will review your request and respond within 24 hours.'}
            </p>
          </div>

          {/* Status Badge */}
          <div className='flex justify-center mb-8'>
            {isInstantBooking ? (
              <Badge className='px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-500'>
                <Zap className='size-4 mr-2' />
                Instantly Confirmed
              </Badge>
            ) : (
              <Badge variant='destructive' className='px-4 py-2 text-sm'>
                <Clock className='size-4 mr-2' />
                Pending Host Approval
              </Badge>
            )}
          </div>

          {/* Booking Details Card */}
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Booking Details</CardTitle>
                <Badge variant='outline'>{booking.referenceCode}</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Vehicle Info */}
              <div className='flex items-center gap-4'>
                {booking.listing.primaryImage ? (
                  <img
                    src={booking.listing.primaryImage}
                    alt={booking.listing.title}
                    className='size-20 rounded-xl object-cover'
                  />
                ) : (
                  <div className='size-20 rounded-xl bg-muted flex items-center justify-center'>
                    <Car className='size-8 text-muted-foreground' />
                  </div>
                )}
                <div>
                  <h3 className='font-semibold text-lg'>{booking.listing.title}</h3>
                  <p className='text-muted-foreground'>
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                  <p className='text-sm text-muted-foreground'>{booking.organization.name}</p>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-muted/50 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Calendar className='size-4' />
                    Pick-up
                  </div>
                  <p className='font-semibold'>{format(new Date(booking.startDate), 'EEE, MMM d, yyyy')}</p>
                </div>
                <div className='p-4 bg-muted/50 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-1'>
                    <Calendar className='size-4' />
                    Return
                  </div>
                  <p className='font-semibold'>{format(new Date(booking.endDate), 'EEE, MMM d, yyyy')}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Rental ({booking.totalDays} days)</span>
                  <span>{formatCurrency(booking.basePrice, booking.currency)}</span>
                </div>
                {booking.taxAmount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Tax</span>
                    <span>{formatCurrency(booking.taxAmount, booking.currency)}</span>
                  </div>
                )}
                {booking.depositHeld > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Security Deposit</span>
                    <span>{formatCurrency(booking.depositHeld, booking.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className='flex justify-between'>
                  <span className='font-semibold'>Total Paid</span>
                  <span className='font-bold text-lg'>
                    {formatCurrency(booking.totalPrice + booking.depositHeld, booking.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='text-lg'>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {isPendingApproval && (
                  <div className='flex items-start gap-4'>
                    <div className='size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0'>
                      <Clock className='size-4 text-amber-600' />
                    </div>
                    <div>
                      <p className='font-medium'>Wait for host approval</p>
                      <p className='text-sm text-muted-foreground'>
                        The host will review your booking request and respond within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex items-start gap-4'>
                  <div className='size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                    <CreditCard className='size-4 text-blue-600' />
                  </div>
                  <div>
                    <p className='font-medium'>Check your email</p>
                    <p className='text-sm text-muted-foreground'>
                      We've sent a confirmation email with all the booking details.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0'>
                    <MapPin className='size-4 text-emerald-600' />
                  </div>
                  <div>
                    <p className='font-medium'>Plan your pickup</p>
                    <p className='text-sm text-muted-foreground'>
                      Contact the host to confirm pickup location and time details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Contact */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Host Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                <div className='size-12 rounded-full bg-primary/10 flex items-center justify-center'>
                  <span className='text-lg font-semibold text-primary'>{booking.organization.name[0]}</span>
                </div>
                <div className='flex-1'>
                  <p className='font-semibold'>{booking.organization.name}</p>
                  <div className='flex flex-wrap gap-3 mt-2'>
                    {booking.organization.phoneNumber && (
                      <a
                        href={`tel:${booking.organization.phoneNumber}`}
                        className='text-sm text-primary hover:underline'
                      >
                        {booking.organization.phoneNumber}
                      </a>
                    )}
                    {booking.organization.email && (
                      <a href={`mailto:${booking.organization.email}`} className='text-sm text-primary hover:underline'>
                        {booking.organization.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <Button asChild className='flex-1'>
              <Link href='/account/bookings'>
                View My Bookings
                <ArrowRight className='size-4 ml-2' />
              </Link>
            </Button>
            <Button asChild variant='outline' className='flex-1'>
              <Link href='/rent/cars'>Browse More Vehicles</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
