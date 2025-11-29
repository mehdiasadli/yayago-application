'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save, DollarSign, Shield, Clock } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import FormInput from '@/components/form-input';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import { CancellationPolicySchema } from '@yayago-app/db/enums';
import { formatEnumValue, formatCurrency } from '@/lib/utils';

const EditPricingSchema = z.object({
  currency: z.string().length(3),
  pricePerDay: z.number().min(0),
  pricePerWeek: z.number().min(0).optional(),
  pricePerMonth: z.number().min(0).optional(),
  weekendPricePerDay: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
  securityDepositRequired: z.boolean(),
  securityDepositAmount: z.number().min(0).optional(),
  cancellationPolicy: CancellationPolicySchema,
  taxRate: z.number().min(0).max(100).optional(),
});

type EditPricingFormValues = z.infer<typeof EditPricingSchema>;

interface EditPricingFormProps {
  listing: FindOneListingOutputType;
}

const currencies = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
];

export default function EditPricingForm({ listing }: EditPricingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pricing = listing.pricing;

  const form = useForm<EditPricingFormValues>({
    resolver: zodResolver(EditPricingSchema),
    defaultValues: {
      currency: pricing?.currency || 'AED',
      pricePerDay: pricing?.pricePerDay || 0,
      pricePerWeek: pricing?.pricePerWeek || undefined,
      pricePerMonth: pricing?.pricePerMonth || undefined,
      weekendPricePerDay: pricing?.weekendPricePerDay || undefined,
      depositAmount: pricing?.depositAmount || undefined,
      securityDepositRequired: pricing?.securityDepositRequired ?? true,
      securityDepositAmount: pricing?.securityDepositAmount || undefined,
      cancellationPolicy: pricing?.cancellationPolicy || 'STRICT',
      taxRate: pricing?.taxRate || undefined,
    },
  });

  const currency = form.watch('currency');
  const pricePerDay = form.watch('pricePerDay');
  const securityDepositRequired = form.watch('securityDepositRequired');
  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  const { mutate, isPending } = useMutation(
    orpc.listings.updatePricing.mutationOptions({
      onSuccess: () => {
        toast.success('Pricing updated');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        router.push(`/listings/${listing.slug}/edit`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update pricing');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      slug: listing.slug,
      data: {
        currency: data.currency,
        pricePerDay: data.pricePerDay,
        pricePerWeek: data.pricePerWeek,
        pricePerMonth: data.pricePerMonth,
        weekendPricePerDay: data.weekendPricePerDay,
        depositAmount: data.depositAmount,
        securityDepositRequired: data.securityDepositRequired,
        securityDepositAmount: data.securityDepositAmount,
        cancellationPolicy: data.cancellationPolicy,
        taxRate: data.taxRate,
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Currency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormInput
            control={form.control}
            name='currency'
            label='Pricing Currency'
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
        </CardContent>
      </Card>

      {/* Rental Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Rates</CardTitle>
          <CardDescription>Set your daily, weekly, and monthly rates</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FormInput
              control={form.control}
              name='pricePerDay'
              label='Daily Rate *'
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

            <FormInput
              control={form.control}
              name='pricePerWeek'
              label='Weekly Rate'
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

            <FormInput
              control={form.control}
              name='pricePerMonth'
              label='Monthly Rate'
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
          </div>

          <FormInput
            control={form.control}
            name='weekendPricePerDay'
            label='Weekend Daily Rate'
            description='Special rate for weekend days (optional)'
            render={(field) => (
              <div className='relative max-w-xs'>
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

          {/* Preview */}
          {pricePerDay > 0 && (
            <div className='text-sm text-muted-foreground bg-muted/50 rounded-lg p-4'>
              <p className='font-medium mb-2'>Rate Preview:</p>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <span className='block text-xs uppercase tracking-wide'>Daily</span>
                  <span className='font-semibold'>{formatCurrency(pricePerDay, currency)}</span>
                </div>
                <div>
                  <span className='block text-xs uppercase tracking-wide'>Weekly</span>
                  <span className='font-semibold'>
                    {form.watch('pricePerWeek')
                      ? formatCurrency(form.watch('pricePerWeek') || 0, currency)
                      : `~${formatCurrency(pricePerDay * 7 * 0.9, currency)}`}
                  </span>
                </div>
                <div>
                  <span className='block text-xs uppercase tracking-wide'>Monthly</span>
                  <span className='font-semibold'>
                    {form.watch('pricePerMonth')
                      ? formatCurrency(form.watch('pricePerMonth') || 0, currency)
                      : `~${formatCurrency(pricePerDay * 30 * 0.8, currency)}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposits */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='size-5' />
            Deposits
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormInput
              control={form.control}
              name='depositAmount'
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
                name='securityDepositRequired'
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
                  name='securityDepositAmount'
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
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='size-5' />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FormInput
            control={form.control}
            name='cancellationPolicy'
            label='Policy Type'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='h-12 max-w-xs'>
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
            <Card className={form.watch('cancellationPolicy') === 'STRICT' ? 'border-primary' : ''}>
              <CardContent className='pt-4'>
                <h4 className='font-semibold'>Strict</h4>
                <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                  <li>• Full refund 7+ days before</li>
                  <li>• 50% refund 3-7 days before</li>
                  <li>• No refund within 3 days</li>
                </ul>
              </CardContent>
            </Card>

            <Card className={form.watch('cancellationPolicy') === 'FLEXIBLE' ? 'border-primary' : ''}>
              <CardContent className='pt-4'>
                <h4 className='font-semibold'>Flexible</h4>
                <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                  <li>• Full refund 24+ hours before</li>
                  <li>• 50% refund within 24 hours</li>
                </ul>
              </CardContent>
            </Card>

            <Card className={form.watch('cancellationPolicy') === 'FREE_CANCELLATION' ? 'border-primary' : ''}>
              <CardContent className='pt-4'>
                <h4 className='font-semibold'>Free Cancellation</h4>
                <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                  <li>• Full refund anytime before pickup</li>
                  <li>• Best for attracting renters</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tax */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <FormInput
            control={form.control}
            name='taxRate'
            label='Tax Rate (%)'
            description='Optional tax rate to apply to bookings'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={0}
                max={100}
                step={0.01}
                value={field.value || ''}
                className='max-w-xs h-12'
                placeholder='e.g., 5'
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='size-4' />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

