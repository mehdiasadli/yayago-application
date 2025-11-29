'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import React from 'react';

export function HostEarningsCalculator() {
  const [numCars, setNumCars] = React.useState(5);
  const [dailyRate, setDailyRate] = React.useState(150);
  const [utilization, setUtilization] = React.useState(70);

  const calculateEarnings = () => {
    const daysInMonth = 30;
    const grossRevenue = numCars * dailyRate * daysInMonth * (utilization / 100);
    const commission = grossRevenue * 0.05; // 5% commission
    const netEarnings = grossRevenue - commission;

    return {
      gross: Math.round(grossRevenue),
      commission: Math.round(commission),
      net: Math.round(netEarnings),
    };
  };

  const earnings = calculateEarnings();

  return (
    <section className='container mx-auto px-4 py-16'>
      <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
        <div>
          <h2 className='mb-4 font-bold text-3xl tracking-tight'>Calculate Your Potential Earnings</h2>
          <p className='mb-6 text-lg text-muted-foreground'>
            See how much you can earn by partnering with YayaGO. Our transparent model means you keep more of your revenue.
          </p>
          
          <div className='space-y-6'>
             <div className='flex gap-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                   <span className='font-bold text-xl'>5%</span>
                </div>
                <div>
                   <h3 className='font-semibold text-lg'>Low Commission</h3>
                   <p className='text-muted-foreground'>We only charge a 5% fee on successful bookings. You keep 95%.</p>
                </div>
             </div>
             
             <div className='flex gap-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                   <span className='font-bold text-xl'>0</span>
                </div>
                <div>
                   <h3 className='font-semibold text-lg'>Hidden Fees</h3>
                   <p className='text-muted-foreground'>Transparent pricing. Subscription covers platform access and tools.</p>
                </div>
             </div>
          </div>
        </div>

        <Card className='border-none bg-muted/50 shadow-xl'>
          <CardHeader className='pb-6'>
            <CardTitle>Earnings Calculator</CardTitle>
            <CardDescription>Estimate your monthly revenue</CardDescription>
          </CardHeader>
          <CardContent className='space-y-8'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Number of Vehicles</Label>
                <Input
                  type='number'
                  value={numCars}
                  onChange={(e) => setNumCars(Math.max(1, Number(e.target.value)))}
                  min={1}
                />
              </div>

              <div className='space-y-2'>
                <Label>Average Daily Rate (AED)</Label>
                <Input
                  type='number'
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Math.max(0, Number(e.target.value)))}
                  min={0}
                />
              </div>

              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <Label>Utilization Rate</Label>
                  <span className='text-muted-foreground text-sm'>{utilization}%</span>
                </div>
                <Slider
                  value={[utilization]}
                  onValueChange={(val) => setUtilization(val[0])}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className='text-muted-foreground text-xs'>Percentage of time your cars are rented out</p>
              </div>
            </div>

            <div className='rounded-xl bg-background p-6 shadow-sm'>
              <div className='mb-4 flex justify-between text-sm'>
                <span className='text-muted-foreground'>Gross Revenue</span>
                <span className='font-medium'>AED {earnings.gross.toLocaleString()}</span>
              </div>
              <div className='mb-4 flex justify-between text-sm'>
                <span className='text-muted-foreground'>Platform Fee (5%)</span>
                <span className='text-destructive'>- AED {earnings.commission.toLocaleString()}</span>
              </div>
              
              <Separator className='my-4' />
              
              <div className='text-center'>
                <p className='mb-1 text-muted-foreground text-sm font-medium uppercase tracking-wider'>
                   Estimated Monthly Earnings
                </p>
                <p className='font-bold text-4xl text-primary'>AED {earnings.net.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

