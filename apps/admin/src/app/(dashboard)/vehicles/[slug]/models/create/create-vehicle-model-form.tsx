'use client';

import FormInput from '@/components/form-input';
import LocalizedInput from '@/components/localized-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateVehicleModelInputSchema } from '@yayago-app/validators';
import { Car, FileText, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

interface CreateVehicleModelFormProps {
  brandSlug: string;
}

type FormData = z.infer<typeof CreateVehicleModelInputSchema>;

export default function CreateVehicleModelForm({ brandSlug }: CreateVehicleModelFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get the brand to show its name
  const { data: brand, isLoading: brandLoading } = useQuery(
    orpc.vehicleBrands.findOne.queryOptions({
      input: { slug: brandSlug },
    })
  );

  const form = useForm<FormData>({
    resolver: zodResolver(CreateVehicleModelInputSchema),
    defaultValues: {
      brandSlug,
      name: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      keywords: { en: '', az: '', ru: '', ar: '' },
    },
  });

  const { mutateAsync: createModel } = useMutation(
    orpc.vehicleModels.create.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to create model');
      },
      onSuccess(data) {
        toast.success(`Model "${data.name}" created successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleModels.list.queryKey({ input: { brandSlug } }),
        });
        router.push(`/vehicles/${brandSlug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await createModel(data);
  });

  if (brandLoading) {
    return <Skeleton className='h-64 w-full' />;
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
            Model Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='p-3 rounded-lg bg-muted/50'>
            <p className='text-sm text-muted-foreground'>Adding model to brand:</p>
            <p className='font-medium'>{brand.name}</p>
          </div>

          <FormInput
            control={form.control}
            name='name'
            label='Model Name'
            description='The official name of the vehicle model in all supported languages.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter model name in English (e.g., A-Class)',
                  az: 'Modelin adı Azərbaycanca',
                  ru: 'Название модели на русском',
                  ar: 'اسم الموديل بالعربية',
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='size-5' />
            SEO (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FormInput
            control={form.control}
            name='title'
            label='SEO Title'
            description='Page title for search engines in all supported languages.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter SEO title in English',
                  az: 'SEO başlığı Azərbaycanca',
                  ru: 'SEO заголовок на русском',
                  ar: 'عنوان SEO بالعربية',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='description'
            label='Description'
            description='Brief description of the model for SEO purposes.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'Enter description in English',
                  az: 'Təsvir Azərbaycanca',
                  ru: 'Описание на русском',
                  ar: 'الوصف بالعربية',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='keywords'
            label='Keywords'
            description='SEO keywords for the model.'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., compact, luxury, sedan',
                  az: 'Açar sözlər Azərbaycanca',
                  ru: 'Ключевые слова на русском',
                  ar: 'الكلمات المفتاحية بالعربية',
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
          {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Create Model'}
        </Button>
      </div>
    </form>
  );
}
