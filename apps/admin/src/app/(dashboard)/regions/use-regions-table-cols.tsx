import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListCountriesOutputType } from '@yayago-app/validators';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIcon, EyeIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { formatEnumValue } from '@/lib/utils';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import DeleteCountryDialog from './delete-country-dialog';

export function useRegionsTableCols() {
  return useMemo<ColumnDef<ListCountriesOutputType['items'][number]>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <span>{row.original.flag}</span>
              <h3 className='font-medium'>{row.original.name}</h3>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          return <div className='text-muted-foreground'>{format(row.original.createdAt, 'dd.MM.yyyy, HH:mm')}</div>;
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        accessorKey: 'code',
        header: 'Code',
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const variantMap: Record<PlaceStatus, BadgeProps['variant']> = {
            [PlaceStatusSchema.enum.ACTIVE]: 'success',
            [PlaceStatusSchema.enum.ARCHIVED]: 'destructive',
            [PlaceStatusSchema.enum.COMING_SOON]: 'info',
            [PlaceStatusSchema.enum.DRAFT]: 'warning',
          };

          return (
            <Badge variant={variantMap[row.original.status]} appearance='outline'>
              {formatEnumValue(row.original.status)}
            </Badge>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/regions/countries/${row.original.code}`}>
                  <EyeIcon className='size-4' />
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/regions/countries/${row.original.code}/edit`}>
                  <EditIcon className='size-4' />
                </Link>
              </Button>
              <DeleteCountryDialog code={row.original.code}>
                <Button variant='destructive' size='sm'>
                  <TrashIcon className='size-4' />
                </Button>
              </DeleteCountryDialog>
            </div>
          );
        },
      },
    ];
  }, []);
}
