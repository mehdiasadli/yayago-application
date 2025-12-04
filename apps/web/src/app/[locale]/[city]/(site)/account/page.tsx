'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Car,
  Heart,
  Star,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Settings,
  TrendingUp,
  ChevronRight,
  Zap,
  History,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function AccountPage() {
  const { data, isLoading, error } = useQuery(orpc.users.getAccountOverview.queryOptions());

  if (isLoading) {
    return <AccountOverviewSkeleton />;
  }

  if (error || !data) {
    return (
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertCircle className='size-4' />
        <AlertDescription>{error?.message || 'Failed to load account overview'}</AlertDescription>
      </Alert>
    );
  }

  const { stats, upcomingBooking, recentActivity } = data;

  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatCard
          icon={Calendar}
          label='Total Bookings'
          value={stats.totalBookings}
          subValue={stats.activeBookings > 0 ? `${stats.activeBookings} active` : undefined}
          color='blue'
        />
        <StatCard
          icon={Wallet}
          label='Total Spent'
          value={`AED ${stats.totalSpent.toLocaleString()}`}
          color='emerald'
        />
        <StatCard icon={Heart} label='Saved Cars' value={stats.favoriteCount} color='rose' />
        <StatCard icon={Star} label='Reviews Given' value={stats.reviewCount} color='violet' />
      </div>

      {/* Main Content Grid */}
      <div className='grid lg:grid-cols-5 gap-4'>
        {/* Upcoming Booking - Takes more space */}
        <div className='lg:col-span-3'>
          <div className='rounded-2xl border bg-card overflow-hidden h-full'>
            {/* Header */}
            <div className='px-5 py-4 border-b bg-linear-to-r from-primary/5 via-primary/10 to-violet-500/5'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-primary/10'>
                  <Sparkles className='size-5 text-primary' />
                </div>
                <div>
                  <h2 className='font-semibold'>Upcoming Booking</h2>
                  <p className='text-xs text-muted-foreground'>Your next adventure awaits</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='p-5'>
              {upcomingBooking ? (
                <div className='flex flex-col sm:flex-row gap-4'>
                  {/* Car Image */}
                  <div className='relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-muted shrink-0 group'>
                    {upcomingBooking.listing.primaryImage ? (
                      <img
                        src={upcomingBooking.listing.primaryImage}
                        alt={upcomingBooking.listing.title}
                        className='w-full h-full object-cover transition-transform group-hover:scale-105'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
                        <Car className='size-10 text-muted-foreground' />
                      </div>
                    )}
                    {/* Status overlay */}
                    <div className='absolute top-2 left-2'>
                      <Badge className='bg-emerald-500 text-white border-0 shadow-sm gap-1'>
                        <CheckCircle2 className='size-3' />
                        Confirmed
                      </Badge>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className='flex-1 min-w-0 flex flex-col'>
                    <h3 className='font-semibold text-lg truncate'>{upcomingBooking.listing.title}</h3>

                    <div className='mt-2 space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='size-4' />
                        <span>
                          {format(new Date(upcomingBooking.startDate), 'EEE, MMM d')} -{' '}
                          {format(new Date(upcomingBooking.endDate), 'EEE, MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className='mt-auto pt-4 flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary' className='gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg'>
                        <Clock className='size-3.5' />
                        {formatDistanceToNow(new Date(upcomingBooking.startDate), { addSuffix: true })}
                      </Badge>
                      <Button asChild size='sm' className='rounded-xl gap-1.5 ml-auto'>
                        <Link href={`/account/bookings/${upcomingBooking.id}`}>
                          View Details
                          <ArrowRight className='size-3.5' />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Car}
                  title='No upcoming bookings'
                  description='Ready for your next adventure? Find the perfect car for your journey.'
                  action={
                    <Button asChild className='rounded-xl gap-2'>
                      <Link href='/rent/cars'>
                        <Search className='size-4' />
                        Browse Cars
                      </Link>
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='lg:col-span-2'>
          <div className='rounded-2xl border bg-card overflow-hidden h-full'>
            <div className='px-5 py-4 border-b'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-violet-500/10'>
                  <Zap className='size-5 text-violet-500' />
                </div>
                <div>
                  <h2 className='font-semibold'>Quick Actions</h2>
                  <p className='text-xs text-muted-foreground'>Navigate your account</p>
                </div>
              </div>
            </div>

            <div className='p-3'>
              <div className='grid grid-cols-2 gap-2'>
                <QuickActionCard href='/rent/cars' icon={Search} label='Find a Car' color='blue' />
                <QuickActionCard href='/account/bookings' icon={Calendar} label='My Bookings' color='emerald' />
                <QuickActionCard href='/account/favorites' icon={Heart} label='Favorites' color='rose' />
                <QuickActionCard href='/account/settings' icon={Settings} label='Settings' color='violet' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats Row */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='rounded-2xl border bg-card p-4 flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-blue-500/10'>
            <TrendingUp className='size-5 text-blue-500' />
          </div>
          <div>
            <p className='text-2xl font-bold'>{stats.activeBookings}</p>
            <p className='text-sm text-muted-foreground'>Active Bookings</p>
          </div>
        </div>
        <div className='rounded-2xl border bg-card p-4 flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-emerald-500/10'>
            <CheckCircle2 className='size-5 text-emerald-500' />
          </div>
          <div>
            <p className='text-2xl font-bold'>{stats.completedBookings}</p>
            <p className='text-sm text-muted-foreground'>Completed Trips</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='rounded-2xl border bg-card overflow-hidden'>
        <div className='px-5 py-4 border-b flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-amber-500/10'>
              <History className='size-5 text-amber-500' />
            </div>
            <div>
              <h2 className='font-semibold'>Recent Activity</h2>
              <p className='text-xs text-muted-foreground'>Your latest actions on YayaGO</p>
            </div>
          </div>
          {recentActivity.length > 0 && (
            <Badge variant='secondary' className='rounded-lg'>
              {recentActivity.length} recent
            </Badge>
          )}
        </div>

        <div className='p-4'>
          {recentActivity.length > 0 ? (
            <div className='space-y-2'>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title='No recent activity'
              description='Your actions will appear here as you explore and book cars.'
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Sub Components ============

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-green-500/10',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subValue?: string;
  color: keyof typeof colorClasses;
}) {
  const colors = colorClasses[color];

  return (
    <div className='rounded-2xl border bg-card p-4 relative overflow-hidden group hover:shadow-md transition-shadow'>
      {/* Subtle gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', colors.gradient)} />

      <div className='relative'>
        <div className={cn('inline-flex p-2.5 rounded-xl mb-3', colors.bg)}>
          <Icon className={cn('size-5', colors.text)} />
        </div>
        <p className='text-2xl sm:text-3xl font-bold tracking-tight'>{value}</p>
        <p className='text-sm text-muted-foreground mt-0.5'>{label}</p>
        {subValue && (
          <div className='flex items-center gap-1 mt-2'>
            <TrendingUp className='size-3 text-emerald-500' />
            <span className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: keyof typeof colorClasses;
}) {
  const colors = colorClasses[color];

  return (
    <Link
      href={href}
      className='flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all hover:shadow-sm group'
    >
      <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-110', colors.bg)}>
        <Icon className={cn('size-5', colors.text)} />
      </div>
      <span className='text-sm font-medium text-center'>{label}</span>
    </Link>
  );
}

function ActivityItem({
  activity,
}: {
  activity: { type: string; description: string; createdAt: Date; link?: string | null };
}) {
  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'booking':
        return { icon: Calendar, color: 'blue' as const };
      case 'review':
        return { icon: Star, color: 'violet' as const };
      default:
        return { icon: Heart, color: 'rose' as const };
    }
  };

  const config = getActivityConfig(activity.type);
  const colors = colorClasses[config.color];

  return (
    <div className='flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group'>
      <div className={cn('p-2.5 rounded-xl shrink-0', colors.bg)}>
        <config.icon className={cn('size-4', colors.text)} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>{activity.description}</p>
        <p className='text-xs text-muted-foreground'>
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
      {activity.link && (
        <Button
          asChild
          variant='ghost'
          size='icon'
          className='size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity'
        >
          <Link href={activity.link}>
            <ChevronRight className='size-4' />
          </Link>
        </Button>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn('text-center', compact ? 'py-8' : 'py-10')}>
      <div
        className={cn(
          'mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4',
          compact ? 'size-14' : 'size-16'
        )}
      >
        <Icon className={cn('text-muted-foreground', compact ? 'size-7' : 'size-8')} />
      </div>
      <p className='font-semibold'>{title}</p>
      <p className='text-sm text-muted-foreground mt-1 max-w-xs mx-auto'>{description}</p>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  );
}

function AccountOverviewSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-2xl border bg-card p-4'>
            <Skeleton className='size-10 rounded-xl mb-3' />
            <Skeleton className='h-8 w-20 mb-2' />
            <Skeleton className='h-4 w-24' />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid lg:grid-cols-5 gap-4'>
        <div className='lg:col-span-3 rounded-2xl border bg-card'>
          <div className='px-5 py-4 border-b'>
            <Skeleton className='h-5 w-40' />
          </div>
          <div className='p-5'>
            <Skeleton className='h-28 w-full rounded-xl' />
          </div>
        </div>
        <div className='lg:col-span-2 rounded-2xl border bg-card'>
          <div className='px-5 py-4 border-b'>
            <Skeleton className='h-5 w-32' />
          </div>
          <div className='p-3'>
            <div className='grid grid-cols-2 gap-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-24 rounded-xl' />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className='grid grid-cols-2 gap-3'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='rounded-2xl border bg-card p-4 flex items-center gap-4'>
            <Skeleton className='size-12 rounded-xl' />
            <div>
              <Skeleton className='h-7 w-12 mb-1' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='rounded-2xl border bg-card'>
        <div className='px-5 py-4 border-b'>
          <Skeleton className='h-5 w-36' />
        </div>
        <div className='p-4 space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4 p-3'>
              <Skeleton className='size-10 rounded-xl' />
              <div className='flex-1'>
                <Skeleton className='h-4 w-48 mb-1' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
