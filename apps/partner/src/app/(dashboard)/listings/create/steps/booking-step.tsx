'use client';

import { UseFormReturn } from 'react-hook-form';
import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap, Clock, Users, Gauge, CalendarDays, Info, Truck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateListingInputSchema } from '@yayago-app/validators';
import { MileageUnitSchema } from '@yayago-app/db/enums';
import type { z } from 'zod';

type FormValues = z.input<typeof CreateListingInputSchema>;

interface BookingStepProps {
  form: UseFormReturn<FormValues>;
}

export default function BookingStep({ form }: BookingStepProps) {
  const hasInstantBooking = form.watch('bookingDetails.hasInstantBooking');
  const mileageUnit = form.watch('bookingDetails.mileageUnit');
  const deliveryEnabled = form.watch('bookingDetails.deliveryEnabled');

  return (
    <div className='space-y-8'>
      {/* Instant Booking */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500'>
            <Zap className='size-4' />
          </div>
          <span>Booking Type</span>
        </div>

        <FormInput
          control={form.control}
          name='bookingDetails.hasInstantBooking'
          label=''
          render={(field) => (
            <Card className={`cursor-pointer transition-all ${hasInstantBooking ? 'border-primary bg-primary/5' : ''}`}>
              <CardHeader className='pb-2'>
                <div className='flex items-start gap-4'>
                  <Checkbox
                    id='instantBooking'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='mt-1'
                  />
                  <div className='flex-1'>
                    <Label htmlFor='instantBooking' className='cursor-pointer'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Zap className='size-4 text-yellow-500' />
                        Enable Instant Booking
                      </CardTitle>
                    </Label>
                    <CardDescription className='mt-1'>
                      Allow guests to book immediately without waiting for your approval. This can significantly
                      increase your bookings as renters prefer instant confirmation.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        />

        {!hasInstantBooking && (
          <Alert>
            <Clock className='size-4' />
            <AlertTitle>Manual Approval Required</AlertTitle>
            <AlertDescription>
              You'll need to manually approve or decline each booking request within 24 hours. Delayed responses may
              result in lost bookings.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Guest Requirements */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500'>
            <Users className='size-4' />
          </div>
          <span>Guest Requirements</span>
        </div>

        <Alert>
          <Info className='size-4' />
          <AlertDescription>
            Set age requirements to comply with your insurance policy. Most rental insurance requires drivers to be at
            least 21 years old.
          </AlertDescription>
        </Alert>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='bookingDetails.minAge'
            label='Minimum Age'
            description='Minimum driver age required'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={16}
                max={100}
                className='h-12'
                onChange={(e) => field.onChange(parseInt(e.target.value) || 21)}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='bookingDetails.maxAge'
            label='Maximum Age (Optional)'
            description='Leave empty for no limit'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={18}
                max={120}
                value={field.value || ''}
                className='h-12'
                placeholder='No limit'
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </div>
      </div>

      {/* Rental Duration */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500'>
            <CalendarDays className='size-4' />
          </div>
          <span>Rental Duration</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='bookingDetails.minRentalDays'
            label='Minimum Rental Days'
            description='Minimum number of days per booking'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={1}
                className='h-12'
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='bookingDetails.maxRentalDays'
            label='Maximum Rental Days (Optional)'
            description='Leave empty for no limit'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={1}
                value={field.value || ''}
                className='h-12'
                placeholder='No limit'
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </div>
      </div>

      {/* Mileage Policy */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500'>
            <Gauge className='size-4' />
          </div>
          <span>Mileage Policy</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='bookingDetails.mileageUnit'
            label='Mileage Unit'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='h-12'>
                  <SelectValue placeholder='Select unit' />
                </SelectTrigger>
                <SelectContent>
                  {MileageUnitSchema.options.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit === 'KM' ? 'Kilometers (KM)' : 'Miles (MI)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='bookingDetails.maxMileagePerDay'
            label='Daily Mileage Limit (Optional)'
            description={`Maximum ${mileageUnit} per day - leave empty for unlimited`}
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={0}
                value={field.value || ''}
                className='h-12'
                placeholder='Unlimited'
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </div>
      </div>

      {/* Booking Notice */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500'>
            <Clock className='size-4' />
          </div>
          <span>Booking Notice</span>
        </div>

        <FormInput
          control={form.control}
          name='bookingDetails.minNoticeHours'
          label='Minimum Notice (Hours)'
          description='How much advance notice do you need before a booking starts?'
          render={(field) => (
            <div className='space-y-3'>
              <Input
                {...field}
                type='number'
                min={0}
                value={field.value || ''}
                className='h-12 max-w-xs'
                placeholder='24'
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <p className='text-sm text-muted-foreground'>
                Recommended: 24 hours. This gives you time to prepare the vehicle.
              </p>
            </div>
          )}
        />
      </div>

      {/* Delivery Options */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500'>
            <Truck className='size-4' />
          </div>
          <span>Delivery Options</span>
        </div>

        <FormInput
          control={form.control}
          name='bookingDetails.deliveryEnabled'
          label=''
          render={(field) => (
            <Card className={`cursor-pointer transition-all ${deliveryEnabled ? 'border-primary bg-primary/5' : ''}`}>
              <CardHeader className='pb-2'>
                <div className='flex items-start gap-4'>
                  <Switch
                    id='deliveryEnabled'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='mt-1'
                  />
                  <div className='flex-1'>
                    <Label htmlFor='deliveryEnabled' className='cursor-pointer'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Truck className='size-4 text-cyan-500' />
                        Enable Vehicle Delivery
                      </CardTitle>
                    </Label>
                    <CardDescription className='mt-1'>
                      Offer to deliver the vehicle to your customer's location. This can increase bookings and provide
                      better customer experience.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        />

        {deliveryEnabled && (
          <div className='space-y-4 p-4 border rounded-lg bg-muted/30'>
            <Alert>
              <Info className='size-4' />
              <AlertDescription>
                Configure how delivery works for this vehicle. You can set a maximum delivery distance, pricing, and
                optionally offer free delivery within a certain radius.
              </AlertDescription>
            </Alert>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='bookingDetails.deliveryMaxDistance'
                label='Maximum Delivery Distance (km)'
                description='How far are you willing to deliver?'
                render={(field) => (
                  <Input
                    {...field}
                    type='number'
                    min={1}
                    value={field.value || ''}
                    className='h-12'
                    placeholder='50'
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />

              <FormInput
                control={form.control}
                name='bookingDetails.deliveryFreeRadius'
                label='Free Delivery Radius (km)'
                description='Offer free delivery within this distance (optional)'
                render={(field) => (
                  <Input
                    {...field}
                    type='number'
                    min={0}
                    value={field.value || ''}
                    className='h-12'
                    placeholder='10'
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />

              <FormInput
                control={form.control}
                name='bookingDetails.deliveryBaseFee'
                label='Base Delivery Fee'
                description='Fixed fee charged for any delivery'
                render={(field) => (
                  <Input
                    {...field}
                    type='number'
                    min={0}
                    step='0.01'
                    value={field.value || ''}
                    className='h-12'
                    placeholder='25'
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />

              <FormInput
                control={form.control}
                name='bookingDetails.deliveryPerKmFee'
                label='Per Kilometer Fee'
                description='Additional charge per km beyond free radius'
                render={(field) => (
                  <Input
                    {...field}
                    type='number'
                    min={0}
                    step='0.01'
                    value={field.value || ''}
                    className='h-12'
                    placeholder='2'
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                )}
              />
            </div>

            <FormInput
              control={form.control}
              name='bookingDetails.deliveryNotes'
              label='Delivery Notes (Optional)'
              description='Any special instructions or conditions for delivery'
              render={(field) => (
                <Textarea
                  {...field}
                  value={field.value || ''}
                  className='min-h-[80px]'
                  placeholder='e.g., Delivery available 8am-8pm only. Weekend deliveries may have additional charges.'
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
