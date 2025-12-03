'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Package, Star, DollarSign, ShoppingCart } from 'lucide-react';

export default function AddonsStats() {
  const { data: stats, isLoading } = useQuery(orpc.addons.getStats.queryOptions({ input: {} }));

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-24' />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Total Addons</CardTitle>
          <Package className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.totalAddons ?? 0}</div>
          <p className='text-xs text-muted-foreground mt-1'>{stats?.activeAddons ?? 0} active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Featured</CardTitle>
          <Star className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.featuredAddons ?? 0}</div>
          <p className='text-xs text-muted-foreground mt-1'>highlighted addons</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Revenue This Month</CardTitle>
          <DollarSign className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats?.addonRevenueThisMonth?.toLocaleString() ?? 0} {stats?.currency ?? 'AED'}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>from addon sales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Bookings with Addons</CardTitle>
          <ShoppingCart className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.totalBookingsWithAddons ?? 0}</div>
          <p className='text-xs text-muted-foreground mt-1'>total bookings</p>
        </CardContent>
      </Card>
    </div>
  );
}

