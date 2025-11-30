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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, Zap, Clock, Users, Gauge, CalendarDays, Info, Truck } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import FormInput from '@/components/form-input';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import { MileageUnitSchema } from '@yayago-app/db/enums';

const EditBookingSchema = z.object({
  hasInstantBooking: z.boolean(),
  minAge: z.number().int().min(16).max(100),
  maxAge: z.number().int().min(18).max(120).optional(),
  minRentalDays: z.number().int().min(1),
  maxRentalDays: z.number().int().min(1).optional(),
  mileageUnit: MileageUnitSchema,
  maxMileagePerDay: z.number().int().min(0).optional(),
  maxMileagePerRental: z.number().int().min(0).optional(),
  minNoticeHours: z.number().int().min(0).optional(),
  // Delivery options
  deliveryEnabled: z.boolean(),
  deliveryMaxDistance: z.number().min(0).optional(),
  deliveryBaseFee: z.number().min(0).optional(),
  deliveryPerKmFee: z.number().min(0).optional(),
  deliveryFreeRadius: z.number().min(0).optional(),
  deliveryNotes: z.string().max(500).optional(),
});

type EditBookingFormValues = z.infer<typeof EditBookingSchema>;

interface EditBookingFormProps {
  listing: FindOneListingOutputType;
}

export default function EditBookingForm({ listing }: EditBookingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const booking = listing.bookingDetails;

  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(EditBookingSchema),
    defaultValues: {
      hasInstantBooking: booking?.hasInstantBooking ?? false,
      minAge: booking?.minAge || 21,
      maxAge: booking?.maxAge || undefined,
      minRentalDays: booking?.minRentalDays || 1,
      maxRentalDays: booking?.maxRentalDays || undefined,
      mileageUnit: booking?.mileageUnit || 'KM',
      maxMileagePerDay: booking?.maxMileagePerDay || undefined,
      maxMileagePerRental: booking?.maxMileagePerRental || undefined,
      minNoticeHours: booking?.minNoticeHours || undefined,
      // Delivery options
      deliveryEnabled: booking?.deliveryEnabled ?? false,
      deliveryMaxDistance: booking?.deliveryMaxDistance || undefined,
      deliveryBaseFee: booking?.deliveryBaseFee || undefined,
      deliveryPerKmFee: booking?.deliveryPerKmFee || undefined,
      deliveryFreeRadius: booking?.deliveryFreeRadius || undefined,
      deliveryNotes: booking?.deliveryNotes || undefined,
    },
  });

  const hasInstantBooking = form.watch('hasInstantBooking');
  const mileageUnit = form.watch('mileageUnit');
  const deliveryEnabled = form.watch('deliveryEnabled');

  const { mutate, isPending } = useMutation(
    orpc.listings.updateBookingDetails.mutationOptions({
      onSuccess: () => {
        toast.success('Booking rules updated');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        router.push(`/listings/${listing.slug}/edit`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update booking rules');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      slug: listing.slug,
      data: {
        hasInstantBooking: data.hasInstantBooking,
        minAge: data.minAge,
        maxAge: data.maxAge,
        minRentalDays: data.minRentalDays,
        maxRentalDays: data.maxRentalDays,
        mileageUnit: data.mileageUnit,
        maxMileagePerDay: data.maxMileagePerDay,
        maxMileagePerRental: data.maxMileagePerRental,
        minNoticeHours: data.minNoticeHours,
        // Delivery options
        deliveryEnabled: data.deliveryEnabled,
        deliveryMaxDistance: data.deliveryMaxDistance,
        deliveryBaseFee: data.deliveryBaseFee,
        deliveryPerKmFee: data.deliveryPerKmFee,
        deliveryFreeRadius: data.deliveryFreeRadius,
        deliveryNotes: data.deliveryNotes,
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Instant Booking */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='size-5 text-yellow-500' />
            Booking Type
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FormInput
            control={form.control}
            name='hasInstantBooking'
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
                        increase your bookings.
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
                You'll need to manually approve or decline each booking request within 24 hours.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guest Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='size-5' />
            Guest Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
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
              name='minAge'
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
              name='maxAge'
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
        </CardContent>
      </Card>

      {/* Rental Duration */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='size-5' />
            Rental Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormInput
              control={form.control}
              name='minRentalDays'
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
              name='maxRentalDays'
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
        </CardContent>
      </Card>

      {/* Mileage Policy */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Gauge className='size-5' />
            Mileage Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormInput
              control={form.control}
              name='mileageUnit'
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
              name='maxMileagePerDay'
              label='Daily Mileage Limit (Optional)'
              description={`Maximum ${mileageUnit} per day`}
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
        </CardContent>
      </Card>

      {/* Booking Notice */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='size-5' />
            Booking Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormInput
            control={form.control}
            name='minNoticeHours'
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
        </CardContent>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Truck className='size-5 text-cyan-500' />
            Delivery Options
          </CardTitle>
          <CardDescription>
            Offer to deliver the vehicle to your customer's location
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FormInput
            control={form.control}
            name='deliveryEnabled'
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
                        Customers can request delivery to their location. This can increase your bookings.
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
                  Set your delivery range and pricing. You can offer free delivery within a certain radius and charge for longer distances.
                </AlertDescription>
              </Alert>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormInput
                  control={form.control}
                  name='deliveryMaxDistance'
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
                  name='deliveryFreeRadius'
                  label='Free Delivery Radius (km)'
                  description='Offer free delivery within this distance'
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
                  name='deliveryBaseFee'
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
                  name='deliveryPerKmFee'
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
                name='deliveryNotes'
                label='Delivery Notes (Optional)'
                description='Any special instructions for delivery'
                render={(field) => (
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    className='min-h-[80px]'
                    placeholder='e.g., Delivery available 8am-8pm only'
                  />
                )}
              />
            </div>
          )}
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

