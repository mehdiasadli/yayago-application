'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Car,
  DollarSign,
  Heart,
  Shield,
  Star,
  Settings,
  Gift,
  Lock,
  Building2,
  ChevronRight,
  Loader2,
  Archive,
} from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import type { NotificationCategory, NotificationOutputType } from '@yayago-app/validators';

const categoryIcons: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  BOOKING: Car,
  LISTING: Car,
  REVIEW: Star,
  ORGANIZATION: Building2,
  FINANCIAL: DollarSign,
  FAVORITE: Heart,
  VERIFICATION: Shield,
  SYSTEM: Settings,
  PROMOTIONAL: Gift,
  SECURITY: Lock,
};

const categoryLabels: Record<NotificationCategory, string> = {
  BOOKING: 'Bookings',
  LISTING: 'Listings',
  REVIEW: 'Reviews',
  ORGANIZATION: 'Organization',
  FINANCIAL: 'Payments',
  FAVORITE: 'Favorites',
  VERIFICATION: 'Verification',
  SYSTEM: 'System',
  PROMOTIONAL: 'Promotions',
  SECURITY: 'Security',
};

type TabValue = 'all' | 'unread' | NotificationCategory;

export default function NotificationsContent() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    orpc.notifications.list.queryOptions({
      input: {
        page: 1,
        take: 50,
        isRead: activeTab === 'unread' ? false : undefined,
        category: activeTab !== 'all' && activeTab !== 'unread' ? activeTab : undefined,
        isArchived: false,
      },
    })
  );

  const { data: unreadCount } = useQuery(orpc.notifications.getUnreadCount.queryOptions({ input: {} }));

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => orpc.notifications.markAsRead.call({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => orpc.notifications.markAllAsRead.call({}),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Marked ${result.count} notification(s) as read`);
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (notificationId: string) => orpc.notifications.archive.call({ notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification archived');
    },
  });

  const groupedNotifications = groupNotificationsByDate(data?.items || []);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Notifications</h2>
          <p className='text-muted-foreground'>
            {unreadCount?.count ? `${unreadCount.count} unread` : 'Stay updated with your activity'}
          </p>
        </div>
        {unreadCount && unreadCount.count > 0 && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <CheckCheck className='size-4' />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className='flex flex-wrap h-auto gap-1 p-1'>
          <TabsTrigger value='all' className='relative'>
            All
          </TabsTrigger>
          <TabsTrigger value='unread' className='relative'>
            Unread
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant='destructive' className='ml-1.5 size-5 p-0 justify-center text-xs'>
                {unreadCount.count > 99 ? '99+' : unreadCount.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='BOOKING'>Bookings</TabsTrigger>
          <TabsTrigger value='FINANCIAL'>Payments</TabsTrigger>
          <TabsTrigger value='REVIEW'>Reviews</TabsTrigger>
          <TabsTrigger value='SYSTEM'>System</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {isLoading ? (
        <NotificationsSkeleton />
      ) : error ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <Bell className='size-12 mx-auto mb-4 text-muted-foreground' />
            <p className='text-lg font-medium'>Failed to load notifications</p>
            <p className='text-sm text-muted-foreground'>Please try again later.</p>
          </CardContent>
        </Card>
      ) : data?.items.length === 0 ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <BellOff className='size-16 mx-auto mb-4 text-muted-foreground' />
            <p className='text-lg font-medium'>No notifications</p>
            <p className='text-sm text-muted-foreground'>
              {activeTab === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {Object.entries(groupedNotifications).map(([dateGroup, notifications]) => (
            <div key={dateGroup}>
              <h3 className='text-sm font-medium text-muted-foreground mb-3 px-1'>{dateGroup}</h3>
              <div className='space-y-2'>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
                    onArchive={() => archiveMutation.mutate(notification.id)}
                    isMarkingAsRead={markAsReadMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link to settings */}
      <div className='pt-4 border-t'>
        <Link
          href='/account/settings/notifications'
          className='flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group'
        >
          <div className='flex items-center gap-3'>
            <Settings className='size-5 text-muted-foreground' />
            <div>
              <p className='font-medium'>Notification Settings</p>
              <p className='text-sm text-muted-foreground'>Manage your email and SMS preferences</p>
            </div>
          </div>
          <ChevronRight className='size-5 text-muted-foreground group-hover:text-foreground transition-colors' />
        </Link>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: NotificationOutputType;
  onMarkAsRead: () => void;
  onArchive: () => void;
  isMarkingAsRead: boolean;
}

function NotificationItem({ notification, onMarkAsRead, onArchive, isMarkingAsRead }: NotificationItemProps) {
  const Icon = categoryIcons[notification.category] || Bell;
  const categoryLabel = categoryLabels[notification.category] || notification.category;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-sm',
        !notification.isRead && 'border-l-4 border-l-primary bg-primary/5'
      )}
    >
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          {/* Icon */}
          <div
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0',
              notification.priority === 'URGENT'
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : notification.priority === 'HIGH'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className='size-5' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <p className={cn('font-medium', !notification.isRead && 'text-foreground')}>
                  {notification.title}
                </p>
                {notification.body && (
                  <p className='text-sm text-muted-foreground line-clamp-2 mt-0.5'>{notification.body}</p>
                )}
              </div>
              <div className='flex items-center gap-1 shrink-0'>
                {!notification.isRead && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8'
                    onClick={onMarkAsRead}
                    disabled={isMarkingAsRead}
                  >
                    <Check className='size-4' />
                    <span className='sr-only'>Mark as read</span>
                  </Button>
                )}
                <Button variant='ghost' size='icon' className='size-8' onClick={onArchive}>
                  <Archive className='size-4' />
                  <span className='sr-only'>Archive</span>
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-3 mt-2'>
              <Badge variant='secondary' className='text-xs'>
                {categoryLabel}
              </Badge>
              <span className='text-xs text-muted-foreground'>
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Action button */}
            {notification.actionUrl && (
              <div className='mt-3'>
                <Button variant='outline' size='sm' asChild>
                  <Link href={notification.actionUrl}>{notification.actionLabel || 'View Details'}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function groupNotificationsByDate(notifications: NotificationOutputType[]): Record<string, NotificationOutputType[]> {
  const groups: Record<string, NotificationOutputType[]> = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else {
      groupKey = format(date, 'MMMM d, yyyy');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
}

function NotificationsSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className='p-4'>
            <div className='flex gap-3'>
              <Skeleton className='size-10 rounded-full shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-5 w-48' />
                <Skeleton className='h-4 w-full' />
                <div className='flex gap-2'>
                  <Skeleton className='h-5 w-16' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

