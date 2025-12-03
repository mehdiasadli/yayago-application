'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  AlertCircle,
  Car,
  Calendar,
  Tag,
  InfoIcon,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';
import type { CreateListingInputSchema } from '@yayago-app/validators';
import type { z } from 'zod';

type FormValues = z.input<typeof CreateListingInputSchema>;

export interface VinDecodedData {
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  matchedBrandId: string | null;
  matchedBrandName: string | null;
  matchedModelId: string | null;
  matchedModelName: string | null;
  isAgeException?: boolean; // True if car is older than allowed but exception requested
}

interface VinStepProps {
  form: UseFormReturn<FormValues>;
  vinData: VinDecodedData | null;
  setVinData: (data: VinDecodedData | null) => void;
  onConfirm: () => void;
}

export default function VinStep({ form, vinData, setVinData, onConfirm }: VinStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(!!vinData?.matchedModelId);

  // Form state
  const [vin, setVin] = useState(vinData?.vin || '');
  const [brandSlug, setBrandSlug] = useState<string>('');
  const [modelId, setModelId] = useState<string>(vinData?.matchedModelId || '');
  const [year, setYear] = useState<number>(vinData?.year || new Date().getFullYear());
  const [trim, setTrim] = useState<string>(vinData?.trim || '');
  const [requestAgeException, setRequestAgeException] = useState(vinData?.isAgeException || false);

  // Fetch organization data to get country rules
  const { data: orgData } = useQuery(orpc.organizations.getOrganization.queryOptions());

  // Extract country rules
  const maxCarRentalAge = orgData?.city?.country?.maxCarRentalAge ?? null;
  const hasCarRentalAgeExceptions = orgData?.city?.country?.hasCarRentalAgeExceptions ?? false;

  // Calculate min year based on country rules
  const currentYear = new Date().getFullYear();
  const minYear = maxCarRentalAge !== null ? currentYear - maxCarRentalAge : 1900;
  const isYearBelowLimit = year < minYear;

  // Fetch brands
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery(
    orpc.vehicleBrands.list.queryOptions({
      input: { page: 1, take: 100 },
    })
  );

  // Fetch models when brand is selected
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    ...orpc.vehicleModels.list.queryOptions({
      input: { page: 1, take: 100, brandSlug: brandSlug },
    }),
    enabled: !!brandSlug,
  });

  const brands = brandsData?.items || [];
  const models = modelsData?.items || [];

  // Find selected brand and model for display
  const selectedBrand = brands.find((b) => b.slug === brandSlug);
  const selectedModel = models.find((m) => m.id === modelId);

  // Reset model when brand changes
  useEffect(() => {
    setModelId('');
  }, [brandSlug]);

  // Reset exception request when year changes to valid
  useEffect(() => {
    if (!isYearBelowLimit) {
      setRequestAgeException(false);
    }
  }, [isYearBelowLimit]);

  const handleConfirm = () => {
    setError(null);

    // Validate VIN
    if (!vin || vin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    // Validate brand
    if (!brandSlug) {
      setError('Please select a vehicle brand');
      return;
    }

    // Validate model
    if (!modelId) {
      setError('Please select a vehicle model');
      return;
    }

    // Validate year
    if (!year || year < 1900 || year > currentYear + 1) {
      setError('Please enter a valid year');
      return;
    }

    // Check age limit
    if (isYearBelowLimit && !requestAgeException) {
      if (hasCarRentalAgeExceptions) {
        setError(`Vehicle must be ${maxCarRentalAge} years old or newer (${minYear} or later). Check the exception box if you want to request approval for an older vehicle.`);
      } else {
        setError(`Vehicle must be ${maxCarRentalAge} years old or newer (${minYear} or later). Your country does not allow exceptions for older vehicles.`);
      }
      return;
    }

    // Build vinData
    const newVinData: VinDecodedData = {
      vin: vin.toUpperCase(),
      make: selectedBrand?.name || 'Unknown',
      model: selectedModel?.name || 'Unknown',
      year,
      trim: trim || null,
      matchedBrandId: selectedBrand?.id || null,
      matchedBrandName: selectedBrand?.name || null,
      matchedModelId: modelId,
      matchedModelName: selectedModel?.name || null,
      isAgeException: isYearBelowLimit && requestAgeException,
    };

    setVinData(newVinData);

    // Generate listing title: {brand} {model} {year} {trim}
    const titleParts = [newVinData.matchedBrandName, newVinData.matchedModelName, year.toString()];
    if (trim) {
      titleParts.push(trim);
    }
    const generatedTitle = titleParts.filter(Boolean).join(' ');

    // Set form values
    form.setValue('title', generatedTitle, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.modelId', modelId, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.year', year, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.vin', vin.toUpperCase(), { shouldDirty: true, shouldValidate: false });
    if (trim) {
      form.setValue('vehicle.trim', trim, { shouldDirty: true, shouldValidate: false });
    }

    setIsConfirmed(true);
    onConfirm();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-2 text-lg font-semibold'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Car className='size-4' />
        </div>
        <span>Vehicle Identification</span>
      </div>

      <Alert>
        <InfoIcon className='size-4' />
        <AlertTitle>Enter Vehicle Details</AlertTitle>
        <AlertDescription>
          Please enter your vehicle's identification number and details. All listings are reviewed by our team before
          going live.
        </AlertDescription>
      </Alert>

      {/* Country Rules Info */}
      {maxCarRentalAge !== null && (
        <Alert variant={hasCarRentalAgeExceptions ? 'default' : 'destructive'}>
          <AlertTriangle className='size-4' />
          <AlertTitle>Vehicle Age Requirement</AlertTitle>
          <AlertDescription>
            {hasCarRentalAgeExceptions ? (
              <>
                Vehicles must be {maxCarRentalAge} years old or newer ({minYear} or later). 
                Exceptions may be requested for older vehicles and will be reviewed by our admin team.
              </>
            ) : (
              <>
                Vehicles must be {maxCarRentalAge} years old or newer ({minYear} or later). 
                No exceptions are allowed in your country.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className='pt-6 space-y-6'>
          {/* VIN Input */}
          <div className='space-y-2'>
            <Label htmlFor='vin' className='flex items-center gap-2'>
              <Fingerprint className='size-4' />
              VIN (Vehicle Identification Number) *
            </Label>
            <Input
              id='vin'
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder='Enter 17-character VIN'
              maxLength={17}
              className='h-12 text-lg font-mono tracking-wider'
              disabled={isConfirmed}
            />
            <p className='text-xs text-muted-foreground'>
              {vin.length}/17 characters • Found on your vehicle registration or dashboard
            </p>
          </div>

          {/* Brand & Model */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Car className='size-4' />
                Brand *
              </Label>
              <Select value={brandSlug} onValueChange={setBrandSlug} disabled={isConfirmed}>
                <SelectTrigger className='h-12'>
                  {isLoadingBrands ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    <SelectValue placeholder='Select a brand...' />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.slug} value={brand.slug}>
                      <div className='flex items-center gap-2'>
                        {brand.logo && <img src={brand.logo} alt={brand.name} className='size-5 object-contain' />}
                        <span>{brand.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <Tag className='size-4' />
                Model *
              </Label>
              <Select
                value={modelId}
                onValueChange={setModelId}
                disabled={!brandSlug || isLoadingModels || isConfirmed}
              >
                <SelectTrigger className='h-12'>
                  {isLoadingModels ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    <SelectValue placeholder={brandSlug ? 'Select a model...' : 'Select brand first'} />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Year & Trim */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='year' className='flex items-center gap-2'>
                <Calendar className='size-4' />
                Year *
              </Label>
              <Input
                id='year'
                type='number'
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)}
                min={1900}
                max={currentYear + 1}
                className='h-12'
                disabled={isConfirmed}
              />
              {isYearBelowLimit && (
                <p className='text-xs text-destructive'>
                  This vehicle is older than the {maxCarRentalAge}-year limit ({minYear} or later required)
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='trim' className='flex items-center gap-2'>
                <Tag className='size-4' />
                Trim (Optional)
              </Label>
              <Input
                id='trim'
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                placeholder='e.g., GT, Sport, Limited'
                className='h-12'
                disabled={isConfirmed}
              />
            </div>
          </div>

          {/* Age Exception Request */}
          {isYearBelowLimit && hasCarRentalAgeExceptions && !isConfirmed && (
            <Alert>
              <AlertTriangle className='size-4' />
              <AlertTitle>Request Age Exception</AlertTitle>
              <AlertDescription className='space-y-3'>
                <p>
                  Your vehicle ({year}) is older than the standard {maxCarRentalAge}-year limit. 
                  You can request an exception, which will be reviewed by our admin team.
                </p>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='age-exception'
                    checked={requestAgeException}
                    onCheckedChange={(checked) => setRequestAgeException(checked === true)}
                  />
                  <Label htmlFor='age-exception' className='text-sm cursor-pointer'>
                    I understand my listing will require admin approval due to vehicle age
                  </Label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='size-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <div className='flex justify-end'>
        {isConfirmed ? (
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 text-green-600'>
              <CheckCircle2 className='size-5' />
              <span className='font-medium'>Vehicle data confirmed</span>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsConfirmed(false);
                setVinData(null);
              }}
            >
              Edit
            </Button>
          </div>
        ) : (
          <Button
            type='button'
            size='lg'
            onClick={handleConfirm}
            disabled={!vin || vin.length !== 17 || !brandSlug || !modelId}
            className='min-w-[200px]'
          >
            <CheckCircle2 className='size-4 mr-2' />
            Confirm Vehicle Data
          </Button>
        )}
      </div>
    </div>
  );
}
