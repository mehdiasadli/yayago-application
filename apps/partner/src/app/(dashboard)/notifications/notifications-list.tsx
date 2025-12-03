'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Car,
  DollarSign,
  Shield,
  Star,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Archive,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import type { NotificationCategory, NotificationOutputType } from '@yayago-app/validators';

const categoryIcons: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  BOOKING: Car,
  LISTING: Car,
  REVIEW: Star,
  ORGANIZATION: Building2,
  FINANCIAL: DollarSign,
  FAVORITE: Star,
  VERIFICATION: Shield,
  SYSTEM: Settings,
  PROMOTIONAL: Settings,
  SECURITY: Shield,
};

const categoryLabels: Record<NotificationCategory, string> = {
  BOOKING: 'Booking',
  LISTING: 'Listing',
  REVIEW: 'Review',
  ORGANIZATION: 'Organization',
  FINANCIAL: 'Payment',
  FAVORITE: 'Favorite',
  VERIFICATION: 'Verification',
  SYSTEM: 'System',
  PROMOTIONAL: 'Promotion',
  SECURITY: 'Security',
};

export default function NotificationsList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [category] = useQueryState('category', parseAsString.withDefault(''));
  const [readStatus] = useQueryState('status', parseAsString.withDefault(''));

  const { data, isLoading, error } = useQuery(
    orpc.notifications.listOrgNotifications.queryOptions({
      input: {
        page,
        take: 10,
        category: category ? (category as NotificationCategory) : undefined,
        isRead: readStatus === 'read' ? true : readStatus === 'unread' ? false : undefined,
        isArchived: false,
      },
    })
  );

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

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(data?.items || []);

  if (isLoading) {
    return <NotificationsListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Bell className='size-12 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-lg mb-2'>Unable to Load Notifications</CardTitle>
          <CardDescription>Please make sure you have an active organization membership.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (data?.items.length === 0 && !category && !readStatus) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <BellOff className='size-16 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-xl mb-2'>No Notifications</CardTitle>
          <CardDescription className='max-w-md mx-auto'>
            Your organization doesn't have any notifications yet. New booking requests, reviews, and important updates
            will appear here.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const hasUnread = data?.items.some((n) => !n.isRead);

  return (
    <div className='space-y-4'>
      {/* Mark all as read button */}
      {hasUnread && (
        <div className='flex justify-end'>
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
        </div>
      )}

      {/* Notifications grouped by date */}
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

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className='flex items-center justify-between pt-4'>
          <p className='text-sm text-muted-foreground'>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className='size-4' />
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(page + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>
      )}
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
                <p className={cn('font-medium', !notification.isRead && 'text-foreground')}>{notification.title}</p>
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
                  <Link href={notification.actionUrl}>
                    {notification.actionLabel || 'View Details'}
                    <ExternalLink className='size-3 ml-1' />
                  </Link>
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

function NotificationsListSkeleton() {
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

