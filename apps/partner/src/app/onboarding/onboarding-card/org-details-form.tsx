import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { InfoIcon } from 'lucide-react';

interface OrgDetailsFormProps {
  form: UseFormReturn<any>;
}

export default function OrgDetailsForm({ form }: OrgDetailsFormProps) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormInput
          control={form.control}
          name='name'
          label='Organization Name'
          description='The public name of your organization'
          render={(field) => <Input id={field.name} {...field} placeholder='e.g., Acme Travel Agency' required />}
        />
        <FormInput
          control={form.control}
          name='slug'
          label='URL Slug'
          description='Unique identifier for your profile URL'
          render={(field) => <Input id={field.name} {...field} placeholder='e.g., acme-travel' required />}
        />
      </div>

      <FormInput
        control={form.control}
        name='legalName'
        label='Legal Name'
        description='Official registered name of your business'
        render={(field) => <Input id={field.name} {...field} placeholder='e.g., Acme Travel Agency LLC' />}
      />

      <FormInput
        control={form.control}
        name='description'
        label='Description'
        description='Tell customers about your organization (max 500 characters)'
        render={(field) => (
          <Textarea
            id={field.name}
            {...field}
            placeholder='Describe your organization, services, and what makes you unique...'
            rows={5}
            maxLength={500}
          />
        )}
      />

      <div className='bg-muted/50 border rounded-lg p-4 flex gap-3'>
        <InfoIcon className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium mb-1'>Tips for a great profile:</p>
          <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
            <li>Choose a clear, memorable organization name</li>
            <li>Use a simple slug (lowercase, hyphens for spaces)</li>
            <li>Write a compelling description that highlights your unique value</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
