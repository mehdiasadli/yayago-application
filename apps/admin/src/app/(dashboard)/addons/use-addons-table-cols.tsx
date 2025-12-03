import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListAddonsOutputType } from '@yayago-app/validators';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIcon, EyeIcon, TrashIcon, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import DeleteAddonDialog from './delete-addon-dialog';

type AddonItem = ListAddonsOutputType['items'][number];

function getLocalizedValue(value: Record<string, string> | null | undefined, locale = 'en'): string {
  if (!value) return '';
  return value[locale] || value['en'] || Object.values(value)[0] || '';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function useAddonsTableCols() {
  return useMemo<ColumnDef<AddonItem>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Addon',
        cell: ({ row }) => {
          const name = getLocalizedValue(row.original.name);
          return (
            <div className='flex items-center gap-2'>
              {row.original.isFeatured && <Star className='size-4 text-amber-500' />}
              <div>
                <h3 className='font-medium'>{name}</h3>
                <p className='text-xs text-muted-foreground'>{row.original.slug}</p>
              </div>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'category',
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          return <Badge variant='outline'>{formatCategory(row.original.category)}</Badge>;
        },
        meta: {
          skeleton: <Skeleton className='w-20 h-4' />,
        },
      },
      {
        id: 'pricing',
        header: 'Pricing',
        cell: ({ row }) => {
          return (
            <div className='text-sm'>
              {row.original.suggestedPrice ? (
                <div>
                  <span className='font-medium'>{row.original.suggestedPrice} AED</span>
                  <span className='text-muted-foreground ml-1'>
                    / {row.original.billingType === 'PER_DAY' ? 'day' : 'fixed'}
                  </span>
                </div>
              ) : (
                <span className='text-muted-foreground'>Not set</span>
              )}
              {row.original.maxPrice && (
                <p className='text-xs text-muted-foreground'>Max: {row.original.maxPrice} AED</p>
              )}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-20 h-4' />,
        },
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
          return (
            <div className='text-xs text-muted-foreground space-y-0.5'>
              <div>Input: {row.original.inputType}</div>
              <div>Billing: {row.original.billingType}</div>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-20 h-4' />,
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-1 flex-wrap'>
              <Badge variant={row.original.isActive ? 'success' : 'secondary'} appearance='outline'>
                {row.original.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {row.original.isPopular && (
                <Badge variant='warning' appearance='outline'>
                  <Sparkles className='size-3 mr-1' />
                  Popular
                </Badge>
              )}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-20 h-4' />,
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          return <div className='text-muted-foreground text-sm'>{format(row.original.createdAt, 'dd.MM.yyyy')}</div>;
        },
        meta: {
          skeleton: <Skeleton className='w-20 h-4' />,
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const name = getLocalizedValue(row.original.name);
          return (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/addons/${row.original.slug}`}>
                  <EyeIcon className='size-4' />
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/addons/${row.original.slug}/edit`}>
                  <EditIcon className='size-4' />
                </Link>
              </Button>
              <DeleteAddonDialog id={row.original.id} name={name}>
                <Button variant='destructive' size='sm'>
                  <TrashIcon className='size-4' />
                </Button>
              </DeleteAddonDialog>
            </div>
          );
        },
      },
    ];
  }, []);
}

