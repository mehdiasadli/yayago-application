'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListUsersOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { formatEnumValue } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EyeIcon, MoreHorizontal, Shield, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@yayago-app/db/enums';

type UserItem = ListUsersOutputType['items'][number];

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'moderator':
      return 'warning';
    default:
      return 'secondary';
  }
}

export default function UsersTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [search] = useQueryState('q', parseAsString.withDefault(''));
  const [role] = useQueryState('role', parseAsString.withDefault(''));
  const [banned] = useQueryState('banned', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.users.list.queryOptions({
      input: {
        page,
        take,
        q: search || undefined,
        role: role ? (role as UserRole) : undefined,
        banned: banned === 'banned' ? true : banned === 'active' ? false : undefined,
      },
    })
  );

  const columns = useMemo<ColumnDef<UserItem>[]>(() => {
    return [
      {
        id: 'user',
        accessorKey: 'name',
        header: 'User',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='size-10'>
                <AvatarImage src={row.original.image || undefined} />
                <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                  {row.original.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{row.original.name}</span>
                <span className='text-xs text-muted-foreground'>@{row.original.username}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col gap-1'>
              <span className='text-sm'>{row.original.email}</span>
              <Badge
                variant={row.original.emailVerified ? 'success' : 'warning'}
                appearance='outline'
                className='w-fit text-xs'
              >
                {row.original.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        cell: ({ row }) => {
          if (!row.original.phoneNumber) {
            return <span className='text-muted-foreground text-sm'>—</span>;
          }
          return (
            <div className='flex flex-col gap-1'>
              <span className='text-sm'>{row.original.phoneNumber}</span>
              <Badge
                variant={row.original.phoneNumberVerified ? 'success' : 'warning'}
                appearance='outline'
                className='w-fit text-xs'
              >
                {row.original.phoneNumberVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          return (
            <Badge variant={getRoleBadgeVariant(row.original.role)} className='gap-1'>
              <Shield className='size-3' />
              {formatEnumValue(row.original.role)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'banned',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <Badge variant={row.original.banned ? 'destructive' : 'success'} appearance='outline' className='gap-1'>
              {row.original.banned ? <Ban className='size-3' /> : <CheckCircle className='size-3' />}
              {row.original.banned ? 'Banned' : 'Active'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
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
                  <Link href={`/users/${row.original.username}`}>
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
