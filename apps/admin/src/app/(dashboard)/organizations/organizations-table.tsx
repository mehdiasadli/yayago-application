'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListOrganizationOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { formatEnumValue } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EyeIcon, MoreHorizontal, Building2, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrganizationStatus } from '@yayago-app/db/enums';

type OrganizationItem = ListOrganizationOutputType['items'][number];

function getStatusBadgeVariant(status: OrganizationStatus): BadgeProps['variant'] {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    case 'SUSPENDED':
      return 'destructive';
    case 'ARCHIVED':
      return 'secondary';
    case 'ONBOARDING':
      return 'info';
    case 'IDLE':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export default function OrganizationsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [search] = useQueryState('q', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.organizations.list.queryOptions({
      input: {
        page,
        take,
        q: search || undefined,
        status: status ? (status as OrganizationStatus) : undefined,
      },
    })
  );

  const columns = useMemo<ColumnDef<OrganizationItem>[]>(() => {
    return [
      {
        id: 'organization',
        accessorKey: 'name',
        header: 'Organization',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='size-10'>
                <AvatarImage src={row.original.logo || undefined} />
                <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                  <Building2 className='size-5' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{row.original.name}</span>
                <span className='text-xs text-muted-foreground'>{row.original.legalName || row.original.slug}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'city',
        header: 'Location',
        cell: ({ row }) => {
          if (!row.original.city) {
            return <span className='text-muted-foreground text-sm'>—</span>;
          }
          return (
            <div className='flex items-center gap-2 text-sm'>
              <MapPin className='size-3 text-muted-foreground' />
              <span>
                {row.original.city.name}, {row.original.city.country.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Contact',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col text-sm'>
              <span>{row.original.email || '—'}</span>
              <span className='text-muted-foreground text-xs'>{row.original.phoneNumber || ''}</span>
            </div>
          );
        },
      },
      {
        accessorKey: '_count',
        header: 'Stats',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1' title='Members'>
                <Users className='size-3' />
                <span>{row.original._count.members}</span>
              </div>
              <div className='flex items-center gap-1' title='Listings'>
                <Building2 className='size-3' />
                <span>{row.original._count.listings}</span>
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
            <Badge variant={getStatusBadgeVariant(row.original.status)} appearance='outline'>
              {formatEnumValue(row.original.status)}
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
                  <Link href={`/organizations/${row.original.slug}`}>
                    <EyeIcon className='size-4' />
                    View Details
                  </Link>
                </DropdownMenuItem>
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

