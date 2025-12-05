'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  Loader2,
  Check,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';

// Form schema
const onboardingSchema = z.object({
  // Step 1: Organization Details
  name: z.string().min(2, 'Organization name is required'),
  slug: z
    .string()
    .min(2, 'URL slug is required')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  legalName: z.string().min(2, 'Legal name is required'),
  description: z.string().max(500).optional(),

  // Step 2: Location
  cityCode: z.string().min(1, 'Please select a city'),
  address: z.string().min(5, 'Address is required'),

  // Step 3: Contact
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  website: z.string().url().optional().or(z.literal('')),

  // Step 4: Business Info
  taxId: z.string().min(2, 'Tax ID is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { step: 1, title: 'Organization Details', icon: Building2, description: 'Basic information about your business' },
  { step: 2, title: 'Location', icon: MapPin, description: 'Where is your business located?' },
  { step: 3, title: 'Contact Info', icon: Phone, description: 'How can customers reach you?' },
  { step: 4, title: 'Business Info', icon: FileText, description: 'Tax and legal information' },
  { step: 5, title: 'Review', icon: CheckCircle, description: 'Review and submit your application' },
];

interface OnboardingFormProps {
  onSuccess: () => void;
}

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      slug: '',
      legalName: '',
      description: '',
      cityCode: '',
      address: '',
      email: '',
      phoneNumber: '',
      website: '',
      taxId: '',
    },
    mode: 'onChange',
  });

  const watchedName = form.watch('name');
  const watchedSlug = form.watch('slug');

  // Auto-generate slug from name
  if (!slugTouched && watchedName && !watchedSlug) {
    const generatedSlug = generateSlug(watchedName);
    if (generatedSlug !== watchedSlug) {
      form.setValue('slug', generatedSlug);
    }
  }

  // Fetch cities for selection
  const { data: citiesData } = useQuery(orpc.cities.findCitiesForOnboarding.queryOptions({ input: {} }));

  // Submit mutation
  const { mutateAsync: submitApplication, isPending } = useMutation(
    orpc.organizations.completeOnboarding.mutationOptions({
      onSuccess: () => {
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to submit application');
      },
    })
  );

  const isSlugValid = /^[a-z0-9_]*$/.test(watchedSlug || '');

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'slug', 'legalName'];
        break;
      case 2:
        fieldsToValidate = ['cityCode', 'address'];
        break;
      case 3:
        fieldsToValidate = ['email', 'phoneNumber'];
        break;
      case 4:
        fieldsToValidate = ['taxId'];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    await submitApplication({
      name: data.name,
      slug: data.slug,
      legalName: data.legalName,
      description: data.description || undefined,
      cityCode: data.cityCode,
      email: data.email,
      phoneNumber: data.phoneNumber,
      website: data.website || undefined,
      address: data.address,
      taxId: data.taxId,
    });
  });

  const currentStepData = STEPS[currentStep - 1];
  const StepIcon = currentStepData.icon;

  const cities = citiesData || [];
  const selectedCity = cities.find((c) => c.code === form.watch('cityCode'));

  return (
    <div className='space-y-6'>
      {/* Progress Steps */}
      <div className='flex items-center justify-between mb-8 overflow-x-auto pb-2'>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.step;
          const isCompleted = currentStep > step.step;

          return (
            <div key={step.step} className='flex items-center'>
              <div className='flex flex-col items-center min-w-[60px]'>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className='h-5 w-5' /> : <Icon className='h-5 w-5' />}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 text-center hidden sm:block',
                    isActive && 'text-primary font-medium',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn('h-0.5 w-8 sm:w-12 mx-2', currentStep > step.step ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className='border-0 shadow-lg'>
        <CardHeader className='border-b bg-muted/30'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              <StepIcon className='h-5 w-5' />
            </div>
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Step 1: Organization Details */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Organization Name *</Label>
                    <Input id='name' {...form.register('name')} placeholder='e.g., Acme Car Rentals' />
                    {form.formState.errors.name && (
                      <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='slug'>URL Slug *</Label>
                    <div className='relative'>
                      <Input
                        id='slug'
                        value={form.watch('slug') || ''}
                        onChange={(e) => {
                          const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                          form.setValue('slug', sanitized);
                          setSlugTouched(true);
                        }}
                        placeholder='e.g., acme_car_rentals'
                        className='pr-10'
                      />
                      {watchedSlug && (
                        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                          {isSlugValid ? (
                            <Check className='w-4 h-4 text-green-500' />
                          ) : (
                            <X className='w-4 h-4 text-destructive' />
                          )}
                        </div>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>Only lowercase letters, numbers, and underscores</p>
                    {form.formState.errors.slug && (
                      <p className='text-sm text-destructive'>{form.formState.errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='legalName'>Legal Business Name *</Label>
                  <Input id='legalName' {...form.register('legalName')} placeholder='e.g., Acme Car Rentals LLC' />
                  {form.formState.errors.legalName && (
                    <p className='text-sm text-destructive'>{form.formState.errors.legalName.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Textarea
                    id='description'
                    {...form.register('description')}
                    placeholder='Tell us about your business...'
                    rows={4}
                    maxLength={500}
                  />
                  <p className='text-xs text-muted-foreground text-right'>
                    {(form.watch('description') || '').length}/500
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='cityCode'>City *</Label>
                  <Select value={form.watch('cityCode')} onValueChange={(value) => form.setValue('cityCode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your city' />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}, {city.country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.cityCode && (
                    <p className='text-sm text-destructive'>{form.formState.errors.cityCode.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address'>Business Address *</Label>
                  <Textarea
                    id='address'
                    {...form.register('address')}
                    placeholder='Enter your full business address'
                    rows={3}
                  />
                  {form.formState.errors.address && (
                    <p className='text-sm text-destructive'>{form.formState.errors.address.message}</p>
                  )}
                </div>

                {selectedCity && (
                  <div className='bg-muted/50 rounded-lg p-4 flex gap-3'>
                    <Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
                    <div className='text-sm'>
                      <p className='font-medium'>Operating in {selectedCity.name}</p>
                      <p className='text-muted-foreground mt-1'>
                        You'll be able to list vehicles and serve customers in this city after approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Business Email *</Label>
                    <Input id='email' type='email' {...form.register('email')} placeholder='contact@yourbusiness.com' />
                    {form.formState.errors.email && (
                      <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phoneNumber'>Phone Number *</Label>
                    <Input
                      id='phoneNumber'
                      type='tel'
                      {...form.register('phoneNumber')}
                      placeholder='+1 (555) 123-4567'
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className='text-sm text-destructive'>{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='website'>Website (Optional)</Label>
                  <Input id='website' type='url' {...form.register('website')} placeholder='https://yourbusiness.com' />
                  {form.formState.errors.website && (
                    <p className='text-sm text-destructive'>{form.formState.errors.website.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Business Info */}
            {currentStep === 4 && (
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='taxId'>Tax ID / Business Registration Number *</Label>
                  <Input id='taxId' {...form.register('taxId')} placeholder='e.g., 12-3456789' />
                  <p className='text-xs text-muted-foreground'>
                    This is your official tax identification or business registration number
                  </p>
                  {form.formState.errors.taxId && (
                    <p className='text-sm text-destructive'>{form.formState.errors.taxId.message}</p>
                  )}
                </div>

                <div className='bg-muted/50 rounded-lg p-4 flex gap-3'>
                  <Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium'>Document Upload</p>
                    <p className='text-muted-foreground mt-1'>
                      After your application is approved, you'll be asked to upload supporting documents in the Partner
                      Dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className='space-y-6'>
                <div className='grid gap-4'>
                  <div className='bg-muted/50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2 flex items-center gap-2'>
                      <Building2 className='h-4 w-4' />
                      Organization Details
                    </h4>
                    <dl className='grid grid-cols-2 gap-2 text-sm'>
                      <dt className='text-muted-foreground'>Name:</dt>
                      <dd>{form.watch('name')}</dd>
                      <dt className='text-muted-foreground'>Slug:</dt>
                      <dd>{form.watch('slug')}</dd>
                      <dt className='text-muted-foreground'>Legal Name:</dt>
                      <dd>{form.watch('legalName')}</dd>
                    </dl>
                  </div>

                  <div className='bg-muted/50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2 flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      Location
                    </h4>
                    <dl className='grid grid-cols-2 gap-2 text-sm'>
                      <dt className='text-muted-foreground'>City:</dt>
                      <dd>{selectedCity?.name || 'Not selected'}</dd>
                      <dt className='text-muted-foreground'>Address:</dt>
                      <dd>{form.watch('address')}</dd>
                    </dl>
                  </div>

                  <div className='bg-muted/50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2 flex items-center gap-2'>
                      <Phone className='h-4 w-4' />
                      Contact Information
                    </h4>
                    <dl className='grid grid-cols-2 gap-2 text-sm'>
                      <dt className='text-muted-foreground'>Email:</dt>
                      <dd>{form.watch('email')}</dd>
                      <dt className='text-muted-foreground'>Phone:</dt>
                      <dd>{form.watch('phoneNumber')}</dd>
                      {form.watch('website') && (
                        <>
                          <dt className='text-muted-foreground'>Website:</dt>
                          <dd>{form.watch('website')}</dd>
                        </>
                      )}
                    </dl>
                  </div>

                  <div className='bg-muted/50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2 flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Business Information
                    </h4>
                    <dl className='grid grid-cols-2 gap-2 text-sm'>
                      <dt className='text-muted-foreground'>Tax ID:</dt>
                      <dd>{form.watch('taxId')}</dd>
                    </dl>
                  </div>
                </div>

                <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
                  <p className='text-sm'>
                    <strong>By submitting this application</strong>, you confirm that all information provided is
                    accurate and you agree to YayaGO's partner terms and conditions. Our team will review your
                    application and respond within 2-3 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className='pt-6 border-t flex justify-between items-center'>
              <div>
                {currentStep > 1 && (
                  <Button type='button' variant='outline' onClick={handleBack}>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back
                  </Button>
                )}
              </div>
              <div>
                {currentStep < 5 && (
                  <Button type='button' onClick={handleNext}>
                    Continue
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button type='submit' disabled={isPending} className='min-w-[180px]'>
                    {isPending ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
