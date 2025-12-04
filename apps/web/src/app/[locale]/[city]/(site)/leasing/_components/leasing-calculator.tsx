'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Calculator, Car, Minus, Plus, Shield } from 'lucide-react';
import React from 'react';

const CAR_TYPES = [
  { label: 'Economy', example: 'Nissan Sunny', price: 60000 },
  { label: 'Sedan', example: 'Toyota Camry', price: 110000 },
  { label: 'SUV', example: 'Nissan Patrol', price: 250000 },
  { label: 'Luxury', example: 'Mercedes E-Class', price: 350000 },
  { label: 'Sports', example: 'Porsche 911', price: 550000 },
];

const TERM_OPTIONS = [
  { value: '12', label: '12 Months', discount: 0 },
  { value: '24', label: '24 Months', discount: 5 },
  { value: '36', label: '36 Months', discount: 10 },
  { value: '48', label: '48 Months', discount: 15 },
];

export function LeasingCalculator() {
  const [carType, setCarType] = React.useState<string>('Sedan');
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

  const handleCarTypeChange = (value: string) => {
    setCarType(value);
    const selectedCar = CAR_TYPES.find((c) => c.label === value);
    if (selectedCar) {
      setPrice(selectedCar.price);
    }
  };

  const incrementDownPayment = () => setDownPaymentPercent((prev) => Math.min(50, prev + 5));
  const decrementDownPayment = () => setDownPaymentPercent((prev) => Math.max(0, prev - 5));

  React.useEffect(() => {
    calculateLease();
  }, [price, downPaymentPercent, term, includeInsurance]);

  const calculateLease = () => {
    const downPayment = (price * downPaymentPercent) / 100;
    const principal = price - downPayment;
    const months = parseInt(term);

    let residualPercentage = 0.4;
    if (months === 12) residualPercentage = 0.6;
    if (months === 24) residualPercentage = 0.5;
    if (months === 48) residualPercentage = 0.35;

    const residualValue = price * residualPercentage;
    const depreciationFee = (principal - residualValue) / months;
    const moneyFactor = 0.0021;
    const financeFee = (principal + residualValue) * moneyFactor;
    const baseMonthly = depreciationFee + financeFee;

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

  const selectedCarInfo = CAR_TYPES.find((c) => c.label === carType);

  return (
    <section id='calculator' className='relative overflow-hidden py-20 lg:py-28'>
      {/* Background pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='leasing-hexagons' width='50' height='43.4' patternUnits='userSpaceOnUse' patternTransform='scale(2)'>
              <polygon
                points='24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#leasing-hexagons)' />
        </svg>
      </div>

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            <Calculator className='size-4' />
            Payment Calculator
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>Estimate Your Payments</h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            Customize your plan to see how affordable your dream car can be.
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
                    <h3 className='font-semibold text-white'>Lease Calculator</h3>
                    <p className='text-sm text-white/70'>Estimate your monthly payments</p>
                  </div>
                </div>
                {selectedCarInfo && (
                  <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm'>
                    <Car className='size-4' />
                    <span>{selectedCarInfo.example}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Calculator Body */}
            <div className='p-6 sm:p-8'>
              <div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>
                {/* Input Section */}
                <div className='space-y-6'>
                  {/* Vehicle Type */}
                  <div className='space-y-3'>
                    <Label className='font-semibold text-base'>Vehicle Type</Label>
                    <div className='grid grid-cols-5 gap-2'>
                      {CAR_TYPES.map((type) => (
                        <button
                          key={type.label}
                          type='button'
                          onClick={() => handleCarTypeChange(type.label)}
                          className={`py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                            carType === type.label
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Price */}
                  <div className='space-y-3'>
                    <Label className='font-semibold text-base'>Vehicle Price</Label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium'>
                        AED
                      </span>
                      <Input
                        type='number'
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={20000}
                        step={5000}
                        className='h-12 pl-14 text-lg font-semibold rounded-xl'
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label className='font-semibold text-base'>Down Payment</Label>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg font-bold text-primary'>{downPaymentPercent}%</span>
                        <span className='text-sm text-muted-foreground'>
                          (AED {Math.round((price * downPaymentPercent) / 100).toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-10 rounded-xl shrink-0'
                        onClick={decrementDownPayment}
                      >
                        <Minus className='size-4' />
                      </Button>
                      <Slider
                        value={[downPaymentPercent]}
                        onValueChange={(val) => setDownPaymentPercent(val[0])}
                        min={0}
                        max={50}
                        step={5}
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='size-10 rounded-xl shrink-0'
                        onClick={incrementDownPayment}
                      >
                        <Plus className='size-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Lease Duration */}
                  <div className='space-y-3'>
                    <Label className='font-semibold text-base'>Lease Duration</Label>
                    <div className='grid grid-cols-4 gap-2'>
                      {TERM_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type='button'
                          onClick={() => setTerm(option.value)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            term === option.value
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insurance Toggle */}
                  <div className='flex items-center justify-between rounded-xl border bg-muted/30 p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
                        <Shield className='size-5 text-primary' />
                      </div>
                      <div>
                        <Label className='text-base font-medium'>Comprehensive Insurance</Label>
                        <p className='text-muted-foreground text-xs'>Include full coverage in monthly payment</p>
                      </div>
                    </div>
                    <Switch checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
                  </div>
                </div>

                {/* Results Section */}
                <div className='space-y-4'>
                  {/* Monthly Payment Hero */}
                  <div className='rounded-2xl bg-primary p-6 text-center'>
                    <p className='text-sm text-white/70 mb-1'>Estimated Monthly Payment</p>
                    <div className='flex items-baseline justify-center gap-1'>
                      <span className='text-xl font-bold text-white/80'>AED</span>
                      <span className='text-5xl font-bold text-white'>{result.monthlyPayment.toLocaleString()}</span>
                    </div>
                    <p className='text-xs text-white/60 mt-2'>*Based on your selected preferences</p>
                  </div>

                  {/* Payment breakdown */}
                  <div className='rounded-2xl bg-muted/50 p-5 space-y-3'>
                    <h4 className='font-semibold text-sm text-muted-foreground uppercase tracking-wider'>
                      Payment Breakdown
                    </h4>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Vehicle Price</span>
                      <span className='font-semibold'>AED {price.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Down Payment ({downPaymentPercent}%)</span>
                      <span className='font-semibold text-destructive'>
                        - AED {Math.round((price * downPaymentPercent) / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Amount Financed</span>
                      <span className='font-semibold'>AED {result.amountFinanced.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-border/50'>
                      <span className='text-muted-foreground'>Total Interest (Est.)</span>
                      <span className='font-semibold'>AED {result.totalInterest.toLocaleString()}</span>
                    </div>
                    {includeInsurance && (
                      <div className='flex justify-between items-center py-2 border-b border-border/50'>
                        <span className='text-muted-foreground'>Insurance (Monthly)</span>
                        <span className='font-semibold'>AED {result.insuranceMonthly.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    <div className='flex justify-between items-center py-2'>
                      <span className='font-semibold'>Total Amount Payable</span>
                      <span className='font-bold text-lg text-primary'>AED {result.totalPayable.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button size='lg' className='w-full h-12 rounded-xl text-base' asChild>
                    <Link href='/contact'>
                      Contact Sales Team
                      <ArrowRight className='ml-2 size-5' />
                    </Link>
                  </Button>

                  <p className='text-center text-muted-foreground text-xs'>
                    This is an estimate only. Final pricing depends on credit approval and specific lease terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
