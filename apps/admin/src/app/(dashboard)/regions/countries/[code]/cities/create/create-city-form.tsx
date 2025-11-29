'use client';

import FormInput from '@/components/form-input';
import LocalizedInput from '@/components/localized-input';
import CityPicker from '@/components/maps/city-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import NumberInput from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { orpc } from '@/utils/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCityInputSchema } from '@yayago-app/validators';
import { GlobeIcon, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CreateCityFormProps {
  code: string;
}

export default function CreateCityForm({ code }: CreateCityFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateCityInputSchema),
    defaultValues: {
      code: '',
      countryCode: code,
      description: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      name: { en: '', az: '', ru: '', ar: '' },
      lat: 0,
      lng: 0,
      timezone: '',
      isDefaultOfCounry: false,
      googleMapsPlaceId: '',
    },
  });

  const { mutateAsync: createCity } = useMutation(
    orpc.cities.create.mutationOptions({
      onError(error) {
        console.log(error);
        toast.error(error.message || 'Failed to create city');
      },
      onSuccess(data) {
        toast.success(`City ${data.name} created successfully`);

        queryClient.invalidateQueries({
          queryKey: orpc.cities.list.queryKey({
            input: { countryCode: code },
          }),
        });

        router.push(`/regions/countries/${code}/cities/${data.code}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await createCity({ ...data, countryCode: code });
  });

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Enter the city details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CityPicker
            countryCode={code}
            placeholder='Search for a city (e.g. Dubai)'
            onCitySelect={(loc) => {
              console.log(loc);

              form.setValue('lat', loc.location.lat);
              form.setValue('lng', loc.location.lng);

              form.setValue('name', {
                en: loc.names.en,
                az: loc.names.az,
                ru: loc.names.ru,
                ar: loc.names.ar,
              });

              form.setValue('googleMapsPlaceId', loc.googlePlaceId);

              form.setValue('title', {
                en: `YayaGO Car rental in ${loc.names.en}`,
                az: `YayaGO Rent a Car ${loc.names.az}`,
                ru: `YayaGO Аренда автомобиля в ${loc.names.ru}`,
                ar: `YayaGO تأجير سيارة في ${loc.names.ar}`,
              });

              form.setValue('description', {
                en: `Rent your next car with YayaGO in ${loc.names.en}`,
                az: `YayaGO Avtomobil Kirala ${loc.names.az}`,
                ru: `YayaGO Аренда автомобиля в ${loc.names.ru}`,
                ar: `YayaGO تأجير سيارة في ${loc.names.ar}`,
              });
            }}
          />

          <div className='flex flex-col gap-4'>
            <FormInput
              control={form.control}
              name='code'
              label='City Code (Only alphanumeric characters or hyphens)'
              description='The code of the city. Example: dubai, new-york, baku, abu-dhabi, etc.'
              render={(field) => (
                <InputGroup>
                  <InputGroupInput {...field} placeholder='Enter city code' />
                  <InputGroupAddon>
                    <GlobeIcon />
                  </InputGroupAddon>
                </InputGroup>
              )}
            />

            <FormInput
              control={form.control}
              name='name'
              label='City Name'
              description='The name of the city in English, Azerbaijani, Russian and Arabic.'
              render={(field) => (
                <LocalizedInput
                  field={field}
                  placeholders={{
                    en: 'Enter city name in English',
                    az: 'Enter city name in Azerbaijani',
                    ru: 'Enter city name in Russian',
                    ar: 'Enter city name in Arabic',
                  }}
                />
              )}
            />

            <div className='flex gap-2 items-center'>
              <FormInput
                control={form.control}
                label='Lat'
                description='The latitude of the city. Example: 40.4093, 49.8671, etc.'
                name='lat'
                render={(field) => <NumberInput minValue={-90} maxValue={90} {...field} placeholder='Enter latitude' />}
              />
              <FormInput
                control={form.control}
                label='Lng'
                description='The longitude of the city. Example: 40.4093, 49.8671, etc.'
                name='lng'
                render={(field) => (
                  <NumberInput minValue={-180} maxValue={180} {...field} placeholder='Enter longitude' />
                )}
              />
            </div>

            <FormInput
              control={form.control}
              label='Timezone'
              description='The timezone of the city. Example: Europe/Baku, Asia/Dubai, etc.'
              name='timezone'
              render={(field) => <Input {...field} placeholder='Enter timezone' />}
            />
          </div>

          <FormInput
            control={form.control}
            name='isDefaultOfCounry'
            render={(field) => (
              <div className='relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none has-data-[state=checked]:border-primary/50'>
                <Switch
                  className='data-[state=checked]:[&_span]:rtl:-translate-x-2 order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2'
                  id='isDefaultOfCounry'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <div className='grid grow gap-2'>
                  <Label htmlFor='isDefaultOfCounry'>Is Default of Country</Label>
                  <p className='text-muted-foreground text-xs' id={`isDefaultOfCountry-description`}>
                    Whether the city is the default city of the country
                  </p>
                </div>
              </div>
            )}
          />

          <FormInput
            control={form.control}
            label='Google Maps Place ID (auto-filled)'
            name='googleMapsPlaceId'
            render={(field) => <Input disabled {...field} placeholder='Enter Google Maps place ID' />}
          />

          <FormInput
            control={form.control}
            name='title'
            label='Title'
            description='The title of the city in English, Azerbaijani, Russian and Arabic.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter title in English',
                  az: 'Enter title in Azerbaijani',
                  ru: 'Enter title in Russian',
                  ar: 'Enter title in Arabic',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='description'
            label='Description'
            description='The description of the city in English, Azerbaijani, Russian and Arabic.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter description in English',
                  az: 'Enter description in Azerbaijani',
                  ru: 'Enter description in Russian',
                  ar: 'Enter description in Arabic',
                }}
              />
            )}
          />

          <Button type='submit' className='w-full mt-6 md:col-span-2'>
            {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Create City'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
