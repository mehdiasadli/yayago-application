'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  Calendar,
  Tag,
  Building2,
  AlertTriangle,
  InfoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecodeVinOutputType } from '@yayago-app/validators';
import type { CreateListingInputSchema } from '@yayago-app/validators';
import type { z } from 'zod';

type FormValues = z.input<typeof CreateListingInputSchema>;

export interface VinDecodedData {
  vin: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  style: string | null;
  manufacturer: string | null;
  matchedBrandId: string | null;
  matchedBrandName: string | null;
  matchedModelId: string | null;
  matchedModelName: string | null;
}

interface VinStepProps {
  form: UseFormReturn<FormValues>;
  vinData: VinDecodedData | null;
  setVinData: (data: VinDecodedData | null) => void;
  onConfirm: () => void;
}

export default function VinStep({ form, vinData, setVinData, onConfirm }: VinStepProps) {
  const [vinInput, setVinInput] = useState(vinData?.vin || '');
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(!!vinData?.matchedModelId);

  // Manual selection state (when no match found)
  const [manualBrandSlug, setManualBrandSlug] = useState<string>('');
  const [manualModelId, setManualModelId] = useState<string>('');

  // Decode VIN mutation
  const { mutate: decodeVin, isPending: isDecoding } = useMutation(
    orpc.autodev.decodeVin.mutationOptions({
      onSuccess: (data) => {
        if (data.vinValid) {
          setVinData({
            vin: data.vin,
            make: data.make,
            model: data.model,
            year: data.year,
            trim: data.trim,
            style: data.style,
            manufacturer: data.manufacturer,
            matchedBrandId: data.matchedBrandId,
            matchedBrandName: data.matchedBrandName,
            matchedModelId: data.matchedModelId,
            matchedModelName: data.matchedModelName,
          });
          setError(null);
          setIsConfirmed(false);
          // Reset manual selection
          setManualBrandSlug('');
          setManualModelId('');
        } else {
          setError(data.error);
          setVinData(null);
        }
      },
      onError: (err) => {
        setError(err.message || 'Failed to decode VIN');
        setVinData(null);
      },
    })
  );

  // Fetch brands for manual selection
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery(
    orpc.vehicleBrands.list.queryOptions({
      input: { page: 1, take: 100 },
    })
  );

  // Fetch models when brand is selected
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    ...orpc.vehicleModels.list.queryOptions({
      input: { page: 1, take: 100, brandSlug: manualBrandSlug },
    }),
    enabled: !!manualBrandSlug,
  });

  const brands = brandsData?.items || [];
  const models = modelsData?.items || [];

  const handleDecode = () => {
    const trimmedVin = vinInput.trim().toUpperCase();
    if (trimmedVin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }
    setError(null);
    decodeVin({ vin: trimmedVin });
  };

  const handleConfirm = () => {
    if (!vinData) return;

    // Determine which model ID to use and get brand/model names
    let modelIdToUse = vinData.matchedModelId;
    let brandNameToUse = vinData.matchedBrandName || vinData.make;
    let modelNameToUse = vinData.matchedModelName || vinData.model;

    // Debug: Log initial values
    console.log('[VIN Step] handleConfirm called with:', {
      'vinData.matchedModelId': vinData.matchedModelId,
      'vinData.matchedBrandId': vinData.matchedBrandId,
      manualModelId,
      manualBrandSlug,
    });

    // If no match, use manual selection
    if (!modelIdToUse && manualModelId) {
      modelIdToUse = manualModelId;
      const selectedBrand = brands.find((b) => b.slug === manualBrandSlug);
      const selectedModel = models.find((m) => m.id === manualModelId);
      
      // Use selected names for title
      brandNameToUse = selectedBrand?.name || vinData.make;
      modelNameToUse = selectedModel?.name || vinData.model;
      
      // Update vinData with manual selection
      setVinData({
        ...vinData,
        matchedBrandId: selectedBrand?.id || null,
        matchedBrandName: brandNameToUse,
        matchedModelId: manualModelId,
        matchedModelName: modelNameToUse,
      });
    }

    if (!modelIdToUse) {
      setError('Please select a vehicle brand and model');
      return;
    }

    // Generate listing title: {brand} {model} {year} {trim}
    const titleParts = [brandNameToUse, modelNameToUse, vinData.year.toString()];
    if (vinData.trim) {
      titleParts.push(vinData.trim);
    }
    const generatedTitle = titleParts.join(' ');

    // Debug: Log what we're about to set
    console.log('[VIN Step] Setting form values:', {
      modelIdToUse,
      generatedTitle,
      year: vinData.year,
    });

    // Set form values from VIN data
    form.setValue('title', generatedTitle, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.modelId', modelIdToUse, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.year', vinData.year, { shouldDirty: true, shouldValidate: false });
    form.setValue('vehicle.vin', vinData.vin, { shouldDirty: true, shouldValidate: false });
    if (vinData.trim) {
      form.setValue('vehicle.trim', vinData.trim, { shouldDirty: true, shouldValidate: false });
    }
    if (vinData.style) {
      form.setValue('vehicle.style', vinData.style, { shouldDirty: true, shouldValidate: false });
    }
    if (vinData.manufacturer) {
      form.setValue('vehicle.manufacturer', vinData.manufacturer, { shouldDirty: true, shouldValidate: false });
    }

    // Debug: Verify values were set
    setTimeout(() => {
      console.log('[VIN Step] Verifying form values after set:', {
        'vehicle.modelId': form.getValues('vehicle.modelId'),
        title: form.getValues('title'),
      });
    }, 100);

    setIsConfirmed(true);
    onConfirm();
  };

  const needsManualSelection = vinData && !vinData.matchedModelId;

  return (
    <div className='space-y-6'>
      {/* VIN Input Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Search className='size-4' />
          </div>
          <span>Enter Vehicle VIN</span>
        </div>

        <Alert>
          <InfoIcon className='size-4' />
          <AlertTitle>What is a VIN?</AlertTitle>
          <AlertDescription>
            The Vehicle Identification Number (VIN) is a unique 17-character code that identifies your vehicle. You can
            find it on your vehicle registration, insurance documents, or on the dashboard near the windshield.
          </AlertDescription>
        </Alert>

        <div className='flex gap-3'>
          <div className='flex-1'>
            <Label htmlFor='vin-input' className='sr-only'>
              VIN
            </Label>
            <Input
              id='vin-input'
              value={vinInput}
              onChange={(e) => setVinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder='Enter 17-character VIN'
              maxLength={17}
              className='h-12 text-lg font-mono tracking-wider'
              disabled={isDecoding}
            />
            <p className='text-xs text-muted-foreground mt-1'>{vinInput.length}/17 characters</p>
          </div>
          <Button
            type='button'
            size='lg'
            onClick={handleDecode}
            disabled={vinInput.length !== 17 || isDecoding}
            className='h-12'
          >
            {isDecoding ? (
              <>
                <Loader2 className='size-4 animate-spin mr-2' />
                Decoding...
              </>
            ) : (
              <>
                <Search className='size-4 mr-2' />
                Decode VIN
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Decoded Data Display */}
      {vinData && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-lg font-semibold'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500'>
              <CheckCircle2 className='size-4' />
            </div>
            <span>Vehicle Information</span>
            {isConfirmed && <Badge variant='secondary'>Confirmed</Badge>}
          </div>

          <Card>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                {/* Make */}
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Car className='size-4' />
                    <span>Make</span>
                  </div>
                  <p className='font-medium text-lg'>{vinData.make}</p>
                  {vinData.matchedBrandName ? (
                    <Badge variant='outline' className='text-green-600 border-green-600'>
                      <CheckCircle2 className='size-3 mr-1' />
                      Matched: {vinData.matchedBrandName}
                    </Badge>
                  ) : (
                    <Badge variant='outline' className='text-amber-600 border-amber-600'>
                      <AlertTriangle className='size-3 mr-1' />
                      Not in database
                    </Badge>
                  )}
                </div>

                {/* Model */}
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='size-4' />
                    <span>Model</span>
                  </div>
                  <p className='font-medium text-lg'>{vinData.model}</p>
                  {vinData.matchedModelName ? (
                    <Badge variant='outline' className='text-green-600 border-green-600'>
                      <CheckCircle2 className='size-3 mr-1' />
                      Matched: {vinData.matchedModelName}
                    </Badge>
                  ) : (
                    <Badge variant='outline' className='text-amber-600 border-amber-600'>
                      <AlertTriangle className='size-3 mr-1' />
                      Not in database
                    </Badge>
                  )}
                </div>

                {/* Year */}
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Calendar className='size-4' />
                    <span>Year</span>
                  </div>
                  <p className='font-medium text-lg'>{vinData.year}</p>
                </div>

                {/* Trim */}
                {vinData.trim && (
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Tag className='size-4' />
                      <span>Trim</span>
                    </div>
                    <p className='font-medium'>{vinData.trim}</p>
                  </div>
                )}

                {/* Style */}
                {vinData.style && (
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Car className='size-4' />
                      <span>Style</span>
                    </div>
                    <p className='font-medium'>{vinData.style}</p>
                  </div>
                )}

                {/* Manufacturer */}
                {vinData.manufacturer && (
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Building2 className='size-4' />
                      <span>Manufacturer</span>
                    </div>
                    <p className='font-medium'>{vinData.manufacturer}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Selection (if no match) */}
          {needsManualSelection && (
            <div className='space-y-4'>
              <Alert>
                <AlertTriangle className='size-4' />
                <AlertTitle>Manual Selection Required</AlertTitle>
                <AlertDescription>
                  We couldn't automatically match your vehicle to our database. Please select the brand and model
                  manually from the options below.
                </AlertDescription>
              </Alert>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Brand Selector */}
                <div className='space-y-2'>
                  <Label>Select Brand</Label>
                  <Select value={manualBrandSlug} onValueChange={setManualBrandSlug}>
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

                {/* Model Selector */}
                <div className='space-y-2'>
                  <Label>Select Model</Label>
                  <Select
                    value={manualModelId}
                    onValueChange={setManualModelId}
                    disabled={!manualBrandSlug || isLoadingModels}
                  >
                    <SelectTrigger className='h-12'>
                      {isLoadingModels ? (
                        <Skeleton className='h-4 w-24' />
                      ) : (
                        <SelectValue placeholder={manualBrandSlug ? 'Select a model...' : 'Select brand first'} />
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
            </div>
          )}

          {/* Confirm Button */}
          {!isConfirmed && (
            <div className='flex justify-end'>
              <Button
                type='button'
                size='lg'
                onClick={handleConfirm}
                disabled={needsManualSelection && !manualModelId}
                className='min-w-[200px]'
              >
                <CheckCircle2 className='size-4 mr-2' />
                Confirm Vehicle Data
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!vinData && !error && (
        <div className='text-center py-12 text-muted-foreground'>
          <Car className='size-16 mx-auto mb-4 opacity-30' />
          <p className='text-lg font-medium'>Enter your VIN to get started</p>
          <p className='text-sm'>We'll automatically decode your vehicle information</p>
        </div>
      )}
    </div>
  );
}

