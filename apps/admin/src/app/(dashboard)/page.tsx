'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import {
  Users,
  Building2,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Activity,
  ArrowRight,
  Eye,
  Shield,
  CreditCard,
  Zap,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'REJECTED':
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_HOST':
    case 'DISPUTED':
      return 'destructive';
    case 'SUSPENDED':
    case 'ONBOARDING':
      return 'secondary';
    default:
      return 'outline';
  }
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  trend,
  trendLabel,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  href?: string;
  trend?: number;
  trendLabel?: string;
}) {
  const content = (
    <Card className={href ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''}>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-3xl font-bold'>{value}</p>
            {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
            {trend !== undefined && (
              <div className='flex items-center gap-1 mt-2'>
                <TrendingUp className={`size-3 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500 rotate-180'}`} />
                <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}
                  {trend} {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className='p-3 rounded-xl bg-primary/10'>
            <Icon className='size-6 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function PendingActionsCard({
  title,
  count,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  count: number;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  if (count === 0) return null;

  return (
    <Link href={href}>
      <Card className='border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-500 transition-colors cursor-pointer'>
        <CardContent className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='p-2 rounded-lg bg-amber-500/20'>
              <Icon className='size-5 text-amber-600' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>{count}</span>
                <span className='text-sm'>{title}</span>
              </div>
              <p className='text-xs text-muted-foreground'>{description}</p>
            </div>
            <ArrowRight className='size-4 text-muted-foreground' />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ResourceBreakdown({
  title,
  data,
  icon: Icon,
  href,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
  icon: React.ElementType;
  href: string;
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base flex items-center gap-2'>
            <Icon className='size-4' />
            {title}
          </CardTitle>
          <Button variant='ghost' size='sm' asChild>
            <Link href={href}>
              View All
              <ArrowRight className='size-3 ml-1' />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {data.map((item) => (
            <div key={item.label} className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className={`size-2 rounded-full ${item.color}`} />
                <span className='text-sm'>{item.label}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>{item.value}</span>
                <span className='text-xs text-muted-foreground'>
                  ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className='flex gap-1 mt-4 h-2 rounded-full overflow-hidden bg-muted'>
          {data.map((item) => (
            <div
              key={item.label}
              className={`h-full ${item.color}`}
              style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading, error, refetch, isFetching } = useQuery(orpc.admin.getDashboardStats.queryOptions());

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64 mt-2' />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-32' />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <AlertTriangle className='size-16 mx-auto mb-4 text-amber-500' />
          <p className='text-lg font-medium'>Failed to load dashboard</p>
          <p className='text-sm text-muted-foreground mb-4'>{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalPending = stats.pending.organizationsCount + stats.pending.listingsCount + stats.pending.bookingsCount;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Platform overview and key metrics</p>
        </div>
        <Button variant='outline' size='sm' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pending Actions Alert */}
      {totalPending > 0 && (
        <Card className='border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'>
          <CardContent className='py-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-amber-500/20'>
                <Clock className='size-6 text-amber-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-amber-900 dark:text-amber-100'>
                  {totalPending} items require your attention
                </h3>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  Review pending organizations, listings, and booking requests
                </p>
              </div>
              <div className='flex gap-2'>
                {stats.pending.organizationsCount > 0 && (
                  <Button size='sm' variant='outline' asChild>
                    <Link href='/organizations?status=PENDING'>{stats.pending.organizationsCount} Orgs</Link>
                  </Button>
                )}
                {stats.pending.listingsCount > 0 && (
                  <Button size='sm' variant='outline' asChild>
                    <Link href='/listings?verificationStatus=PENDING'>{stats.pending.listingsCount} Listings</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Users'
          value={stats.platform.totalUsers.toLocaleString()}
          subtitle={`${stats.users.admins} admins, ${stats.users.moderators} mods`}
          icon={Users}
          href='/users'
          trend={stats.thisMonth.newUsers}
          trendLabel='this month'
        />
        <StatCard
          title='Organizations'
          value={stats.platform.totalOrganizations.toLocaleString()}
          subtitle={`${stats.organizations.active} active`}
          icon={Building2}
          href='/organizations'
          trend={stats.thisMonth.newOrganizations}
          trendLabel='this month'
        />
        <StatCard
          title='Listings'
          value={stats.platform.totalListings.toLocaleString()}
          subtitle={`${stats.listings.available} available`}
          icon={Car}
          href='/listings'
          trend={stats.thisMonth.newListings}
          trendLabel='this month'
        />
        <StatCard
          title='Bookings'
          value={stats.platform.totalBookings.toLocaleString()}
          subtitle={`${stats.bookings.active} active now`}
          icon={Calendar}
          href='/bookings'
          trend={stats.thisMonth.newBookings}
          trendLabel='this month'
        />
      </div>

      {/* Revenue Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='md:col-span-2'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='size-5' />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-3 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Revenue</p>
                <p className='text-3xl font-bold text-emerald-600'>
                  {formatCurrency(stats.platform.totalRevenue, stats.platform.currency)}
                </p>
                <p className='text-xs text-muted-foreground'>All time</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>This Month</p>
                <p className='text-3xl font-bold'>{formatCurrency(stats.thisMonth.revenue, stats.platform.currency)}</p>
                <p className='text-xs text-muted-foreground'>{stats.thisMonth.completedBookings} completed</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>MRR (Subscriptions)</p>
                <p className='text-3xl font-bold text-primary'>
                  {formatCurrency(stats.subscriptions.monthlyRecurringRevenue, stats.platform.currency)}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {stats.subscriptions.totalActive + stats.subscriptions.totalTrialing} active subs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='size-5' />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-emerald-500' />
                  <span className='text-sm'>Active</span>
                </div>
                <span className='font-semibold'>{stats.subscriptions.totalActive}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-blue-500' />
                  <span className='text-sm'>Trialing</span>
                </div>
                <span className='font-semibold'>{stats.subscriptions.totalTrialing}</span>
              </div>
              <Button variant='outline' className='w-full' asChild>
                <Link href='/plans'>Manage Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Breakdowns */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <ResourceBreakdown
          title='Users'
          icon={Users}
          href='/users'
          data={[
            { label: 'Active', value: stats.users.active, color: 'bg-emerald-500' },
            { label: 'Banned', value: stats.users.banned, color: 'bg-red-500' },
            { label: 'Admins', value: stats.users.admins, color: 'bg-purple-500' },
            { label: 'Moderators', value: stats.users.moderators, color: 'bg-blue-500' },
          ]}
        />
        <ResourceBreakdown
          title='Organizations'
          icon={Building2}
          href='/organizations'
          data={[
            { label: 'Active', value: stats.organizations.active, color: 'bg-emerald-500' },
            { label: 'Pending', value: stats.organizations.pending, color: 'bg-amber-500' },
            { label: 'Rejected', value: stats.organizations.rejected, color: 'bg-red-500' },
            { label: 'Onboarding', value: stats.organizations.onboarding, color: 'bg-blue-500' },
          ]}
        />
        <ResourceBreakdown
          title='Listings'
          icon={Car}
          href='/listings'
          data={[
            { label: 'Approved', value: stats.listings.approved, color: 'bg-emerald-500' },
            { label: 'Pending', value: stats.listings.pending, color: 'bg-amber-500' },
            { label: 'Rejected', value: stats.listings.rejected, color: 'bg-red-500' },
            { label: 'Available', value: stats.listings.available, color: 'bg-blue-500' },
          ]}
        />
        <ResourceBreakdown
          title='Bookings'
          icon={Calendar}
          href='/bookings'
          data={[
            { label: 'Active', value: stats.bookings.active, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.bookings.pendingApproval, color: 'bg-amber-500' },
            { label: 'Completed', value: stats.bookings.completed, color: 'bg-emerald-500' },
            { label: 'Cancelled', value: stats.bookings.cancelled, color: 'bg-gray-500' },
          ]}
        />
      </div>

      {/* Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Organizations */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Recent Organizations</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/organizations'>
                  View All
                  <ArrowRight className='size-3 ml-1' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.recentOrganizations.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>No organizations yet</p>
              ) : (
                stats.recentOrganizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.slug}`}
                    className='flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Building2 className='size-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>{org.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(org.status)} className='text-xs'>
                      {formatEnumValue(org.status)}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Recent Listings</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/listings'>
                  View All
                  <ArrowRight className='size-3 ml-1' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.recentListings.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>No listings yet</p>
              ) : (
                stats.recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug}`}
                    className='flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Car className='size-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium text-sm truncate max-w-32'>{listing.title}</p>
                        <p className='text-xs text-muted-foreground truncate max-w-32'>{listing.organizationName}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(listing.verificationStatus)} className='text-xs'>
                      {formatEnumValue(listing.verificationStatus)}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Recent Bookings</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/bookings'>
                  View All
                  <ArrowRight className='size-3 ml-1' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.recentBookings.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>No bookings yet</p>
              ) : (
                stats.recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className='flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Calendar className='size-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium text-sm'>{booking.referenceCode}</p>
                        <p className='text-xs text-muted-foreground truncate max-w-24'>{booking.userName}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge variant={getStatusBadgeVariant(booking.status)} className='text-xs'>
                        {formatEnumValue(booking.status)}
                      </Badge>
                      <p className='text-xs font-medium mt-1'>{formatCurrency(booking.totalPrice, booking.currency)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button variant='outline' className='h-auto py-4 flex-col gap-2' asChild>
              <Link href='/organizations?status=PENDING'>
                <Building2 className='size-5' />
                <span>Review Organizations</span>
              </Link>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex-col gap-2' asChild>
              <Link href='/listings?verificationStatus=PENDING'>
                <Car className='size-5' />
                <span>Verify Listings</span>
              </Link>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex-col gap-2' asChild>
              <Link href='/users'>
                <Users className='size-5' />
                <span>Manage Users</span>
              </Link>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex-col gap-2' asChild>
              <Link href='/plans'>
                <CreditCard className='size-5' />
                <span>Subscription Plans</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
