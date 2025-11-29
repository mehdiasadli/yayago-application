import { ColumnDef } from '@tanstack/react-table';
import { ListCityOutputType } from '@yayago-app/validators';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { formatEnumValue } from '@/lib/utils';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditIcon, EyeIcon } from 'lucide-react';

export function useCitiesTableCols() {
  return useMemo<ColumnDef<ListCityOutputType['items'][number]>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          return <div className='text-muted-foreground'>{format(row.original.createdAt, 'dd.MM.yyyy, HH:mm')}</div>;
        },
      },
      {
        accessorKey: 'code',
        header: 'Code',
      },
      {
        accessorFn: (row) => `${row.lat}, ${row.lng}`,
        header: 'Coordinates',
        cell: ({ row }) => {
          return <div className='text-muted-foreground'>{`${row.original.lat}, ${row.original.lng}`}</div>;
        },
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
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
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/regions/countries/${row.original.country.code}/cities/${row.original.code}`}>
                  <EyeIcon className='size-4' />
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/regions/countries/${row.original.country.code}/cities/${row.original.code}/edit`}>
                  <EditIcon className='size-4' />
                </Link>
              </Button>
            </div>
          );
        },
      },
    ];
  }, []);
}
