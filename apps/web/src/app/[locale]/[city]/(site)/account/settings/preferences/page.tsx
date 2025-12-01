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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings, Globe, DollarSign, Ruler, Loader2, AlertCircle, Save } from 'lucide-react';

const currencies = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
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
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Preferences</h2>
        <p className='text-muted-foreground'>Customize your experience on YayaGO</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='size-5' />
              Display Preferences
            </CardTitle>
            <CardDescription>
              These settings affect how information is displayed to you
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Currency */}
            <div className='grid sm:grid-cols-2 gap-4 items-start'>
              <div className='space-y-1'>
                <Label htmlFor='currency' className='flex items-center gap-2'>
                  <DollarSign className='size-4' />
                  Currency
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Prices will be displayed in this currency
                </p>
              </div>
              <Select
                value={form.watch('preferredCurrency')}
                onValueChange={(value) => form.setValue('preferredCurrency', value)}
              >
                <SelectTrigger id='currency'>
                  <SelectValue placeholder='Select currency' />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className='flex items-center gap-2'>
                        <span className='w-6 text-center'>{currency.symbol}</span>
                        <span>
                          {currency.code} - {currency.name}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className='grid sm:grid-cols-2 gap-4 items-start'>
              <div className='space-y-1'>
                <Label htmlFor='language' className='flex items-center gap-2'>
                  <Globe className='size-4' />
                  Language
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Your preferred language for the interface
                </p>
              </div>
              <Select
                value={form.watch('preferredLanguage')}
                onValueChange={(value) => form.setValue('preferredLanguage', value)}
              >
                <SelectTrigger id='language'>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance Unit */}
            <div className='grid sm:grid-cols-2 gap-4 items-start'>
              <div className='space-y-1'>
                <Label htmlFor='distance' className='flex items-center gap-2'>
                  <Ruler className='size-4' />
                  Distance Unit
                </Label>
                <p className='text-sm text-muted-foreground'>
                  For mileage and delivery distances
                </p>
              </div>
              <Select
                value={form.watch('preferredDistanceUnit')}
                onValueChange={(value) =>
                  form.setValue('preferredDistanceUnit', value as 'km' | 'mi')
                }
              >
                <SelectTrigger id='distance'>
                  <SelectValue placeholder='Select unit' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='km'>Kilometers (km)</SelectItem>
                  <SelectItem value='mi'>Miles (mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className='size-4 mr-2 animate-spin' />
            ) : (
              <Save className='size-4 mr-2' />
            )}
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

function PreferencesSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-40 mb-2' />
        <Skeleton className='h-4 w-64' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-48' />
        </CardHeader>
        <CardContent className='space-y-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='grid sm:grid-cols-2 gap-4'>
              <div>
                <Skeleton className='h-4 w-24 mb-1' />
                <Skeleton className='h-3 w-48' />
              </div>
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

