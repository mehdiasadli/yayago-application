'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@/lib/navigation/navigation-client';
import {
  Calendar,
  Car,
  Heart,
  Star,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  PenLine,
  TrendingUp,
  Activity,
  Target,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function AccountPage() {
  const { data, isLoading, error } = useQuery(orpc.users.getAccountOverview.queryOptions());

  if (isLoading) {
    return <AccountOverviewSkeleton />;
  }

  if (error || !data) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>{error?.message || 'Failed to load account overview'}</AlertDescription>
      </Alert>
    );
  }

  const { stats, upcomingBooking, recentActivity, profileCompletion } = data;

  return (
    <div className='space-y-8'>
      {/* Profile Completion Alert */}
      {profileCompletion.percentage < 100 && (
        <Alert className='border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10'>
          <AlertCircle className='size-4 text-amber-500' />
          <AlertDescription className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='hidden sm:block'>
                <Progress value={profileCompletion.percentage} className='w-24 h-2' />
              </div>
              <span>
                Your profile is <span className='font-semibold'>{profileCompletion.percentage}%</span> complete
              </span>
            </div>
            <Button asChild size='sm' variant='outline' className='border-amber-500/50 hover:bg-amber-500/10'>
              <Link href='/account/settings'>Complete Profile</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Stats Section */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={Calendar}
          label='Total Bookings'
          value={stats.totalBookings}
          gradient='from-blue-500 to-cyan-500'
          trend={stats.activeBookings > 0 ? `${stats.activeBookings} active` : undefined}
        />
        <StatCard
          icon={Wallet}
          label='Total Spent'
          value={`AED ${stats.totalSpent.toLocaleString()}`}
          gradient='from-emerald-500 to-green-500'
          isLarge
        />
        <StatCard
          icon={Heart}
          label='Saved Cars'
          value={stats.favoriteCount}
          gradient='from-rose-500 to-pink-500'
        />
        <StatCard
          icon={Star}
          label='Reviews'
          value={stats.reviewCount}
          gradient='from-violet-500 to-purple-500'
        />
      </div>

      {/* Secondary Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <MiniStatCard
          icon={Activity}
          label='Active'
          value={stats.activeBookings}
          color='text-blue-500'
        />
        <MiniStatCard
          icon={CheckCircle}
          label='Completed'
          value={stats.completedBookings}
          color='text-emerald-500'
        />
        <MiniStatCard
          icon={Target}
          label='Profile'
          value={`${profileCompletion.percentage}%`}
          color='text-amber-500'
        />
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Upcoming Booking */}
        <Card className='overflow-hidden'>
          <CardHeader className='pb-3 bg-gradient-to-r from-primary/5 to-primary/10'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Sparkles className='size-5 text-primary' />
              Upcoming Booking
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-4'>
            {upcomingBooking ? (
              <div className='flex gap-4'>
                <div className='relative w-28 h-20 rounded-xl overflow-hidden bg-muted shrink-0 shadow-sm'>
                  {upcomingBooking.listing.primaryImage ? (
                    <img
                      src={upcomingBooking.listing.primaryImage}
                      alt={upcomingBooking.listing.title}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Car className='size-8 text-muted-foreground' />
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold truncate'>{upcomingBooking.listing.title}</h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {format(new Date(upcomingBooking.startDate), 'EEE, MMM d')} -{' '}
                    {format(new Date(upcomingBooking.endDate), 'EEE, MMM d')}
                  </p>
                  <div className='flex items-center gap-2 mt-3'>
                    <Badge variant='secondary' className='gap-1 bg-primary/10 text-primary'>
                      <Clock className='size-3' />
                      {formatDistanceToNow(new Date(upcomingBooking.startDate), { addSuffix: true })}
                    </Badge>
                    <Button asChild variant='ghost' size='sm'>
                      <Link href={`/account/bookings/${upcomingBooking.id}`}>
                        View <ArrowRight className='size-3 ml-1' />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='size-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4'>
                  <Car className='size-8 text-muted-foreground' />
                </div>
                <p className='font-medium mb-1'>No upcoming bookings</p>
                <p className='text-sm text-muted-foreground mb-4'>Find your perfect ride</p>
                <Button asChild>
                  <Link href='/rent/cars'>
                    <Search className='size-4 mr-2' />
                    Browse Cars
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Profile Strength</CardTitle>
              <div className='flex items-center gap-2'>
                <span className='text-3xl font-bold'>{profileCompletion.percentage}%</span>
                {profileCompletion.percentage === 100 && (
                  <CheckCircle className='size-6 text-emerald-500' />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative'>
              <Progress value={profileCompletion.percentage} className='h-3' />
              <div
                className='absolute top-1/2 -translate-y-1/2 size-5 rounded-full bg-primary shadow-lg border-2 border-background'
                style={{ left: `calc(${profileCompletion.percentage}% - 10px)` }}
              />
            </div>

            {profileCompletion.percentage < 100 && profileCompletion.missingFields.length > 0 && (
              <div className='p-4 rounded-lg bg-muted/50'>
                <p className='text-sm font-medium mb-2'>Complete to unlock benefits:</p>
                <div className='flex flex-wrap gap-2'>
                  {profileCompletion.missingFields.slice(0, 3).map((field) => (
                    <Badge key={field} variant='outline' className='capitalize text-xs'>
                      {field.replace(/([A-Z])/g, ' $1').replace('address', '').trim()}
                    </Badge>
                  ))}
                  {profileCompletion.missingFields.length > 3 && (
                    <Badge variant='secondary' className='text-xs'>
                      +{profileCompletion.missingFields.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Button asChild variant='outline' className='w-full'>
              <Link href='/account/settings'>
                <PenLine className='size-4 mr-2' />
                {profileCompletion.percentage === 100 ? 'View Profile' : 'Complete Profile'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg'>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on YayaGO</CardDescription>
            </div>
            {recentActivity.length > 0 && (
              <Badge variant='secondary'>{recentActivity.length} recent</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className='space-y-1'>
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group'
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      activity.type === 'booking'
                        ? 'bg-blue-500/10 text-blue-500'
                        : activity.type === 'review'
                          ? 'bg-violet-500/10 text-violet-500'
                          : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {activity.type === 'booking' ? (
                      <Calendar className='size-4' />
                    ) : activity.type === 'review' ? (
                      <Star className='size-4' />
                    ) : (
                      <Heart className='size-4' />
                    )}
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
                      size='sm'
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Link href={activity.link}>
                        <ArrowRight className='size-4' />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='size-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4'>
                <Clock className='size-8 text-muted-foreground' />
              </div>
              <p className='font-medium mb-1'>No recent activity</p>
              <p className='text-sm text-muted-foreground'>Start exploring to see your activity here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='grid sm:grid-cols-3 gap-4'>
        <QuickActionCard
          href='/rent/cars'
          icon={Search}
          title='Find a Car'
          description='Browse available vehicles'
          gradient='from-blue-500/10 to-cyan-500/10'
        />
        <QuickActionCard
          href='/account/bookings'
          icon={Calendar}
          title='My Bookings'
          description='View all your rentals'
          gradient='from-emerald-500/10 to-green-500/10'
        />
        <QuickActionCard
          href='/account/favorites'
          icon={Heart}
          title='Favorites'
          description='Your saved cars'
          gradient='from-rose-500/10 to-pink-500/10'
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  trend,
  isLarge,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  gradient: string;
  trend?: string;
  isLarge?: boolean;
}) {
  return (
    <Card className='relative overflow-hidden border-0 shadow-lg'>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
      <CardContent className='p-5 relative'>
        <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white mb-3`}>
          <Icon className='size-5' />
        </div>
        <p className={`font-bold ${isLarge ? 'text-2xl' : 'text-3xl'} tracking-tight`}>{value}</p>
        <p className='text-sm text-muted-foreground mt-1'>{label}</p>
        {trend && (
          <div className='flex items-center gap-1 mt-2'>
            <TrendingUp className='size-3 text-emerald-500' />
            <span className='text-xs text-emerald-600 font-medium'>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className='border-dashed'>
      <CardContent className='p-4 flex items-center gap-3'>
        <div className={`p-2 rounded-lg bg-muted ${color}`}>
          <Icon className='size-4' />
        </div>
        <div>
          <p className='text-xl font-bold'>{value}</p>
          <p className='text-xs text-muted-foreground'>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  gradient,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className={`h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${gradient} border-0`}>
        <CardContent className='p-5 flex flex-col items-center text-center'>
          <div className='p-3 rounded-xl bg-background/80 shadow-sm mb-3'>
            <Icon className='size-6' />
          </div>
          <h3 className='font-semibold'>{title}</h3>
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function AccountOverviewSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className='border-0 shadow-lg'>
            <CardContent className='p-5'>
              <Skeleton className='size-10 rounded-xl mb-3' />
              <Skeleton className='h-8 w-20 mb-2' />
              <Skeleton className='h-4 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='border-dashed'>
            <CardContent className='p-4 flex items-center gap-3'>
              <Skeleton className='size-10 rounded-lg' />
              <div>
                <Skeleton className='h-6 w-12 mb-1' />
                <Skeleton className='h-3 w-16' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-40' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-24 w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-40' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-24 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
