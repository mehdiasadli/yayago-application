'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListAllListingsOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EyeIcon, MoreHorizontal, Car, Building2, Eye, CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListingStatus, VerificationStatus } from '@yayago-app/db/enums';

type ListingItem = ListAllListingsOutputType['items'][number];

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
    case 'BLOCKED':
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

  const { data, isLoading } = useQuery(
    orpc.listings.listAll.queryOptions({
      input: {
        page,
        take,
        q: search || undefined,
        status: status ? (status as ListingStatus) : undefined,
        verificationStatus: verificationStatus ? (verificationStatus as VerificationStatus) : undefined,
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
                <span className='font-medium truncate max-w-[200px]'>{row.original.title}</span>
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
        accessorKey: 'organization',
        header: 'Organization',
        cell: ({ row }) => {
          return (
            <Link href={`/organizations/${row.original.organization.slug}`} className='hover:underline'>
              <div className='flex items-center gap-2 text-sm'>
                <Building2 className='size-3 text-muted-foreground' />
                <span>{row.original.organization.name}</span>
              </div>
            </Link>
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
            </div>
          );
        },
      },
      {
        accessorKey: 'verificationStatus',
        header: 'Verification',
        cell: ({ row }) => {
          return (
            <Badge variant={getVerificationBadgeVariant(row.original.verificationStatus)} appearance='outline'>
              {row.original.verificationStatus === 'PENDING' && <Clock className='size-3 mr-1' />}
              {row.original.verificationStatus === 'APPROVED' && <CheckCircle className='size-3 mr-1' />}
              {row.original.verificationStatus === 'REJECTED' && <XCircle className='size-3 mr-1' />}
              {formatEnumValue(row.original.verificationStatus)}
            </Badge>
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
                {row.original.verificationStatus === 'PENDING' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/listings/${row.original.slug}?action=approve`}>
                        <CheckCircle className='size-4' />
                        Approve
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className='text-destructive'>
                      <Link href={`/listings/${row.original.slug}?action=reject`}>
                        <XCircle className='size-4' />
                        Reject
                      </Link>
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
