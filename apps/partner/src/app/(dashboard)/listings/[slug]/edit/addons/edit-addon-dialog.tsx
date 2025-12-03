'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2, DollarSign, Puzzle } from 'lucide-react';
import type { ListListingAddonsOutputType } from '@yayago-app/validators';
import { useEffect } from 'react';

type ListingAddonItem = ListListingAddonsOutputType['items'][number];

interface EditAddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingAddon: ListingAddonItem;
}

function getLocalizedValue(value: Record<string, string> | null | undefined, locale = 'en'): string {
  if (!value) return '';
  return value[locale] || value['en'] || Object.values(value)[0] || '';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

const EditListingAddonSchema = z.object({
  price: z.number().min(0, 'Price must be positive'),
  discountAmount: z.number().min(0).default(0),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  isIncludedFree: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  isActive: z.boolean().default(true),
  maxPerBooking: z.number().min(1).default(1),
  stockQuantity: z.number().min(1).default(1),
});

type EditListingAddonFormValues = z.infer<typeof EditListingAddonSchema>;

export default function EditAddonDialog({ open, onOpenChange, listingAddon }: EditAddonDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(EditListingAddonSchema),
    defaultValues: {
      price: listingAddon.price,
      discountAmount: listingAddon.discountAmount ?? 0,
      discountType: listingAddon.discountType || 'PERCENTAGE',
      isIncludedFree: listingAddon.isIncludedFree,
      isRecommended: listingAddon.isRecommended,
      isActive: listingAddon.isActive,
      maxPerBooking: listingAddon.maxPerBooking ?? 1,
      stockQuantity: listingAddon.stockQuantity ?? 1,
    },
  });

  // Reset form when listingAddon changes
  useEffect(() => {
    form.reset({
      price: listingAddon.price,
      discountAmount: listingAddon.discountAmount ?? 0,
      discountType: listingAddon.discountType || 'PERCENTAGE',
      isIncludedFree: listingAddon.isIncludedFree,
      isRecommended: listingAddon.isRecommended,
      isActive: listingAddon.isActive,
      maxPerBooking: listingAddon.maxPerBooking ?? 1,
      stockQuantity: listingAddon.stockQuantity ?? 1,
    });
  }, [listingAddon, form]);

  const { mutate: updateAddon, isPending } = useMutation(
    orpc.addons.updateListingAddon.mutationOptions({
      onSuccess: () => {
        toast.success('Addon updated successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.addons.listListingAddons.queryKey({
            input: { listingId: listingAddon.listingId, page: 1, take: 100 },
          }),
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update addon');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    updateAddon({
      listingAddonId: listingAddon.id,
      price: data.price,
      discountAmount: data.discountAmount ?? undefined,
      discountType: data.discountType,
      isIncludedFree: data.isIncludedFree,
      isRecommended: data.isRecommended,
      isActive: data.isActive,
      maxPerBooking: data.maxPerBooking ?? undefined,
      stockQuantity: data.stockQuantity ?? undefined,
    });
  });

  const isIncludedFree = form.watch('isIncludedFree');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Edit Addon</DialogTitle>
          <DialogDescription>Update the configuration for this addon</DialogDescription>
        </DialogHeader>

        {/* Addon Info */}
        <div className='flex items-center gap-4 p-4 bg-muted/50 rounded-lg'>
          <div className='flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Puzzle className='size-6' />
          </div>
          <div>
            <h3 className='font-medium'>{getLocalizedValue(listingAddon.addon.name)}</h3>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Badge variant='outline' className='text-xs'>
                {formatCategory(listingAddon.addon.category)}
              </Badge>
              <span>{listingAddon.addon.billingType === 'PER_DAY' ? 'Per Day' : 'Fixed'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className='space-y-6'>
          {/* Active Toggle */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div>
              <Label>Active</Label>
              <p className='text-sm text-muted-foreground'>Show this addon to renters</p>
            </div>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
          </div>

          {/* Include Free Toggle */}
          <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/30'>
            <div>
              <Label>Include Free</Label>
              <p className='text-sm text-muted-foreground'>Offer at no extra cost</p>
            </div>
            <Switch checked={isIncludedFree} onCheckedChange={(checked) => form.setValue('isIncludedFree', checked)} />
          </div>

          {/* Pricing */}
          {!isIncludedFree && (
            <>
              <Separator />
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Price ({listingAddon.addon.billingType === 'PER_DAY' ? 'per day' : 'fixed'})</Label>
                  <div className='relative'>
                    <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                    <Input
                      type='number'
                      min={0}
                      step={0.01}
                      className='pl-9'
                      {...form.register('price', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Discount</Label>
                  <div className='flex gap-2'>
                    <Input
                      type='number'
                      min={0}
                      placeholder='0'
                      {...form.register('discountAmount', { valueAsNumber: true })}
                    />
                    <Select
                      value={form.watch('discountType')}
                      onValueChange={(value) => form.setValue('discountType', value as any)}
                    >
                      <SelectTrigger className='w-24'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='PERCENTAGE'>%</SelectItem>
                        <SelectItem value='FIXED_AMOUNT'>AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Options */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Max Per Booking</Label>
              <Input
                type='number'
                min={1}
                max={listingAddon.addon.maxQuantity}
                {...form.register('maxPerBooking', { valueAsNumber: true })}
              />
              <p className='text-xs text-muted-foreground'>Max allowed: {listingAddon.addon.maxQuantity}</p>
            </div>

            <div className='space-y-2'>
              <Label>Stock Quantity</Label>
              <Input type='number' min={1} {...form.register('stockQuantity', { valueAsNumber: true })} />
              <p className='text-xs text-muted-foreground'>Set available units</p>
            </div>
          </div>

          {/* Recommended Toggle */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div>
              <Label>Recommended</Label>
              <p className='text-sm text-muted-foreground'>Highlight to renters</p>
            </div>
            <Switch
              checked={form.watch('isRecommended')}
              onCheckedChange={(checked) => form.setValue('isRecommended', checked)}
            />
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
