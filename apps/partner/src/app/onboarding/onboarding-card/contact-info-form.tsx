'use client';

import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MailIcon, PhoneIcon, GlobeIcon, MapPinIcon, CheckCircleIcon } from 'lucide-react';
import { FindCitiesForOnboardingOutputType } from '@yayago-app/validators';
import { useEffect, useState } from 'react';

interface ContactInfoFormProps {
  form: UseFormReturn<any>;
  selectedCity?: FindCitiesForOnboardingOutputType[number] | null;
}

export default function ContactInfoForm({ form, selectedCity }: ContactInfoFormProps) {
  const [phonePrefix, setPhonePrefix] = useState('');

  // Set phone prefix from city's country phoneCode
  useEffect(() => {
    if (selectedCity?.country?.phoneCode) {
      const prefix = selectedCity.country.phoneCode.startsWith('+')
        ? selectedCity.country.phoneCode
        : `+${selectedCity.country.phoneCode}`;
      setPhonePrefix(prefix);

      // Auto-fill prefix if phone number is empty
      const currentPhone = form.getValues('phoneNumber');
      if (!currentPhone || currentPhone === '') {
        form.setValue('phoneNumber', prefix + ' ');
      }
    }
  }, [selectedCity, form]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Ensure the prefix stays at the beginning
    if (phonePrefix && !value.startsWith(phonePrefix)) {
      value = phonePrefix + ' ' + value.replace(/^\+?\d*\s*/, '');
    }

    form.setValue('phoneNumber', value);
  };

  return (
    <div className='space-y-6'>
      {/* Show selected location info */}
      {selectedCity && form.watch('address') && (
        <div className='bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3'>
          <CheckCircleIcon className='w-5 h-5 text-green-500 shrink-0 mt-0.5' />
          <div className='text-sm'>
            <p className='font-medium text-green-900 dark:text-green-50 mb-1'>Location Selected</p>
            <p className='text-green-800 dark:text-green-100'>
              <strong>City:</strong> {selectedCity.name}, {selectedCity.country.name}
            </p>
            <p className='text-green-800 dark:text-green-100'>
              <strong>Address:</strong> {form.watch('address')}
            </p>
          </div>
        </div>
      )}

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
          description={`Primary contact number${phonePrefix ? ` (${phonePrefix})` : ''}`}
          render={(field) => (
            <div className='relative'>
              <PhoneIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                id={field.name}
                value={field.value || ''}
                onChange={handlePhoneChange}
                onBlur={field.onBlur}
                type='tel'
                className='pl-10'
                placeholder={phonePrefix ? `${phonePrefix} 50 123 4567` : '+971 50 123 4567'}
                required
              />
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

      <div className='bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
        <p className='text-sm text-amber-900 dark:text-amber-50'>
          <strong>Important:</strong> Make sure these contact details are accurate. Customers will use them to reach you
          and we'll use them for important account notifications.
        </p>
      </div>
    </div>
  );
}
