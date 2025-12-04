'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { type UpdatePreferencesInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  Settings,
  Globe,
  DollarSign,
  Ruler,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const currencies = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
];

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
];

const distanceUnits = [
  { value: 'km', label: 'Kilometers', short: 'km', description: 'Metric system' },
  { value: 'mi', label: 'Miles', short: 'mi', description: 'Imperial system' },
];

export default function PreferencesSettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdatePreferencesInputType>({
    defaultValues: {
      preferredCurrency: 'AED',
      preferredLanguage: 'en',
      preferredDistanceUnit: 'km',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        preferredCurrency: profile.preferredCurrency || 'AED',
        preferredLanguage: profile.preferredLanguage || 'en',
        preferredDistanceUnit: (profile.preferredDistanceUnit as 'km' | 'mi') || 'km',
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation(
    orpc.users.updatePreferences.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Preferences updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update preferences');
      },
    })
  );

  const onSubmit = (data: UpdatePreferencesInputType) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <PreferencesSkeleton />;
  }

  if (!profile) {
    return (
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  const hasChanges = form.formState.isDirty;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <Settings className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Preferences</h2>
          <p className='text-muted-foreground'>Customize your experience on YayaGO</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Currency */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <DollarSign className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Currency</CardTitle>
                <CardDescription className='text-sm'>
                  Prices will be displayed in this currency
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {currencies.map((currency) => {
                const isSelected = form.watch('preferredCurrency') === currency.code;
                return (
                  <button
                    key={currency.code}
                    type='button'
                    onClick={() => form.setValue('preferredCurrency', currency.code, { shouldDirty: true })}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg text-lg font-medium',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      {currency.symbol}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium'>{currency.code}</p>
                      <p className='text-xs text-muted-foreground truncate'>{currency.name}</p>
                    </div>
                    {isSelected && <CheckCircle2 className='size-4 text-primary shrink-0' />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <Globe className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Language</CardTitle>
                <CardDescription className='text-sm'>
                  Your preferred language for the interface
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {languages.map((lang) => {
                const isSelected = form.watch('preferredLanguage') === lang.code;
                return (
                  <button
                    key={lang.code}
                    type='button'
                    onClick={() => form.setValue('preferredLanguage', lang.code, { shouldDirty: true })}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg text-sm font-medium',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      {lang.code.toUpperCase()}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium truncate'>{lang.name}</p>
                      <p className='text-xs text-muted-foreground truncate'>{lang.native}</p>
                    </div>
                    {isSelected && <CheckCircle2 className='size-4 text-primary shrink-0' />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Distance Unit */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <Ruler className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Distance Unit</CardTitle>
                <CardDescription className='text-sm'>
                  For mileage and delivery distances
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={form.watch('preferredDistanceUnit')}
              onValueChange={(value) => form.setValue('preferredDistanceUnit', value as 'km' | 'mi', { shouldDirty: true })}
              className='grid gap-3 sm:grid-cols-2'
            >
              {distanceUnits.map((unit) => {
                const isSelected = form.watch('preferredDistanceUnit') === unit.value;
                return (
                  <Label
                    key={unit.value}
                    htmlFor={unit.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <RadioGroupItem value={unit.value} id={unit.value} className='sr-only' />
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg text-sm font-bold',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      {unit.short}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium'>{unit.label}</p>
                      <p className='text-xs text-muted-foreground'>{unit.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className='size-5 text-primary shrink-0' />}
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex items-center justify-between rounded-2xl border bg-card p-4'>
          <div className='text-sm'>
            {hasChanges ? (
              <span className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
                <div className='size-2 rounded-full bg-amber-500 animate-pulse' />
                You have unsaved changes
              </span>
            ) : (
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <CheckCircle2 className='size-4' />
                All changes saved
              </span>
            )}
          </div>
          <Button type='submit' disabled={updateMutation.isPending || !hasChanges} className='h-10'>
            {updateMutation.isPending ? (
              <>
                <Loader2 className='size-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='size-4 mr-2' />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PreferencesSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-2xl' />
        <div className='space-y-2'>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-4 w-56' />
        </div>
      </div>

      {/* Currency skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-16 w-full rounded-xl' />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-52' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-16 w-full rounded-xl' />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distance skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-3 w-44' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 sm:grid-cols-2'>
            <Skeleton className='h-20 w-full rounded-xl' />
            <Skeleton className='h-20 w-full rounded-xl' />
          </div>
        </CardContent>
      </Card>

      {/* Submit skeleton */}
      <div className='flex items-center justify-between rounded-2xl border p-4'>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}
