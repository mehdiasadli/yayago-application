'use client';

import FormInput from '@/components/form-input';
import LocalizedInput from '@/components/localized-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateVehicleBrandInputSchema } from '@yayago-app/validators';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Country, CountryDropdown } from '@/components/country-dropdown';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';

export default function CreateVehicleBrandForm() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateVehicleBrandInputSchema),
    defaultValues: {
      name: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      keywords: { en: '', az: '', ru: '', ar: '' },
      website: '',
      originCountryCode: '',
    },
  });

  const { mutateAsync: createBrand } = useMutation(
    orpc.vehicleBrands.create.mutationOptions({
      onError(error) {
        console.log(error);
        toast.error(error.message || 'Failed to create country');
      },
      onSuccess(data) {
        toast.success(`Vehicle brand ${data.name} created successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.countries.list.queryKey({
            input: {},
          }),
        });
        router.push(`/vehicles/${data.slug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await createBrand(data);
  });

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Enter the vehicle brand details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='name'
            label='Vehicle Brand Name'
            description='The name of the vehicle brand in English, Azerbaijani, Russian and Arabic.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter brand name in English',
                  az: 'Enter brand name in Azerbaijani',
                  ru: 'Enter brand name in Russian',
                  ar: 'Enter brand name in Arabic',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='originCountryCode'
            label='Origin Country'
            description='The country of the vehicle brand.'
            render={() => (
              <CountryDropdown
                defaultValue={selectedCountry?.alpha3}
                onChange={(country) => {
                  setSelectedCountry(country);

                  form.setValue('originCountryCode', country.alpha2.toLowerCase());
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='website'
            label='Website'
            description='The website of the vehicle brand.'
            render={(field) => <Input {...field} value={field.value || ''} placeholder='Enter website' />}
          />

          <Button type='submit' className='col-span-full' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Create Vehicle Brand'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
