import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListSubscriptionPlansOutputType } from '@yayago-app/validators';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditIcon, EyeIcon, TrashIcon, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import DeletePlanDialog from './delete-plan-dialog';

type PlanItem = ListSubscriptionPlansOutputType['items'][number];

function formatPrice(amount: number, currency: string) {
  return `${(amount / 100).toFixed(0)} ${currency.toUpperCase()}`;
}

export function usePlansTableCols() {
  return useMemo<ColumnDef<PlanItem>[]>(() => {
    return [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Plan',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              {row.original.isPopular && <Crown className='size-4 text-amber-500' />}
              <div>
                <h3 className='font-medium'>{row.original.name}</h3>
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
        id: 'prices',
        header: 'Prices',
        cell: ({ row }) => {
          const monthlyPrice = row.original.prices.find((p) => p.interval === 'month');
          const yearlyPrice = row.original.prices.find((p) => p.interval === 'year');

          return (
            <div className='text-sm space-y-1'>
              {monthlyPrice && (
                <div className='text-muted-foreground'>
                  {formatPrice(monthlyPrice.amount, monthlyPrice.currency)}/mo
                </div>
              )}
              {yearlyPrice && (
                <div className='text-muted-foreground'>
                  {formatPrice(yearlyPrice.amount, yearlyPrice.currency)}/yr
                </div>
              )}
              {!monthlyPrice && !yearlyPrice && <span className='text-muted-foreground'>No prices</span>}
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'limits',
        header: 'Limits',
        cell: ({ row }) => {
          return (
            <div className='text-xs text-muted-foreground space-y-0.5'>
              <div>{row.original.maxListings} listings</div>
              <div>{row.original.maxMembers} members</div>
            </div>
          );
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'trial',
        header: 'Trial',
        cell: ({ row }) => {
          if (!row.original.trialEnabled) {
            return <span className='text-muted-foreground text-sm'>—</span>;
          }
          return <span className='text-sm'>{row.original.trialDays} days</span>;
        },
        meta: {
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-1'>
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
          skeleton: <Skeleton className='w-full h-4' />,
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
          skeleton: <Skeleton className='w-full h-4' />,
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/plans/${row.original.slug}`}>
                  <EyeIcon className='size-4' />
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/plans/${row.original.slug}/edit`}>
                  <EditIcon className='size-4' />
                </Link>
              </Button>
              <DeletePlanDialog slug={row.original.slug} name={row.original.name}>
                <Button variant='destructive' size='sm'>
                  <TrashIcon className='size-4' />
                </Button>
              </DeletePlanDialog>
            </div>
          );
        },
      },
    ];
  }, []);
}

