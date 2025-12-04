'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Calculator, Car, Percent, TrendingUp, Minus, Plus } from 'lucide-react';
import React from 'react';

export function HostEarningsCalculator() {
  const [numCars, setNumCars] = React.useState(5);
  const [dailyRate, setDailyRate] = React.useState(150);
  const [utilization, setUtilization] = React.useState(70);

  const calculateEarnings = () => {
    const daysInMonth = 30;
    const grossRevenue = numCars * dailyRate * daysInMonth * (utilization / 100);
    const commission = grossRevenue * 0.05;
    const netEarnings = grossRevenue - commission;
    const yearlyEarnings = netEarnings * 12;

    return {
      gross: Math.round(grossRevenue),
      commission: Math.round(commission),
      net: Math.round(netEarnings),
      yearly: Math.round(yearlyEarnings),
    };
  };

  const earnings = calculateEarnings();

  const incrementCars = () => setNumCars((prev) => prev + 1);
  const decrementCars = () => setNumCars((prev) => Math.max(1, prev - 1));

  return (
    <section id='calculator' className='relative overflow-hidden py-20 lg:py-28'>
      {/* Background pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='hexagons' width='50' height='43.4' patternUnits='userSpaceOnUse' patternTransform='scale(2)'>
              <polygon
                points='24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#hexagons)' />
        </svg>
      </div>

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            <Calculator className='size-4' />
            Earnings Calculator
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>
            Calculate Your Potential Earnings
          </h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            See how much you can earn by partnering with YayaGO.
          </p>
        </div>

        <div className='max-w-5xl mx-auto'>
          {/* Calculator Card */}
          <div className='rounded-3xl border-2 border-primary/20 bg-card shadow-2xl shadow-primary/5 overflow-hidden'>
            {/* Header */}
            <div className='bg-primary px-6 py-5 sm:px-8'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-white/20'>
                    <Calculator className='size-5 text-white' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-white'>Revenue Calculator</h3>
                    <p className='text-sm text-white/70'>Estimate your monthly earnings</p>
                  </div>
                </div>
                <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm'>
                  <Percent className='size-4' />
                  <span>Only 5% Fee</span>
                </div>
              </div>
            </div>

            {/* Calculator Body */}
            <div className='p-6 sm:p-8'>
              <div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>
                {/* Input Section */}
                <div className='space-y-6'>
                  {/* Number of Vehicles */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label className='font-semibold text-base flex items-center gap-2'>
                        <Car className='size-4 text-primary' />
                        Number of Vehicles
                      </Label>
                      <span className='text-2xl font-bold text-primary'>{numCars}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-10 rounded-xl shrink-0'
                        onClick={decrementCars}
                      >
                        <Minus className='size-4' />
                      </Button>
                      <Slider
                        value={[numCars]}
                        onValueChange={(val) => setNumCars(val[0])}
                        min={1}
                        max={50}
                        step={1}
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-10 rounded-xl shrink-0'
                        onClick={incrementCars}
                      >
                        <Plus className='size-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Daily Rate */}
                  <div className='space-y-3'>
                    <Label className='font-semibold text-base'>Average Daily Rate</Label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
                        AED
                      </span>
                      <Input
                        type='number'
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Math.max(0, Number(e.target.value)))}
                        min={0}
                        className='h-12 pl-14 text-lg font-semibold rounded-xl'
                      />
                    </div>
                    <div className='flex gap-2'>
                      {[100, 150, 200, 300].map((rate) => (
                        <button
                          key={rate}
                          type='button'
                          onClick={() => setDailyRate(rate)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            dailyRate === rate
                              ? 'bg-primary text-white'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                        >
                          {rate}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Utilization Rate */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label className='font-semibold text-base'>Utilization Rate</Label>
                      <span className='text-lg font-bold text-primary'>{utilization}%</span>
                    </div>
                    <Slider
                      value={[utilization]}
                      onValueChange={(val) => setUtilization(val[0])}
                      min={10}
                      max={100}
                      step={5}
                    />
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>Low (10%)</span>
                      <span>Average (60-70%)</span>
                      <span>High (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className='space-y-4'>
                  {/* Monthly breakdown */}
                  <div className='rounded-2xl bg-muted/50 p-5 space-y-3'>
                    <h4 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                      Monthly Breakdown
                    </h4>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Gross Revenue</span>
                      <span className='font-semibold text-lg'>AED {earnings.gross.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Platform Fee (5%)</span>
                      <span className='font-semibold text-destructive'>- AED {earnings.commission.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between items-center py-2'>
                      <span className='font-semibold'>Your Earnings</span>
                      <span className='font-bold text-xl text-primary'>AED {earnings.net.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Yearly projection */}
                  <div className='rounded-2xl bg-primary p-6 text-center'>
                    <p className='text-sm text-white/70 mb-1'>Projected Yearly Earnings</p>
                    <p className='text-4xl font-bold text-white'>AED {earnings.yearly.toLocaleString()}</p>
                    <div className='flex items-center justify-center gap-2 mt-2 text-white/80 text-sm'>
                      <TrendingUp className='size-4' />
                      <span>Based on current settings</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button size='lg' className='w-full h-12 rounded-xl text-base' asChild>
                    <Link href='/signup?role=partner'>
                      Start Earning Today
                      <ArrowRight className='ml-2 size-5' />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className='mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto'>
            <div className='text-center p-4 rounded-xl bg-card border'>
              <p className='text-2xl font-bold text-primary'>95%</p>
              <p className='text-xs text-muted-foreground mt-1'>Revenue You Keep</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-card border'>
              <p className='text-2xl font-bold text-primary'>24h</p>
              <p className='text-xs text-muted-foreground mt-1'>Fast Payouts</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-card border'>
              <p className='text-2xl font-bold text-primary'>0</p>
              <p className='text-xs text-muted-foreground mt-1'>Hidden Fees</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
