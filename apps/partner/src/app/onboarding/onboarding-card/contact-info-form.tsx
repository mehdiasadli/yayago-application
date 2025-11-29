import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { MailIcon, PhoneIcon, GlobeIcon, MapPinIcon } from 'lucide-react';

interface ContactInfoFormProps {
  form: UseFormReturn<any>;
}

export default function ContactInfoForm({ form }: ContactInfoFormProps) {
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
        <h3 className='text-base font-semibold mb-4 flex items-center gap-2'>
          <MapPinIcon className='w-4 h-4' />
          Physical Address
        </h3>
        <FormInput
          control={form.control}
          name='address'
          label='Street Address'
          description='Your complete business address where customers can visit'
          render={(field) => (
            <Textarea
              id={field.name}
              {...field}
              placeholder='e.g., 123 Main Street, Suite 100&#10;Building Name&#10;Additional details...'
              rows={3}
              required
            />
          )}
        />
      </div>

      <div className='bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
        <p className='text-sm text-amber-900 dark:text-amber-50'>
          <strong>Important:</strong> Make sure these contact details and address are accurate. Customers will use them
          to reach you and find your location. We'll also use them for important account notifications.
        </p>
      </div>
    </div>
  );
}
