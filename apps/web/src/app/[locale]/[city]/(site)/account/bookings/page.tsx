'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Activity,
  Search,
  Building2,
  CalendarClock,
  History,
  ListFilter,
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

type BookingCardData = {
  id: string;
  referenceCode?: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  currency: string;
  listing: { title: string; primaryImage: string | null };
  vehicle: { year: number; make: string; model: string };
  organization: { name: string };
  createdAt?: Date;
};

// ============ Status Configuration ============
const statusConfig: Record<BookingStatus, { color: string; bgColor: string; icon: React.ElementType; label: string }> =
  {
    DRAFT: { color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: Clock, label: 'Draft' },
    PENDING_APPROVAL: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      icon: Clock,
      label: 'Pending',
    },
    APPROVED: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: CheckCircle2,
      label: 'Approved',
    },
    REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: XCircle, label: 'Rejected' },
    ACTIVE: {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: Activity,
      label: 'Active',
    },
    COMPLETED: {
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: CheckCircle2,
      label: 'Completed',
    },
    CANCELLED_BY_USER: {
      color: 'text-rose-600',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      icon: XCircle,
      label: 'Cancelled',
    },
    CANCELLED_BY_HOST: {
      color: 'text-rose-600',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      icon: XCircle,
      label: 'Cancelled by Host',
    },
    DISPUTED: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      icon: AlertTriangle,
      label: 'Disputed',
    },
  };

