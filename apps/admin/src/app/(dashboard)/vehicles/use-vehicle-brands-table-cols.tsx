import { ColumnDef } from '@tanstack/react-table';
import { ListVehicleBrandOutputType } from '@yayago-app/validators';
import Link from 'next/link';
import { useMemo } from 'react';
import { countries } from 'country-data-list';
import { Button } from '@/components/ui/button';
import { EditIcon, EyeIcon, TrashIcon, Globe, Car } from 'lucide-react';
import DeleteVehicleBrandDialog from './delete-vehicle-brand-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export function useVehicleBrandsTableCols() {
  return useMemo<ColumnDef<ListVehicleBrandOutputType['items'][number]>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Brand',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              {row.original.logo ? (
                <img src={row.original.logo} alt={row.original.name} className='size-8 object-contain' />
              ) : (
                <div className='size-8 rounded bg-muted flex items-center justify-center'>
                  <Car className='size-4 text-muted-foreground' />
                </div>
              )}
              <div>
                <h3 className='font-medium'>{row.original.name}</h3>
                <p className='text-xs text-muted-foreground'>{row.original.slug}</p>
              </div>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-8' />,
        },
      },
      {
        id: 'origin',
        accessorKey: 'originCountryCode',
        header: 'Origin',
        cell: ({ row }) => {
          const country = countries.all.find(
            (c) => c.alpha2.toLowerCase() === row.original.originCountryCode?.toLowerCase()
          );

          return country ? (
            <div className='flex items-center gap-2'>
              <span>{country.emoji}</span>
              <span className='text-sm'>{country.name}</span>
            </div>
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-24 h-4' />,
        },
      },
      {
        id: 'website',
        accessorKey: 'website',
        header: 'Website',
        cell: ({ row }) => {
          return row.original.website ? (
            <Link
              href={row.original.website}
              className='flex items-center gap-1 text-primary hover:underline text-sm'
              target='_blank'
            >
              <Globe className='size-3' />
              Visit
            </Link>
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-16 h-4' />,
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Button variant='outline' size='sm' asChild>
              <Link href={`/vehicles/${row.original.slug}`}>
                <EyeIcon className='size-4' />
              </Link>
            </Button>
            <Button variant='outline' size='sm' asChild>
              <Link href={`/vehicles/${row.original.slug}/edit`}>
                <EditIcon className='size-4' />
              </Link>
            </Button>
            <DeleteVehicleBrandDialog slug={row.original.slug} name={row.original.name}>
              <Button variant='destructive' size='sm'>
                <TrashIcon className='size-4' />
              </Button>
            </DeleteVehicleBrandDialog>
          </div>
        ),
      },
    ];
  }, []);
}
