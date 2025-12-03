'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, AlertTriangle, Calendar, Megaphone } from 'lucide-react';

export default function NotificationsStats() {
  // Get total notifications count
  const { data, isLoading } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
      },
    })
  );

  // Get recent notifications (this month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        dateFrom: startOfMonth,
      },
    })
  );

  // Get urgent notifications
  const { data: urgentData } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        priority: 'URGENT',
      },
    })
  );

  // Get high priority notifications
  const { data: highData } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        priority: 'HIGH',
      },
    })
  );

  // Get system notifications
  const { data: systemData } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        category: 'SYSTEM',
      },
    })
  );

  if (isLoading || isMonthlyLoading) {
    return <NotificationsStatsSkeleton />;
  }

  const totalNotifications = data?.pagination.total || 0;
  const monthlyNotifications = monthlyData?.pagination.total || 0;
  const urgentCount = urgentData?.pagination.total || 0;
  const highCount = highData?.pagination.total || 0;
  const systemCount = systemData?.pagination.total || 0;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1'>
      {/* Total Notifications */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Total Notifications</CardTitle>
          <Bell className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalNotifications.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>All time sent</p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>This Month</CardTitle>
          <Calendar className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{monthlyNotifications.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>New notifications</p>
        </CardContent>
      </Card>

      {/* Urgent & High Priority */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Urgent & High</CardTitle>
          <AlertTriangle className='size-4 text-amber-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-amber-600'>{(urgentCount + highCount).toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>
            {urgentCount} urgent, {highCount} high
          </p>
        </CardContent>
      </Card>

      {/* System Broadcasts */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>System Broadcasts</CardTitle>
          <Megaphone className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{systemCount.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>Announcements & updates</p>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1'>
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