const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
  { id: 'past', label: 'Past', icon: History },
  { id: 'all', label: 'All', icon: ListFilter },
] as const;

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

  // Use mock data if enabled, otherwise use real data
  const displayBookings = bookingsData?.items || [];

  const showLoading = isLoading;
  const showError = error;
  const isEmpty = displayBookings.length === 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-2xl border bg-card overflow-hidden'>
        <div className='p-5 sm:p-6 bg-linear-to-r from-blue-500/10 via-primary/5 to-violet-500/10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-primary/10 shrink-0'>
                <CalendarDays className='size-7 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl font-bold'>My Bookings</h1>
                <p className='text-muted-foreground text-sm'>View and manage your car rental bookings</p>
              </div>
            </div>
            <Button asChild className='rounded-xl gap-2 shadow-lg shadow-primary/20'>
              <Link href='/rent/cars'>
                <Search className='size-4' />
                Find a Car
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className='px-4 sm:px-6 py-3 border-t bg-muted/30'>
          <div className='flex gap-2'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-card border hover:bg-accent'
                )}
              >
                <tab.icon className='size-4' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {showLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      ) : showError ? (
        <ErrorState />
      ) : isEmpty ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <div className='space-y-3'>
          {displayBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {bookingsData && bookingsData.pagination.totalPages > 1 && (
        <div className='flex justify-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground'>
            Page {bookingsData.pagination.page} of {bookingsData.pagination.totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Booking Card Component ============
function BookingCard({ booking }: { booking: BookingCardData }) {
  const config = statusConfig[booking.status];
  const StatusIcon = config.icon;
  const isActive = booking.status === 'ACTIVE';

  return (
    <Link href={`/account/bookings/${booking.id}`} className='block group'>
      <div
        className={cn(
          'rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30',
          isActive && 'ring-2 ring-emerald-500/20'
        )}
      >
        <div className='flex flex-col sm:flex-row'>
          {/* Image */}
          <div className='relative w-full sm:w-52 h-44 sm:h-auto shrink-0'>
            {booking.listing.primaryImage ? (
              <img
                src={booking.listing.primaryImage}
                alt={booking.listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
              />
            ) : (
              <div className='w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center'>
                <Car className='size-12 text-muted-foreground' />
              </div>
            )}
            {/* Dark overlay for better badge visibility */}
            <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30' />
            {/* Status Badge Overlay - now with backdrop blur */}
            <div className='absolute top-3 left-3'>
              <Badge className='gap-1.5 px-2.5 py-1.5 border-0 shadow-lg backdrop-blur-md bg-black/50 text-white font-medium'>
                <StatusIcon className='size-3.5' />
                {config.label}
              </Badge>
            </div>
            {/* Active indicator */}
            {isActive && (
              <div className='absolute bottom-3 left-3 right-3'>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium shadow-lg'>
                  <span className='relative flex size-2'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75' />
                    <span className='relative inline-flex rounded-full size-2 bg-white' />
                  </span>
                  Currently Active
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 p-4 sm:p-5 flex flex-col min-w-0'>
            {/* Header Row: Title + Reference */}
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1'>
                  {booking.listing.title}
                </h3>
                <p className='text-sm text-muted-foreground mt-0.5'>
                  {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                </p>
              </div>
              {booking.referenceCode && (
                <Badge variant='outline' className='shrink-0 font-mono text-xs'>
                  {booking.referenceCode}
                </Badge>
              )}
            </div>

            {/* Details Grid */}
            <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3'>
              <div className='flex items-center gap-2.5 text-sm'>
                <div className='p-2 rounded-lg bg-blue-500/10'>
                  <Calendar className='size-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Rental Period</p>
                  <p className='font-medium'>
                    {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2.5 text-sm'>
                <div className='p-2 rounded-lg bg-emerald-500/10'>
                  <Building2 className='size-4 text-emerald-500' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Provider</p>
                  <p className='font-medium truncate'>{booking.organization.name}</p>
                </div>
              </div>
              {booking.createdAt && (
                <div className='flex items-center gap-2.5 text-sm'>
                  <div className='p-2 rounded-lg bg-violet-500/10'>
                    <Clock className='size-4 text-violet-500' />
                  </div>
                  <div>
                    <p className='text-muted-foreground text-xs'>Booked On</p>
                    <p className='font-medium'>{format(new Date(booking.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='mt-6 pt-4 flex items-center justify-between border-t border-dashed'>
              <div className='text-sm text-muted-foreground'>
                {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} rental
              </div>
              <div className='flex items-center gap-3'>
                <p className='text-xl font-bold text-primary'>{formatCurrency(booking.totalPrice, booking.currency)}</p>
                <ChevronRight className='size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============ Empty State ============
function EmptyState({ activeTab }: { activeTab: string }) {
  const messages = {
    upcoming: {
      title: 'No upcoming bookings',
      description: 'Ready for your next adventure? Find the perfect car for your journey.',
    },
    past: {
      title: 'No past bookings',
      description: 'Once you complete a rental, it will appear here.',
    },
    all: {
      title: 'No bookings yet',
      description: 'Start your journey by finding the perfect car to rent.',
    },
  };

  const msg = messages[activeTab as keyof typeof messages] || messages.all;

  return (
    <div className='rounded-2xl border bg-card p-8 sm:p-12 text-center'>
      <div className='size-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-5'>
        <CalendarDays className='size-10 text-muted-foreground' />
      </div>
      <h3 className='text-xl font-semibold'>{msg.title}</h3>
      <p className='text-muted-foreground mt-2 max-w-sm mx-auto'>{msg.description}</p>
      <Button asChild className='mt-6 rounded-xl gap-2'>
        <Link href='/rent/cars'>
          <Search className='size-4' />
          Browse Available Cars
        </Link>
      </Button>
    </div>
  );
}

// ============ Error State ============
function ErrorState() {
  return (
    <div className='rounded-2xl border bg-card p-8 sm:p-12 text-center'>
      <div className='size-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5'>
        <AlertTriangle className='size-10 text-amber-500' />
      </div>
      <h3 className='text-xl font-semibold'>Failed to load bookings</h3>
      <p className='text-muted-foreground mt-2'>Something went wrong. Please try again later.</p>
      <Button variant='outline' className='mt-6 rounded-xl' onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}

// ============ Skeleton ============
function BookingCardSkeleton() {
  return (
    <div className='rounded-2xl border bg-card overflow-hidden'>
      <div className='flex flex-col sm:flex-row'>
        <Skeleton className='w-full sm:w-48 h-40 sm:h-48 rounded-none' />
        <div className='flex-1 p-4 sm:p-5 space-y-4'>
          <div>
            <Skeleton className='h-6 w-3/4 mb-2' />
            <Skeleton className='h-4 w-1/2' />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <Skeleton className='h-12 rounded-lg' />
            <Skeleton className='h-12 rounded-lg' />
          </div>
          <div className='flex justify-between pt-4 border-t border-dashed'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-6 w-24' />
          </div>
        </div>
      </div>
    </div>
  );
}
