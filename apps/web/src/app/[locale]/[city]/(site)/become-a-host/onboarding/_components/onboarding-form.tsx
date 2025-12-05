'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
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
  Sparkles,
  Shield,
  Globe,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';
import { LocationPicker, MapProvider, type GeocodedLocation } from '@/components/maps';
import type { FindCitiesForOnboardingOutputType } from '@yayago-app/validators';

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
  address: z.string().min(5, 'Please select a location on the map'),
  lat: z.number().optional(),
  lng: z.number().optional(),

  // Step 3: Contact
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  website: z.string().url().optional().or(z.literal('')),

  // Step 4: Business Info
  taxId: z.string().min(2, 'Tax ID is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { step: 1, title: 'Organization', icon: Building2, description: 'Basic information about your business' },
  { step: 2, title: 'Location', icon: MapPin, description: 'Where is your business located?' },
  { step: 3, title: 'Contact', icon: Phone, description: 'How can customers reach you?' },
  { step: 4, title: 'Legal', icon: FileText, description: 'Tax and legal information' },
  { step: 5, title: 'Review', icon: CheckCircle, description: 'Review and submit' },
];

const STORAGE_KEY = 'yayago-onboarding-draft';

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
  const [selectedCity, setSelectedCity] = useState<FindCitiesForOnboardingOutputType[number] | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      slug: '',
      legalName: '',
      description: '',
      cityCode: '',
      address: '',
      lat: undefined,
      lng: undefined,
      email: '',
      phoneNumber: '',
      website: '',
      taxId: '',
    },
    mode: 'onChange',
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          Object.entries(parsed.data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              form.setValue(key as keyof OnboardingFormData, value as any);
            }
          });
        }
        if (parsed.step && parsed.step > 0 && parsed.step <= 5) {
          setCurrentStep(parsed.step);
        }
        if (parsed.slugTouched) {
          setSlugTouched(true);
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    setIsHydrated(true);
  }, [form]);

  // Save data to localStorage on changes
  const saveProgress = useCallback(() => {
    if (!isHydrated) return;
    try {
      const data = form.getValues();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          data,
          step: currentStep,
          slugTouched,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [form, currentStep, slugTouched, isHydrated]);

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      saveProgress();
    });
    return () => subscription.unsubscribe();
  }, [form, saveProgress]);

  // Save when step changes
  useEffect(() => {
    saveProgress();
  }, [currentStep, saveProgress]);

  const watchedName = form.watch('name');
  const watchedSlug = form.watch('slug');
  const watchedCityCode = form.watch('cityCode');

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && watchedName) {
      const generatedSlug = generateSlug(watchedName);
      if (generatedSlug && generatedSlug !== watchedSlug) {
        form.setValue('slug', generatedSlug);
      }
    }
  }, [watchedName, slugTouched, watchedSlug, form]);

  // Fetch cities for selection
  const { data: citiesData, isLoading: citiesLoading } = useQuery(
    orpc.cities.findCitiesForOnboarding.queryOptions({ input: {} })
  );

  // Update selected city when cityCode changes
  useEffect(() => {
    if (citiesData && watchedCityCode) {
      const city = citiesData.find((c) => c.code === watchedCityCode);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [citiesData, watchedCityCode]);

  // Submit mutation
  const { mutateAsync: submitApplication, isPending } = useMutation(
    orpc.organizations.completeOnboarding.mutationOptions({
      onSuccess: () => {
        // Clear saved data on success
        localStorage.removeItem(STORAGE_KEY);
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

  const handleLocationSelect = (location: GeocodedLocation & { placeId?: string }) => {
    form.setValue('address', location.address);
    form.setValue('lat', location.lat);
    form.setValue('lng', location.lng);
  };

  const handleCityChange = (cityCode: string) => {
    const city = citiesData?.find((c) => c.code === cityCode);
    if (city) {
      setSelectedCity(city);
      form.setValue('cityCode', cityCode);
      // Reset location when city changes
      form.setValue('address', '');
      form.setValue('lat', undefined);
      form.setValue('lng', undefined);
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

  if (!isHydrated) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Progress Steps - Enhanced Design */}
      <div className='relative'>
        {/* Progress Line */}
        <div className='absolute top-5 left-0 right-0 h-0.5 bg-muted hidden sm:block'>
          <div
            className='h-full bg-primary transition-all duration-500'
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className='flex items-start justify-between relative'>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.step;
            const isCompleted = currentStep > step.step;

            return (
              <div key={step.step} className='flex flex-col items-center flex-1'>
                <div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                    isActive &&
                      'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    !isActive && !isCompleted && 'bg-background border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className='h-5 w-5' /> : <Icon className='h-5 w-5' />}
                </div>
                <div className='mt-3 text-center'>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:block',
                      isActive && 'text-primary',
                      isCompleted && 'text-primary',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Card - Enhanced Design */}
      <Card className='border-0 pt-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden'>
        {/* Card Header with Gradient */}
        <CardHeader className='relative pt-3 bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b'>
          <div className='absolute inset-0 opacity-[0.02]'>
            <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <pattern id='onboarding-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
                  <path d='M 32 0 L 0 0 0 32' fill='none' stroke='currentColor' strokeWidth='0.5' />
                </pattern>
              </defs>
              <rect width='100%' height='100%' fill='url(#onboarding-grid)' />
            </svg>
          </div>
          <div className='relative flex items-center gap-4'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30'>
              <StepIcon className='h-7 w-7' />
            </div>
            <div>
              <Badge variant='secondary' className='mb-2'>
                Step {currentStep} of {STEPS.length}
              </Badge>
              <CardTitle className='text-xl'>{currentStepData.title}</CardTitle>
              <CardDescription className='text-sm'>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-8 pb-6'>
          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Step 1: Organization Details */}
            {currentStep === 1 && (
              <div className='space-y-8'>
                <div className='flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20'>
                  <Sparkles className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-foreground'>Let's get started!</p>
                    <p className='text-muted-foreground mt-1'>
                      Tell us about your organization. This information will be visible to customers.
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium'>
                      Organization Name <span className='text-destructive'>*</span>
                    </Label>
                    <Input id='name' {...form.register('name')} placeholder='e.g., Acme Car Rentals' className='h-11' />
                    {form.formState.errors.name && (
                      <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='slug' className='text-sm font-medium'>
                      URL Slug <span className='text-destructive'>*</span>
                    </Label>
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
                        className='h-11 pr-10'
                      />
                      {watchedSlug && (
                        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                          {isSlugValid ? (
                            <Check className='w-5 h-5 text-green-500' />
                          ) : (
                            <X className='w-5 h-5 text-destructive' />
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
                  <Label htmlFor='legalName' className='text-sm font-medium'>
                    Legal Business Name <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='legalName'
                    {...form.register('legalName')}
                    placeholder='e.g., Acme Car Rentals LLC'
                    className='h-11'
                  />
                  {form.formState.errors.legalName && (
                    <p className='text-sm text-destructive'>{form.formState.errors.legalName.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-sm font-medium'>
                    Description <span className='text-muted-foreground text-xs'>(Optional)</span>
                  </Label>
                  <Textarea
                    id='description'
                    {...form.register('description')}
                    placeholder='Tell us about your business...'
                    rows={4}
                    maxLength={500}
                    className='resize-none'
                  />
                  <p className='text-xs text-muted-foreground text-right'>
                    {(form.watch('description') || '').length}/500
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Location with Map */}
            {currentStep === 2 && (
              <div className='space-y-8'>
                <div className='flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20'>
                  <MapPin className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-foreground'>Select Your Location</p>
                    <p className='text-muted-foreground mt-1'>
                      Choose your city first, then pinpoint your exact business location on the map.
                    </p>
                  </div>
                </div>

                {/* City Selection */}
                <div className='space-y-4'>
                  <Label className='text-sm font-medium'>
                    City <span className='text-destructive'>*</span>
                  </Label>

                  {citiesLoading ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
                    </div>
                  ) : cities.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      No cities available at the moment. Please contact support.
                    </div>
                  ) : (
                    <RadioGroup value={form.watch('cityCode')} onValueChange={handleCityChange}>
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                        {cities.map((city) => (
                          <div key={city.code}>
                            <div
                              className={cn(
                                'relative flex items-center gap-3 rounded-xl border-2 p-4 hover:border-primary/50 transition-all cursor-pointer',
                                form.watch('cityCode') === city.code
                                  ? 'border-primary bg-primary/5 shadow-md'
                                  : 'border-border bg-card'
                              )}
                            >
                              <RadioGroupItem value={city.code} id={`city-${city.code}`} className='shrink-0' />
                              <Label
                                htmlFor={`city-${city.code}`}
                                className='flex-1 cursor-pointer text-sm font-medium leading-none'
                              >
                                <div className='font-medium'>{city.name}</div>
                                <div className='text-xs text-muted-foreground mt-1'>{city.country.name}</div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                  {form.formState.errors.cityCode && (
                    <p className='text-sm text-destructive'>{form.formState.errors.cityCode.message}</p>
                  )}
                </div>

                {/* Map Picker - shown after city selection */}
                {selectedCity && (
                  <div className='space-y-4 pt-6 border-t'>
                    <div className='flex items-center gap-2'>
                      <Navigation className='w-5 h-5 text-primary' />
                      <Label className='text-sm font-medium'>
                        Pinpoint Your Location <span className='text-destructive'>*</span>
                      </Label>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Click on the map or search to find your exact business address in {selectedCity.name}.
                    </p>

                    <MapProvider>
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        centerCity={{ lat: selectedCity.lat, lng: selectedCity.lng }}
                        countryCode={selectedCity.country.code}
                        initialLocation={
                          form.getValues('lat') && form.getValues('lng')
                            ? { lat: form.getValues('lat')!, lng: form.getValues('lng')! }
                            : { lat: selectedCity.lat, lng: selectedCity.lng }
                        }
                        placeholder={`Search for your address in ${selectedCity.name}...`}
                        height='400px'
                      />
                    </MapProvider>

                    {form.watch('address') && (
                      <div className='p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl'>
                        <div className='flex items-start gap-3'>
                          <Check className='w-5 h-5 text-green-600 shrink-0 mt-0.5' />
                          <div>
                            <p className='text-sm font-medium text-green-800 dark:text-green-200'>Selected Address</p>
                            <p className='text-sm text-green-700 dark:text-green-300 mt-1'>{form.watch('address')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {form.formState.errors.address && (
                      <p className='text-sm text-destructive'>{form.formState.errors.address.message}</p>
                    )}
                  </div>
                )}

                <div className='p-4 rounded-xl bg-muted/50 border'>
                  <p className='text-sm text-muted-foreground'>
                    <strong className='text-foreground'>Can't find your city?</strong> If your city is not listed,
                    please contact our support team at{' '}
                    <a href='mailto:partners@yayago.com' className='text-primary hover:underline'>
                      partners@yayago.com
                    </a>{' '}
                    and we'll add it for you.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className='space-y-8'>
                <div className='flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20'>
                  <Phone className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-foreground'>Contact Information</p>
                    <p className='text-muted-foreground mt-1'>This is how customers and our team will contact you.</p>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium'>
                      Business Email <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      {...form.register('email')}
                      placeholder='contact@yourbusiness.com'
                      className='h-11'
                    />
                    {form.formState.errors.email && (
                      <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phoneNumber' className='text-sm font-medium'>
                      Phone Number <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='phoneNumber'
                      type='tel'
                      {...form.register('phoneNumber')}
                      placeholder='+1 (555) 123-4567'
                      className='h-11'
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className='text-sm text-destructive'>{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='website' className='text-sm font-medium'>
                    Website <span className='text-muted-foreground text-xs'>(Optional)</span>
                  </Label>
                  <div className='relative'>
                    <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                    <Input
                      id='website'
                      type='url'
                      {...form.register('website')}
                      placeholder='https://yourbusiness.com'
                      className='h-11 pl-10'
                    />
                  </div>
                  {form.formState.errors.website && (
                    <p className='text-sm text-destructive'>{form.formState.errors.website.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Business Info */}
            {currentStep === 4 && (
              <div className='space-y-8'>
                <div className='flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20'>
                  <Shield className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-foreground'>Legal Information</p>
                    <p className='text-muted-foreground mt-1'>
                      We need this for tax and compliance purposes. Your information is secure.
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='taxId' className='text-sm font-medium'>
                    Tax ID / Business Registration Number <span className='text-destructive'>*</span>
                  </Label>
                  <Input id='taxId' {...form.register('taxId')} placeholder='e.g., 12-3456789' className='h-11' />
                  <p className='text-xs text-muted-foreground'>
                    This is your official tax identification or business registration number
                  </p>
                  {form.formState.errors.taxId && (
                    <p className='text-sm text-destructive'>{form.formState.errors.taxId.message}</p>
                  )}
                </div>

                <div className='p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'>
                  <div className='flex items-start gap-3'>
                    <Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
                    <div className='text-sm'>
                      <p className='font-medium text-blue-900 dark:text-blue-50'>Document Upload</p>
                      <p className='text-blue-800 dark:text-blue-100 mt-1'>
                        After your application is approved, you'll be asked to upload supporting documents in the
                        Partner Dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className='space-y-6'>
                <div className='flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'>
                  <CheckCircle className='w-5 h-5 text-green-500 shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-green-900 dark:text-green-50'>Almost there!</p>
                    <p className='text-green-800 dark:text-green-100 mt-1'>
                      Please review your information before submitting.
                    </p>
                  </div>
                </div>

                <div className='grid gap-4'>
                  {/* Organization Details */}
                  <Card className='bg-muted/30 border-muted'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-2'>
                        <Building2 className='h-5 w-5 text-primary' />
                        <CardTitle className='text-base'>Organization Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        <div>
                          <dt className='text-muted-foreground'>Name</dt>
                          <dd className='font-medium'>{form.watch('name') || '-'}</dd>
                        </div>
                        <div>
                          <dt className='text-muted-foreground'>URL Slug</dt>
                          <dd className='font-medium'>{form.watch('slug') || '-'}</dd>
                        </div>
                        <div className='sm:col-span-2'>
                          <dt className='text-muted-foreground'>Legal Name</dt>
                          <dd className='font-medium'>{form.watch('legalName') || '-'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className='bg-muted/30 border-muted'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-5 w-5 text-primary' />
                        <CardTitle className='text-base'>Location</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        <div>
                          <dt className='text-muted-foreground'>City</dt>
                          <dd className='font-medium'>{selectedCity?.name || '-'}</dd>
                        </div>
                        <div className='sm:col-span-2'>
                          <dt className='text-muted-foreground'>Address</dt>
                          <dd className='font-medium'>{form.watch('address') || '-'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Contact */}
                  <Card className='bg-muted/30 border-muted'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-5 w-5 text-primary' />
                        <CardTitle className='text-base'>Contact Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        <div>
                          <dt className='text-muted-foreground'>Email</dt>
                          <dd className='font-medium'>{form.watch('email') || '-'}</dd>
                        </div>
                        <div>
                          <dt className='text-muted-foreground'>Phone</dt>
                          <dd className='font-medium'>{form.watch('phoneNumber') || '-'}</dd>
                        </div>
                        {form.watch('website') && (
                          <div className='sm:col-span-2'>
                            <dt className='text-muted-foreground'>Website</dt>
                            <dd className='font-medium'>{form.watch('website')}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Business Info */}
                  <Card className='bg-muted/30 border-muted'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-5 w-5 text-primary' />
                        <CardTitle className='text-base'>Business Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className='text-sm'>
                        <dt className='text-muted-foreground'>Tax ID</dt>
                        <dd className='font-medium'>{form.watch('taxId') || '-'}</dd>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <div className='p-4 rounded-xl bg-primary/5 border border-primary/20'>
                  <p className='text-sm'>
                    <strong>By submitting this application</strong>, you confirm that all information provided is
                    accurate and you agree to YayaGO's{' '}
                    <a href='/terms' className='text-primary hover:underline'>
                      partner terms and conditions
                    </a>
                    . Our team will review your application and respond within 2-3 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className='pt-6 border-t flex justify-between items-center gap-4'>
              <div>
                {currentStep > 1 && (
                  <Button type='button' variant='outline' onClick={handleBack} className='gap-2'>
                    <ArrowLeft className='h-4 w-4' />
                    Back
                  </Button>
                )}
              </div>
              <div className='flex items-center gap-3'>
                {/* Save indicator */}
                <span className='text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1'>
                  <Check className='h-3 w-3' />
                  Auto-saved
                </span>
                {currentStep < 5 && (
                  <Button type='button' onClick={handleNext} className='gap-2 min-w-[120px]'>
                    Continue
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button type='submit' disabled={isPending} className='gap-2 min-w-[180px]'>
                    {isPending ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='h-4 w-4' />
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
