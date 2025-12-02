'use client';

import { orpc } from '@/utils/orpc';
import { MapPinIcon, Loader2Icon, NavigationIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FindCitiesForOnboardingOutputType } from '@yayago-app/validators';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LocationPicker, MapProvider } from '@/components/maps';
import type { GeocodedLocation } from '@/components/maps';

interface CitySelectionFormProps {
  form: UseFormReturn<any>;
  setSelectedCity: (city: FindCitiesForOnboardingOutputType[number]) => void;
  selectedCity?: FindCitiesForOnboardingOutputType[number] | null;
}

export default function CitySelectionForm({ form, setSelectedCity, selectedCity }: CitySelectionFormProps) {
  const [selectedCityCode, setSelectedCityCode] = useState<string | undefined>(selectedCity?.code);

  const { data: cities, isLoading } = useQuery(
    orpc.cities.findCitiesForOnboarding.queryOptions({
      input: {},
    })
  );

  const handleLocationSelect = (location: GeocodedLocation & { placeId?: string }) => {
    form.setValue('address', location.address);
    form.setValue('lat', location.lat);
    form.setValue('lng', location.lng);
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3'>
          <MapPinIcon className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
          <div className='text-sm'>
            <p className='font-medium text-blue-900 dark:text-blue-50 mb-1'>Select Your City</p>
            <p className='text-blue-800 dark:text-blue-100'>
              Choose the city where your organization is located. This helps customers in your area discover your
              services.
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center py-8'>
          <Loader2Icon className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      </div>
    );
  }

  if (!cities?.length) {
    return (
      <div className='space-y-6'>
        <div className='bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3'>
          <MapPinIcon className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
          <div className='text-sm'>
            <p className='font-medium text-blue-900 dark:text-blue-50 mb-1'>Select Your City</p>
            <p className='text-blue-800 dark:text-blue-100'>
              Choose the city where your organization is located. This helps customers in your area discover your
              services.
            </p>
          </div>
        </div>
        <div className='text-center py-8 text-muted-foreground'>
          No cities available at the moment. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3'>
        <MapPinIcon className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium text-blue-900 dark:text-blue-50 mb-1'>Select Your City & Location</p>
          <p className='text-blue-800 dark:text-blue-100'>
            Choose the city where your organization is located, then pinpoint your exact business location on the map.
          </p>
        </div>
      </div>

      <div>
        <Label className='text-sm font-medium mb-2 block'>City</Label>
        <p className='text-sm text-muted-foreground mb-4'>Select your city from the available locations</p>
        <RadioGroup
          value={selectedCityCode}
          onValueChange={(value) => {
            const city = cities.find((city) => city.code === value);

            if (city) {
              setSelectedCityCode(value);
              setSelectedCity(city);
              // Reset location when city changes
              form.setValue('lat', undefined);
              form.setValue('lng', undefined);
              form.setValue('address', '');
            }
          }}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {cities.map((city) => (
              <div key={city.code}>
                <div
                  className={cn(
                    'relative flex items-center space-x-3 rounded-lg border border-input p-4 hover:bg-accent hover:border-primary transition-colors cursor-pointer',
                    selectedCityCode === city.code && 'border-primary bg-accent'
                  )}
                >
                  <RadioGroupItem value={city.code} id={`city-${city.code}`} className='shrink-0' />
                  <Label
                    htmlFor={`city-${city.code}`}
                    className='flex-1 flex flex-col items-start gap-0 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    <div>{city.name}</div>
                    <div className='text-xs text-muted-foreground mt-1'>{city.country.name}</div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Location Picker - shown only after city is selected */}
      {selectedCity && (
        <div className='border-t pt-6 mt-6'>
          <div className='flex items-center gap-2 mb-2'>
            <NavigationIcon className='w-4 h-4' />
            <h3 className='text-base font-semibold'>Pinpoint Your Location</h3>
          </div>
          <p className='text-sm text-muted-foreground mb-4'>
            Click on the map or search to pinpoint your exact business location in {selectedCity.name}. This helps
            customers find you easily.
          </p>

          <MapProvider>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              centerCity={{ lat: selectedCity.lat, lng: selectedCity.lng }}
              initialLocation={
                form.getValues('lat') && form.getValues('lng')
                  ? { lat: form.getValues('lat'), lng: form.getValues('lng') }
                  : { lat: selectedCity.lat, lng: selectedCity.lng }
              }
              placeholder={`Search for your address in ${selectedCity.name}...`}
              height='350px'
            />
          </MapProvider>

          {form.watch('address') && (
            <div className='mt-4 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg'>
              <p className='text-sm text-green-800 dark:text-green-200'>
                <strong>Selected Address:</strong> {form.watch('address')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className='bg-muted/50 border rounded-lg p-4'>
        <p className='text-sm text-muted-foreground'>
          <strong className='text-foreground'>Can't find your city?</strong> If your city is not listed, please contact
          our support team and we'll add it for you.
        </p>
      </div>
    </div>
  );
}
