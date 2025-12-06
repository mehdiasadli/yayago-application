'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
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
  Building2,
  ExternalLink,
  Activity,
  CreditCard,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { orpc } from '@/utils/orpc';
import { format } from 'date-fns';

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

type PaymentStatus = 'NOT_PAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED' | 'DISPUTED';

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

function getPaymentBadgeVariant(status: PaymentStatus): BadgeProps['variant'] {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'AUTHORIZED':
      return 'info';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'warning';
    case 'FAILED':
    case 'DISPUTED':
      return 'destructive';
    default:
      return 'secondary';
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

export default function AdminBookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = use(params);

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery(
    orpc.bookings.getAdminBooking.queryOptions({
      input: { bookingId: id },
    })
  );

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
            <Skeleton className='h-64' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' asChild>
          <Link href='/bookings'>
            <ArrowLeft className='size-4 mr-2' />
            Back to Bookings
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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/bookings'>
              <ArrowLeft className='size-5' />
            </Link>
          </Button>
          <div>
            <PageHeader
              title={
                <div className='flex items-center gap-3'>
                  <span className='font-mono text-xl'>{booking.referenceCode}</span>
                  <Badge variant={getStatusBadgeVariant(booking.status)} size='lg'>
                    <StatusIcon className='size-4 mr-1' />
                    {formatEnumValue(booking.status)}
                  </Badge>
                  <Badge variant={getPaymentBadgeVariant(booking.paymentStatus)}>
                    <CreditCard className='size-3 mr-1' />
                    {formatEnumValue(booking.paymentStatus)}
                  </Badge>
                </div>
              }
              description={`Created ${format(new Date(booking.createdAt), 'PPP')}`}
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='size-5' />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Listing Info */}
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
                    href={`/listings/${booking.listing.slug}`}
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
                  <p className='font-medium'>{format(new Date(booking.startDate), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Return Date</p>
                  <p className='font-medium'>{format(new Date(booking.endDate), 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className='p-4 bg-primary/5 rounded-lg border border-primary/20'>
                <p className='text-2xl font-bold text-primary'>{booking.totalDays} days</p>
                <p className='text-sm text-muted-foreground'>Total rental duration</p>
              </div>

              {/* Trip Status */}
              {(booking.actualPickupTime || booking.actualReturnTime) && (
                <>
                  <Separator />
                  <div>
                    <h4 className='font-medium mb-4'>Trip Progress</h4>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-muted-foreground'>Actual Pick-up</p>
                        <p className='font-medium'>
                          {booking.actualPickupTime
                            ? format(new Date(booking.actualPickupTime), 'PPp')
                            : 'Not started'}
                        </p>
                        {booking.startOdometer && (
                          <p className='text-sm text-muted-foreground'>
                            Odometer: {booking.startOdometer.toLocaleString()} km
                          </p>
                        )}
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>Actual Return</p>
                        <p className='font-medium'>
                          {booking.actualReturnTime
                            ? format(new Date(booking.actualReturnTime), 'PPp')
                            : 'Not returned'}
                        </p>
                        {booking.endOdometer && (
                          <p className='text-sm text-muted-foreground'>
                            Odometer: {booking.endOdometer.toLocaleString()} km
                          </p>
                        )}
                      </div>
                    </div>
                    {booking.startOdometer && booking.endOdometer && (
                      <p className='text-sm mt-2'>
                        Total Distance: {(booking.endOdometer - booking.startOdometer).toLocaleString()} km
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
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
              {booking.addonsTotal > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Add-ons</span>
                  <span>{formatCurrency(booking.addonsTotal, booking.currency)}</span>
                </div>
              )}
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
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='size-5' />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4 mb-4'>
                <Avatar className='size-14'>
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
              <div className='space-y-2'>
                <a
                  href={`mailto:${booking.user.email}`}
                  className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
                >
                  <Mail className='size-4' />
                  {booking.user.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='size-5' />
                Host Organization
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
                  <p className='text-sm text-muted-foreground'>@{booking.organization.slug}</p>
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
              <Link
                href={`/organizations/${booking.organization.slug}`}
                className='text-sm text-primary hover:underline inline-flex items-center gap-1 mt-4'
              >
                View Organization <ExternalLink className='size-3' />
              </Link>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='size-5' />
                Booking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <div>
                    <p className='text-sm font-medium'>Booking Created</p>
                    <p className='text-xs text-muted-foreground'>
                      {format(new Date(booking.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
                {booking.actualPickupTime && (
                  <div className='flex gap-3'>
                    <div className='w-2 h-2 rounded-full bg-emerald-500 mt-2' />
                    <div>
                      <p className='text-sm font-medium'>Trip Started</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(booking.actualPickupTime), 'PPp')}
                      </p>
                    </div>
                  </div>
                )}
                {booking.actualReturnTime && (
                  <div className='flex gap-3'>
                    <div className='w-2 h-2 rounded-full bg-blue-500 mt-2' />
                    <div>
                      <p className='text-sm font-medium'>Trip Completed</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(booking.actualReturnTime), 'PPp')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

