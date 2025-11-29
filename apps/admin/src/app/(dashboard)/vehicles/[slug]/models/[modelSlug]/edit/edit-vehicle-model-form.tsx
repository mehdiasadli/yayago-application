'use client';

import FormInput from '@/components/form-input';
import LocalizedInput from '@/components/localized-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpdateVehicleModelInputSchema } from '@yayago-app/validators';
import { Car, FileText, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

interface EditVehicleModelFormProps {
  brandSlug: string;
  modelSlug: string;
}

type FormData = z.infer<typeof UpdateVehicleModelInputSchema>;

export default function EditVehicleModelForm({ brandSlug, modelSlug }: EditVehicleModelFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get the model
  const { data: model, isLoading } = useQuery(
    orpc.vehicleModels.findOne.queryOptions({
      input: { slug: modelSlug },
    })
  );

  const form = useForm<FormData>({
    resolver: zodResolver(UpdateVehicleModelInputSchema),
    defaultValues: {
      slug: modelSlug,
      name: { en: '', az: '', ru: '', ar: '' },
      title: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      keywords: { en: '', az: '', ru: '', ar: '' },
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (model) {
      form.reset({
        slug: modelSlug,
        name: { en: model.name, az: '', ru: '', ar: '' },
        title: { en: model.title || '', az: '', ru: '', ar: '' },
        description: { en: model.description || '', az: '', ru: '', ar: '' },
        keywords: { en: model.keywords?.join(', ') || '', az: '', ru: '', ar: '' },
      });
    }
  }, [model, modelSlug, form]);

  const { mutateAsync: updateModel } = useMutation(
    orpc.vehicleModels.update.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update model');
      },
      onSuccess(data) {
        toast.success(`Model "${data.name}" updated successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleModels.list.queryKey({ input: { brandSlug } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleModels.findOne.queryKey({ input: { slug: modelSlug } }),
        });
        router.push(`/vehicles/${brandSlug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await updateModel(data);
  });

  if (isLoading) {
    return <Skeleton className='h-64 w-full' />;
  }

  if (!model) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Model not found</CardContent>
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
            <p className='text-sm text-muted-foreground'>Brand:</p>
            <p className='font-medium'>{model.brand.name}</p>
          </div>

          <div className='p-3 rounded-lg bg-muted/50'>
            <p className='text-sm text-muted-foreground'>Current Slug:</p>
            <p className='font-mono text-sm'>{model.slug}</p>
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
                  en: 'Enter model name in English',
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
          {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
