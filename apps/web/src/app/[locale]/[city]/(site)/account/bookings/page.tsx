'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  CalendarOff,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
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

export default function AccountBookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const statusFilters: Record<string, BookingStatus[]> = {
    upcoming: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE'],
    past: ['COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_HOST', 'REJECTED'],
    all: [],
  };

  const {
    data: bookingsData,
    isLoading,
    error,
  } = useQuery(
    orpc.bookings.listMyBookings.queryOptions({
      input: {
        page: 1,
        take: 20,
        status: statusFilters[activeTab].length > 0 ? statusFilters[activeTab] : undefined,
        upcoming: activeTab === 'upcoming' ? true : undefined,
      },
    })
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>My Bookings</h2>
          <p className='text-muted-foreground'>View and manage your car rental bookings</p>
        </div>
        <Button asChild>
          <Link href='/rent/cars'>
            Find a Car
            <ArrowRight className='size-4 ml-2' />
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className='grid w-full grid-cols-3 max-w-sm'>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='past'>Past</TabsTrigger>
          <TabsTrigger value='all'>All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='py-4'>
                <div className='flex gap-4'>
                  <Skeleton className='size-20 rounded-lg shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-48' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-8 w-24' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <AlertTriangle className='size-12 mx-auto mb-4 text-amber-500' />
            <p className='text-lg font-medium'>Failed to load bookings</p>
            <p className='text-sm text-muted-foreground'>Please try again later.</p>
          </CardContent>
        </Card>
      ) : bookingsData?.items.length === 0 ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <CalendarOff className='size-16 mx-auto mb-4 text-muted-foreground' />
            <p className='text-lg font-medium'>No bookings found</p>
            <p className='text-sm text-muted-foreground mb-6'>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming bookings."
                : activeTab === 'past'
                  ? "You don't have any past bookings."
                  : "You haven't made any bookings yet."}
            </p>
            <Button asChild>
              <Link href='/rent/cars'>Browse Available Cars</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-col gap-2'>
          {bookingsData?.items.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status);

            return (
              <Link key={booking.id} href={`/account/bookings/${booking.id}`}>
                <Card className='hover:border-primary/50 transition-all cursor-pointer group'>
                  <CardContent className='py-4'>
                    <div className='flex gap-4'>
                      {/* Image */}
                      {booking.listing.primaryImage ? (
                        <img
                          src={booking.listing.primaryImage}
                          alt={booking.listing.title}
                          className='size-20 rounded-lg object-cover shrink-0'
                        />
                      ) : (
                        <div className='size-20 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                          <Car className='size-8 text-muted-foreground' />
                        </div>
                      )}

                      {/* Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div>
                            <h3 className='font-semibold truncate'>{booking.listing.title}</h3>
                            <p className='text-sm text-muted-foreground'>
                              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)} className='shrink-0'>
                            <StatusIcon className='size-3 mr-1' />
                            {formatEnumValue(booking.status)}
                          </Badge>
                        </div>

                        <div className='flex flex-wrap items-center gap-4 mt-3 text-sm'>
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <Calendar className='size-4' />
                            <span>
                              {format(new Date(booking.startDate), 'MMM d')} -{' '}
                              {format(new Date(booking.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className='text-muted-foreground'>{booking.totalDays} days</div>
                          <div className='font-semibold text-primary'>
                            {formatCurrency(booking.totalPrice, booking.currency)}
                          </div>
                        </div>

                        <p className='text-sm text-muted-foreground mt-2'>{booking.organization.name}</p>
                      </div>

                      {/* Arrow */}
                      <div className='flex items-center'>
                        <ChevronRight className='size-5 text-muted-foreground group-hover:text-primary transition-colors' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {bookingsData && bookingsData.pagination.totalPages > 1 && (
        <div className='flex justify-center'>
          <p className='text-sm text-muted-foreground'>
            Page {bookingsData.pagination.page} of {bookingsData.pagination.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
