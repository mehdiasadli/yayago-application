'use client';

import FormInput from '@/components/form-input';
import LocalizedInput from '@/components/localized-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpdateVehicleBrandInputSchema } from '@yayago-app/validators';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Country, CountryDropdown } from '@/components/country-dropdown';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Car, Globe, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import z from 'zod';

interface EditVehicleBrandFormProps {
  slug: string;
}

const EditDataSchema = UpdateVehicleBrandInputSchema.shape.data;
type EditDataType = z.infer<typeof EditDataSchema>;

export default function EditVehicleBrandForm({ slug }: EditVehicleBrandFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);

  const { data: brand, isLoading } = useQuery(
    orpc.vehicleBrands.findOne.queryOptions({
      input: { slug },
    })
  );

  const form = useForm<EditDataType>({
    resolver: zodResolver(EditDataSchema),
    defaultValues: {
      name: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      keywords: { en: '', az: '', ru: '', ar: '' },
      website: '',
      originCountryCode: '',
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (brand) {
      form.reset({
        name: { en: brand.name, az: '', ru: '', ar: '' },
        description: brand.description ? { en: brand.description, az: '', ru: '', ar: '' } : undefined,
        title: brand.title ? { en: brand.title, az: '', ru: '', ar: '' } : undefined,
        keywords: brand.keywords ? { en: brand.keywords.join(', '), az: '', ru: '', ar: '' } : undefined,
        website: brand.website || '',
        originCountryCode: brand.originCountryCode || '',
      });
    }
  }, [brand, form]);

  const { mutateAsync: updateBrand } = useMutation(
    orpc.vehicleBrands.update.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update brand');
      },
      onSuccess(data) {
        toast.success(`Brand "${data.name}" updated successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleBrands.list.queryKey({ input: {} }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleBrands.findOne.queryKey({ input: { slug } }),
        });
        router.push(`/vehicles/${slug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await updateBrand({ slug, data });
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (!brand) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Brand not found</CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Car className='size-5' />
            Brand Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className='text-muted-foreground'>Slug (read-only)</Label>
            <p className='font-mono bg-muted px-3 py-2 rounded-md'>{brand.slug}</p>
          </div>

          <FormInput
            control={form.control}
            name='name'
            label='Brand Name'
            description='The name of the vehicle brand'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., Mercedes-Benz',
                  az: 'e.g., Mercedes-Benz',
                  ru: 'e.g., Mercedes-Benz',
                  ar: 'e.g., Mercedes-Benz',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='originCountryCode'
            label='Origin Country'
            description='The country where the brand originates'
            render={() => (
              <CountryDropdown
                defaultValue={brand.originCountryCode?.toUpperCase()}
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
            description='Official brand website'
            render={(field) => <Input {...field} value={field.value || ''} placeholder='https://www.brand.com' />}
          />

          <FormInput
            control={form.control}
            name='title'
            label='SEO Title'
            description='Title for search engines'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., Mercedes-Benz - Luxury Cars',
                  az: 'e.g., Mercedes-Benz - Lüks Avtomobillər',
                  ru: 'e.g., Mercedes-Benz - Люксовые автомобили',
                  ar: 'e.g., مرسيدس-بنز - سيارات فاخرة',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='description'
            label='Description'
            description='Brief description of the brand'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., German luxury automotive manufacturer',
                  az: 'e.g., Alman lüks avtomobil istehsalçısı',
                  ru: 'e.g., Немецкий производитель автомобилей класса люкс',
                  ar: 'e.g., شركة ألمانية لصناعة السيارات الفاخرة',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='keywords'
            label='Keywords'
            description='SEO keywords (comma separated)'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., luxury, german, cars',
                  az: 'e.g., lüks, alman, avtomobillər',
                  ru: 'e.g., люкс, немецкие, автомобили',
                  ar: 'e.g., فاخرة، ألمانية، سيارات',
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

