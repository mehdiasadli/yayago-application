'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, GlobeIcon, Loader2Icon, PercentIcon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateCountryInputSchema } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { enums } from '@yayago-app/validators';
import LocalizedInput from '@/components/localized-input';
import { makeEnumLabels } from '@/lib/utils';
import { countries } from '@/lib/countries-list';
import { Country, CountryDropdown } from '@/components/country-dropdown';
import { useState } from 'react';
import NumberInput from '@/components/ui/number-input';

export default function CreateCountryForm() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateCountryInputSchema),
    defaultValues: {
      code: '',
      phoneCode: '',
      name: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      currency: 'USD',
      emergencyPhoneNumber: '',
      trafficDirection: 'RIGHT',
      flag: '',
      minDriverAge: 18,
      minDriverLicenseAge: 1,
      platformCommissionRate: 0.05,
    },
  });

  const { mutateAsync: createCountry } = useMutation(
    orpc.countries.create.mutationOptions({
      onError(error) {
        console.log(error);
        toast.error(error.message || 'Failed to create country');
      },
      onSuccess(data) {
        toast.success(`Country ${data.name} created successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.countries.list.queryKey({
            input: {},
          }),
        });
        router.push(`/regions/countries/${data.code}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await createCountry({
      ...data,
      trafficDirection: data.trafficDirection as 'RIGHT' | 'LEFT' | 'HYBRID',
    });
  });

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Enter the country details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='code'
            label='Country'
            description='The country of the country. Example: Azerbaijan, United States, Great Britain, etc.'
            render={() => (
              <CountryDropdown
                defaultValue={selectedCountry?.alpha3}
                onChange={(country) => {
                  setSelectedCountry(country);

                  form.setValue('code', country.alpha2);
                  form.setValue('phoneCode', country.countryCallingCodes[0]);
                  form.setValue('name', {
                    en: countries.getNames('en')[country.alpha2],
                    az: countries.getNames('az')[country.alpha2],
                    ru: countries.getNames('ru')[country.alpha2],
                    ar: countries.getNames('ar')[country.alpha2],
                  });
                  form.setValue('currency', country.currencies[0]);
                  form.setValue('flag', country.emoji);

                  form.setValue('title', {
                    en: `YayaGO Car rental in ${countries.getNames('en')[country.alpha2]}`,
                    az: `YayaGO Rent a Car ${countries.getNames('az')[country.alpha2]}`,
                    ru: `YayaGO Аренда автомобиля в ${countries.getNames('ru')[country.alpha2]}`,
                    ar: `YayaGO تأجير سيارة في ${countries.getNames('ar')[country.alpha2]}`,
                  });

                  form.setValue('description', {
                    en: `Rent your next car with YayaGO in ${countries.getNames('en')[country.alpha2]}`,
                    az: `YayaGO Avtomobil Kirala ${countries.getNames('az')[country.alpha2]}`,
                    ru: `YayaGO Аренда автомобиля в ${countries.getNames('ru')[country.alpha2]}`,
                    ar: `YayaGO تأجير سيارة في ${countries.getNames('ar')[country.alpha2]}`,
                  });
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            label={
              <span>
                Country Code{' '}
                <Link
                  className='text-blue-500 hover:underline'
                  href='https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2'
                  target='_blank'
                >
                  (ISO 3166-1 alpha-2)
                </Link>
              </span>
            }
            description='The country code of the country. Example: AZ, US, GB, etc.'
            name='code'
            render={(field) => (
              <InputGroup>
                <InputGroupInput disabled {...field} placeholder='Enter country code' />
                <InputGroupAddon>
                  <GlobeIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='phoneCode'
            label='Phone Code'
            description='The phone code of the country. Starting with "+" sign.'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} placeholder='Enter phone code' />
                <InputGroupAddon>
                  <PhoneIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='name'
            label='Country Name'
            description='The name of the country in English, Azerbaijani, Russian and Arabic.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter country name in English',
                  az: 'Enter country name in Azerbaijani',
                  ru: 'Enter country name in Russian',
                  ar: 'Enter country name in Arabic',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='trafficDirection'
            label='Traffic Direction'
            description='The traffic direction of the country. Right-hand traffic or left-hand traffic.'
            render={(field) => (
              <RadioGroup className='flex flex-wrap gap-2' value={field.value} onValueChange={field.onChange}>
                {makeEnumLabels(enums.TrafficDirectionSchema.options).map((item) => (
                  <div
                    key={item.value}
                    className='relative flex flex-col items-start gap-4 rounded-md border border-input p-3 shadow-xs outline-none has-data-[state=checked]:border-primary/50'
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem
                        id={`${field.name}-${item.value}`}
                        value={item.value}
                        className='after:absolute after:inset-0'
                      />
                      <Label htmlFor={`${field.name}-${item.value}`}>{item.label}</Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          />

          <FormInput
            control={form.control}
            label='Emergency Phone Number'
            description='The emergency phone number of the country. Example: 911, 102, etc.'
            name='emergencyPhoneNumber'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} placeholder='Enter emergency phone number' value={field.value || ''} />
                <InputGroupAddon>
                  <PhoneIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            label={
              <span>
                Currency{' '}
                <Link
                  className='text-blue-500 hover:underline'
                  href='https://en.wikipedia.org/wiki/Currency'
                  target='_blank'
                >
                  (ISO 4217 currency code)
                </Link>
              </span>
            }
            description='The currency of the country. Example: USD, EUR, AZN, etc.'
            name='currency'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} placeholder='Enter currency' />
                <InputGroupAddon>
                  <DollarSign />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            label='Min Driver Age'
            description='The minimum age of the driver. Example: 18, 19, etc.'
            name='minDriverAge'
            render={(field) => (
              <NumberInput minValue={14} maxValue={120} {...field} placeholder='Enter min driver age' />
            )}
          />

          <FormInput
            control={form.control}
            label='Min Driver License Age'
            description='The minimum age of the driver license. Example: 1 (year), 2 (years), etc.'
            name='minDriverLicenseAge'
            render={(field) => <NumberInput minValue={0} {...field} placeholder='Enter min driver license age' />}
          />

          <FormInput
            control={form.control}
            label='Platform Commission Rate'
            description='The commission percentage the platform takes from each booking. Example: 5% = 0.05'
            name='platformCommissionRate'
            render={(field) => (
              <InputGroup>
                <InputGroupInput
                  type='number'
                  step='0.01'
                  min='0'
                  max='1'
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder='0.05'
                />
                <InputGroupAddon>
                  <PercentIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            label='Flag'
            description='The flag of the country. Example: 🇦🇿, 🇺🇸, etc.'
            name='flag'
            render={(field) => <Input {...field} placeholder='Enter flag' value={field.value || ''} />}
          />

          <FormInput
            control={form.control}
            name='title'
            label='Title'
            description="A marketing title for the country. Example: 'YayaGO Car rental in Azerbaijan'"
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
            description="A marketing title for the country. Example: 'Rent your next car with YayaGO in Azerbaijan'"
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
            {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Create Country'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
