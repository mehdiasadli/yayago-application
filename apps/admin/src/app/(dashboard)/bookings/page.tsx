'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import {
  Calendar,
  Search,
  AlertTriangle,
  CalendarOff,
  ChevronRight,
  Building2,
  User,
  Filter,
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

type PaymentStatus = 'NOT_PAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED';

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
      return 'destructive';
    default:
      return 'secondary';
  }
}

const statusOptions: BookingStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
  'REJECTED',
  'CANCELLED_BY_USER',
  'CANCELLED_BY_HOST',
  'DISPUTED',
];

const paymentOptions: PaymentStatus[] = ['NOT_PAID', 'AUTHORIZED', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED'];

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const {
    data: bookingsData,
    isLoading,
    error,
  } = useQuery(
    orpc.bookings.listAll.queryOptions({
      input: {
        page,
        take: 20,
        q: searchQuery || undefined,
        status: statusFilter !== 'all' ? [statusFilter] : undefined,
        paymentStatus: paymentFilter !== 'all' ? [paymentFilter] : undefined,
      },
    })
  );

  return (
    <div className='space-y-6'>
      <PageHeader title='All Bookings' description='View and manage all bookings across the platform' />

      {/* Filters */}
      <Card>
        <CardContent className='py-4'>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  placeholder='Search by reference code...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className='w-[180px]'>
                <Filter className='size-4 mr-2' />
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatEnumValue(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Payment' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Payments</SelectItem>
                {paymentOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatEnumValue(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {bookingsData && (
        <p className='text-sm text-muted-foreground'>
          Showing {bookingsData.items.length} of {bookingsData.pagination.total} bookings
        </p>
      )}

      {/* Bookings List */}
      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='py-4'>
                <div className='flex gap-4'>
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-48' />
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
            <p className='text-sm text-muted-foreground'>Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {bookingsData?.items.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className='hover:border-primary/50 transition-all cursor-pointer group'>
                <CardContent className='py-4'>
                  <div className='flex items-center gap-4'>
                    {/* Reference Code */}
                    <div className='min-w-[100px]'>
                      <Badge variant='outline' className='font-mono'>
                        {booking.referenceCode}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium truncate'>{booking.listing.title}</h3>
                      <div className='flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <User className='size-3' />
                          {booking.user.name}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Building2 className='size-3' />
                          {booking.organization.name}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className='hidden md:block text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='size-3' />
                        {format(new Date(booking.startDate), 'MMM d')} -{' '}
                        {format(new Date(booking.endDate), 'MMM d, yyyy')}
                      </div>
                      <div className='text-xs'>{booking.totalDays} days</div>
                    </div>

                    {/* Amount */}
                    <div className='text-right'>
                      <p className='font-semibold'>{formatCurrency(booking.totalPrice, booking.currency)}</p>
                    </div>

                    {/* Status */}
                    <div className='flex flex-col gap-1 items-end min-w-[100px]'>
                      <Badge variant={getStatusBadgeVariant(booking.status)} className='text-xs'>
                        {formatEnumValue(booking.status)}
                      </Badge>
                      <Badge variant={getPaymentBadgeVariant(booking.paymentStatus)} className='text-xs'>
                        {formatEnumValue(booking.paymentStatus)}
                      </Badge>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className='size-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {bookingsData && bookingsData.pagination.totalPages > 1 && (
        <div className='flex items-center justify-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className='text-sm text-muted-foreground'>
            Page {page} of {bookingsData.pagination.totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page === bookingsData.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
