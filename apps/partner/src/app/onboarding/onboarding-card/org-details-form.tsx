import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { InfoIcon, CheckIcon, XIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OrgDetailsFormProps {
  form: UseFormReturn<any>;
}

// Generate slug from organization name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

// Validate slug format (only lowercase letters, numbers, underscores)
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9_]*$/.test(slug);
}

// Sanitize slug input (remove invalid characters on the fly)
function sanitizeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

export default function OrgDetailsForm({ form }: OrgDetailsFormProps) {
  // Track if user has manually edited the slug
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugValid, setSlugValid] = useState(true);

  const watchedName = form.watch('name');
  const watchedSlug = form.watch('slug');

  // Auto-generate slug from name if slug hasn't been manually edited
  useEffect(() => {
    if (!slugTouched && watchedName) {
      const generatedSlug = generateSlug(watchedName);
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchedName, slugTouched, form]);

  // Validate slug format
  useEffect(() => {
    setSlugValid(isValidSlug(watchedSlug || ''));
  }, [watchedSlug]);

  // Handle slug input change with sanitization
  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeSlug(e.target.value);
      form.setValue('slug', sanitized, { shouldValidate: true });
      setSlugTouched(true);
    },
    [form]
  );

  // Handle slug blur to mark as touched
  const handleSlugBlur = useCallback(() => {
    setSlugTouched(true);
  }, []);

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
          description='Only lowercase letters, numbers, and underscores allowed'
          render={(field) => (
            <div className='relative'>
              <Input
                id={field.name}
                value={field.value || ''}
                onChange={handleSlugChange}
                onBlur={handleSlugBlur}
                placeholder='e.g., acme_travel'
                required
                className={cn(
                  'pr-10',
                  watchedSlug && !slugValid && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {watchedSlug && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  {slugValid ? (
                    <CheckIcon className='w-4 h-4 text-green-500' />
                  ) : (
                    <XIcon className='w-4 h-4 text-destructive' />
                  )}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <FormInput
        control={form.control}
        name='legalName'
        label='Legal Name'
        description='Official registered name of your business (required)'
        render={(field) => (
          <Input id={field.name} {...field} placeholder='e.g., Acme Travel Agency LLC' required />
        )}
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
