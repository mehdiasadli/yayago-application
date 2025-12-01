'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { orpc } from '@/utils/orpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, Package, DollarSign, Users, Image, Video, ListIcon, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { UpdateSubscriptionPlanInputSchema } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import LocalizedInput from '@/components/localized-input';
import NumberInput from '@/components/ui/number-input';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import z from 'zod';

interface EditPlanFormProps {
  slug: string;
}

// Create a schema for just the data part
const EditPlanDataSchema = UpdateSubscriptionPlanInputSchema.shape.data;
type EditPlanDataType = z.infer<typeof EditPlanDataSchema>;

export default function EditPlanForm({ slug }: EditPlanFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useQuery(
    orpc.subscriptionPlans.findOne.queryOptions({
      input: { slug },
    })
  );

  const form = useForm<EditPlanDataType>({
    resolver: zodResolver(EditPlanDataSchema),
    defaultValues: {
      name: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      maxListings: 5,
      maxFeaturedListings: 0,
      maxMembers: 1,
      maxImagesPerListing: 10,
      maxVideosPerListing: 1,
      trialEnabled: false,
      trialDays: 0,
      isActive: true,
      isPopular: false,
      sortOrder: 0,
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (plan) {
      form.reset({
        name: { en: plan.name, az: '', ru: '', ar: '' }, // We only have localized string, need to handle this
        description: plan.description ? { en: plan.description, az: '', ru: '', ar: '' } : undefined,
        maxListings: plan.maxListings,
        maxFeaturedListings: plan.maxFeaturedListings,
        maxMembers: plan.maxMembers,
        maxImagesPerListing: plan.maxImagesPerListing,
        maxVideosPerListing: plan.maxVideosPerListing,
        extraListingCost: plan.extraListingCost ?? undefined,
        extraFeaturedListingCost: plan.extraFeaturedListingCost ?? undefined,
        extraMemberCost: plan.extraMemberCost ?? undefined,
        extraImageCost: plan.extraImageCost ?? undefined,
        extraVideoCost: plan.extraVideoCost ?? undefined,
        trialEnabled: plan.trialEnabled,
        trialDays: plan.trialDays,
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        sortOrder: plan.sortOrder,
      });
    }
  }, [plan, form]);

  const { mutateAsync: updatePlan } = useMutation(
    orpc.subscriptionPlans.update.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update plan');
      },
      onSuccess(data) {
        toast.success(`Plan "${data.name}" updated successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.list.queryKey({ input: {} }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.findOne.queryKey({ input: { slug } }),
        });
        router.push(`/plans/${slug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (data) => {
    await updatePlan({ slug, data });
  });

  const trialEnabled = form.watch('trialEnabled');

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-64 w-full' />
        <Skeleton className='h-48 w-full' />
      </div>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Plan not found</CardContent>
      </Card>
    );
  }

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
          <div className='space-y-2'>
            <Label className='text-muted-foreground'>Slug (read-only)</Label>
            <p className='font-mono bg-muted px-3 py-2 rounded-md'>{plan.slug}</p>
          </div>

          <div className='space-y-2'>
            <Label className='text-muted-foreground'>Stripe Product ID (read-only)</Label>
            <p className='font-mono bg-muted px-3 py-2 rounded-md text-sm'>{plan.stripeProductId}</p>
          </div>

          <FormInput
            control={form.control}
            name='name'
            label='Plan Name'
            description='Display name for the plan'
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

          <FormInput
            control={form.control}
            name='sortOrder'
            label='Sort Order'
            description='Order in which the plan appears (lower = first)'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='0' />}
          />

          <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <Label>Active</Label>
                <p className='text-xs text-muted-foreground'>Make this plan available for purchase</p>
              </div>
              <Switch checked={form.watch('isActive')} onCheckedChange={(checked) => form.setValue('isActive', checked)} />
            </div>

            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <Label className='flex items-center gap-1'>
                  <Star className='size-3 text-amber-500' />
                  Popular
                </Label>
                <p className='text-xs text-muted-foreground'>Highlight this plan as popular</p>
              </div>
              <Switch
                checked={form.watch('isPopular')}
                onCheckedChange={(checked) => form.setValue('isPopular', checked)}
              />
            </div>
          </div>
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
              <InputGroup>
                <NumberInput className='rounded-r-none' {...field} minValue={1} placeholder='5' />
                <InputGroupAddon>
                  <ListIcon className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='maxFeaturedListings'
            label='Max Featured Listings'
            description='Maximum number of featured/promoted listings'
            render={(field) => (
              <InputGroup>
                <NumberInput className='rounded-r-none' {...field} minValue={0} placeholder='0' />
                <InputGroupAddon>
                  <Star className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='maxMembers'
            label='Max Team Members'
            description='Maximum number of organization members'
            render={(field) => (
              <InputGroup>
                <NumberInput className='rounded-r-none' {...field} minValue={1} placeholder='1' />
                <InputGroupAddon>
                  <Users className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='maxImagesPerListing'
            label='Max Images per Listing'
            description='Maximum images allowed per listing'
            render={(field) => (
              <InputGroup>
                <NumberInput className='rounded-r-none' {...field} minValue={1} placeholder='10' />
                <InputGroupAddon>
                  <Image className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='maxVideosPerListing'
            label='Max Videos per Listing'
            description='Maximum videos allowed per listing'
            render={(field) => (
              <InputGroup>
                <NumberInput className='rounded-r-none' {...field} minValue={0} placeholder='1' />
                <InputGroupAddon>
                  <Video className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />
        </CardContent>
      </Card>

      {/* Overage Costs */}
      <Card>
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
            render={(field) => <NumberInput {...field} value={field.value ?? undefined} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraFeaturedListingCost'
            label='Extra Featured Listing Cost'
            description='Cost per additional featured listing (in cents)'
            render={(field) => <NumberInput {...field} value={field.value ?? undefined} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraMemberCost'
            label='Extra Member Cost'
            description='Cost per additional team member (in cents)'
            render={(field) => <NumberInput {...field} value={field.value ?? undefined} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraImageCost'
            label='Extra Image Cost'
            description='Cost per additional image (in cents)'
            render={(field) => <NumberInput {...field} value={field.value ?? undefined} minValue={0} placeholder='Leave empty for no overage' />}
          />

          <FormInput
            control={form.control}
            name='extraVideoCost'
            label='Extra Video Cost'
            description='Cost per additional video (in cents)'
            render={(field) => <NumberInput {...field} value={field.value ?? undefined} minValue={0} placeholder='Leave empty for no overage' />}
          />
        </CardContent>
      </Card>

      {/* Trial */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Period</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
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
          {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

