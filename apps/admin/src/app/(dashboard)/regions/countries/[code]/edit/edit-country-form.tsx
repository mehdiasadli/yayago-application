'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { orpc } from '@/utils/orpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, GlobeIcon, Loader2Icon, PercentIcon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateCountryInputSchema, UpdateCountryInputSchema } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { enums } from '@yayago-app/validators';
import LocalizedInput from '@/components/localized-input';
import { makeEnumLabels } from '@/lib/utils';
import { countries } from '@/lib/countries-list';
import { Country, CountryDropdown } from '@/components/country-dropdown';
import { useEffect, useState } from 'react';
import NumberInput from '@/components/ui/number-input';

interface EditCountryFormProps {
  code: string;
}

export default function EditCountryForm({ code }: EditCountryFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: country,
    isLoading,
    error,
  } = useQuery(
    orpc.countries.findOne.queryOptions({
      input: { code },
    })
  );

  // Cast country to any to access platformCommissionRate field (new field not yet in generated types)
  const countryData = country as any;

  const form = useForm({
    resolver: zodResolver(UpdateCountryInputSchema),
    defaultValues: {
      currency: country?.currency || '',
      description: country?.description,
      emergencyPhoneNumber: country?.emergencyPhoneNumber,
      flag: country?.flag,
      minDriverAge: country?.minDriverAge,
      minDriverLicenseAge: country?.minDriverLicenseAge,
      name: country?.name,
      phoneCode: country?.phoneCode,
      status: country?.status,
      title: country?.title,
      trafficDirection: country?.trafficDirection,
      platformCommissionRate: countryData?.platformCommissionRate ?? 0.05,
    } as any,
  });

  useEffect(() => {
    if (country) {
      form.reset(country);
    }
  }, [country]);

  const { mutateAsync: updateCountry } = useMutation(
    orpc.countries.update.mutationOptions({
      onError(error) {
        console.log(error);
        toast.error(error.message || 'Failed to create country');
      },
      onSuccess(data) {
        toast.success(`Country ${country?.name.en} updated successfully`);
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
    if (!country?.code) return;

    await updateCountry({
      ...data,
      code: country.code,
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
            name={'platformCommissionRate' as any}
            render={(field) => (
              <InputGroup>
                <InputGroupInput
                  type='number'
                  step='0.01'
                  min='0'
                  max='1'
                  value={String(field.value ?? 0.05)}
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
            {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Update Country'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
