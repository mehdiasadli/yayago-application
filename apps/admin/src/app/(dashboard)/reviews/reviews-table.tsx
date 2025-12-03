'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListAllReviewsOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, User, Building2, Mail, MoreHorizontal, ExternalLink } from 'lucide-react';
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

type ReviewItem = ListAllReviewsOutputType['items'][number];

export default function ReviewsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [search] = useQueryState('q', parseAsString.withDefault(''));
  const [organizationSlug] = useQueryState('org', parseAsString.withDefault(''));
  const [rating] = useQueryState('rating', parseAsInteger);
  const [sortBy] = useQueryState('sort', parseAsString.withDefault('newest'));
  const [dateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo] = useQueryState('to', parseAsString.withDefault(''));

  const { data, isLoading, error } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: {
        page,
        take,
        q: search || undefined,
        organizationSlug: organizationSlug || undefined,
        rating: rating || undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        sortBy: sortBy as 'newest' | 'oldest' | 'highest' | 'lowest',
      },
    })
  );

  const columns = useMemo<ColumnDef<ReviewItem>[]>(() => {
    return [
      {
        id: 'customer',
        accessorKey: 'user',
        header: 'Customer',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='size-9'>
                <AvatarFallback className='bg-primary/10 text-primary'>
                  <User className='size-4' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col min-w-0'>
                <Link
                  href={`/users/${row.original.user.id}`}
                  className='font-medium truncate hover:underline'
                >
                  {row.original.user.name}
                </Link>
                <span className='text-xs text-muted-foreground truncate'>
                  {row.original.user.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'listing',
        header: 'Listing',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col min-w-0'>
              <Link
                href={`/listings/${row.original.listing.slug}`}
                className='font-medium truncate hover:underline max-w-[200px]'
              >
                {row.original.listing.title}
              </Link>
              <span className='text-xs text-muted-foreground'>
                {row.original.booking.referenceCode}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'organization',
        header: 'Organization',
        cell: ({ row }) => {
          return (
            <Link
              href={`/organizations/${row.original.organization.slug}`}
              className='flex items-center gap-2 hover:underline'
            >
              <Building2 className='size-3.5 text-muted-foreground' />
              <span className='text-sm'>{row.original.organization.name}</span>
            </Link>
          );
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-4',
                    i < row.original.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        cell: ({ row }) => {
          if (!row.original.comment) {
            return <span className='text-muted-foreground text-sm italic'>No comment</span>;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='text-sm text-muted-foreground line-clamp-2 max-w-xs cursor-help'>
                    {row.original.comment}
                  </p>
                </TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <p>{row.original.comment}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
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
                <DropdownMenuItem asChild>
                  <Link href={`/listings/${row.original.listing.slug}`}>
                    <ExternalLink className='size-4' />
                    View Listing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/organizations/${row.original.organization.slug}`}>
                    <Building2 className='size-4' />
                    View Organization
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/bookings/${row.original.booking.id}`}>
                    <MessageSquare className='size-4' />
                    View Booking
                  </Link>
                </DropdownMenuItem>
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
          <MessageSquare className='size-12 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-lg mb-2'>Unable to Load Reviews</CardTitle>
          <CardDescription>
            An error occurred while fetching reviews. Please try again later.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!isLoading && data?.items.length === 0 && !search && !organizationSlug && !rating && !dateFrom && !dateTo) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Star className='size-16 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-xl mb-2'>No Reviews Yet</CardTitle>
          <CardDescription className='max-w-md mx-auto'>
            When customers leave reviews for their bookings, they'll appear here.
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

