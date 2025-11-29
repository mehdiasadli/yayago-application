'use client';

import { UseFormReturn } from 'react-hook-form';
import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatEnumValue, formatCurrency } from '@/lib/utils';
import { DollarSign, Info, Shield, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { CreateListingInputSchema } from '@yayago-app/validators';
import { CancellationPolicySchema } from '@yayago-app/db/enums';
import type { z } from 'zod';

type FormValues = z.input<typeof CreateListingInputSchema>;

interface PricingStepProps {
  form: UseFormReturn<FormValues>;
}

const currencies = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
];

export default function PricingStep({ form }: PricingStepProps) {
  const currency = form.watch('pricing.currency');
  const pricePerDay = form.watch('pricing.pricePerDay');
  const securityDepositRequired = form.watch('pricing.securityDepositRequired');

  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <div className='space-y-8'>
      {/* Currency Selection */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500'>
            <DollarSign className='size-4' />
          </div>
          <span>Pricing Currency</span>
        </div>

        <FormInput
          control={form.control}
          name='pricing.currency'
          label='Currency'
          description='Select the currency for your rental prices'
          render={(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className='w-full md:w-72 h-12'>
                <SelectValue placeholder='Select currency' />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <span className='flex items-center gap-2'>
                      <span className='font-mono text-muted-foreground'>{curr.symbol}</span>
                      <span>{curr.name}</span>
                      <span className='text-muted-foreground'>({curr.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Rental Rates */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Rental Rates</h3>
        <Alert>
          <Info className='size-4' />
          <AlertTitle>Tip: Set competitive rates</AlertTitle>
          <AlertDescription>
            Research similar vehicles in your area. Offering weekly and monthly discounts can attract long-term renters.
          </AlertDescription>
        </Alert>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='border-2 border-primary/20'>
            <CardContent className='pt-4'>
              <FormInput
                control={form.control}
                name='pricing.pricePerDay'
                label='Daily Rate'
                description='Required - base rate per day'
                render={(field) => (
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      className='pl-10 h-12 text-lg font-semibold'
                      placeholder='0'
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <FormInput
                control={form.control}
                name='pricing.pricePerWeek'
                label='Weekly Rate'
                description='Optional - discount for 7+ days'
                render={(field) => (
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      value={field.value || ''}
                      className='pl-10 h-12'
                      placeholder='Optional'
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <FormInput
                control={form.control}
                name='pricing.pricePerMonth'
                label='Monthly Rate'
                description='Optional - discount for 30+ days'
                render={(field) => (
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      value={field.value || ''}
                      className='pl-10 h-12'
                      placeholder='Optional'
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {pricePerDay > 0 && (
          <div className='text-sm text-muted-foreground bg-muted/50 rounded-lg p-4'>
            <p className='font-medium mb-2'>Preview:</p>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <span className='block text-xs uppercase tracking-wide'>Daily</span>
                <span className='font-semibold'>{formatCurrency(pricePerDay, currency)}</span>
              </div>
              <div>
                <span className='block text-xs uppercase tracking-wide'>Weekly</span>
                <span className='font-semibold'>
                  {form.watch('pricing.pricePerWeek')
                    ? formatCurrency(form.watch('pricing.pricePerWeek') || 0, currency)
                    : `~${formatCurrency(pricePerDay * 7 * 0.9, currency)}`}
                </span>
              </div>
              <div>
                <span className='block text-xs uppercase tracking-wide'>Monthly</span>
                <span className='font-semibold'>
                  {form.watch('pricing.pricePerMonth')
                    ? formatCurrency(form.watch('pricing.pricePerMonth') || 0, currency)
                    : `~${formatCurrency(pricePerDay * 30 * 0.8, currency)}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security & Deposits */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500'>
            <Shield className='size-4' />
          </div>
          <span>Security & Deposits</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormInput
            control={form.control}
            name='pricing.depositAmount'
            label='Booking Deposit'
            description='Amount collected when booking is confirmed'
            render={(field) => (
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                  {selectedCurrency.symbol}
                </span>
                <Input
                  {...field}
                  type='number'
                  min={0}
                  value={field.value || ''}
                  className='pl-10 h-12'
                  placeholder='Optional'
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            )}
          />

          <div className='space-y-4'>
            <FormInput
              control={form.control}
              name='pricing.securityDepositRequired'
              label='Security Deposit'
              render={(field) => (
                <div className='flex items-center space-x-3 p-4 border rounded-lg h-12'>
                  <Checkbox id='securityDeposit' checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor='securityDeposit' className='cursor-pointer font-normal'>
                    Require security deposit
                  </Label>
                </div>
              )}
            />

            {securityDepositRequired && (
              <FormInput
                control={form.control}
                name='pricing.securityDepositAmount'
                label='Security Deposit Amount'
                render={(field) => (
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                      {selectedCurrency.symbol}
                    </span>
                    <Input
                      {...field}
                      type='number'
                      min={0}
                      value={field.value || ''}
                      className='pl-10 h-12'
                      placeholder='1000'
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500'>
            <Clock className='size-4' />
          </div>
          <span>Cancellation Policy</span>
        </div>

        <FormInput
          control={form.control}
          name='pricing.cancellationPolicy'
          label='Policy Type'
          render={(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className='h-12'>
                <SelectValue placeholder='Select policy' />
              </SelectTrigger>
              <SelectContent>
                {CancellationPolicySchema.options.map((policy) => (
                  <SelectItem key={policy} value={policy}>
                    {formatEnumValue(policy)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className={form.watch('pricing.cancellationPolicy') === 'STRICT' ? 'border-primary' : ''}>
            <CardContent className='pt-4'>
              <h4 className='font-semibold'>Strict</h4>
              <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                <li>• Full refund 7+ days before</li>
                <li>• 50% refund 3-7 days before</li>
                <li>• No refund within 3 days</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={form.watch('pricing.cancellationPolicy') === 'FLEXIBLE' ? 'border-primary' : ''}>
            <CardContent className='pt-4'>
              <h4 className='font-semibold'>Flexible</h4>
              <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                <li>• Full refund 24+ hours before</li>
                <li>• 50% refund within 24 hours</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={form.watch('pricing.cancellationPolicy') === 'FREE_CANCELLATION' ? 'border-primary' : ''}>
            <CardContent className='pt-4'>
              <h4 className='font-semibold'>Free Cancellation</h4>
              <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                <li>• Full refund anytime before pickup</li>
                <li>• Best for attracting renters</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
