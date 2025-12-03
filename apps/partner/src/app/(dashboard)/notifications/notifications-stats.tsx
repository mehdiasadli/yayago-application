'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NotificationsStats() {
  const { data: stats, isLoading } = useQuery(orpc.notifications.getStats.queryOptions({ input: {} }));

  if (isLoading) {
    return <NotificationsStatsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  // Calculate key stats
  const bookingNotifications = stats.byCategory.BOOKING || 0;
  const financialNotifications = stats.byCategory.FINANCIAL || 0;
  const highPriorityNotifications = (stats.byPriority.HIGH || 0) + (stats.byPriority.URGENT || 0);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {/* Total Notifications */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Total</CardTitle>
          <Bell className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.total}</div>
          <p className='text-xs text-muted-foreground mt-1'>All notifications</p>
        </CardContent>
      </Card>

      {/* Unread Notifications */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Unread</CardTitle>
          <Calendar className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.unread}</div>
          <p className='text-xs text-muted-foreground mt-1'>Awaiting your attention</p>
        </CardContent>
      </Card>

      {/* Booking Related */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Bookings</CardTitle>
          <CheckCircle className='size-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>{bookingNotifications}</div>
          <p className='text-xs text-muted-foreground mt-1'>Booking notifications</p>
        </CardContent>
      </Card>

      {/* High Priority */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>High Priority</CardTitle>
          <AlertTriangle className='size-4 text-amber-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-amber-600'>{highPriorityNotifications}</div>
          <p className='text-xs text-muted-foreground mt-1'>Urgent & high priority</p>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='pb-2'>
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-1' />
            <Skeleton className='h-3 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

