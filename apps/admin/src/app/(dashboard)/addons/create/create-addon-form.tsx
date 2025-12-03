'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, Package, DollarSign, Settings, Shield, Hash, Globe, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateAddonInputSchema, CreateAddonInputType } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import LocalizedInput from '@/components/localized-input';
import NumberInput from '@/components/ui/number-input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldLabel } from '@/components/ui/field';

const ADDON_CATEGORIES = [
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'PROTECTION', label: 'Protection' },
  { value: 'CHILD_SAFETY', label: 'Child Safety' },
  { value: 'NAVIGATION', label: 'Navigation' },
  { value: 'CONNECTIVITY', label: 'Connectivity' },
  { value: 'COMFORT', label: 'Comfort' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'OUTDOOR', label: 'Outdoor' },
  { value: 'MOBILITY', label: 'Mobility' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'FUEL', label: 'Fuel' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'TOLL', label: 'Toll' },
  { value: 'BORDER', label: 'Border' },
  { value: 'PARKING', label: 'Parking' },
  { value: 'OTHER', label: 'Other' },
];

const INPUT_TYPES = [
  { value: 'BOOLEAN', label: 'Boolean (Yes/No)' },
  { value: 'QUANTITY', label: 'Quantity (1, 2, 3...)' },
  { value: 'SELECTION', label: 'Selection (Options)' },
];

const BILLING_TYPES = [
  { value: 'FIXED', label: 'Fixed (One-time)' },
  { value: 'PER_DAY', label: 'Per Day' },
  { value: 'PER_HOUR', label: 'Per Hour' },
  { value: 'PER_USE', label: 'Per Use' },
];

