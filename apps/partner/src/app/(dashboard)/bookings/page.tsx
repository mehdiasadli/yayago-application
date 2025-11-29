'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Loader2,
  CalendarOff,
  ChevronRight,
  User,
  DollarSign,
  TrendingUp,
  Activity,
  Bell,
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

export default function PartnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming' | 'past'>('all');

  // Get booking stats
  const { data: stats, isLoading: isLoadingStats } = useQuery(
    orpc.bookings.getStats.queryOptions({ input: {} })
  );

  // Get bookings list
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error,
  } = useQuery(
    orpc.bookings.listPartnerBookings.queryOptions({
      input: {
        page: 1,
        take: 20,
        pendingOnly: activeTab === 'pending' ? true : undefined,
        upcoming: activeTab === 'upcoming' ? true : undefined,
        status:
          activeTab === 'past'
            ? ['COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_HOST', 'REJECTED']
            : undefined,
      },
    })
  );

  return (
    <div className='space-y-6'>
      <PageHeader title='Bookings' description='Manage your vehicle bookings and reservations' />

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                <Calendar className='size-5 text-primary' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {isLoadingStats ? <Skeleton className='h-7 w-12' /> : stats?.totalBookings || 0}
                </div>
                <p className='text-xs text-muted-foreground'>Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                <Bell className='size-5 text-amber-500' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {isLoadingStats ? <Skeleton className='h-7 w-12' /> : stats?.pendingApproval || 0}
                </div>
                <p className='text-xs text-muted-foreground'>Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                <Activity className='size-5 text-emerald-500' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {isLoadingStats ? <Skeleton className='h-7 w-12' /> : stats?.activeBookings || 0}
                </div>
                <p className='text-xs text-muted-foreground'>Active Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='size-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                <DollarSign className='size-5 text-blue-500' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {isLoadingStats ? (
                    <Skeleton className='h-7 w-16' />
                  ) : (
                    formatCurrency(stats?.revenueThisMonth || 0, stats?.currency || 'AED')
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings Preview */}
      {stats?.upcomingBookings && stats.upcomingBookings.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <TrendingUp className='size-4' />
              Upcoming This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className='flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='size-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Calendar className='size-5 text-primary' />
                    </div>
                    <div>
                      <p className='font-medium'>{booking.listing.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {booking.user.name} • {format(new Date(booking.startDate), 'EEE, MMM d')}
                      </p>
                    </div>
                  </div>
                  <Badge variant='outline'>{booking.referenceCode}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='pending'>
            Pending
            {stats?.pendingApproval ? (
              <Badge variant='destructive' className='ml-2 size-5 p-0 text-xs justify-center'>
                {stats.pendingApproval}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='past'>Past</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {isLoadingBookings ? (
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='py-4'>
                <div className='flex gap-4'>
                  <Skeleton className='size-20 rounded-lg flex-shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-48' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-10 w-24' />
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
            <p className='text-sm text-muted-foreground'>
              {activeTab === 'pending'
                ? 'No bookings waiting for your approval.'
                : activeTab === 'upcoming'
                  ? 'No upcoming bookings.'
                  : 'No bookings yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {bookingsData?.items.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status);
            return (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
                <Card className='hover:border-primary/50 transition-all cursor-pointer group'>
                  <CardContent className='py-4'>
                    <div className='flex gap-4'>
                      {/* Image */}
                      {booking.listing.primaryImage ? (
                        <img
                          src={booking.listing.primaryImage}
                          alt={booking.listing.title}
                          className='size-20 rounded-lg object-cover flex-shrink-0'
                        />
                      ) : (
                        <div className='size-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0'>
                          <Car className='size-8 text-muted-foreground' />
                        </div>
                      )}

                      {/* Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='font-semibold truncate'>{booking.listing.title}</h3>
                              <Badge variant='outline' className='text-xs'>
                                {booking.referenceCode}
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            <StatusIcon className='size-3 mr-1' />
                            {formatEnumValue(booking.status)}
                          </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className='flex items-center gap-3 mt-3'>
                          <Avatar className='size-8'>
                            <AvatarImage src={booking.user.image || undefined} />
                            <AvatarFallback>
                              <User className='size-4' />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='text-sm font-medium'>{booking.user.name}</p>
                            <p className='text-xs text-muted-foreground'>{booking.user.email}</p>
                          </div>
                        </div>

                        {/* Booking Details */}
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
                      </div>

                      {/* Action Button */}
                      <div className='flex items-center gap-2'>
                        {booking.requiresAction && (
                          <Badge variant='warning' className='animate-pulse'>
                            Action Required
                          </Badge>
                        )}
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
    </div>
  );
}

