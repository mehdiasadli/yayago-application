'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListAllNotificationsOutputType, type NotificationCategory, type NotificationPriority } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Bell,
  User,
  Building2,
  MoreHorizontal,
  ExternalLink,
  Eye,
  Car,
  DollarSign,
  Heart,
  Shield,
  Star,
  Settings,
  Gift,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

type NotificationItem = ListAllNotificationsOutputType['items'][number];

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

const categoryColors: Record<NotificationCategory, string> = {
  BOOKING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  LISTING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ORGANIZATION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  FINANCIAL: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAVORITE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  VERIFICATION: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  SYSTEM: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  PROMOTIONAL: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SECURITY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<NotificationPriority, string> = {
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-300',
};

export default function NotificationsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [category] = useQueryState('category', parseAsString.withDefault(''));
  const [priority] = useQueryState('priority', parseAsString.withDefault(''));
  const [userId] = useQueryState('userId', parseAsString.withDefault(''));
  const [sortBy] = useQueryState('sort', parseAsString.withDefault('newest'));
  const [dateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo] = useQueryState('to', parseAsString.withDefault(''));

  const { data, isLoading, error } = useQuery(
    orpc.notifications.listAll.queryOptions({
      input: {
        page,
        take,
        category: category ? (category as NotificationCategory) : undefined,
        priority: priority ? (priority as NotificationPriority) : undefined,
        userId: userId || undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
    })
  );

  const columns = useMemo<ColumnDef<NotificationItem>[]>(() => {
    return [
      {
        id: 'category',
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.original.category;
          const Icon = categoryIcons[category] || Bell;
          return (
            <Badge variant='outline' className={cn('gap-1.5', categoryColors[category])}>
              <Icon className='size-3' />
              <span className='capitalize text-xs'>{category.toLowerCase()}</span>
            </Badge>
          );
        },
      },
      {
        id: 'notification',
        header: 'Notification',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col min-w-0 max-w-md'>
              <span className='font-medium truncate'>{row.original.title}</span>
              {row.original.body && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className='text-xs text-muted-foreground line-clamp-1 cursor-help'>{row.original.body}</p>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-sm'>
                      <p>{row.original.body}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        id: 'recipient',
        header: 'Recipient',
        cell: ({ row }) => {
          if (row.original.user) {
            return (
              <div className='flex items-center gap-2'>
                <Avatar className='size-7'>
                  <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                    <User className='size-3' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col min-w-0'>
                  <span className='text-sm font-medium truncate'>{row.original.user.name}</span>
                  <span className='text-xs text-muted-foreground truncate'>{row.original.user.email}</span>
                </div>
              </div>
            );
          }
          if (row.original.organization) {
            return (
              <Link
                href={`/organizations/${row.original.organization.slug}`}
                className='flex items-center gap-2 hover:underline'
              >
                <Building2 className='size-4 text-muted-foreground' />
                <span className='text-sm'>{row.original.organization.name}</span>
              </Link>
            );
          }
          return <span className='text-muted-foreground text-sm'>—</span>;
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const priority = row.original.priority;
          return (
            <Badge variant='outline' className={cn('text-xs', priorityColors[priority])}>
              {priority === 'URGENT' && <AlertCircle className='size-3 mr-1' />}
              {priority}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'isRead',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              {row.original.isRead ? (
                <Badge variant='secondary' className='text-xs'>
                  <Eye className='size-3 mr-1' />
                  Read
                </Badge>
              ) : (
                <Badge variant='primary' className='text-xs'>
                  Unread
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Sent',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col'>
              <span className='text-sm'>{format(new Date(row.original.createdAt), 'd MMM yyyy')}</span>
              <span className='text-xs text-muted-foreground'>
                {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {row.original.user && (
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${row.original.user.id}`}>
                      <User className='size-4' />
                      View User
                    </Link>
                  </DropdownMenuItem>
                )}
                {row.original.organization && (
                  <DropdownMenuItem asChild>
                    <Link href={`/organizations/${row.original.organization.slug}`}>
                      <Building2 className='size-4' />
                      View Organization
                    </Link>
                  </DropdownMenuItem>
                )}
                {row.original.listingId && (
                  <DropdownMenuItem asChild>
                    <Link href={`/listings/${row.original.listingId}`}>
                      <Car className='size-4' />
                      View Listing
                    </Link>
                  </DropdownMenuItem>
                )}
                {row.original.bookingId && (
                  <DropdownMenuItem asChild>
                    <Link href={`/bookings/${row.original.bookingId}`}>
                      <ExternalLink className='size-4' />
                      View Booking
                    </Link>
                  </DropdownMenuItem>
                )}
                {row.original.actionUrl && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={row.original.actionUrl} target='_blank' rel='noopener noreferrer'>
                        <ExternalLink className='size-4' />
                        {row.original.actionLabel || 'Open Link'}
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, []);

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Bell className='size-12 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-lg mb-2'>Unable to Load Notifications</CardTitle>
          <CardDescription>An error occurred while fetching notifications. Please try again later.</CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!isLoading && data?.items.length === 0 && !category && !priority && !userId && !dateFrom && !dateTo) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Bell className='size-16 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-xl mb-2'>No Notifications Yet</CardTitle>
          <CardDescription className='max-w-md mx-auto'>
            Notifications will appear here as they are sent to users throughout the platform.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      page={page}
      onPageChange={setPage}
      pageSize={take}
      onPageSizeChange={setTake}
    />
  );
}

