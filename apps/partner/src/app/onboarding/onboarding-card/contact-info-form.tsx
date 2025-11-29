'use client';

import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MailIcon, PhoneIcon, GlobeIcon, MapPinIcon } from 'lucide-react';
import { LocationPicker } from '@/components/maps';
import type { GeocodedLocation } from '@/components/maps';
import { Label } from '@/components/ui/label';

interface ContactInfoFormProps {
  form: UseFormReturn<any>;
  selectedCity?: { lat: number; lng: number; name: string } | null;
  onLocationChange?: (location: GeocodedLocation) => void;
}

export default function ContactInfoForm({ form, selectedCity, onLocationChange }: ContactInfoFormProps) {
  const handleLocationSelect = (location: GeocodedLocation & { placeId?: string }) => {
    form.setValue('address', location.address);
    form.setValue('lat', location.lat);
    form.setValue('lng', location.lng);
    onLocationChange?.(location);
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <FormInput
          control={form.control}
          name='email'
          label='Email Address'
          description='Primary contact email for customer inquiries'
          render={(field) => (
            <div className='relative'>
              <MailIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                id={field.name}
                {...field}
                type='email'
                className='pl-10'
                placeholder='contact@example.com'
                required
              />
            </div>
          )}
        />
        <FormInput
          control={form.control}
          name='phoneNumber'
          label='Phone Number'
          description='Primary contact number with country code'
          render={(field) => (
            <div className='relative'>
              <PhoneIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input id={field.name} {...field} type='tel' className='pl-10' placeholder='+1 (555) 123-4567' required />
            </div>
          )}
        />
        <FormInput
          control={form.control}
          name='website'
          label='Website (Optional)'
          description='Your organization website or social media page'
          render={(field) => (
            <div className='relative'>
              <GlobeIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input id={field.name} {...field} type='url' className='pl-10' placeholder='https://www.example.com' />
            </div>
          )}
        />
      </div>

      <div className='border-t pt-6 mt-6'>
        <div className='flex items-center gap-2 mb-2'>
          <MapPinIcon className='w-4 h-4' />
          <h3 className='text-base font-semibold'>Physical Location</h3>
        </div>
        <p className='text-sm text-muted-foreground mb-4'>
          Click on the map or search to pinpoint your exact business location. This helps customers find you easily.
        </p>

        <div className='space-y-4'>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            centerCity={selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : undefined}
            initialLocation={
              form.getValues('lat') && form.getValues('lng')
                ? { lat: form.getValues('lat'), lng: form.getValues('lng') }
                : selectedCity
                  ? { lat: selectedCity.lat, lng: selectedCity.lng }
                  : undefined
            }
            placeholder={`Search for your address in ${selectedCity?.name || 'your city'}...`}
            height='350px'
          />

          <div>
            <Label className='text-sm font-medium mb-2 block'>Address</Label>
            <Input
              value={form.watch('address') || ''}
              readOnly
              placeholder='Click on the map to select your location'
              className='bg-muted/50'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              Address is automatically filled when you select a location on the map
            </p>
          </div>
        </div>
      </div>

      <div className='bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
        <p className='text-sm text-amber-900 dark:text-amber-50'>
          <strong>Important:</strong> Make sure these contact details and location are accurate. Customers will use them
          to reach you and find your business. We'll also use them for important account notifications.
        </p>
      </div>
    </div>
  );
}
