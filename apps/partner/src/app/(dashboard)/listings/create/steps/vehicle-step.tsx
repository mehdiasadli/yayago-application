'use client';

import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orpc } from '@/utils/orpc';
import { formatEnumValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Search, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreateListingInputSchema } from '@yayago-app/validators';
import {
  VehicleClassSchema,
  VehicleBodyTypeSchema,
  VehicleFuelTypeSchema,
  VehicleTransmissionTypeSchema,
  VehicleDriveTypeSchema,
  VehicleEngineLayoutSchema,
} from '@yayago-app/db/enums';
import type { z } from 'zod';

type FormValues = z.input<typeof CreateListingInputSchema>;

interface VehicleStepProps {
  form: UseFormReturn<FormValues>;
}

export default function VehicleStep({ form }: VehicleStepProps) {
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>('');

  // Fetch brands
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery(
    orpc.vehicleBrands.list.queryOptions({
      input: { page: 1, take: 100 },
    })
  );

  // Fetch models when brand is selected
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    ...orpc.vehicleModels.list.queryOptions({
      input: { page: 1, take: 100, brandSlug: selectedBrandSlug },
    }),
    enabled: !!selectedBrandSlug,
  });

  // When brand changes, clear model selection
  useEffect(() => {
    if (!selectedBrandSlug) {
      form.setValue('vehicle.modelId', '');
    }
  }, [selectedBrandSlug, form]);

  const brands = brandsData?.items || [];
  const models = modelsData?.items || [];

  return (
    <div className='space-y-8'>
      {/* Listing Title & Description */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Car className='size-4' />
          </div>
          <span>Listing Details</span>
        </div>
        <div className='grid gap-4'>
          <FormInput
            control={form.control}
            name='title'
            label='Listing Title'
            description='Create a compelling title that will attract renters'
            render={(field) => (
              <Input
                {...field}
                placeholder='e.g., 2024 Mercedes-Benz S-Class - Luxury Sedan with Premium Features'
                className='text-base'
              />
            )}
          />
          <FormInput
            control={form.control}
            name='description'
            label='Description (Optional)'
            description='Describe what makes your vehicle special'
            render={(field) => (
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder='Tell potential renters about your vehicle features, condition, and what makes it a great choice...'
                rows={4}
                className='resize-none'
              />
            )}
          />
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500'>
            <Search className='size-4' />
          </div>
          <span>Select Your Vehicle</span>
        </div>

        <Alert>
          <Info className='size-4' />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            First select the brand, then choose the specific model. This helps us verify your vehicle and show accurate
            information to renters.
          </AlertDescription>
        </Alert>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Brand Selector */}
          <FormInput
            control={form.control}
            name='vehicle.modelId'
            label='Vehicle Brand'
            render={() => (
              <Select value={selectedBrandSlug} onValueChange={setSelectedBrandSlug}>
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
            )}
          />

          {/* Model Selector */}
          <FormInput
            control={form.control}
            name='vehicle.modelId'
            label='Vehicle Model'
            render={(field) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedBrandSlug || isLoadingModels}
              >
                <SelectTrigger className='h-12'>
                  {isLoadingModels ? (
                    <Skeleton className='h-4 w-24' />
                  ) : (
                    <SelectValue placeholder={selectedBrandSlug ? 'Select a model...' : 'Select brand first'} />
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
            )}
          />

          {/* Year */}
          <FormInput
            control={form.control}
            name='vehicle.year'
            label='Year'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={1900}
                max={new Date().getFullYear() + 1}
                onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                className='h-12'
              />
            )}
          />

          {/* Trim */}
          <FormInput
            control={form.control}
            name='vehicle.trim'
            label='Trim Level (Optional)'
            render={(field) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder='e.g., Sport, Premium, Limited'
                className='h-12'
              />
            )}
          />
        </div>
      </div>

      {/* Vehicle Specifications */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Vehicle Specifications</h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {/* Class */}
          <FormInput
            control={form.control}
            name='vehicle.class'
            label='Class'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select class' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleClassSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Body Type */}
          <FormInput
            control={form.control}
            name='vehicle.bodyType'
            label='Body Type'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select body type' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleBodyTypeSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Fuel Type */}
          <FormInput
            control={form.control}
            name='vehicle.fuelType'
            label='Fuel Type'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select fuel type' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleFuelTypeSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Transmission */}
          <FormInput
            control={form.control}
            name='vehicle.transmissionType'
            label='Transmission'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select transmission' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleTransmissionTypeSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Drive Type */}
          <FormInput
            control={form.control}
            name='vehicle.driveType'
            label='Drive Type'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select drive' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleDriveTypeSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Engine Layout */}
          <FormInput
            control={form.control}
            name='vehicle.engineLayout'
            label='Engine Layout'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select layout' />
                </SelectTrigger>
                <SelectContent>
                  {VehicleEngineLayoutSchema.options.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatEnumValue(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Seats */}
          <FormInput
            control={form.control}
            name='vehicle.seats'
            label='Seats'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={1}
                max={50}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
              />
            )}
          />

          {/* Doors */}
          <FormInput
            control={form.control}
            name='vehicle.doors'
            label='Doors'
            render={(field) => (
              <Input
                {...field}
                type='number'
                min={1}
                max={10}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
              />
            )}
          />
        </div>
      </div>

      {/* Optional Details */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Additional Details (Optional)</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <FormInput
            control={form.control}
            name='vehicle.licensePlate'
            label='License Plate'
            render={(field) => <Input {...field} value={field.value || ''} placeholder='ABC 123' />}
          />

          <FormInput
            control={form.control}
            name='vehicle.vin'
            label='VIN'
            description='Vehicle Identification Number'
            render={(field) => (
              <Input {...field} value={field.value || ''} placeholder='17 characters' maxLength={17} />
            )}
          />

          <FormInput
            control={form.control}
            name='vehicle.odometer'
            label='Odometer (km)'
            render={(field) => (
              <Input
                {...field}
                type='number'
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder='50000'
              />
            )}
          />

          <FormInput
            control={form.control}
            name='vehicle.horsepower'
            label='Horsepower'
            render={(field) => (
              <Input
                {...field}
                type='number'
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder='300'
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