export default function CreateAddonForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateAddonInputType>({
    resolver: zodResolver(CreateAddonInputSchema),
    defaultValues: {
      slug: '',
      name: { en: '', az: '', ru: '', ar: '' },
      description: { en: '', az: '', ru: '', ar: '' },
      shortName: { en: '', az: '', ru: '', ar: '' },
      category: 'OTHER',
      inputType: 'BOOLEAN',
      billingType: 'FIXED',
      suggestedPrice: undefined,
      maxPrice: undefined,
      minQuantity: 1,
      maxQuantity: 10,
      minRentalDays: undefined,
      maxRentalDays: undefined,
      minDriverAge: undefined,
      requiresApproval: false,
      isRefundable: true,
      isTaxExempt: false,
      isActive: true,
      isFeatured: false,
      isPopular: false,
      displayOrder: 0,
      iconKey: undefined,
      imageUrl: undefined,
    },
  });

  const { mutateAsync: createAddon, isPending } = useMutation(
    orpc.addons.create.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to create addon');
      },
      onSuccess(data) {
        toast.success('Addon created successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.addons.list.queryKey({ input: {} }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.addons.getStats.queryKey({ input: {} }),
        });
        router.push(`/addons/${data.slug}`);
      },
    })
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await createAddon(data);
    },
    (errors) => {
      console.error('Form validation errors:', errors);
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(firstError.message as string);
      }
    }
  );

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
            description='Unique identifier (e.g., gps-navigation, child-seat)'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} placeholder='e.g., gps-navigation' />
                <InputGroupAddon>
                  <Package className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='category'
            label='Category'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {ADDON_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='name'
            label='Name'
            description='Display name in all languages'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., GPS Navigation',
                  az: 'e.g., GPS Naviqasiya',
                  ru: 'e.g., GPS Навигация',
                  ar: 'e.g., ملاحة GPS',
                }}
              />
            )}
          />

          <FormInput
            control={form.control}
            name='shortName'
            label='Short Name'
            description='Abbreviated name for compact displays'
            render={(field) => (
              <LocalizedInput
                field={field}
                placeholders={{
                  en: 'e.g., GPS',
                  az: 'e.g., GPS',
                  ru: 'e.g., GPS',
                  ar: 'e.g., GPS',
                }}
              />
            )}
          />

          <div className='md:col-span-2'>
            <FormInput
              control={form.control}
              name='description'
              label='Description'
              description='Detailed description of the addon'
              render={(field) => (
                <LocalizedInput
                  field={field}
                  placeholders={{
                    en: 'e.g., Turn-by-turn navigation device',
                    az: 'e.g., Naviqasiya cihazı',
                    ru: 'e.g., Навигационное устройство',
                    ar: 'e.g., جهاز ملاحة',
                  }}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='inputType'
            label='Input Type'
            description='How users select this addon'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select input type' />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='billingType'
            label='Billing Type'
            description='How the addon is charged'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select billing type' />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='suggestedPrice'
            label='Suggested Price (AED)'
            description='Recommended price for partners'
            render={(field) => (
              <NumberInput
                value={field.value ?? undefined}
                onChange={field.onChange}
                min={0}
                placeholder='e.g., 50'
              />
            )}
          />

          <FormInput
            control={form.control}
            name='maxPrice'
            label='Maximum Price (AED)'
            description='Maximum allowed price (platform policy)'
            render={(field) => (
              <NumberInput
                value={field.value ?? undefined}
                onChange={field.onChange}
                min={0}
                placeholder='e.g., 100'
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Quantity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Hash className='size-5' />
            Quantity Settings
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='minQuantity'
            label='Minimum Quantity'
            render={(field) => <NumberInput value={field.value} onChange={field.onChange} min={1} />}
          />

          <FormInput
            control={form.control}
            name='maxQuantity'
            label='Maximum Quantity'
            render={(field) => <NumberInput value={field.value} onChange={field.onChange} min={1} />}
          />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='size-5' />
            Requirements & Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <FormInput
            control={form.control}
            name='minRentalDays'
            label='Min Rental Days'
            description='Minimum rental duration to offer this addon'
            render={(field) => (
              <NumberInput value={field.value ?? undefined} onChange={field.onChange} min={1} placeholder='No minimum' />
            )}
          />

          <FormInput
            control={form.control}
            name='maxRentalDays'
            label='Max Rental Days'
            description='Maximum rental duration for this addon'
            render={(field) => (
              <NumberInput value={field.value ?? undefined} onChange={field.onChange} min={1} placeholder='No maximum' />
            )}
          />

          <FormInput
            control={form.control}
            name='minDriverAge'
            label='Min Driver Age'
            description='Minimum age to add this addon'
            render={(field) => (
              <NumberInput value={field.value ?? undefined} onChange={field.onChange} min={18} max={100} placeholder='No requirement' />
            )}
          />

          <div className='flex items-center gap-4 p-4 border rounded-lg'>
            <Switch
              checked={form.watch('requiresApproval')}
              onCheckedChange={(checked) => form.setValue('requiresApproval', checked)}
            />
            <div>
              <Label>Requires Approval</Label>
              <p className='text-sm text-muted-foreground'>Host must approve this addon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='size-5' />
            Policies
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-center gap-4 p-4 border rounded-lg'>
            <Switch
              checked={form.watch('isRefundable')}
              onCheckedChange={(checked) => form.setValue('isRefundable', checked)}
            />
            <div>
              <Label>Refundable</Label>
              <p className='text-sm text-muted-foreground'>Can be refunded if cancelled</p>
            </div>
          </div>

          <div className='flex items-center gap-4 p-4 border rounded-lg'>
            <Switch
              checked={form.watch('isTaxExempt')}
              onCheckedChange={(checked) => form.setValue('isTaxExempt', checked)}
            />
            <div>
              <Label>Tax Exempt</Label>
              <p className='text-sm text-muted-foreground'>No tax applied to this addon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='size-5' />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput
            control={form.control}
            name='displayOrder'
            label='Display Order'
            description='Order in which the addon appears (lower = first)'
            render={(field) => <NumberInput value={field.value} onChange={field.onChange} min={0} />}
          />

          <FormInput
            control={form.control}
            name='iconKey'
            label='Icon Key'
            description='Icon identifier for frontend display'
            render={(field) => (
              <InputGroup>
                <InputGroupInput {...field} value={field.value ?? ''} placeholder='e.g., navigation' />
                <InputGroupAddon>
                  <Star className='size-4' />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='imageUrl'
            label='Image URL'
            description='Product image URL'
            render={(field) => <InputGroupInput {...field} value={field.value ?? ''} placeholder='https://...' />}
          />

          <div className='space-y-4'>
            <div className='flex items-center gap-4 p-4 border rounded-lg'>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
              <div>
                <Label>Active</Label>
                <p className='text-sm text-muted-foreground'>Addon is available for use</p>
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 border rounded-lg'>
              <Switch
                checked={form.watch('isFeatured')}
                onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
              />
              <div>
                <Label>Featured</Label>
                <p className='text-sm text-muted-foreground'>Show prominently in listings</p>
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 border rounded-lg'>
              <Switch
                checked={form.watch('isPopular')}
                onCheckedChange={(checked) => form.setValue('isPopular', checked)}
              />
              <div>
                <Label>Popular</Label>
                <p className='text-sm text-muted-foreground'>Badge as popular addon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className='flex justify-end gap-4'>
        <Button type='button' variant='outline' onClick={() => router.push('/addons')}>
          Cancel
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2Icon className='size-4 mr-2 animate-spin' />}
          Create Addon
        </Button>
      </div>
    </form>
  );
}

