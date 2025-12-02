'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, Package, DollarSign, Users, Image, Video, ListIcon, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateSubscriptionPlanInputSchema, CreateSubscriptionPlanInputType } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import LocalizedInput from '@/components/localized-input';
import NumberInput from '@/components/ui/number-input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';

export default function CreatePlanForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateSubscriptionPlanInputType>({
    resolver: zodResolver(CreateSubscriptionPlanInputSchema),
    defaultValues: {
      slug: '',
      name: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      maxListings: 5,
      maxFeaturedListings: 0,
      maxMembers: 1,
      maxImagesPerListing: 10,
      maxVideosPerListing: 1,
      hasAnalytics: false,
      sortOrder: 0,
      extraListingCost: undefined,
      extraFeaturedListingCost: undefined,
      extraMemberCost: undefined,
      extraImageCost: undefined,
      extraVideoCost: undefined,
      trialEnabled: false,
      trialDays: 0,
    },
  });

  const { mutateAsync: createPlan } = useMutation(
    orpc.subscriptionPlans.create.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to create plan');
      },
      onSuccess(data) {
        toast.success(`Plan "${data.name}" created successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.list.queryKey({ input: {} }),
        });
        router.push(`/plans/${data.slug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await createPlan(data);
    },
    (errors) => {
      // Log validation errors for debugging
      console.error('Form validation errors:', errors);
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(firstError.message as string);
      }
    }
  );

  const trialEnabled = form.watch('trialEnabled');

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='size-5' />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='slug'
            label='Slug'
            description='Unique identifier for the plan (e.g., basic, premium, elegant)'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} placeholder='e.g., basic' />
                <InputGroupAddon>
                  <Package className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='name'
            label='Plan Name'
            description='Display name for the plan in all languages'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., Basic Plan',
                  az: 'e.g., Əsas Plan',
                  ru: 'e.g., Базовый план',
                  ar: 'e.g., الخطة الأساسية',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='description'
            label='Description'
            description='Short description of the plan'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., Perfect for individuals',
                  az: 'e.g., Fərdlər üçün ideal',
                  ru: 'e.g., Идеально для индивидуальных пользователей',
                  ar: 'e.g., مثالي للأفراد',
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ListIcon className='size-5' />
            Plan Limits
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <FormInput
            control={form.control}
            name='maxListings'
            label='Max Listings'
            description='Maximum number of vehicle listings'
            render={(field) => (
              <div className='flex flex-col gap-4'>
                <NumberInput
                  className='rounded-r-none'
                  {...field}
                  minValue={1}
                  placeholder='5'
                  isDisabled={field.value === -1}
                />
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={field.value === -1}
                    onCheckedChange={() => form.setValue('maxListings', field.value === -1 ? 1 : -1)}
                  />
                  <p className='text-sm text-muted-foreground'>Unlimited listings</p>
                </div>
              </div>
            )}
          />

          <FormInput
            control={form.control}
            name='maxFeaturedListings'
            label='Max Featured Listings'
            description='Maximum number of featured/promoted listings'
            render={(field) => (
              <div className='flex flex-col gap-4'>
                <NumberInput
                  className='rounded-r-none'
                  {...field}
                  minValue={0}
                  placeholder='0'
                  isDisabled={field.value === -1}
                />
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={field.value === -1}
                    onCheckedChange={() => form.setValue('maxFeaturedListings', field.value === -1 ? 0 : -1)}
                  />
                  <p className='text-sm text-muted-foreground'>Unlimited featured listings</p>
                </div>
              </div>
            )}
          />

          <FormInput
            control={form.control}
            name='maxMembers'
            label='Max Team Members'
            description='Maximum number of organization members'
            render={(field) => (
              <div className='flex flex-col gap-4'>
                <NumberInput
                  className='rounded-r-none'
                  {...field}
                  minValue={1}
                  placeholder='1'
                  isDisabled={field.value === -1}
                />
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={field.value === -1}
                    onCheckedChange={() => form.setValue('maxMembers', field.value === -1 ? 1 : -1)}
                  />
                  <p className='text-sm text-muted-foreground'>Unlimited members</p>
                </div>
              </div>
            )}
          />

          <FormInput
            control={form.control}
            name='maxImagesPerListing'
            label='Max Images per Listing'
            description='Maximum images allowed per listing'
            render={(field) => (
              <div className='flex flex-col gap-4'>
                <NumberInput
                  className='rounded-r-none'
                  {...field}
                  minValue={4}
                  placeholder='10'
                  isDisabled={field.value === -1}
                />
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={field.value === -1}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue('maxImagesPerListing', -1);
                      } else {
                        form.setValue('maxImagesPerListing', 4);
                      }
                    }}
                  />
                  <p className='text-sm text-muted-foreground'>Unlimited listings</p>
                </div>
              </div>
            )}
          />

          <FormInput
            control={form.control}
            name='maxVideosPerListing'
            label='Max Videos per Listing'
            description='Maximum videos allowed per listing'
            render={(field) => <NumberInput className='rounded-r-none' {...field} minValue={0} placeholder='1' />}
          />

          <FormInput
            control={form.control}
            name='hasAnalytics'
            render={(field) => (
              <Card>
                <CardContent className='flex items-center gap-2'>
                  <Checkbox
                    id={field.name}
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => form.setValue('hasAnalytics', checked === true)}
                  />
                  <FieldLabel htmlFor={field.name} className='flex flex-col items-start gap-2'>
                    <p className='text-sm'>Analytics</p>
                    <p className='text-sm text-muted-foreground'>Enable advanced analytics for the plan</p>
                  </FieldLabel>
                </CardContent>
              </Card>
            )}
          />
        </CardContent>
      </Card>

      {/* Overage Costs */}
      {/* <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Overage Costs (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <FormInput
            control={form.control}
            name='extraListingCost'
            label='Extra Listing Cost'
            description='Cost per additional listing (in cents)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraFeaturedListingCost'
            label='Extra Featured Listing Cost'
            description='Cost per additional featured listing (in cents)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraMemberCost'
            label='Extra Member Cost'
            description='Cost per additional team member (in cents)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraImageCost'
            label='Extra Image Cost'
            description='Cost per additional image (in cents)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraVideoCost'
            label='Extra Video Cost'
            description='Cost per additional video (in cents)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='Leave empty for no overage' />}
          />
        </CardContent>
      </Card> */}

      {/* Trial */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Period</CardTitle>
        </CardHeader>
        <CardContent className='flex items-end gap-2'>
          <div className='flex items-center justify-between rounded-lg border p-4 flex-1'>
            <div className='space-y-0.5'>
              <Label>Enable Trial</Label>
              <p className='text-xs text-muted-foreground'>Allow users to try this plan for free</p>
            </div>
            <Switch
              checked={trialEnabled}
              onCheckedChange={(checked) => {
                form.setValue('trialEnabled', checked);
                if (!checked) form.setValue('trialDays', 0);
              }}
            />
          </div>

          {trialEnabled && (
            <FormInput
              control={form.control}
              name='trialDays'
              label='Trial Days'
              description='Number of days for the free trial'
              containerClassName='flex-1'
              render={(field) => <NumberInput {...field} minValue={1} maxValue={90} placeholder='14' />}
            />
          )}
        </CardContent>
      </Card>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
