'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Car, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { orpc } from '@/utils/orpc';
import FormInput from '@/components/form-input';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import {
  VehicleClassSchema,
  VehicleBodyTypeSchema,
  VehicleFuelTypeSchema,
  VehicleTransmissionTypeSchema,
  VehicleDriveTypeSchema,
  VehicleEngineLayoutSchema,
} from '@yayago-app/db/enums';
import { formatEnumValue } from '@/lib/utils';
import { useState, useEffect } from 'react';

const EditVehicleSchema = z.object({
  modelId: z.string().uuid().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  trim: z.string().max(100).optional(),
  licensePlate: z.string().max(20).optional(),
  vin: z.string().max(17).optional(),
  odometer: z.number().int().min(0).optional(),
  class: VehicleClassSchema,
  bodyType: VehicleBodyTypeSchema,
  fuelType: VehicleFuelTypeSchema,
  transmissionType: VehicleTransmissionTypeSchema,
  driveType: VehicleDriveTypeSchema,
  engineLayout: VehicleEngineLayoutSchema,
  doors: z.number().int().min(1).max(10),
  seats: z.number().int().min(1).max(50),
  horsepower: z.number().int().min(0).optional(),
  torque: z.number().int().min(0).optional(),
  engineDisplacement: z.number().min(0).optional(),
  cylinders: z.number().int().min(0).optional(),
});

type EditVehicleFormValues = z.infer<typeof EditVehicleSchema>;

interface EditVehicleFormProps {
  listing: FindOneListingOutputType;
}

export default function EditVehicleForm({ listing }: EditVehicleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const vehicle = listing.vehicle;

  // Track selected brand for model filtering
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>(
    vehicle?.model?.brand?.slug || ''
  );

  const form = useForm<EditVehicleFormValues>({
    resolver: zodResolver(EditVehicleSchema),
    defaultValues: {
      modelId: vehicle?.model?.id,
      year: vehicle?.year || new Date().getFullYear(),
      trim: vehicle?.trim || '',
      licensePlate: vehicle?.licensePlate || '',
      vin: vehicle?.vin || '',
      odometer: vehicle?.odometer || undefined,
      class: vehicle?.class || 'STANDARD',
      bodyType: vehicle?.bodyType || 'SEDAN',
      fuelType: vehicle?.fuelType || 'GASOLINE',
      transmissionType: vehicle?.transmissionType || 'AUTOMATIC',
      driveType: vehicle?.driveType || 'FWD',
      engineLayout: vehicle?.engineLayout || 'INLINE',
      doors: vehicle?.doors || 4,
      seats: vehicle?.seats || 5,
      horsepower: vehicle?.horsepower || undefined,
      torque: vehicle?.torque || undefined,
      engineDisplacement: vehicle?.engineDisplacement || undefined,
      cylinders: vehicle?.cylinders || undefined,
    },
  });

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

  const brands = brandsData?.items || [];
  const models = modelsData?.items || [];

  // When brand changes, clear model selection unless it's initial load
  useEffect(() => {
    if (selectedBrandSlug && selectedBrandSlug !== vehicle?.model?.brand?.slug) {
      form.setValue('modelId', '');
    }
  }, [selectedBrandSlug, vehicle?.model?.brand?.slug, form]);

  const { mutate, isPending } = useMutation(
    orpc.listings.updateVehicle.mutationOptions({
      onSuccess: () => {
        toast.success('Vehicle details updated');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        router.push(`/listings/${listing.slug}/edit`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update vehicle');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      slug: listing.slug,
      data: {
        ...(data.modelId && { modelId: data.modelId }),
        year: data.year,
        trim: data.trim || undefined,
        licensePlate: data.licensePlate || undefined,
        vin: data.vin || undefined,
        odometer: data.odometer,
        class: data.class,
        bodyType: data.bodyType,
        fuelType: data.fuelType,
        transmissionType: data.transmissionType,
        driveType: data.driveType,
        engineLayout: data.engineLayout,
        doors: data.doors,
        seats: data.seats,
        horsepower: data.horsepower,
        torque: data.torque,
        engineDisplacement: data.engineDisplacement,
        cylinders: data.cylinders,
      },
    });
  });

  if (!vehicle) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>
          <Car className='size-12 mx-auto mb-2 opacity-50' />
          <p>No vehicle information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Current Vehicle Info */}
      <Alert>
        <Info className='size-4' />
        <AlertTitle>Current Vehicle</AlertTitle>
        <AlertDescription>
          {vehicle.year} {vehicle.model.brand.name} {vehicle.model.name}
          {vehicle.trim && ` ${vehicle.trim}`}
        </AlertDescription>
      </Alert>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Model</CardTitle>
          <CardDescription>Change the brand and model of your vehicle</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Brand Selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Brand</label>
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
            </div>

            {/* Model Selector */}
            <FormInput
              control={form.control}
              name='modelId'
              label='Model'
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
              name='year'
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
              name='trim'
              label='Trim Level (Optional)'
              render={(field) => (
                <Input {...field} value={field.value || ''} placeholder='e.g., Sport, Premium' className='h-12' />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
          <CardDescription>Update vehicle specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <FormInput
              control={form.control}
              name='class'
              label='Class'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='bodyType'
              label='Body Type'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='fuelType'
              label='Fuel Type'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='transmissionType'
              label='Transmission'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='driveType'
              label='Drive Type'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='engineLayout'
              label='Engine Layout'
              render={(field) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
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

            <FormInput
              control={form.control}
              name='seats'
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

            <FormInput
              control={form.control}
              name='doors'
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
        </CardContent>
      </Card>

      {/* Performance & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Performance & Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <FormInput
              control={form.control}
              name='horsepower'
              label='Horsepower'
              render={(field) => (
                <Input
                  {...field}
                  type='number'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder='e.g., 300'
                />
              )}
            />

            <FormInput
              control={form.control}
              name='torque'
              label='Torque (Nm)'
              render={(field) => (
                <Input
                  {...field}
                  type='number'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder='e.g., 400'
                />
              )}
            />

            <FormInput
              control={form.control}
              name='engineDisplacement'
              label='Engine (cc)'
              render={(field) => (
                <Input
                  {...field}
                  type='number'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder='e.g., 3000'
                />
              )}
            />

            <FormInput
              control={form.control}
              name='cylinders'
              label='Cylinders'
              render={(field) => (
                <Input
                  {...field}
                  type='number'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder='e.g., 6'
                />
              )}
            />

            <FormInput
              control={form.control}
              name='odometer'
              label='Odometer (km)'
              render={(field) => (
                <Input
                  {...field}
                  type='number'
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder='e.g., 50000'
                />
              )}
            />

            <FormInput
              control={form.control}
              name='licensePlate'
              label='License Plate'
              render={(field) => <Input {...field} value={field.value || ''} placeholder='ABC 123' />}
            />

            <FormInput
              control={form.control}
              name='vin'
              label='VIN'
              render={(field) => <Input {...field} value={field.value || ''} placeholder='17 characters' maxLength={17} />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='size-4' />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

