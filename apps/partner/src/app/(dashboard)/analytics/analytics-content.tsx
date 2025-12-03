'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Eye, DollarSign } from 'lucide-react';

export default function AnalyticsContent() {
  return (
    <div className='space-y-6'>
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Views</CardTitle>
            <Eye className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground mt-1'>Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Conversion Rate</CardTitle>
            <TrendingUp className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground mt-1'>Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Revenue</CardTitle>
            <DollarSign className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground mt-1'>Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Bookings</CardTitle>
            <BarChart className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>—</div>
            <p className='text-xs text-muted-foreground mt-1'>Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your fleet's performance metrics over time</CardDescription>
        </CardHeader>
        <CardContent className='h-[400px] flex items-center justify-center'>
          <div className='text-center text-muted-foreground'>
            <BarChart className='size-16 mx-auto mb-4 opacity-50' />
            <p className='text-lg font-medium'>Analytics Dashboard</p>
            <p className='text-sm'>Detailed analytics will be available soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
