'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListOwnListingsOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Car, EyeIcon, MoreHorizontal, Star, Eye, CalendarCheck, Pencil, Send, Plus, PackageOpen } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ListingItem = ListOwnListingsOutputType['items'][number];

function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'PENDING_VERIFICATION':
      return 'warning';
    case 'DRAFT':
      return 'secondary';
    case 'UNAVAILABLE':
      return 'outline';
    case 'MAINTENANCE':
      return 'info';
    case 'ARCHIVED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getVerificationBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function ListingsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [search] = useQueryState('q', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));
  const [verificationStatus] = useQueryState('verification', parseAsString.withDefault(''));

  const { data, isLoading, error } = useQuery(
    orpc.listings.listOwn.queryOptions({
      input: {
        page,
        take,
        q: search || undefined,
        status: status ? (status as ListingItem['status']) : undefined,
        verificationStatus: verificationStatus ? (verificationStatus as ListingItem['verificationStatus']) : undefined,
      },
    })
  );

  const columns = useMemo<ColumnDef<ListingItem>[]>(() => {
    return [
      {
        id: 'listing',
        accessorKey: 'title',
        header: 'Listing',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='size-12 rounded-lg'>
                <AvatarImage src={row.original.primaryMedia?.url || undefined} className='object-cover' />
                <AvatarFallback className='bg-primary/10 text-primary font-medium rounded-lg'>
                  <Car className='size-5' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col min-w-0'>
                <span className='font-medium truncate'>{row.original.title}</span>
                {row.original.vehicle && (
                  <span className='text-xs text-muted-foreground truncate'>
                    {row.original.vehicle.year} {row.original.vehicle.model.brand.name}{' '}
                    {row.original.vehicle.model.name}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'pricing',
        header: 'Price',
        cell: ({ row }) => {
          if (!row.original.pricing) {
            return <span className='text-muted-foreground text-sm'>—</span>;
          }
          return (
            <div className='flex flex-col'>
              <span className='font-semibold'>
                {formatCurrency(row.original.pricing.pricePerDay, row.original.pricing.currency)}
              </span>
              <span className='text-xs text-muted-foreground'>per day</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col gap-1'>
              <Badge variant={getStatusBadgeVariant(row.original.status)} appearance='outline'>
                {formatEnumValue(row.original.status)}
              </Badge>
              <Badge
                variant={getVerificationBadgeVariant(row.original.verificationStatus)}
                appearance='outline'
                className='text-xs'
              >
                {formatEnumValue(row.original.verificationStatus)}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'stats',
        header: 'Stats',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1' title='Views'>
                <Eye className='size-3' />
                <span>{row.original.viewCount}</span>
              </div>
              <div className='flex items-center gap-1' title='Bookings'>
                <CalendarCheck className='size-3' />
                <span>{row.original.bookingCount}</span>
              </div>
              {row.original.averageRating && (
                <div className='flex items-center gap-1' title='Rating'>
                  <Star className='size-3 fill-yellow-400 text-yellow-400' />
                  <span>{row.original.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          return <span className='text-sm text-muted-foreground'>{format(row.original.createdAt, 'd MMM yyyy')}</span>;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const canSubmitForReview = row.original.status === 'DRAFT' && row.original.verificationStatus !== 'PENDING';

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
                  <Link href={`/listings/${row.original.slug}`}>
                    <EyeIcon className='size-4' />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/listings/${row.original.slug}/edit`}>
                    <Pencil className='size-4' />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {canSubmitForReview && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Send className='size-4' />
                      Submit for Review
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
          <PackageOpen className='size-12 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-lg mb-2'>Unable to Load Listings</CardTitle>
          <CardDescription>
            Please make sure you have an active subscription and organization membership.
          </CardDescription>
          <Button asChild className='mt-4'>
            <Link href='/subscription'>View Subscription</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!isLoading && data?.items.length === 0 && !search && !status && !verificationStatus) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Car className='size-16 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-xl mb-2'>No Listings Yet</CardTitle>
          <CardDescription className='max-w-md mx-auto mb-6'>
            Start by creating your first vehicle listing. Once approved, your vehicle will be visible to potential
            renters.
          </CardDescription>
          <Button asChild size='lg'>
            <Link href='/listings/create'>
              <Plus className='size-4' />
              Create Your First Listing
            </Link>
          </Button>
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
