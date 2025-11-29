'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import React from 'react';

const CAR_TYPES = [
  { label: 'Economy (e.g., Nissan Sunny)', price: 60000 },
  { label: 'Sedan (e.g., Toyota Camry)', price: 110000 },
  { label: 'SUV (e.g., Nissan Patrol)', price: 250000 },
  { label: 'Luxury (e.g., Mercedes E-Class)', price: 350000 },
  { label: 'Sports (e.g., Porsche 911)', price: 550000 },
];

export function LeasingCalculator() {
  const [carType, setCarType] = React.useState<string>('Sedan (e.g., Toyota Camry)');
  const [price, setPrice] = React.useState(110000);
  const [downPaymentPercent, setDownPaymentPercent] = React.useState(10);
  const [term, setTerm] = React.useState('36');
  const [includeInsurance, setIncludeInsurance] = React.useState(false);

  const [result, setResult] = React.useState({
    monthlyPayment: 0,
    amountFinanced: 0,
    totalInterest: 0,
    totalPayable: 0,
    insuranceMonthly: 0,
  });

  // Update price when car type changes
  const handleCarTypeChange = (value: string) => {
    setCarType(value);
    const selectedCar = CAR_TYPES.find((c) => c.label === value);
    if (selectedCar) {
      setPrice(selectedCar.price);
    }
  };

  React.useEffect(() => {
    calculateLease();
  }, [price, downPaymentPercent, term, includeInsurance]);

  const calculateLease = () => {
    const downPayment = (price * downPaymentPercent) / 100;
    const principal = price - downPayment;
    const months = parseInt(term);

    // Simplified lease calculation
    let residualPercentage = 0.4; // 40% residual after 36 months
    if (months === 12) residualPercentage = 0.6;
    if (months === 24) residualPercentage = 0.5;
    if (months === 48) residualPercentage = 0.35;

    const residualValue = price * residualPercentage;
    const depreciationFee = (principal - residualValue) / months;

    // Money factor (approx 5% APR equivalent)
    const moneyFactor = 0.0021;
    const financeFee = (principal + residualValue) * moneyFactor;

    const baseMonthly = depreciationFee + financeFee;

    // Insurance: approx 3% of car value per year
    const insuranceYearly = price * 0.03;
    const insuranceMonthly = includeInsurance ? insuranceYearly / 12 : 0;

    const totalMonthly = baseMonthly + insuranceMonthly;
    const totalInterest = financeFee * months;
    const totalPayable = downPayment + totalMonthly * months;

    setResult({
      monthlyPayment: Math.round(totalMonthly),
      amountFinanced: Math.round(principal),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
      insuranceMonthly: Math.round(insuranceMonthly),
    });
  };

  return (
    <section id='calculator' className='container mx-auto px-4 py-16'>
      <div className='grid gap-12 lg:grid-cols-2 lg:items-start'>
        <div className='space-y-6'>
          <div className='mb-8'>
            <h2 className='font-bold text-3xl tracking-tight'>Estimate Your Payments</h2>
            <p className='mt-2 text-lg text-muted-foreground'>
              Customize your plan to see how affordable your dream car can be.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Vehicle Type</Label>
              <Select value={carType} onValueChange={handleCarTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select car type' />
                </SelectTrigger>
                <SelectContent>
                  {CAR_TYPES.map((type) => (
                    <SelectItem key={type.label} value={type.label}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Vehicle Price (AED)</Label>
              <Input
                type='number'
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={20000}
                step={1000}
              />
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between'>
                <Label>Down Payment (%)</Label>
                <span className='text-muted-foreground text-sm'>{downPaymentPercent}%</span>
              </div>
              <Slider
                value={[downPaymentPercent]}
                onValueChange={(val) => setDownPaymentPercent(val[0])}
                min={0}
                max={50}
                step={5}
                className='w-full'
              />
              <div className='flex justify-between text-muted-foreground text-xs'>
                <span>AED {Math.round((price * downPaymentPercent) / 100).toLocaleString()}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Lease Duration</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='12'>12 Months</SelectItem>
                  <SelectItem value='24'>24 Months</SelectItem>
                  <SelectItem value='36'>36 Months</SelectItem>
                  <SelectItem value='48'>48 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center justify-between rounded-lg border p-4 shadow-sm'>
              <div className='space-y-0.5'>
                <Label className='text-base'>Comprehensive Insurance</Label>
                <p className='text-muted-foreground text-sm'>Include full coverage in monthly payment</p>
              </div>
              <Switch checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
            </div>
          </div>
        </div>

        <Card className='overflow-hidden border-none bg-muted/50 shadow-xl'>
          <CardHeader className='bg-primary/5 py-6'>
            <CardTitle>Your Lease Estimate</CardTitle>
            <CardDescription>Based on your selected preferences</CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='mb-8 text-center'>
              <p className='text-muted-foreground text-sm font-medium uppercase tracking-wider'>Monthly Payment</p>
              <div className='flex items-baseline justify-center gap-1'>
                <span className='text-lg font-bold text-primary'>AED</span>
                <span className='text-5xl font-extrabold text-primary'>{result.monthlyPayment.toLocaleString()}</span>
              </div>
              <p className='mt-2 text-muted-foreground text-xs'>*Estimated figure. Terms and conditions apply.</p>
            </div>

            <div className='space-y-4 rounded-lg bg-background p-4'>
              <h4 className='mb-4 font-medium text-sm'>Payment Breakdown</h4>

              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Vehicle Price</span>
                <span className='font-medium'>AED {price.toLocaleString()}</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Down Payment ({downPaymentPercent}%)</span>
                <span className='font-medium'>
                  - AED {Math.round((price * downPaymentPercent) / 100).toLocaleString()}
                </span>
              </div>

              <Separator />

              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Total Amount Financed</span>
                <span className='font-medium'>AED {result.amountFinanced.toLocaleString()}</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Total Interest (Est.)</span>
                <span className='font-medium'>AED {result.totalInterest.toLocaleString()}</span>
              </div>

              {includeInsurance && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Insurance (Monthly)</span>
                  <span className='font-medium'>AED {result.insuranceMonthly.toLocaleString()}</span>
                </div>
              )}

              <Separator className='my-2' />

              <div className='flex justify-between font-bold text-base'>
                <span>Total Amount Payable</span>
                <span>AED {result.totalPayable.toLocaleString()}</span>
              </div>
              <p className='mt-1 text-right text-muted-foreground text-xs'>
                (Includes down payment + all monthly installments)
              </p>
            </div>

            <div className='mt-6'>
              <p className='text-center text-muted-foreground text-xs'>
                This is an estimate only. Final pricing depends on credit approval, actual vehicle availability, and
                specific lease terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
