'use client';

import { useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2, Puzzle, Check, DollarSign } from 'lucide-react';
import type { ListAddonsOutputType } from '@yayago-app/validators';

type AddonItem = ListAddonsOutputType['items'][number];

interface AddAddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  availableAddons: AddonItem[];
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

const AddListingAddonSchema = z.object({
  addonId: z.string().min(1, 'Please select an addon'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('AED'),
  discountAmount: z.number().min(0).default(0),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  isIncludedFree: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  maxPerBooking: z.number().min(1).default(1),
  stockQuantity: z.number().min(1).default(1),
});

type AddListingAddonFormValues = z.infer<typeof AddListingAddonSchema>;

export default function AddAddonDialog({ open, onOpenChange, listingId, availableAddons }: AddAddonDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAddon, setSelectedAddon] = useState<AddonItem | null>(null);

  const form = useForm({
    resolver: zodResolver(AddListingAddonSchema),
    defaultValues: {
      addonId: '',
      price: 0,
      currency: 'AED',
      discountAmount: 0,
      discountType: 'PERCENTAGE',
      isIncludedFree: false,
      isRecommended: false,
      maxPerBooking: 1,
      stockQuantity: 1,
    },
  });

  const { mutate: addAddon, isPending } = useMutation(
    orpc.addons.createListingAddon.mutationOptions({
      onSuccess: () => {
        toast.success('Addon added successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.addons.listListingAddons.queryKey({ input: { listingId, page: 1, take: 100 } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.addons.list.queryKey({ input: { isActive: true, page: 1, take: 100 } }),
        });
        form.reset();
        setSelectedAddon(null);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add addon');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    addAddon({
      listingId,
      addonId: data.addonId,
      price: data.price,
      currency: data.currency,
      discountAmount: data.discountAmount,
      discountType: data.discountType,
      isIncludedFree: data.isIncludedFree,
      isRecommended: data.isRecommended,
      maxPerBooking: data.maxPerBooking,
      stockQuantity: data.stockQuantity,
    });
  });

  const handleAddonSelect = (addonId: string) => {
    const addon = availableAddons.find((a) => a.id === addonId);
    if (addon) {
      setSelectedAddon(addon);
      form.setValue('addonId', addonId);
      form.setValue('price', addon.suggestedPrice || 0);
    }
  };

  const isIncludedFree = form.watch('isIncludedFree');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Addon to Listing</DialogTitle>
          <DialogDescription>Configure an addon to offer to renters</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className='space-y-6'>
          {/* Addon Selection */}
          <div className='space-y-2'>
            <Label>Select Addon</Label>
            <ScrollArea className='h-48 rounded-md border p-2'>
              <div className='space-y-2'>
                {availableAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAddon?.id === addon.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                    onClick={() => handleAddonSelect(addon.id)}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex size-10 items-center justify-center rounded-lg bg-muted'>
                        <Puzzle className='size-5' />
                      </div>
                      <div>
                        <h4 className='font-medium text-sm'>{getLocalizedValue(addon.name)}</h4>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <Badge variant='outline' className='text-xs'>
                            {formatCategory(addon.category)}
                          </Badge>
                          <span>{addon.billingType === 'PER_DAY' ? 'Per Day' : 'Fixed'}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {addon.suggestedPrice && (
                        <span className='text-sm text-muted-foreground'>{addon.suggestedPrice} AED</span>
                      )}
                      {selectedAddon?.id === addon.id && <Check className='size-5 text-primary' />}
                    </div>
                  </div>
                ))}
                {availableAddons.length === 0 && (
                  <p className='text-sm text-muted-foreground text-center py-8'>
                    All available addons have been configured for this listing
                  </p>
                )}
              </div>
            </ScrollArea>
            {form.formState.errors.addonId && (
              <p className='text-sm text-red-500'>{form.formState.errors.addonId.message}</p>
            )}
          </div>

          {selectedAddon && (
            <>
              <Separator />

              {/* Include Free Toggle */}
              <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/30'>
                <div>
                  <Label>Include Free</Label>
                  <p className='text-sm text-muted-foreground'>
                    Offer this addon at no extra cost to attract more renters
                  </p>
                </div>
                <Switch
                  checked={isIncludedFree}
                  onCheckedChange={(checked) => form.setValue('isIncludedFree', checked)}
                />
              </div>

              {/* Pricing */}
              {!isIncludedFree && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Price ({selectedAddon.billingType === 'PER_DAY' ? 'per day' : 'fixed'})</Label>
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
                    {selectedAddon.maxPrice && (
                      <p className='text-xs text-muted-foreground'>Max allowed: {selectedAddon.maxPrice} AED</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Discount (optional)</Label>
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
                        <SelectTrigger className='w-28'>
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
              )}

              {/* Additional Options */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Max Per Booking</Label>
                  <Input
                    type='number'
                    min={1}
                    max={selectedAddon.maxQuantity}
                    {...form.register('maxPerBooking', { valueAsNumber: true })}
                  />
                  <p className='text-xs text-muted-foreground'>Max allowed: {selectedAddon.maxQuantity}</p>
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
                  <Label>Mark as Recommended</Label>
                  <p className='text-sm text-muted-foreground'>Highlight this addon to renters</p>
                </div>
                <Switch
                  checked={form.watch('isRecommended')}
                  onCheckedChange={(checked) => form.setValue('isRecommended', checked)}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !selectedAddon}>
              {isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
              Add Addon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
